import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';

// Initialisation du bouclier anti-triche différée sur première interaction utilisateur
if (typeof window !== 'undefined') {
  const trigger = () => {
    window.removeEventListener('scroll', trigger);
    window.removeEventListener('click', trigger);
    window.removeEventListener('touchstart', trigger);
    window.removeEventListener('keydown', trigger);
    import('./utils/securityAntiCheat').then((m) => m.initSecurityAntiCheat());
  };
  window.addEventListener('scroll', trigger, { passive: true, once: true });
  window.addEventListener('click', trigger, { passive: true, once: true });
  window.addEventListener('touchstart', trigger, { passive: true, once: true });
  window.addEventListener('keydown', trigger, { passive: true, once: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
