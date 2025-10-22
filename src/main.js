import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let currentLang = 'es';
let currentUser = null;
let categories = [];
let locations = [];
let listings = [];

const translations = {
  es: {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    postAd: 'Publicar anuncio',
    logout: 'Cerrar sesión',
    loginTitle: 'Iniciar sesión',
    registerTitle: 'Crear cuenta',
    noAds: 'No se encontraron anuncios',
    tryDifferent: 'Intenta con otros filtros',
    loadingCategories: 'Cargando categorías...',
    loadingAds: 'Cargando anuncios...',
    allCategories: 'Todas las categorías',
    allCities: 'Todas las ciudades'
  },
  en: {
    login: 'Login',
    register: 'Register',
    postAd: 'Post Ad',
    logout: 'Logout',
    loginTitle: 'Login',
    registerTitle: 'Create Account',
    noAds: 'No ads found',
    tryDifferent: 'Try different filters',
    loadingCategories: 'Loading categories...',
    loadingAds: 'Loading ads...',
    allCategories: 'All categories',
    allCities: 'All cities'
  }
};

function updateLanguage(lang) {
  currentLang = lang;
  document.documentElement.setAttribute('data-lang', lang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  document.querySelectorAll('[data-es], [data-en]').forEach(el => {
    const text = el.dataset[lang];
    if (text) {
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.placeholder = el.dataset[`placeholder${lang === 'es' ? 'Es' : 'En'}`] || text;
      } else {
        el.textContent = text;
      }
    }
  });

  document.querySelectorAll('option[data-es], option[data-en]').forEach(opt => {
    const text = opt.dataset[lang];
    if (text) opt.textContent = text;
  });

  updateAuthButtons();
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    updateLanguage(btn.dataset.lang);
  });
});

async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  updateAuthButtons();
}

function updateAuthButtons() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (currentUser) {
    loginBtn.textContent = translations[currentLang].logout;
    loginBtn.onclick = async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      currentUser = null;
      updateAuthButtons();
    };
    registerBtn.textContent = translations[currentLang].postAd;
    registerBtn.onclick = (e) => {
      e.preventDefault();
      alert('Post ad form - to be implemented');
    };
  } else {
    loginBtn.textContent = translations[currentLang].login;
    loginBtn.onclick = (e) => {
      e.preventDefault();
      openAuthModal('login');
    };
    registerBtn.textContent = translations[currentLang].register;
    registerBtn.onclick = (e) => {
      e.preventDefault();
      openAuthModal('register');
    };
  }
}

function openAuthModal(mode) {
  const modal = document.getElementById('authModal');
  const modalTitle = document.getElementById('modalTitle');
  const usernameGroup = document.getElementById('usernameGroup');
  const authSubmitBtn = document.getElementById('authSubmitBtn');

  if (mode === 'login') {
    modalTitle.textContent = translations[currentLang].loginTitle;
    usernameGroup.style.display = 'none';
    authSubmitBtn.textContent = translations[currentLang].login;
  } else {
    modalTitle.textContent = translations[currentLang].registerTitle;
    usernameGroup.style.display = 'block';
    authSubmitBtn.textContent = translations[currentLang].register;
  }

  modal.classList.add('active');
  modal.dataset.mode = mode;
}

document.getElementById('closeModal').addEventListener('click', () => {
  const modal = document.getElementById('authModal');
  modal.classList.remove('active');
  document.getElementById('authForm').reset();
  document.getElementById('authMessage').innerHTML = '';
});

document.getElementById('authModal').addEventListener('click', (e) => {
  if (e.target.id === 'authModal') {
    document.getElementById('closeModal').click();
  }
});

document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const mode = document.getElementById('authModal').dataset.mode;
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const username = document.getElementById('username').value;
  const authMessage = document.getElementById('authMessage');
  const authSubmitBtn = document.getElementById('authSubmitBtn');

  authSubmitBtn.disabled = true;
  authMessage.innerHTML = '';

  try {
    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;

      await supabase.from('profiles').insert([{
        id: data.user.id,
        username: username,
        email: email
      }]);

      authMessage.innerHTML = '<div class="form-message success">Account created successfully!</div>';
      setTimeout(() => {
        document.getElementById('closeModal').click();
        currentUser = data.user;
        updateAuthButtons();
      }, 1500);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      authMessage.innerHTML = '<div class="form-message success">Login successful!</div>';
      setTimeout(() => {
        document.getElementById('closeModal').click();
        currentUser = data.user;
        updateAuthButtons();
      }, 1000);
    }
  } catch (error) {
    console.error('Auth error:', error);
    authMessage.innerHTML = `<div class="form-message error">${error.message}</div>`;
  } finally {
    authSubmitBtn.disabled = false;
  }
});

async function loadCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;

    categories = data || [];
    renderCategories();
    updateCategoryFilter();
  } catch (error) {
    console.error('Error loading categories:', error);
    document.getElementById('categoriesGrid').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">😕</div>
        <p class="empty-state-text">Error loading categories</p>
      </div>
    `;
  }
}

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');

  if (categories.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <p class="empty-state-text">${translations[currentLang].loadingCategories}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = categories.map(cat => `
    <a href="#" class="category-card" data-category="${cat.id}">
      <span class="category-icon">${cat.icon || '📁'}</span>
      <div class="category-name">${currentLang === 'es' ? cat.name_es : cat.name_en}</div>
      <div class="category-count">0 ads</div>
    </a>
  `).join('');

  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryId = card.dataset.category;
      document.getElementById('categoryFilter').value = categoryId;
      filterListings();
      document.getElementById('listingsGrid').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function updateCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  select.innerHTML = `<option value="">${translations[currentLang].allCategories}</option>` +
    categories.map(cat => `
      <option value="${cat.id}">${currentLang === 'es' ? cat.name_es : cat.name_en}</option>
    `).join('');
}

async function loadLocations() {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'city')
      .order('name_es', { ascending: true });

    if (error) throw error;

    locations = data || [];
    updateLocationFilter();
  } catch (error) {
    console.error('Error loading locations:', error);
  }
}

function updateLocationFilter() {
  const select = document.getElementById('locationFilter');
  select.innerHTML = `<option value="">${translations[currentLang].allCities}</option>` +
    locations.map(loc => `
      <option value="${loc.id}">${currentLang === 'es' ? loc.name_es : loc.name_en}</option>
    `).join('');
}

async function loadListings() {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        category:categories(name_es, name_en),
        location:locations(name_es, name_en),
        images:listing_images(image_url, order_index)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    listings = data || [];
    renderListings(listings);
  } catch (error) {
    console.error('Error loading listings:', error);
    document.getElementById('listingsGrid').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">😕</div>
        <p class="empty-state-text">Error loading ads</p>
      </div>
    `;
  }
}

function renderListings(items) {
  const grid = document.getElementById('listingsGrid');

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p class="empty-state-text">${translations[currentLang].noAds}</p>
        <p>${translations[currentLang].tryDifferent}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(listing => {
    const image = listing.images && listing.images.length > 0
      ? listing.images[0].image_url
      : 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=400';

    const title = currentLang === 'es' ? listing.title_es : listing.title_en;
    const description = currentLang === 'es' ? listing.description_es : listing.description_en;
    const location = listing.location
      ? (currentLang === 'es' ? listing.location.name_es : listing.location.name_en)
      : '';

    return `
      <a href="#" class="listing-card" data-listing="${listing.id}">
        ${listing.featured ? '<div class="featured-badge">Featured</div>' : ''}
        <img src="${image}" alt="${title}" class="listing-image" loading="lazy">
        <div class="listing-content">
          <h3 class="listing-title">${title}</h3>
          <p class="listing-description">${description}</p>
          <div class="listing-meta">
            <span class="listing-location">📍 ${location}</span>
            ${listing.price ? `<span class="listing-price">$${listing.price}</span>` : ''}
          </div>
        </div>
      </a>
    `;
  }).join('');

  document.querySelectorAll('.listing-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const listingId = card.dataset.listing;
      alert(`View listing details: ${listingId}`);
    });
  });
}

function filterListings() {
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  const categoryId = document.getElementById('categoryFilter').value;
  const locationId = document.getElementById('locationFilter').value;
  const sortBy = document.getElementById('sortFilter').value;

  let filtered = [...listings];

  if (searchText) {
    filtered = filtered.filter(listing => {
      const title = (currentLang === 'es' ? listing.title_es : listing.title_en).toLowerCase();
      const desc = (currentLang === 'es' ? listing.description_es : listing.description_en).toLowerCase();
      return title.includes(searchText) || desc.includes(searchText);
    });
  }

  if (categoryId) {
    filtered = filtered.filter(listing => listing.category_id === categoryId);
  }

  if (locationId) {
    filtered = filtered.filter(listing => listing.location_id === locationId);
  }

  switch (sortBy) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case 'price_low':
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price_high':
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    default:
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  renderListings(filtered);
}

document.getElementById('searchBtn').addEventListener('click', filterListings);
document.getElementById('searchInput').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') filterListings();
});
document.getElementById('categoryFilter').addEventListener('change', filterListings);
document.getElementById('locationFilter').addEventListener('change', filterListings);
document.getElementById('sortFilter').addEventListener('change', filterListings);

async function init() {
  await checkAuth();
  await loadCategories();
  await loadLocations();
  await loadListings();
  updateLanguage('es');
}

init();
