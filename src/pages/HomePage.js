import { supabase } from '../lib/supabase.js';
import { getLanguage, t } from '../lib/i18n.js';

export async function HomePage() {
  const countries = await loadCountries();
  const categories = await loadCategories();
  const lang = getLanguage();

  return `
    <div class="home-page">
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">💋 ${lang === 'es' ? 'ENCUENTRAME' : 'FIND ME'}</h1>
          <p class="hero-subtitle">${lang === 'es' ? 'Plataforma de Clasificados para Adultos' : 'Adult Classifieds Platform'}</p>
          <p class="hero-description">${lang === 'es' ? 'Selecciona tu país para comenzar' : 'Select your country to get started'}</p>
        </div>
      </section>

      <section class="countries-section">
        <div class="container">
          <h2 class="section-title">${lang === 'es' ? '🌎 Selecciona tu País' : '🌎 Select Your Country'}</h2>
          <div class="countries-grid">
            ${countries.map(country => `
              <a href="/${country.code.toLowerCase()}" data-link class="country-card">
                <div class="country-flag">${country.flag_emoji}</div>
                <div class="country-name">${lang === 'es' ? country.name_es : country.name_en}</div>
              </a>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="categories-preview">
        <div class="container">
          <h2 class="section-title">${lang === 'es' ? '📂 Categorías Disponibles' : '📂 Available Categories'}</h2>
          <div class="categories-grid">
            ${categories.slice(0, 6).map(cat => `
              <div class="category-card-preview">
                <span class="category-icon">${cat.icon || '✨'}</span>
                <span class="category-name">${lang === 'es' ? cat.name_es : cat.name_en}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="stats-section">
        <div class="container">
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
              <div class="stat-number">0</div>
              <div class="stat-label">${lang === 'es' ? 'Anuncios' : 'Listings'}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

async function loadCountries() {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
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
