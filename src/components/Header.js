import { getLanguage, setLanguage } from '../lib/i18n.js';

export function Header() {
  const lang = getLanguage();

  return `
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <a href="/" data-link class="logo">
            💋 <span>${lang === 'es' ? 'ENCUENTRAME' : 'FIND ME'}</span>
          </a>

          <nav class="header-nav">
            <button id="langToggle" class="lang-toggle">
              ${lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  `;
}

export function initHeaderEvents() {
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const newLang = getLanguage() === 'es' ? 'en' : 'es';
      setLanguage(newLang);
      window.location.reload();
    });
  }
}
