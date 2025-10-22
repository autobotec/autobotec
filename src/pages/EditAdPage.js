import { i18n } from '../i18n.js';
import { supabase } from '../supabase.js';
import { router } from '../router.js';

export class EditAdPage {
  constructor(params) {
    this.listingId = params.id;
    this.listing = null;
    this.categories = [];
    this.locations = [];
  }

  async loadData() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.navigate('/auth');
      return;
    }

    const [listingRes, categoriesRes, locationsRes] = await Promise.all([
      supabase
        .from('listings')
        .select('*')
        .eq('id', this.listingId)
        .eq('user_id', session.user.id)
        .maybeSingle(),
      supabase.from('categories').select('*').order('order_index'),
      supabase.from('locations').select('*').eq('type', 'city').order('name_en')
    ]);

    if (!listingRes.data) {
      router.navigate('/dashboard');
      return;
    }

    this.listing = listingRes.data;
    this.categories = categoriesRes.data || [];
    this.locations = locationsRes.data || [];
  }

  render() {
    const t = i18n.t.bind(i18n);

    return `
      <div style="max-width: 800px; margin: 0 auto;">
        <button class="btn-secondary" id="back-btn" style="margin-bottom: calc(var(--spacing) * 3);">
          ← ${t('common.back')}
        </button>

        <h1 class="section-title">Edit Ad</h1>
        <p style="color: var(--text-light); margin-bottom: calc(var(--spacing) * 4);">
          Update your ad information below
        </p>

        <div id="edit-message"></div>

        <div id="edit-form-container">
          <div class="loading">${t('common.loading')}</div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.loadData();
    this.renderForm();
    this.attachEvents();
  }

  renderForm() {
    const lang = i18n.getCurrentLanguage();
    const t = i18n.t.bind(i18n);
    const container = document.getElementById('edit-form-container');

    if (!this.listing) {
      container.innerHTML = '<div class="error">Listing not found</div>';
      return;
    }

    container.innerHTML = `
      <div style="background: var(--bg-card); padding: calc(var(--spacing) * 5); border-radius: var(--radius); box-shadow: var(--shadow-md);">
        <form id="edit-ad-form">
          <div class="form-group">
            <label class="form-label">${t('postAd.titleLabel')} (English)</label>
            <input type="text" class="form-input" id="title-en" required value="${this.listing.title_en}" />
          </div>

          <div class="form-group">
            <label class="form-label">${t('postAd.titleLabel')} (Español)</label>
            <input type="text" class="form-input" id="title-es" required value="${this.listing.title_es}" />
          </div>

          <div class="form-group">
            <label class="form-label">${t('postAd.descriptionLabel')} (English)</label>
            <textarea class="form-textarea" id="description-en" required>${this.listing.description_en}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">${t('postAd.descriptionLabel')} (Español)</label>
            <textarea class="form-textarea" id="description-es" required>${this.listing.description_es}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">${t('postAd.categoryLabel')}</label>
            <select class="form-select" id="category" required>
              <option value="">${t('postAd.categoryPlaceholder')}</option>
              ${this.categories.map(cat => `
                <option value="${cat.id}" ${cat.id === this.listing.category_id ? 'selected' : ''}>
                  ${lang === 'en' ? cat.name_en : cat.name_es}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${t('postAd.locationLabel')}</label>
            <select class="form-select" id="location" required>
              <option value="">${t('postAd.locationPlaceholder')}</option>
              ${this.locations.map(loc => `
                <option value="${loc.id}" ${loc.id === this.listing.location_id ? 'selected' : ''}>
                  ${lang === 'en' ? loc.name_en : loc.name_es}
                </option>
              `).join('')}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: calc(var(--spacing) * 2);">
            <div class="form-group">
              <label class="form-label">${t('postAd.priceLabel')}</label>
              <input type="number" class="form-input" id="price" value="${this.listing.price || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label">${t('postAd.currencyLabel')}</label>
              <select class="form-select" id="currency">
                <option value="USD" ${this.listing.currency === 'USD' ? 'selected' : ''}>USD</option>
                <option value="COP" ${this.listing.currency === 'COP' ? 'selected' : ''}>COP</option>
                <option value="EUR" ${this.listing.currency === 'EUR' ? 'selected' : ''}>EUR</option>
                <option value="MXN" ${this.listing.currency === 'MXN' ? 'selected' : ''}>MXN</option>
              </select>
            </div>
          </div>

          <h3 style="font-size: 18px; font-weight: 600; margin: calc(var(--spacing) * 4) 0 calc(var(--spacing) * 2);">
            ${t('postAd.contactLabel')}
          </h3>

          <div class="form-group">
            <label class="form-label">${t('postAd.phoneLabel')}</label>
            <input type="tel" class="form-input" id="phone" value="${this.listing.contact_phone || ''}" />
          </div>

          <div class="form-group">
            <label class="form-label">${t('postAd.emailLabel')}</label>
            <input type="email" class="form-input" id="email" value="${this.listing.contact_email || ''}" />
          </div>

          <div class="form-group">
            <label class="form-label">${t('postAd.whatsappLabel')}</label>
            <input type="tel" class="form-input" id="whatsapp" value="${this.listing.whatsapp || ''}" />
          </div>

          <div style="display: flex; gap: calc(var(--spacing) * 2); margin-top: calc(var(--spacing) * 3);">
            <button type="submit" class="btn-primary" style="flex: 1;">
              ${t('common.save')}
            </button>
            <button type="button" class="btn-secondary" id="cancel-btn" style="flex: 1;">
              ${t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  attachEvents() {
    const form = document.getElementById('edit-ad-form');
    const message = document.getElementById('edit-message');
    const backBtn = document.getElementById('back-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const t = i18n.t.bind(i18n);

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        router.navigate('/dashboard');
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        router.navigate('/dashboard');
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        message.innerHTML = '';

        const updateData = {
          title_en: document.getElementById('title-en').value,
          title_es: document.getElementById('title-es').value,
          description_en: document.getElementById('description-en').value,
          description_es: document.getElementById('description-es').value,
          category_id: document.getElementById('category').value,
          location_id: document.getElementById('location').value,
          price: document.getElementById('price').value || null,
          currency: document.getElementById('currency').value,
          contact_phone: document.getElementById('phone').value,
          contact_email: document.getElementById('email').value,
          whatsapp: document.getElementById('whatsapp').value,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('listings')
          .update(updateData)
          .eq('id', this.listingId);

        if (error) {
          message.innerHTML = `<div class="error">Error updating ad: ${error.message}</div>`;
          console.error('Error updating ad:', error);
        } else {
          message.innerHTML = '<div class="success">Ad updated successfully!</div>';
          setTimeout(() => router.navigate('/dashboard'), 2000);
        }
      });
    }
  }
}
