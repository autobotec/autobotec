import { supabase } from '../lib/supabase.js';
import { getLanguage } from '../lib/i18n.js';

export async function CountryPage(params) {
  const { countryCode } = params;
  const lang = getLanguage();

  const country = await loadCountry(countryCode);
  if (!country) {
    return '<div class="error-page"><h1>Country not found</h1></div>';
  }

  const states = await loadStates(country.id);
  const categories = await loadCategories();
  const listings = await loadListings(country.id);

  return `
    <div class="country-page">
      <div class="country-header">
        <div class="container">
          <div class="country-header-content">
            <div class="country-info">
              <span class="country-flag-large">${country.flag_emoji}</span>
              <h1 class="country-title">${lang === 'es' ? country.name_es : country.name_en}</h1>
            </div>
            <a href="/" data-link class="btn-back">
              ← ${lang === 'es' ? 'Cambiar País' : 'Change Country'}
            </a>
          </div>
        </div>
      </div>

      <div class="country-content">
        <div class="container">
          <div class="content-layout">
            <aside class="sidebar">
              <div class="sidebar-section">
                <h3 class="sidebar-title">${lang === 'es' ? '📍 Estados/Provincias' : '📍 States/Provinces'}</h3>
                <div class="states-list">
                  ${states.length > 0 ? states.map(state => `
                    <a href="/${countryCode.toLowerCase()}/${state.slug}" data-link class="state-link">
                      ${lang === 'es' ? state.name_es : state.name_en}
                      <span class="state-count">(0)</span>
                    </a>
                  `).join('') : `
                    <p class="no-data">${lang === 'es' ? 'No hay estados disponibles' : 'No states available'}</p>
                  `}
                </div>
              </div>

              <div class="sidebar-section">
                <h3 class="sidebar-title">${lang === 'es' ? '📂 Categorías' : '📂 Categories'}</h3>
                <div class="categories-list">
                  ${categories.map(cat => `
                    <a href="/${countryCode.toLowerCase()}/categoria/${cat.slug}" data-link class="category-link">
                      <span class="category-icon-small">${cat.icon || '✨'}</span>
                      ${lang === 'es' ? cat.name_es : cat.name_en}
                      <span class="category-count">(0)</span>
                    </a>
                  `).join('')}
                </div>
              </div>
            </aside>

            <main class="main-content">
              <div class="content-header">
                <h2 class="content-title">
                  ${lang === 'es' ? '🔥 Anuncios Recientes' : '🔥 Recent Listings'}
                </h2>
                <button class="btn-primary" id="createListingBtn">
                  ${lang === 'es' ? '+ Publicar Anuncio' : '+ Post Listing'}
                </button>
              </div>

              ${listings.length > 0 ? `
                <div class="listings-grid">
                  ${listings.map(listing => renderListingCard(listing, lang)).join('')}
                </div>
              ` : `
                <div class="empty-state">
                  <div class="empty-icon">📭</div>
                  <h3>${lang === 'es' ? 'No hay anuncios todavía' : 'No listings yet'}</h3>
                  <p>${lang === 'es' ? 'Sé el primero en publicar un anuncio en este país' : 'Be the first to post a listing in this country'}</p>
                  <button class="btn-primary">${lang === 'es' ? 'Publicar Anuncio' : 'Post Listing'}</button>
                </div>
              `}
            </main>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderListingCard(listing, lang) {
  return `
    <div class="listing-card">
      <div class="listing-image">
        <img src="https://via.placeholder.com/300x400?text=No+Image" alt="${listing.title}">
        ${listing.featured ? '<span class="badge-featured">⭐ Featured</span>' : ''}
      </div>
      <div class="listing-info">
        <h3 class="listing-title">${listing.title}</h3>
        <p class="listing-location">📍 ${listing.neighborhood || 'Location'}</p>
        ${listing.age ? `<p class="listing-age">${listing.age} ${lang === 'es' ? 'años' : 'years'}</p>` : ''}
        <div class="listing-meta">
          <span>👁 ${listing.views_count || 0}</span>
          <span>❤️ ${listing.favorites_count || 0}</span>
        </div>
      </div>
    </div>
  `;
}

async function loadCountry(countryCode) {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('code', countryCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading country:', error);
    return null;
  }
}

async function loadStates(countryId) {
  try {
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .eq('country_id', countryId)
      .eq('is_active', true)
      .order('name_en');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading states:', error);
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

async function loadListings(countryId) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('country_id', countryId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading listings:', error);
    return [];
  }
}
