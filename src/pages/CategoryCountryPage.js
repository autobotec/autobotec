import { supabase } from '../lib/supabase.js';
import { getLanguage } from '../lib/i18n.js';

export async function CategoryCountryPage(params) {
  const { countryCode, categorySlug } = params;
  const lang = getLanguage();

  const country = await loadCountry(countryCode);
  if (!country) return '<div class="error-page"><h1>Country not found</h1></div>';

  const category = await loadCategory(categorySlug);
  if (!category) return '<div class="error-page"><h1>Category not found</h1></div>';

  const states = await loadStates(country.id);
  const categories = await loadCategories();
  const listings = await loadListings(country.id, category.id);

  return `
    <div class="location-page category-page">
      <div class="breadcrumb">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a href="/" data-link>${lang === 'es' ? 'Inicio' : 'Home'}</a>
            <span>/</span>
            <a href="/${countryCode.toLowerCase()}" data-link>${country.flag_emoji} ${lang === 'es' ? country.name_es : country.name_en}</a>
            <span>/</span>
            <span class="current">${category.icon} ${lang === 'es' ? category.name_es : category.name_en}</span>
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
                  ${country.flag_emoji} ${lang === 'es' ? country.name_es : country.name_en}
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
                <h3 class="sidebar-title">${lang === 'es' ? '📍 Estados/Provincias' : '📍 States/Provinces'}</h3>
                <div class="states-list">
                  ${states.length > 0 ? states.map(state => `
                    <a href="/${countryCode.toLowerCase()}/${categorySlug}/${state.slug}" data-link class="location-link">
                      ${lang === 'es' ? state.name_es : state.name_en}
                      <span class="location-count">(0)</span>
                    </a>
                  `).join('') : `
                    <p class="no-data">${lang === 'es' ? 'No hay estados disponibles' : 'No states available'}</p>
                  `}
                </div>
              </div>

              <div class="sidebar-section">
                <h3 class="sidebar-title">${lang === 'es' ? '📂 Otras Categorías' : '📂 Other Categories'}</h3>
                <div class="categories-list">
                  ${categories.map(cat => `
                    <a href="/${countryCode.toLowerCase()}/${cat.slug}"
                       data-link
                       class="category-link ${cat.id === category.id ? 'active' : ''}">
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
                  ${lang === 'es' ? '🔥 Todos los anuncios' : '🔥 All listings'}
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

async function loadListings(countryId, categoryId) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('country_id', countryId)
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
