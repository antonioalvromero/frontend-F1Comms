// frontend/src/OverlayPlayer.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './OverlayPlayer.css';
import F1CommBox from './F1CommBox';
// Ya NO usamos useParams

const API_BASE_URL = 'http://132.226.48.36:8000';
const POLLING_INTERVAL = 3000; // Consultar el backend cada 3 segundos


interface CommMessage {
    available: boolean;
    username?: string;
    audio_url?: string;
    audio_id?: string;
    transcript?: string;
}

const OverlayPlayer: React.FC = () => {
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'loading'>('idle');
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  
  // Usamos useCallback para que esta función no se redefina y cause bucles
  const fetchNextComm = useCallback(async () => {
    if (status === 'playing' || status === 'loading') {
      return; // No intentar buscar si ya estamos ocupados
    }
    
    try {
      setStatus('loading');
      const response = await fetch(`${API_BASE_URL}/comms/next`);
      const data: CommMessage = await response.json();

      if (data.available && data.audio_url && audioRef.current) {
        // Encontramos un mensaje en la cola, ¡a reproducir!
        setCurrentUsername(data.username || 'Equipo');
        setCurrentTranscript(data.transcript || 'Mensaje de Radio COMM');
        audioRef.current.src = `${API_BASE_URL}${data.audio_url}`;
        
        // Intentar iniciar la reproducción
        audioRef.current.play()
          .then(() => {
            console.log("Reproducción iniciada con audio ID:", data.audio_id);
            setStatus('playing');
          })
          .catch(error => {
            console.error("Fallo de auto-play o error de reproducción:", error);
            setStatus('idle');
          });
          
      } else {
        // Cola vacía
        setStatus('idle');
      }

    } catch (error) {
      console.error("Error al hacer polling:", error);
      setStatus('idle'); // Vuelve a intentar en el siguiente ciclo
    }
  }, [status]); // Depende del status

  useEffect(() => {
    const audio = audioRef.current;
    
    if (audio) {
      // Configurar el evento onended para limpiar y buscar el siguiente audio
      audio.onended = () => {
        console.log("Audio finalizado. Buscando el siguiente...");
        setStatus('idle'); // Al estar 'idle', se dispara el polling
        fetchNextComm(); 
      };
    }

    // --- LÓGICA DE POLLING ---
    // Inicia la primera consulta inmediatamente
    fetchNextComm(); 

    // Configura el intervalo de polling
    const intervalId = setInterval(fetchNextComm, POLLING_INTERVAL);

    // Limpieza: importante para evitar fugas de memoria
    return () => {
      clearInterval(intervalId);
      if (audio) audio.onended = null;
    };
    
  }, [fetchNextComm]); // Depende de fetchNextComm

  // Estilos cruciales para OBS: fondo transparente
  // 'idle' = oculto, 'playing' = visible
  return (
    <div className="overlay-wrapper">
      <audio ref={audioRef} /> 
      
      <F1CommBox 
        status={status} 
        username={currentUsername} 
        transcript={currentTranscript}
      />
    </div>
  );
};

export default OverlayPlayer;