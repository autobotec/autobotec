import { auth } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';
import { i18n } from '../lib/i18n.js';

export async function EditAdPage(listingId) {
  const t = (key) => i18n.t(key);

  let user = null;
  let listing = null;
  let countries = [];
  let states = [];
  let cities = [];
  let categories = [];

  async function init() {
    try {
      user = await auth.getCurrentUser();
      if (!user) {
        window.location.href = '/auth';
        return;
      }

      await loadListing();
      await loadFormData();

      if (listing.country_id) {
        await loadStates(listing.country_id);
      }
      if (listing.state_id) {
        await loadCities(listing.state_id);
      }

      render();
    } catch (error) {
      console.error('EditAd init error:', error);
      window.location.href = '/dashboard';
    }
  }

  async function loadListing() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Listing not found or access denied');
    }

    listing = data;
  }

  async function loadFormData() {
    const [countriesRes, categoriesRes] = await Promise.all([
      supabase.from('countries').select('*').order('order_index'),
      supabase.from('categories').select('*').order('order_index')
    ]);

    countries = countriesRes.data || [];
    categories = categoriesRes.data || [];
  }

  async function loadStates(countryId) {
    if (!countryId) {
      states = [];
      cities = [];
      return;
    }

    const { data } = await supabase
      .from('states')
      .select('*')
      .eq('country_id', countryId)
      .order('name_es');

    states = data || [];

    updateStatesDropdown();
  }

  async function loadCities(stateId) {
    if (!stateId) {
      cities = [];
      return;
    }

    const { data } = await supabase
      .from('cities')
      .select('*')
      .eq('state_id', stateId)
      .order('name_es');

    cities = data || [];

    updateCitiesDropdown();
  }

  function updateStatesDropdown() {
    const stateSelect = document.getElementById('state_id');
    const lang = i18n.getLanguage();

    stateSelect.innerHTML = `<option value="">${t('post_ad.state')}</option>` +
      states.map(state => `<option value="${state.id}" ${state.id === listing.state_id ? 'selected' : ''}>${lang === 'en' ? state.name_en : state.name_es}</option>`).join('');
  }

  function updateCitiesDropdown() {
    const citySelect = document.getElementById('city_id');
    const lang = i18n.getLanguage();

    citySelect.innerHTML = `<option value="">${t('post_ad.city')}</option>` +
      cities.map(city => `<option value="${city.id}" ${city.id === listing.city_id ? 'selected' : ''}>${lang === 'en' ? city.name_en : city.name_es}</option>`).join('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('edit-error');

    errorDiv.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = t('loading');

    try {
      const serviceType = formData.getAll('service_type');
      const attendsTo = formData.getAll('attends_to');
      const schedule = formData.getAll('schedule');
      const languages = formData.getAll('languages');
      const paymentMethods = formData.getAll('payment_methods');

      const updateData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category_id: formData.get('category_id') || null,
        country_id: formData.get('country_id') || null,
        state_id: formData.get('state_id') || null,
        city_id: formData.get('city_id') || null,
        neighborhood: formData.get('neighborhood') || null,
        age: formData.get('age') ? parseInt(formData.get('age')) : null,
        price: formData.get('price') ? parseFloat(formData.get('price')) : null,
        contact_phone: formData.get('contact_phone') || null,
        whatsapp: formData.get('whatsapp') || null,
        contact_email: formData.get('contact_email') || null,
        website_url: formData.get('website_url') || null,
        instagram_url: formData.get('instagram_url') || null,
        twitter_url: formData.get('twitter_url') || null,
        telegram_url: formData.get('telegram_url') || null,
        service_type: serviceType.length > 0 ? serviceType : null,
        attends_to: attendsTo.length > 0 ? attendsTo : null,
        schedule: schedule.length > 0 ? schedule : null,
        languages: languages.length > 0 ? languages : null,
        payment_methods: paymentMethods.length > 0 ? paymentMethods : null,
        travels: formData.get('travels') === 'on',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', listingId);

      if (error) throw error;

      alert(t('post_ad.success'));
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error updating listing:', error);
      errorDiv.textContent = error.message || t('post_ad.error');
      submitBtn.disabled = false;
      submitBtn.textContent = t('common.save');
    }
  }

  function isChecked(array, value) {
    return array && array.includes(value);
  }

  function render() {
    const container = document.getElementById('app');
    const lang = i18n.getLanguage();

    container.innerHTML = `
      <div class="post-ad-page">
        <div class="post-ad-container">
          <div class="post-ad-header">
            <h1>${t('post_ad.edit_title')}</h1>
            <a href="/dashboard" class="btn-secondary">${t('common.back')}</a>
          </div>

          <form id="edit-ad-form" class="post-ad-form">
            <section class="form-section">
              <h2>${t('post_ad.content')}</h2>

              <div class="form-group">
                <label for="title">${t('post_ad.title_field')} *</label>
                <input type="text" id="title" name="title" required maxlength="200" value="${listing.title || ''}" />
              </div>

              <div class="form-group">
                <label for="description">${t('post_ad.description')} *</label>
                <textarea id="description" name="description" required rows="6">${listing.description || ''}</textarea>
              </div>

              <div class="form-group">
                <label for="category_id">${t('post_ad.category')}</label>
                <select id="category_id" name="category_id">
                  <option value="">${t('post_ad.category')}</option>
                  ${categories.map(cat => `
                    <option value="${cat.id}" ${cat.id === listing.category_id ? 'selected' : ''}>${lang === 'en' ? cat.name_en : cat.name_es}</option>
                  `).join('')}
                </select>
              </div>
            </section>

            <section class="form-section">
              <h2>${t('post_ad.location')}</h2>

              <div class="form-group">
                <label for="country_id">${t('post_ad.country')} *</label>
                <select id="country_id" name="country_id" required>
                  <option value="">${t('post_ad.country')}</option>
                  ${countries.map(country => `
                    <option value="${country.id}" ${country.id === listing.country_id ? 'selected' : ''}>${lang === 'en' ? country.name_en : country.name_es}</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label for="state_id">${t('post_ad.state')}</label>
                <select id="state_id" name="state_id">
                  <option value="">${t('post_ad.state')}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="city_id">${t('post_ad.city')}</label>
                <select id="city_id" name="city_id">
                  <option value="">${t('post_ad.city')}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="neighborhood">${t('post_ad.neighborhood')}</label>
                <input type="text" id="neighborhood" name="neighborhood" value="${listing.neighborhood || ''}" />
              </div>

              <div class="form-group checkbox-group">
                <input type="checkbox" id="travels" name="travels" ${listing.travels ? 'checked' : ''} />
                <label for="travels">${t('post_ad.travels')}</label>
              </div>
            </section>

            <section class="form-section">
              <h2>${t('post_ad.personal_info')}</h2>

              <div class="form-group">
                <label for="age">${t('post_ad.age')}</label>
                <input type="number" id="age" name="age" min="18" max="99" value="${listing.age || ''}" />
              </div>

              <div class="form-group">
                <label for="price">Precio (USD)</label>
                <input type="number" id="price" name="price" min="0" step="0.01" value="${listing.price || ''}" />
              </div>
            </section>

            <section class="form-section">
              <h2>${t('post_ad.contact_info')}</h2>

              <div class="form-group">
                <label for="contact_phone">${t('post_ad.phone')}</label>
                <input type="tel" id="contact_phone" name="contact_phone" value="${listing.contact_phone || ''}" />
              </div>

              <div class="form-group">
                <label for="whatsapp">${t('post_ad.whatsapp')}</label>
                <input type="tel" id="whatsapp" name="whatsapp" value="${listing.whatsapp || ''}" />
              </div>

              <div class="form-group">
                <label for="contact_email">${t('post_ad.email')}</label>
                <input type="email" id="contact_email" name="contact_email" value="${listing.contact_email || ''}" />
              </div>
            </section>

            <section class="form-section">
              <h2>${t('post_ad.characteristics')}</h2>

              <div class="form-group">
                <label>${t('post_ad.service_type')}</label>
                <div class="checkbox-list">
                  <label><input type="checkbox" name="service_type" value="outcall" ${isChecked(listing.service_type, 'outcall') ? 'checked' : ''} /> A domicilio</label>
                  <label><input type="checkbox" name="service_type" value="incall" ${isChecked(listing.service_type, 'incall') ? 'checked' : ''} /> En local</label>
                  <label><input type="checkbox" name="service_type" value="virtual" ${isChecked(listing.service_type, 'virtual') ? 'checked' : ''} /> Virtual</label>
                  <label><input type="checkbox" name="service_type" value="events" ${isChecked(listing.service_type, 'events') ? 'checked' : ''} /> Eventos</label>
                </div>
              </div>

              <div class="form-group">
                <label>${t('post_ad.attends_to')}</label>
                <div class="checkbox-list">
                  <label><input type="checkbox" name="attends_to" value="men" ${isChecked(listing.attends_to, 'men') ? 'checked' : ''} /> Hombres</label>
                  <label><input type="checkbox" name="attends_to" value="women" ${isChecked(listing.attends_to, 'women') ? 'checked' : ''} /> Mujeres</label>
                  <label><input type="checkbox" name="attends_to" value="couples" ${isChecked(listing.attends_to, 'couples') ? 'checked' : ''} /> Parejas</label>
                  <label><input type="checkbox" name="attends_to" value="all" ${isChecked(listing.attends_to, 'all') ? 'checked' : ''} /> Todos</label>
                </div>
              </div>

              <div class="form-group">
                <label>${t('post_ad.schedule_field')}</label>
                <div class="checkbox-list">
                  <label><input type="checkbox" name="schedule" value="morning" ${isChecked(listing.schedule, 'morning') ? 'checked' : ''} /> Mañana</label>
                  <label><input type="checkbox" name="schedule" value="afternoon" ${isChecked(listing.schedule, 'afternoon') ? 'checked' : ''} /> Tarde</label>
                  <label><input type="checkbox" name="schedule" value="night" ${isChecked(listing.schedule, 'night') ? 'checked' : ''} /> Noche</label>
                  <label><input type="checkbox" name="schedule" value="24-7" ${isChecked(listing.schedule, '24-7') ? 'checked' : ''} /> 24/7</label>
                </div>
              </div>

              <div class="form-group">
                <label>${t('post_ad.languages_field')}</label>
                <div class="checkbox-list">
                  <label><input type="checkbox" name="languages" value="spanish" ${isChecked(listing.languages, 'spanish') ? 'checked' : ''} /> Español</label>
                  <label><input type="checkbox" name="languages" value="english" ${isChecked(listing.languages, 'english') ? 'checked' : ''} /> English</label>
                  <label><input type="checkbox" name="languages" value="portuguese" ${isChecked(listing.languages, 'portuguese') ? 'checked' : ''} /> Português</label>
                  <label><input type="checkbox" name="languages" value="french" ${isChecked(listing.languages, 'french') ? 'checked' : ''} /> Français</label>
                </div>
              </div>

              <div class="form-group">
                <label>${t('post_ad.payment_methods')}</label>
                <div class="checkbox-list">
                  <label><input type="checkbox" name="payment_methods" value="cash" ${isChecked(listing.payment_methods, 'cash') ? 'checked' : ''} /> Efectivo</label>
                  <label><input type="checkbox" name="payment_methods" value="card" ${isChecked(listing.payment_methods, 'card') ? 'checked' : ''} /> Tarjeta</label>
                  <label><input type="checkbox" name="payment_methods" value="transfer" ${isChecked(listing.payment_methods, 'transfer') ? 'checked' : ''} /> Transferencia</label>
                  <label><input type="checkbox" name="payment_methods" value="crypto" ${isChecked(listing.payment_methods, 'crypto') ? 'checked' : ''} /> Crypto</label>
                </div>
              </div>
            </section>

            <section class="form-section">
              <h2>${t('post_ad.social_media')}</h2>

              <div class="form-group">
                <label for="website_url">${t('post_ad.website')}</label>
                <input type="url" id="website_url" name="website_url" value="${listing.website_url || ''}" />
              </div>

              <div class="form-group">
                <label for="instagram_url">${t('post_ad.instagram')}</label>
                <input type="url" id="instagram_url" name="instagram_url" value="${listing.instagram_url || ''}" />
              </div>

              <div class="form-group">
                <label for="twitter_url">${t('post_ad.twitter')}</label>
                <input type="url" id="twitter_url" name="twitter_url" value="${listing.twitter_url || ''}" />
              </div>

              <div class="form-group">
                <label for="telegram_url">${t('post_ad.telegram')}</label>
                <input type="url" id="telegram_url" name="telegram_url" value="${listing.telegram_url || ''}" />
              </div>
            </section>

            <div id="edit-error" class="error-message"></div>

            <div class="form-actions">
              <a href="/dashboard" class="btn-secondary">${t('common.cancel')}</a>
              <button type="submit" class="btn-primary">${t('common.save')}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('edit-ad-form').addEventListener('submit', handleSubmit);

    document.getElementById('country_id').addEventListener('change', async (e) => {
      await loadStates(e.target.value);
    });

    document.getElementById('state_id').addEventListener('change', async (e) => {
      await loadCities(e.target.value);
    });
  }

  await init();
}
