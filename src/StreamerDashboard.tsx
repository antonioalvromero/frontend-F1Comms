// frontend/src/StreamerDashboard.tsx

import React from 'react';

const OVERLAY_URL = `${window.location.origin}/overlay`; 

const StreamerDashboard: React.FC = () => {
    return (
        <div className="app-container">
            <h1>⚙️ Dashboard del Streamer</h1>
            <p>Este enlace es *únicamente* para ti.</p>
            
            {/* 🚨 ÚNICA CAJA: URL Estática para el Streamer */}
            <div className="result-box static-url">
                <h3>🔗 ENLACE DE OVERLAY (PRIVADO)</h3>
                <p>Copia esta única URL para tu fuente "Navegador" en OBS:</p>
                <div className="url-display">
                    <code className="copy-text">{OVERLAY_URL}</code>
                    <button 
                        className="copy-button"
                        onClick={() => navigator.clipboard.writeText(OVERLAY_URL)}
                    >
                        Copiar
                    </button>
                </div>
                <p className="note">**NO COMPARTAS ESTE ENLACE con los viewers.**</p>
            </div>

            <hr className="divider" />
            
            <h2>URL Pública para tus Viewers</h2>
            <p>La URL para compartir con tu audiencia es: <code>{window.location.origin}</code></p>
        </div>
    );
};

export default StreamerDashboard;