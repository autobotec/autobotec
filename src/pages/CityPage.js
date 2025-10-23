import { supabase } from '../lib/supabase.js';
import { getLanguage } from '../lib/i18n.js';

export async function CityPage(params) {
  const { countryCode, stateSlug, citySlug } = params;
  const lang = getLanguage();

  const country = await loadCountry(countryCode);
  if (!country) return '<div class="error-page"><h1>Country not found</h1></div>';

  const state = await loadState(country.id, stateSlug);
  if (!state) return '<div class="error-page"><h1>State not found</h1></div>';

  const city = await loadCity(state.id, citySlug);
  if (!city) return '<div class="error-page"><h1>City not found</h1></div>';

  const categories = await loadCategories();
  const listings = await loadListings(country.id, state.id, city.id);

  return `
    <div class="location-page">
      <div class="breadcrumb">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a href="/" data-link>${lang === 'es' ? 'Inicio' : 'Home'}</a>
            <span>/</span>
            <a href="/${countryCode.toLowerCase()}" data-link>${country.flag_emoji} ${lang === 'es' ? country.name_es : country.name_en}</a>
            <span>/</span>
            <a href="/${countryCode.toLowerCase()}/${stateSlug}" data-link>${lang === 'es' ? state.name_es : state.name_en}</a>
            <span>/</span>
            <span class="current">${lang === 'es' ? city.name_es : city.name_en}</span>
          </nav>
        </div>
      </div>

      <div class="location-header">
        <div class="container">
          <h1 class="location-title">
            🏙️ ${lang === 'es' ? city.name_es : city.name_en}
          </h1>
          <p class="location-subtitle">
            ${lang === 'es' ? state.name_es : state.name_en}, ${lang === 'es' ? country.name_es : country.name_en}
          </p>
        </div>
      </div>

      <div class="location-content">
        <div class="container">
          <div class="content-layout">
            <aside class="sidebar">
              <div class="sidebar-section">
                <h3 class="sidebar-title">${lang === 'es' ? '📂 Categorías' : '📂 Categories'}</h3>
                <div class="categories-list">
                  ${categories.map(cat => `
                    <a href="/${countryCode.toLowerCase()}/${cat.slug}/${stateSlug}/${citySlug}" data-link class="category-link">
                      <span class="category-icon-small">${cat.icon || '✨'}</span>
                      ${lang === 'es' ? cat.name_es : cat.name_en}
                      <span class="category-count">(0)</span>
                    </a>
                  `).join('')}
                </div>
              </div>

              <div class="sidebar-section">
                <h3 class="sidebar-title">${lang === 'es' ? '🔙 Navegación' : '🔙 Navigation'}</h3>
                <div class="navigation-list">
                  <a href="/${countryCode.toLowerCase()}" data-link class="nav-link">
                    ← ${lang === 'es' ? 'Todos los estados' : 'All states'}
                  </a>
                  <a href="/${countryCode.toLowerCase()}/${stateSlug}" data-link class="nav-link">
                    ← ${lang === 'es' ? 'Todas las ciudades' : 'All cities'}
                  </a>
                </div>
              </div>
            </aside>

            <main class="main-content">
              <div class="content-header">
                <h2 class="content-title">
                  ${lang === 'es' ? '🔥 Todos los anuncios en' : '🔥 All listings in'} ${lang === 'es' ? city.name_es : city.name_en}
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
                  <h3>${lang === 'es' ? 'No hay anuncios en esta ciudad' : 'No listings in this city'}</h3>
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

async function loadCity(stateId, citySlug) {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('state_id', stateId)
      .eq('slug', citySlug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading city:', error);
    return null;
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

async function loadListings(countryId, stateId, cityId) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('country_id', countryId)
      .eq('state_id', stateId)
      .eq('city_id', cityId)
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
