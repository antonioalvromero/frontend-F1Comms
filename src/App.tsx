// frontend/src/App.tsx

import React, { useState } from 'react';
import './App.css';
import AudioRecorder from './AudioRecorder'
import { FaPaperPlane, FaUser, FaRegClock, FaCheckCircle, FaSpinner } from 'react-icons/fa'; // Importamos iconos modernos

const API_BASE_URL = 'https://bg408rvv-8000.use2.devtunnels.ms/';
const MAX_TTS_CHARS = 150;

function App() {
  const [username, setUsername] = useState('Max Verstappen');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const charRemaining = MAX_TTS_CHARS - message.length; // Calculamos caracteres restantes

  const handleSuccess = () => {
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Bloqueamos ambos modos mientras se envía TTS
    setIsLoading(true);
    setIsSent(false);

    // ... (Lógica de fetch se mantiene igual) ...
    // Añadirás aquí el transcript para /tts

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('text', message); // El 'text' es ahora también el transcript
      formData.append('transcript', message); // Enviamos el transcript explícitamente

      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al generar el audio. Revisa el backend.');
      }

      await response.json();
      handleSuccess();
      setMessage('');

    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      alert('Hubo un error en la comunicación con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="app-container">
      <header className="header-bar">
        <h1>🎙️ F1 Radio Console</h1>
        <p className="subtitle">Mensajes, TTS y Grabación</p>
      </header>

      <div className="content-panel">

        {/* --- NOTIFICACIÓN MODERNA --- */}
        {isSent && (
          <div className="notification-box success-animation">
            <FaCheckCircle className="icon-success" />
            <p>Mensaje enviado. ¡A la espera de reproducción!</p>
          </div>
        )}

        {/* --- SECCIÓN DE IDENTIDAD --- */}
        <section className="section-card user-identity-section">
          <h2><FaUser /> Tu Identidad</h2>
          <div className="input-group">
            <label htmlFor="username">Nombre de Usuario (tu Nick)</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Ej: Checo Perez"
              className="f1-input"
            />
          </div>
        </section>

        {/* --- TTS FORM --- */}
        <section className="section-card tts-section">
          <h2>1. Text-to-Speech</h2>
          <p className="description">Convierte texto en la voz de radio de un piloto.</p>
          <form onSubmit={handleSubmit} className="comms-form">
            <div className="input-group">
              <label htmlFor="message">
                Mensaje de Radio
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={MAX_TTS_CHARS}
                placeholder="Ej: 'Copy. We are boxing this lap for the hard tyre.'"
                required
                disabled={isLoading}
                className="f1-textarea"
              />
              <small className={`char-counter ${charRemaining < 10 ? 'warning' : ''}`}>
                <FaRegClock /> {charRemaining} caracteres restantes (Máx. {MAX_TTS_CHARS})
              </small>
            </div>

            <button type="submit" disabled={isLoading || message.length === 0} className="f1-button primary-btn">
              {isLoading ? (
                <>
                  <FaSpinner className="spinner-icon" /> Generando Audio...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Enviar Mensaje TTS a la Cola
                </>
              )}
            </button>
          </form>
        </section>

        <hr className="f1-divider" />

        {/* --- GRABACIÓN DE AUDIO --- */}
        <section className="section-card recording-section">
          <h2>2. Grabación Directa</h2>
          <p className="description">Graba tu propia voz para enviarla a la radio.</p>
          <AudioRecorder
            username={username}
            onAudioUploaded={handleSuccess}
            isSubmitting={isLoading}
          />
          {/* NOTA: Asegúrate de que tu componente AudioRecorder maneje el transcript/texto para el backend */}
        </section>

      </div>
    </div>
  );
}

export default App;