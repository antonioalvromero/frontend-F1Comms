// frontend/src/F1CommBox.tsx
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import './OverlayPlayer.css';

// ==========================================================
// 1. LÓGICA DE COLOR DINÁMICO F1
// ==========================================================

// Paleta de colores primarios de equipos de F1
const TEAM_COLORS = [
    '#E3001B', // Ferrari
    '#00D2BE', // Mercedes (Verde/Cian)
    '#FF8700', // McLaren (Naranja Papaya)
    '#005C55', // Aston Martin (Verde Racing)
    '#0090FF', // Alpine (Azul)
    '#005A99', // Williams (Azul Oscuro)
];

const getRandomColor = () => {
    return TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
};

// ==========================================================

// Definimos el número de barras
const BAR_COUNT = 30;
const ANIMATION_DURATION_MS = 400; // Duración de la animación slide-out en CSS

interface F1CommBoxProps {
    status: 'idle' | 'playing' | 'loading';
    username: string;
    transcript: string;
    // Agregamos logoUrl, aunque en el JSX usas /logo.png fijo, es buena práctica tener la prop
    logoUrl?: string; 
}

const F1CommBox: FC<F1CommBoxProps> = ({ status, username, transcript, logoUrl = '/logo.png' }) => {

    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    // 2. ESTADO PARA ALMACENAR Y CAMBIAR EL COLOR
    const [teamColor, setTeamColor] = useState(getRandomColor);

    // ==========================================================
    // Lógica de Animación y Cambio de Color
    // ==========================================================

    useEffect(() => {
        // INICIO: Lógica de cambio de color aleatorio cada 15s
        const colorInterval = setInterval(() => {
            setTeamColor(getRandomColor());
        }, 15000); 

        // Lógica de Animación de Salida (Idle)
        if (status === 'idle' && !isAnimatingOut) {
            setIsAnimatingOut(true);

            const timer = setTimeout(() => {
                setIsAnimatingOut(false);
            }, ANIMATION_DURATION_MS);

            // Limpieza específica para el timeout de animación
            return () => { 
                clearTimeout(timer);
                clearInterval(colorInterval);
            };
        }

        // Si el status es 'playing', aseguramos que no haya animación de salida activa
        if (status === 'playing') {
            setIsAnimatingOut(false);
        }
        
        // Limpieza general para el intervalo de color
        return () => clearInterval(colorInterval); 
    }, [status, isAnimatingOut]);

    // ==========================================================
    // Renderizado del Overlay (Diseño F1)
    // ==========================================================

    const isVisible = status === 'playing' || isAnimatingOut;

    // Clases CSS para controlar las animaciones de entrada y salida
    const containerClass = `radio-overlay-container 
        ${status === 'playing' ? 'slide-in' : ''}
        ${isAnimatingOut ? 'slide-out' : ''}`;

    // Clases para las barras
    const barClass = (index: number) =>
        `audio-bar ${status === 'playing' ? 'playing' : ''} bar-${index}`;


    if (!isVisible) {
        return null;
    }

    return (
        <div className={containerClass}>

            {/* HEADER: Aplicamos color al borde inferior */}
            <div 
                className="radio-header"
                style={{ 
                    borderBottomColor: teamColor, 
                }}
            >

                {/* Contenedor para el apilamiento vertical y alineación a la derecha */}
                <div className="radio-text-group">

                    {/* Username dinámico: Aplicamos color al texto */}
                    <span 
                        className="radio-user-name"
                        style={{ color: teamColor }} 
                    >
                        {username?.toUpperCase()}
                    </span>

                    <span className="radio-tag">RADIO</span>

                </div>

                <img src={logoUrl} alt="Logo" className="radio-logo" />
            </div>

            <div className="radio-visualizer-area">
                <div className="radio-visualizer">
                    {/* Barras dinámicas simuladas: Aplicamos color de fondo a las barras */}
                    {Array.from({ length: BAR_COUNT }).map((_, index) => (
                        <div 
                            key={index} 
                            className={barClass(index)}
                            style={{ backgroundColor: teamColor }} 
                        ></div>
                    ))}
                </div>
            </div>

            {/*  ÁREA DEL TRANSCRIPT */}
            {status === 'playing' && (
                <div 
                    className="radio-transcript-area"
                    style={{ 
                        // Aplicamos color al borde superior del transcript
                        borderTopColor: teamColor 
                    }}
                >
                    <p className="radio-transcript">
                        {transcript}
                    </p>
                </div>
            )}
        </div>
    );
};

export default F1CommBox;