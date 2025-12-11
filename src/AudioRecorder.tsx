import React, { useState, useRef, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8000';

const MAX_RECORDING_TIME_MS = 10000; // 10 segundos en milisegundos
const MAX_RECORDING_TIME_S = MAX_RECORDING_TIME_MS / 1000; // 10 segundos en segundos

interface AudioRecorderProps {
  username: string;
  onAudioUploaded: () => void; 
  isSubmitting: boolean; 
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ username, onAudioUploaded, isSubmitting }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Referencias para datos de grabación y timers
  const audioChunksRef = useRef<Blob[]>([]);
  const [timer, setTimer] = useState<number>(0); 
  const intervalRef = useRef<number | null>(null); 
  const streamRef = useRef<MediaStream | null>(null); 
  const timeoutRef = useRef<number | null>(null); 

  // Función de detención unificada, usa useCallback para estabilidad.
  const stopRecording = useCallback(() => {
    // 1. Limpiar el timeout de detención automática
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 2. Limpiar el temporizador de la UI
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimer(0);
    
    // 3. Detener la grabadora (si está activa)
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      // OJO: setIsRecording(false) se maneja implícitamente aquí o al final
    }
    
    // 4. Detener la pista del micrófono y liberar el stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // El estado de grabación se pone a false en el punto de inicio de la secuencia de detención
    setIsRecording(false);
  }, [mediaRecorder, isRecording]);


  const startRecording = async () => {
    if (isRecording) return;
    
    try {
      // 1. Obtener Stream del micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; 
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      audioChunksRef.current = [];
      setAudioBlob(null); 
      
      // Manejadores de eventos de la grabadora
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        // Al detenerse (manual o automático), combinamos los fragmentos
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      // 2. INICIAR EL TIMEOUT DE DETENCIÓN AUTOMÁTICA (10s)
      timeoutRef.current = setTimeout(() => {
        // Al alcanzar el límite, forzamos la detención
        if (recorder.state !== 'inactive') {
          console.log("Grabación detenida automáticamente por límite de 10s.");
          recorder.stop();
          // Llamamos a stopRecording para la limpieza de timers y streams
          stopRecording(); 
        }
      }, MAX_RECORDING_TIME_MS);
      
      // 3. INICIAR EL CONTADOR DE TIEMPO (para la UI)
      setTimer(0);
      const startTime = Date.now();
      
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        
        if (elapsed <= MAX_RECORDING_TIME_S) {
            setTimer(elapsed);
        } else {
            clearInterval(intervalRef.current!);
        }
      }, 100); 

      
      // 4. Iniciar la grabación
      recorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('Error: Asegúrate de dar permiso al navegador para usar el micrófono.');
    }
  };

  // Limpieza al desmontar el componente (importante)
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      if (streamRef.current) {
         streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const uploadAudio = async () => {
    if (!audioBlob) return;
    
    // Aquí puedes añadir la lógica para deshabilitar el botón antes de enviar (ej: setIsSubmitting(true) si estuviera en estado local)

    try {
      // Usar FormData para enviar el archivo binario (Blob)
      const formData = new FormData();
      formData.append('username', username);
      // 'file' debe coincidir con el parámetro de FastAPI (@app.post("/upload", file: UploadFile = File(...)))
      formData.append('file', audioBlob, 'recorded_comm.webm'); 
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo de audio.');
      }

      await response.json(); 
      onAudioUploaded(); // Notificar al componente padre
      setAudioBlob(null); // Limpiar después de subir

    } catch (error) {
      console.error('Error al subir el audio:', error);
      alert('Hubo un error al subir el audio al servidor.');
    }
  };
  
  // Cálculo del tiempo restante para mostrar en la UI
  const timeLeft = MAX_RECORDING_TIME_S - timer;

  return (
    <div className="audio-recorder-section">
      <div className="recording-controls">
        <button 
          // Botón llama a stopRecording si está grabando, sino a startRecording
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isSubmitting}
          className={`record-button ${isRecording ? 'recording' : ''}`}
        >
          {isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}
        </button>

        
        
        
        
        {audioBlob && !isRecording && (
          <>
            <button 
              onClick={uploadAudio}
              disabled={isSubmitting}
              className="upload-button"
            >
              Enviar Audio
            </button>
            <audio src={URL.createObjectURL(audioBlob)} controls className="preview-audio" />
          </>
        )}
      </div>
      
      {isRecording && (
            <p className="recording-timer">
                {/* 🔴 Usamos el icono con la animación de pulso */}
                <span className="timer-icon pulse-animation">🔴</span> 
                {/* El temporizador grande y rojo */}
                {timeLeft.toFixed(1)}s
            </p>
        )}
    </div>
  );
};

export default AudioRecorder;