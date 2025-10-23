import { supabase } from '../lib/supabase.js';
import { i18n } from '../lib/i18n.js';
import { Header, initHeaderEvents } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

export async function ListingSinglePage(listingId) {
  const t = (key) => i18n.t(key);

  let listing = null;
  let media = [];
  let isFavorite = false;
  let currentMediaIndex = 0;

  async function init() {
    try {
      await incrementViews();
      await loadListing();
      await loadMedia();
      await checkFavorite();
      render();
      attachEventListeners();
    } catch (error) {
      console.error('Error loading listing:', error);
      window.location.href = '/';
    }
  }

  async function incrementViews() {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ views_count: supabase.raw('views_count + 1') })
        .eq('id', listingId);

      if (error) console.error('Error incrementing views:', error);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  async function loadListing() {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        countries (name_en, name_es, code),
        states (name_en, name_es, slug),
        cities (name_en, name_es, slug),
        categories (name_en, name_es, slug)
      `)
      .eq('id', listingId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) {
      throw new Error('Listing not found');
    }

    listing = data;
  }

  async function loadMedia() {
    const { data, error } = await supabase
      .from('listing_media')
      .select('*')
      .eq('listing_id', listingId)
      .order('order_index');

    if (!error && data) {
      media = data;
    }
  }

  async function checkFavorite() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      isFavorite = !!data;
    }
  }

  async function toggleFavorite() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert('Debes iniciar sesión para guardar favoritos');
      window.location.href = '/auth';
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('listing_id', listingId);

        isFavorite = false;
        listing.favorites_count = Math.max(0, (listing.favorites_count || 0) - 1);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: session.user.id, listing_id: listingId });

        isFavorite = true;
        listing.favorites_count = (listing.favorites_count || 0) + 1;
      }

      render();
      attachEventListeners();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error al guardar favorito');
    }
  }

  function changeMedia(direction) {
    currentMediaIndex += direction;
    if (currentMediaIndex < 0) currentMediaIndex = media.length - 1;
    if (currentMediaIndex >= media.length) currentMediaIndex = 0;

    updateMediaDisplay();
  }

  function updateMediaDisplay() {
    const container = document.querySelector('.media-viewer');
    if (!container || media.length === 0) return;

    const currentMedia = media[currentMediaIndex];

    if (currentMedia.media_type === 'video') {
      container.innerHTML = `
        <video src="${currentMedia.media_url}" class="main-media" controls autoplay>
          Tu navegador no soporta videos
        </video>
      `;
    } else {
      container.innerHTML = `
        <img src="${currentMedia.media_url}" alt="${listing.title}" class="main-media">
      `;
    }

    if (media.length > 1) {
      container.innerHTML += `
        <button class="media-nav prev" onclick="window.changeMediaPrev()">‹</button>
        <button class="media-nav next" onclick="window.changeMediaNext()">›</button>
        <div class="media-counter">${currentMediaIndex + 1} / ${media.length}</div>
      `;
    }
  }

  function attachEventListeners() {
    initHeaderEvents();

    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', toggleFavorite);
    }

    window.changeMediaPrev = () => changeMedia(-1);
    window.changeMediaNext = () => changeMedia(1);

    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        currentMediaIndex = index;
        updateMediaDisplay();
      });
    });
  }

  function render() {
    const container = document.getElementById('app');
    const lang = i18n.getLanguage();

    const countryName = lang === 'en' ? listing.countries.name_en : listing.countries.name_es;
    const stateName = lang === 'en' ? listing.states.name_en : listing.states.name_es;
    const cityName = lang === 'en' ? listing.cities.name_en : listing.cities.name_es;
    const categoryName = lang === 'en' ? listing.categories.name_en : listing.categories.name_es;

    container.innerHTML = `
      ${Header()}

      <main class="listing-single-page">
        <div class="container">
          <div class="breadcrumb">
            <a href="/" data-link>Home</a>
            <span> / </span>
            <a href="/${listing.countries.code.toLowerCase()}" data-link>${countryName}</a>
            <span> / </span>
            <span>${categoryName}</span>
            <span> / </span>
            <span>${stateName}</span>
            <span> / </span>
            <span>${cityName}</span>
          </div>

          <div class="listing-content">
            <div class="listing-main">
              <h1 class="listing-title">${listing.title}</h1>

              <div class="listing-meta-bar">
                <div class="meta-stats">
                  <span class="stat-item">👁️ ${listing.views_count || 0} vistas</span>
                  <button id="favoriteBtn" class="btn-favorite-large ${isFavorite ? 'active' : ''}">
                    ${isFavorite ? '❤️' : '🤍'} ${listing.favorites_count || 0} favoritos
                  </button>
                </div>
              </div>

              ${media.length > 0 ? `
                <div class="media-section">
                  <div class="media-viewer">
                    ${media[0].media_type === 'video' ? `
                      <video src="${media[0].media_url}" class="main-media" controls>
                        Tu navegador no soporta videos
                      </video>
                    ` : `
                      <img src="${media[0].media_url}" alt="${listing.title}" class="main-media">
                    `}
                    ${media.length > 1 ? `
                      <button class="media-nav prev" onclick="window.changeMediaPrev()">‹</button>
                      <button class="media-nav next" onclick="window.changeMediaNext()">›</button>
                      <div class="media-counter">1 / ${media.length}</div>
                    ` : ''}
                  </div>

                  ${media.length > 1 ? `
                    <div class="media-thumbnails">
                      ${media.map((m, i) => `
                        <div class="thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}">
                          ${m.media_type === 'video' ? `
                            <video src="${m.media_url}" class="thumbnail-media"></video>
                            <div class="video-icon">▶</div>
                          ` : `
                            <img src="${m.media_url}" alt="Foto ${i + 1}" class="thumbnail-media">
                          `}
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              <div class="listing-description">
                <h2>Descripción</h2>
                <p>${listing.description || 'Sin descripción'}</p>
              </div>

              <div class="listing-details-grid">
                ${listing.age ? `
                  <div class="detail-item">
                    <span class="detail-label">Edad</span>
                    <span class="detail-value">${listing.age} años</span>
                  </div>
                ` : ''}

                ${listing.ethnicity ? `
                  <div class="detail-item">
                    <span class="detail-label">Etnia</span>
                    <span class="detail-value">${listing.ethnicity}</span>
                  </div>
                ` : ''}

                ${listing.body_type ? `
                  <div class="detail-item">
                    <span class="detail-label">Tipo de cuerpo</span>
                    <span class="detail-value">${listing.body_type}</span>
                  </div>
                ` : ''}

                ${listing.height ? `
                  <div class="detail-item">
                    <span class="detail-label">Altura</span>
                    <span class="detail-value">${listing.height} cm</span>
                  </div>
                ` : ''}

                ${listing.weight ? `
                  <div class="detail-item">
                    <span class="detail-label">Peso</span>
                    <span class="detail-value">${listing.weight} kg</span>
                  </div>
                ` : ''}

                ${listing.service_type && listing.service_type.length > 0 ? `
                  <div class="detail-item">
                    <span class="detail-label">Tipo de servicio</span>
                    <span class="detail-value">${listing.service_type.join(', ')}</span>
                  </div>
                ` : ''}

                ${listing.attends_to && listing.attends_to.length > 0 ? `
                  <div class="detail-item">
                    <span class="detail-label">Atiende a</span>
                    <span class="detail-value">${listing.attends_to.join(', ')}</span>
                  </div>
                ` : ''}

                ${listing.schedule && listing.schedule.length > 0 ? `
                  <div class="detail-item">
                    <span class="detail-label">Horario</span>
                    <span class="detail-value">${listing.schedule.join(', ')}</span>
                  </div>
                ` : ''}

                ${listing.languages && listing.languages.length > 0 ? `
                  <div class="detail-item">
                    <span class="detail-label">Idiomas</span>
                    <span class="detail-value">${listing.languages.join(', ')}</span>
                  </div>
                ` : ''}

                ${listing.payment_methods && listing.payment_methods.length > 0 ? `
                  <div class="detail-item">
                    <span class="detail-label">Métodos de pago</span>
                    <span class="detail-value">${listing.payment_methods.join(', ')}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="listing-sidebar">
              <div class="contact-card">
                <h3>Información de contacto</h3>

                ${listing.phone ? `
                  <a href="tel:${listing.phone}" class="contact-btn phone">
                    📱 ${listing.phone}
                  </a>
                ` : ''}

                ${listing.whatsapp ? `
                  <a href="https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="contact-btn whatsapp">
                    💬 WhatsApp
                  </a>
                ` : ''}

                ${listing.email ? `
                  <a href="mailto:${listing.email}" class="contact-btn email">
                    ✉️ Email
                  </a>
                ` : ''}
              </div>

              <div class="location-card">
                <h3>Ubicación</h3>
                <div class="location-info">
                  <p><strong>País:</strong> ${countryName}</p>
                  <p><strong>Estado:</strong> ${stateName}</p>
                  <p><strong>Ciudad:</strong> ${cityName}</p>
                  ${listing.neighborhood ? `<p><strong>Barrio:</strong> ${listing.neighborhood}</p>` : ''}
                  ${listing.address ? `<p><strong>Dirección:</strong> ${listing.address}</p>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      ${Footer()}
    `;
  }

  await init();
}
