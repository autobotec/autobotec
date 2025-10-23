import { supabase } from '../lib/supabase.js';
import { i18n } from '../lib/i18n.js';
import { Header, initHeaderEvents } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

export async function ListingDetailPage(params) {
  const t = (key) => i18n.t(key);
  const { country, category, state, city } = params;

  let listings = [];
  let countryData = null;
  let stateData = null;
  let cityData = null;
  let categoryData = null;

  async function init() {
    try {
      await Promise.all([
        loadLocationData(),
        loadListings()
      ]);
      render();
      attachEventListeners();
    } catch (error) {
      console.error('Error loading listing detail:', error);
      render();
    }
  }

  async function loadLocationData() {
    const { data: c } = await supabase
      .from('countries')
      .select('*')
      .eq('code', country.toUpperCase())
      .maybeSingle();
    countryData = c;

    if (state) {
      const { data: s } = await supabase
        .from('states')
        .select('*')
        .eq('slug', state)
        .maybeSingle();
      stateData = s;
    }

    if (city) {
      const { data: ci } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', city)
        .maybeSingle();
      cityData = ci;
    }

    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', category)
        .maybeSingle();
      categoryData = cat;
    }
  }

  async function loadListings() {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');

    if (countryData) query = query.eq('country_id', countryData.id);
    if (stateData) query = query.eq('state_id', stateData.id);
    if (cityData) query = query.eq('city_id', cityData.id);
    if (categoryData) query = query.eq('category_id', categoryData.id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      listings = data;
      await loadMediaForListings();
    }
  }

  async function loadMediaForListings() {
    for (const listing of listings) {
      const { data: media } = await supabase
        .from('listing_media')
        .select('*')
        .eq('listing_id', listing.id)
        .order('order_index');

      listing.media = media || [];
    }
  }

  async function handleFavorite(listingId) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert('Debes iniciar sesión para guardar favoritos');
      window.location.href = '/auth';
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);

        await supabase.rpc('decrement_favorites', { listing_id: listingId });
        alert('Eliminado de favoritos');
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: session.user.id, listing_id: listingId });

        await supabase.rpc('increment_favorites', { listing_id: listingId });
        alert('Agregado a favoritos');
      }

      await loadListings();
      render();
      attachEventListeners();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  async function handleViewListing(listingId) {
    try {
      await supabase.rpc('increment_views', { listing_id: listingId });

      window.location.href = `/listing/${listingId}`;
    } catch (error) {
      console.error('Error tracking view:', error);
      window.location.href = `/listing/${listingId}`;
    }
  }

  function attachEventListeners() {
    initHeaderEvents();

    document.querySelectorAll('.btn-favorite').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const listingId = btn.getAttribute('data-id');
        handleFavorite(listingId);
      });
    });

    document.querySelectorAll('.listing-item').forEach(item => {
      item.addEventListener('click', () => {
        const listingId = item.getAttribute('data-id');
        handleViewListing(listingId);
      });
    });
  }

  function getFirstMedia(listing) {
    if (!listing.media || listing.media.length === 0) {
      return `<div class="listing-placeholder">
        <span>No image</span>
      </div>`;
    }

    const firstMedia = listing.media[0];

    if (firstMedia.media_type === 'video') {
      return `<video src="${firstMedia.media_url}" class="listing-media" controls></video>`;
    } else {
      return `<img src="${firstMedia.media_url}" alt="${listing.title}" class="listing-media">`;
    }
  }

  function render() {
    const container = document.getElementById('app');
    const lang = i18n.getLanguage();

    const breadcrumb = [];
    if (countryData) breadcrumb.push(lang === 'en' ? countryData.name_en : countryData.name_es);
    if (categoryData) breadcrumb.push(lang === 'en' ? categoryData.name_en : categoryData.name_es);
    if (stateData) breadcrumb.push(lang === 'en' ? stateData.name_en : stateData.name_es);
    if (cityData) breadcrumb.push(lang === 'en' ? cityData.name_en : cityData.name_es);

    container.innerHTML = `
      ${Header()}

      <main class="listing-detail-page">
        <div class="container">
          <div class="breadcrumb">
            <a href="/" data-link>Home</a>
            ${breadcrumb.map(b => `<span> / ${b}</span>`).join('')}
          </div>

          <h1>${breadcrumb.join(' - ')}</h1>
          <p class="subtitle">${listings.length} ${listings.length === 1 ? 'anuncio' : 'anuncios'} ${t('common.available')}</p>

          ${listings.length === 0 ? `
            <div class="empty-state">
              <p>${t('listing.no_listings')}</p>
            </div>
          ` : `
            <div class="listings-list">
              ${listings.map(listing => `
                <div class="listing-item" data-id="${listing.id}">
                  <div class="listing-media-container">
                    ${getFirstMedia(listing)}
                    <div class="listing-badge">${listing.media.length} ${listing.media.length === 1 ? 'foto' : 'fotos'}</div>
                  </div>

                  <div class="listing-info">
                    <h3 class="listing-title">${listing.title}</h3>
                    <p class="listing-description">${listing.description?.substring(0, 150)}${listing.description?.length > 150 ? '...' : ''}</p>

                    <div class="listing-details">
                      ${listing.age ? `<span>📅 ${listing.age} años</span>` : ''}
                      ${listing.phone ? `<span>📱 ${listing.phone}</span>` : ''}
                      ${listing.neighborhood ? `<span>📍 ${listing.neighborhood}</span>` : ''}
                    </div>

                    <div class="listing-stats">
                      <button class="btn-favorite" data-id="${listing.id}">
                        ❤️ <span>${listing.favorites_count || 0}</span>
                      </button>
                      <span class="stat-item">👁️ ${listing.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </main>

      ${Footer()}
    `;
  }

  await init();
}
