import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './aplicacion/App';
import './aplicacion/estilos.css';

const elementoRaiz = document.querySelector<HTMLElement>('#raiz-ficha');

if (!elementoRaiz) {
  throw new Error('No se encontró el contenedor de la ficha PawSys.');
}

createRoot(elementoRaiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
