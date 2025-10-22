import { getLanguage } from '../lib/i18n.js';

export function Footer() {
  const lang = getLanguage();
  const year = new Date().getFullYear();

  return `
    <footer class="app-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="footer-title">💋 ${lang === 'es' ? 'ENCUENTRAME' : 'FIND ME'}</h3>
            <p class="footer-description">
              ${lang === 'es' ? 'Plataforma de Clasificados para Adultos' : 'Adult Classifieds Platform'}
            </p>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">${lang === 'es' ? 'Información' : 'Information'}</h4>
            <ul class="footer-links">
              <li><a href="/about" data-link>${lang === 'es' ? 'Acerca de' : 'About'}</a></li>
              <li><a href="/terms" data-link>${lang === 'es' ? 'Términos' : 'Terms'}</a></li>
              <li><a href="/privacy" data-link>${lang === 'es' ? 'Privacidad' : 'Privacy'}</a></li>
              <li><a href="/contact" data-link>${lang === 'es' ? 'Contacto' : 'Contact'}</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">${lang === 'es' ? 'Soporte' : 'Support'}</h4>
            <ul class="footer-links">
              <li><a href="/help" data-link>${lang === 'es' ? 'Ayuda' : 'Help'}</a></li>
              <li><a href="/faq" data-link>FAQ</a></li>
              <li><a href="/safety" data-link>${lang === 'es' ? 'Seguridad' : 'Safety'}</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; ${year} ${lang === 'es' ? 'ENCUENTRAME' : 'FIND ME'} - ${lang === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}</p>
          <p class="footer-disclaimer">
            ${lang === 'es' ? '⚠️ Contenido solo para mayores de 18 años' : '⚠️ Content for adults 18+ only'}
          </p>
        </div>
      </div>
    </footer>
  `;
}
