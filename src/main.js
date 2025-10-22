import { supabase } from './lib/supabase.js';
import { initI18n, setLanguage, getLanguage, t } from './lib/i18n.js';

console.log('🚀 ENCUENTRAME / FIND ME - New Project Starting...');

initI18n();

async function loadCountries() {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('order_index');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading countries:', error);
    return [];
  }
}

async function loadCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

async function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const countries = await loadCountries();
  const categories = await loadCategories();
  const lang = getLanguage();

  const countriesHTML = countries.map(c => `
    <div class="country-card">
      <span class="country-flag">${c.flag_emoji}</span>
      <span class="country-name">${lang === 'es' ? c.name_es : c.name_en}</span>
    </div>
  `).join('');

  const categoriesHTML = categories.map(c => `
    <div class="category-card">
      <span class="category-icon">${c.icon || '✨'}</span>
      <span class="category-name">${lang === 'es' ? c.name_es : c.name_en}</span>
    </div>
  `).join('');

  app.innerHTML = `
    <style>
      .app-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FE6B8B 100%);
        color: white;
      }

      .header {
        background: rgba(255, 255, 255, 0.95);
        padding: 1.5rem 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .logo {
        font-size: 1.75rem;
        font-weight: 700;
        color: #FF6B6B;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .lang-btn {
        padding: 0.75rem 1.5rem;
        background: #FF6B6B;
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
      }

      .lang-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        background: #FF5252;
      }

      .hero {
        text-align: center;
        padding: 4rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .hero h1 {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        animation: fadeInUp 0.6s ease;
      }

      .hero p {
        font-size: 1.5rem;
        margin-bottom: 3rem;
        opacity: 0.95;
        animation: fadeInUp 0.6s ease 0.2s backwards;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .section {
        background: white;
        color: #333;
        padding: 4rem 2rem;
      }

      .section-title {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
        color: #FF6B6B;
        font-weight: 700;
      }

      .countries-grid, .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .country-card, .category-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem 1rem;
        border-radius: 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        color: white;
      }

      .country-card:hover, .category-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }

      .country-flag, .category-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 0.75rem;
      }

      .country-name, .category-name {
        font-size: 1.1rem;
        font-weight: 600;
      }

      .stats {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 3rem 2rem;
        text-align: center;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
        max-width: 1200px;
        margin: 2rem auto 0;
      }

      .stat-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 2rem;
        border-radius: 16px;
        backdrop-filter: blur(10px);
      }

      .stat-number {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .stat-label {
        font-size: 1.1rem;
        opacity: 0.9;
      }

      .footer {
        background: #1a1a2e;
        color: white;
        padding: 2rem;
        text-align: center;
      }

      @media (max-width: 768px) {
        .hero h1 {
          font-size: 2.5rem;
        }
        .hero p {
          font-size: 1.2rem;
        }
        .countries-grid, .categories-grid {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }
      }
    </style>

    <div class="app-container">
      <header class="header">
        <div class="logo">
          💋 ${lang === 'es' ? 'ENCUENTRAME' : 'FIND ME'}
        </div>
        <button id="langBtn" class="lang-btn">
          ${lang === 'es' ? '🇺🇸 English' : '🇪🇸 Español'}
        </button>
      </header>

      <section class="hero">
        <h1>💋 ${lang === 'es' ? 'ENCUENTRAME' : 'FIND ME'}</h1>
        <p>${lang === 'es' ? 'Plataforma de Clasificados para Adultos' : 'Adult Classifieds Platform'}</p>
        <div style="font-size: 1.2rem; opacity: 0.9;">
          ${lang === 'es' ? '✨ Proyecto completamente nuevo con base de datos configurada' : '✨ Brand new project with configured database'}
        </div>
      </section>

      <section class="stats">
        <h2 style="font-size: 2rem; margin-bottom: 1rem;">${lang === 'es' ? '📊 Base de Datos Configurada' : '📊 Database Configured'}</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${countries.length}</div>
            <div class="stat-label">${lang === 'es' ? 'Países' : 'Countries'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${categories.length}</div>
            <div class="stat-label">${lang === 'es' ? 'Categorías' : 'Categories'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">17</div>
            <div class="stat-label">${lang === 'es' ? 'Tablas' : 'Tables'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">✅</div>
            <div class="stat-label">${lang === 'es' ? 'Compilación' : 'Build Status'}</div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">${lang === 'es' ? '🌎 Países Disponibles' : '🌎 Available Countries'}</h2>
        <div class="countries-grid">
          ${countriesHTML}
        </div>
      </section>

      <section class="section" style="background: #f8f9fa;">
        <h2 class="section-title">${lang === 'es' ? '📂 Categorías' : '📂 Categories'}</h2>
        <div class="categories-grid">
          ${categoriesHTML}
        </div>
      </section>

      <footer class="footer">
        <p>&copy; 2025 ${lang === 'es' ? 'ENCUENTRAME' : 'FIND ME'} - ${lang === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}</p>
        <p style="margin-top: 1rem; opacity: 0.7; font-size: 0.9rem;">
          ${lang === 'es' ? '🚀 Proyecto nuevo con Supabase + Vite + JavaScript Vanilla' : '🚀 New project with Supabase + Vite + Vanilla JavaScript'}
        </p>
      </footer>
    </div>
  `;

  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const newLang = getLanguage() === 'es' ? 'en' : 'es';
      setLanguage(newLang);
      renderApp();
    });
  }
}

renderApp();
