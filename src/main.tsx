import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support. Registration failure is not fatal — the app works from cache or
// from the network either way.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Whether a worker was already in charge when this page loaded. On the very
  // first visit there is none, and the install then fires controllerchange —
  // reloading for that would be a pointless flash on a brand-new install.
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
