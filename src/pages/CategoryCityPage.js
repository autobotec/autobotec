import { supabase } from '../lib/supabase.js';
import { getLanguage } from '../lib/i18n.js';

export async function CategoryCityPage(params) {
  const { countryCode, categorySlug, stateSlug, citySlug } = params;
  const lang = getLanguage();

  const country = await loadCountry(countryCode);
  if (!country) return '<div class="error-page"><h1>Country not found</h1></div>';

  const category = await loadCategory(categorySlug);
  if (!category) return '<div class="error-page"><h1>Category not found</h1></div>';

  const state = await loadState(country.id, stateSlug);
  if (!state) return '<div class="error-page"><h1>State not found</h1></div>';

  const city = await loadCity(state.id, citySlug);
  if (!city) return '<div class="error-page"><h1>City not found</h1></div>';

  const categories = await loadCategories();
  const listings = await loadListings(country.id, state.id, city.id, category.id);

  return `
    <div class="location-page category-page">
      <div class="breadcrumb">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a href="/" data-link>${lang === 'es' ? 'Inicio' : 'Home'}</a>
            <span>/</span>
            <a href="/${countryCode.toLowerCase()}" data-link>${country.flag_emoji} ${lang === 'es' ? country.name_es : country.name_en}</a>
            <span>/</span>
            <a href="/${countryCode.toLowerCase()}/${categorySlug}" data-link>${category.icon} ${lang === 'es' ? category.name_es : category.name_en}</a>
            <span>/</span>
            <a href="/${countryCode.toLowerCase()}/${stateSlug}" data-link>${lang === 'es' ? state.name_es : state.name_en}</a>
            <span>/</span>
            <span class="current">${lang === 'es' ? city.name_es : city.name_en}</span>
          </nav>
        </div>
      </div>

      <div class="category-header">
        <div class="container">
          <div class="category-header-content">
            <div class="category-info">
              <span class="category-icon-large">${category.icon || '✨'}</span>
              <div>
                <h1 class="category-title">
                  ${lang === 'es' ? category.name_es : category.name_en}
                </h1>
                <p class="category-location">
                  📍 ${lang === 'es' ? city.name_es : city.name_en}, ${lang === 'es' ? state.name_es : state.name_en}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="location-content">
        <div class="container">
          <div class="content-layout">
            <aside class="sidebar">
              <div class="sidebar-section">
                <h3 class="sidebar-title">${lang === 'es' ? '📂 Otras Categorías' : '📂 Other Categories'}</h3>
                <div class="categories-list">
                  ${categories.map(cat => `
                    <a href="/${countryCode.toLowerCase()}/${cat.slug}/${stateSlug}/${citySlug}"
                       data-link
                       class="category-link ${cat.id === category.id ? 'active' : ''}">
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
                  <a href="/${countryCode.toLowerCase()}/${categorySlug}" data-link class="nav-link">
                    ← ${lang === 'es' ? 'Todo el país' : 'Entire country'}
                  </a>
                  <a href="/${countryCode.toLowerCase()}/${categorySlug}/${stateSlug}" data-link class="nav-link">
                    ← ${lang === 'es' ? 'Todo el estado' : 'Entire state'}
                  </a>
                  <a href="/${countryCode.toLowerCase()}/${stateSlug}/${citySlug}" data-link class="nav-link">
                    ← ${lang === 'es' ? 'Todas las categorías' : 'All categories'}
                  </a>
                </div>
              </div>
            </aside>

            <main class="main-content">
              <div class="content-header">
                <h2 class="content-title">
                  ${lang === 'es' ? '🔥 Resultados' : '🔥 Results'}
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
                  <h3>${lang === 'es' ? 'No hay anuncios en esta categoría' : 'No listings in this category'}</h3>
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

async function loadCategory(categorySlug) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading category:', error);
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

async function loadListings(countryId, stateId, cityId, categoryId) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('country_id', countryId)
      .eq('state_id', stateId)
      .eq('city_id', cityId)
      .eq('category_id', categoryId)
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
