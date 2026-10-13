/**
 * Punto de entrada del front-end React.
 * Autor: Mauricio Vargas - Ficha 3186699
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ProveedorAutenticacion } from './contexto/AutenticacionContexto';
import { ProveedorAvisos } from './contexto/AvisosContexto';
import LimiteErrores from './componentes/LimiteErrores';
import './estilos/estilos.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LimiteErrores>
      <BrowserRouter>
        <ProveedorAvisos>
          <ProveedorAutenticacion>
            <App />
          </ProveedorAutenticacion>
        </ProveedorAvisos>
      </BrowserRouter>
    </LimiteErrores>
  </React.StrictMode>
);
