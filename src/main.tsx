// frontend/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx'; // El componente del formulario
import OverlayPlayer from './OverlayPlayer.tsx'; // El componente del overlay
import './index.css';
import StreamerDashboard from './StreamerDashboard.tsx'; //Componente del dashboard del streamer

// CLAVE: Define el nombre del repositorio. 
// Reemplaza 'frontend-F1Comms' si el nombre real de tu repositorio es diferente.
const REPO_NAME = "frontend-F1Comms"; 

// Definición de las rutas
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // RUTA PÚBLICA (SOLO FORMULARIOS)
  },
  {
    path: "/admin", // 🚨 NUEVA RUTA SECRETA
    element: <StreamerDashboard />, // RUTA PRIVADA (SOLO URL DE OVERLAY)
  },
  {
    path: "/overlay", 
    element: <OverlayPlayer />, // RUTA DE REPRODUCCIÓN (OBS)
  },
], {
    // CLAVE: AÑADE ESTO para que React Router sepa que la base es el subdirectorio del repositorio
    basename: `/${REPO_NAME}`, 
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);