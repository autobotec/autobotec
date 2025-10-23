import { getLanguage, setLanguage, t } from '../lib/i18n.js';
import { supabase } from '../lib/supabase.js';

export function Header() {
  const lang = getLanguage();
  const isAuthenticated = checkAuth();

  return `
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <a href="/" data-link class="logo">
            💋 <span>${lang === 'es' ? 'ENCUENTRAME' : 'FIND ME'}</span>
          </a>

          <nav class="header-nav">
            ${isAuthenticated ? `
              <a href="/post-ad" data-link class="btn-nav">${t('nav.post_ad')}</a>
              <a href="/dashboard" data-link class="btn-nav">${t('nav.dashboard')}</a>
              <button id="logoutBtn" class="btn-nav-secondary">${t('nav.logout')}</button>
            ` : `
              <a href="/auth" data-link class="btn-nav">${t('nav.login')}</a>
              <a href="/auth" data-link class="btn-nav-primary">${t('nav.register')}</a>
            `}
            <button id="langToggle" class="lang-toggle">
              ${lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  `;
}

function checkAuth() {
  const session = supabase.auth.getSession();
  return session !== null;
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

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/';
    });
  }
}
