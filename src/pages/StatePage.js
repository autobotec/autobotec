import { supabase } from '../lib/supabase.js';
import { getLanguage } from '../lib/i18n.js';

export async function StatePage(params) {
  const { countryCode, stateSlug } = params;
  const lang = getLanguage();

  const country = await loadCountry(countryCode);
  if (!country) return '<div class="error-page"><h1>Country not found</h1></div>';

  const state = await loadState(country.id, stateSlug);
  if (!state) return '<div class="error-page"><h1>State not found</h1></div>';

  const cities = await loadCities(state.id);
  const categories = await loadCategories();
  const listings = await loadListings(country.id, state.id);

  return `
    <div class="location-page">
      <div class="breadcrumb">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a href="/" data-link>${lang === 'es' ? 'Inicio' : 'Home'}</a>
            <span>/</span>
            <a href="/${countryCode.toLowerCase()}" data-link>${country.flag_emoji} ${lang === 'es' ? country.name_es : country.name_en}</a>
            <span>/</span>
            <span class="current">${lang === 'es' ? state.name_es : state.name_en}</span>
          </nav>
        </div>
      </div>

      <div class="location-header">
        <div class="container">
          <h1 class="location-title">
            📍 ${lang === 'es' ? state.name_es : state.name_en}
          </h1>
          <p class="location-subtitle">
            ${lang === 'es' ? country.name_es : country.name_en}
          </p>
        </div>
      </div>

      <div class="location-content">
        <div class="container">
          <div class="content-layout">
            <aside class="sidebar">
              <div class="sidebar-section">
                <h3 class="sidebar-title">${lang === 'es' ? '🏙️ Ciudades' : '🏙️ Cities'}</h3>
                <div class="cities-list">
                  ${cities.length > 0 ? cities.map(city => `
                    <a href="/${countryCode.toLowerCase()}/${stateSlug}/${city.slug}" data-link class="location-link">
                      ${lang === 'es' ? city.name_es : city.name_en}
                      <span class="location-count">(0)</span>
                    </a>
                  `).join('') : `
                    <p class="no-data">${lang === 'es' ? 'No hay ciudades disponibles' : 'No cities available'}</p>
                  `}
                </div>
              </div>

              <div class="sidebar-section">
                <h3 class="sidebar-title">${lang === 'es' ? '📂 Categorías' : '📂 Categories'}</h3>
                <div class="categories-list">
                  ${categories.map(cat => `
                    <a href="/${countryCode.toLowerCase()}/${cat.slug}" data-link class="category-link">
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
                  ${lang === 'es' ? '🔥 Anuncios en' : '🔥 Listings in'} ${lang === 'es' ? state.name_es : state.name_en}
                </h2>
                <button class="btn-primary" id="createListingBtn">
                  ${lang === 'es' ? '+ Publicar' : '+ Post'}
                </button>
              </div>

              ${listings.length > 0 ? `
                <div class="listings-grid">
                  ${listings.map(listing => renderListingCard(listing, lang)).join('')}
                </div>
              ` : `
                <div class="empty-state">
                  <div class="empty-icon">📭</div>
                  <h3>${lang === 'es' ? 'No hay anuncios en esta ubicación' : 'No listings in this location'}</h3>
                  <p>${lang === 'es' ? 'Sé el primero en publicar aquí' : 'Be the first to post here'}</p>
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

async function loadState(countryId, stateSlug) {
  try {
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .eq('country_id', countryId)
      .eq('slug', stateSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading state:', error);
    return null;
  }
}

async function loadCities(stateId) {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('state_id', stateId)
      .eq('is_active', true)
      .order('name_en');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading cities:', error);
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

async function loadListings(countryId, stateId) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('country_id', countryId)
      .eq('state_id', stateId)
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
