import './styles.css';
import { supabase } from './supabase.js';
import { i18n } from './i18n.js';
import { router } from './router.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { AdminListingsPage } from './pages/AdminListingsPage.js';
import { UserDashboardPage } from './pages/UserDashboardPage.js';
import { EditAdPage } from './pages/EditAdPage.js';

class App {
  constructor() {
    this.container = document.getElementById('app');
    this.currentUser = null;
    this.userProfile = null;
    this.init();
  }

  async init() {
    await this.checkAuth();
    this.setupRouter();
    this.render();
    this.setupAuthListener();
  }

  async checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    this.currentUser = session?.user || null;

    if (this.currentUser) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', this.currentUser.id)
        .maybeSingle();

      this.userProfile = data;
    }
  }

  setupAuthListener() {
    supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        this.currentUser = session?.user || null;
        if (this.currentUser) {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', this.currentUser.id)
            .maybeSingle();
          this.userProfile = data;
        } else {
          this.userProfile = null;
        }
        this.render();
      })();
    });
  }

  setupRouter() {
    router.on('/admin', () => this.renderPage(AdminDashboardPage));
    router.on('/admin/listings', () => this.renderPage(AdminListingsPage));
    router.on('/dashboard', () => this.renderPage(UserDashboardPage));
    router.on('/edit-ad/:id', (params) => this.renderPage(EditAdPage, params));
    router.on('/', () => this.renderHome());

    router.resolve();
  }

  render() {
    this.container.innerHTML = `
      ${this.renderHeader()}
      <main class="main-content" id="page-content"></main>
      ${this.renderFooter()}
    `;

    this.attachHeaderEvents();
    router.resolve();
  }

  renderHeader() {
    const t = i18n.t.bind(i18n);
    const currentLang = i18n.getCurrentLanguage();
    const isAdmin = this.userProfile?.role === 'admin';

    return `
      <header class="header">
        <div class="header-container">
          <a href="/" class="logo">
            <span class="logo-icon">💋</span>
            <span>${t('siteName')}</span>
          </a>

          <nav>
            <ul class="nav-menu">
              <li><a href="/" class="nav-link">${t('nav.home')}</a></li>
              ${this.currentUser ? `
                ${isAdmin ? `
                  <li><a href="/admin" class="nav-link">Admin Panel</a></li>
                ` : `
                  <li><a href="/dashboard" class="nav-link">${t('nav.dashboard')}</a></li>
                `}
                <li><a href="#" id="logout-btn" class="nav-link">${t('nav.logout')}</a></li>
              ` : `
                <li><a href="/auth" class="nav-link">${t('nav.login')}</a></li>
              `}
            </ul>
          </nav>

          <div class="language-switcher">
            <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" title="English">
              🇺🇸
            </button>
            <button class="lang-btn ${currentLang === 'es' ? 'active' : ''}" data-lang="es" title="Español">
              🇪🇸
            </button>
          </div>
        </div>
      </header>
    `;
  }

  renderFooter() {
    const t = i18n.t.bind(i18n);

    return `
      <footer class="footer">
        <div class="footer-container">
          <div class="footer-grid">
            <div class="footer-section">
              <h3>${t('footer.about')}</h3>
              <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-top: 16px;">
                ${t('footer.aboutText')}
              </p>
            </div>

            <div class="footer-section">
              <h3>${t('footer.quickLinks')}</h3>
              <ul class="footer-links">
                <li><a href="/" class="footer-link">${t('footer.categories')}</a></li>
                <li><a href="/" class="footer-link">${t('footer.locations')}</a></li>
              </ul>
            </div>

            <div class="footer-section">
              <h3>${t('footer.legal')}</h3>
              <ul class="footer-links">
                <li><a href="#" class="footer-link">${t('footer.terms')}</a></li>
                <li><a href="#" class="footer-link">${t('footer.privacy')}</a></li>
                <li><a href="#" class="footer-link">${t('footer.contact')}</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <p>${t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    `;
  }

  renderPage(PageComponent, params = {}) {
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      const page = new PageComponent(params);
      pageContent.innerHTML = page.render();
      if (page.afterRender) {
        page.afterRender();
      }
    }
  }

  renderHome() {
    const pageContent = document.getElementById('page-content');
    const t = i18n.t.bind(i18n);

    if (pageContent) {
      pageContent.innerHTML = `
        <div class="hero">
          <div class="hero-content">
            <h1 class="hero-title">${t('hero.title')}</h1>
            <p class="hero-subtitle">${t('hero.subtitle')}</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t('categories.title')}</h2>
          <div class="categories-grid" id="categories-grid">
            <div class="loading">${t('common.loading')}</div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Featured Ads</h2>
          <div class="listings-grid" id="featured-listings">
            <div class="loading">${t('common.loading')}</div>
          </div>
        </div>
      `;

      setTimeout(() => this.loadHomeData(), 100);
    }
  }

  async loadHomeData() {
    const lang = i18n.getCurrentLanguage();
    const t = i18n.t.bind(i18n);

    try {
      const [categoriesRes, listingsRes] = await Promise.all([
        supabase.from('categories').select('*').order('order_index'),
        supabase.from('listings')
          .select(`
            *,
            category:categories(name_en, name_es),
            location:locations(name_en, name_es)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8)
      ]);

      if (categoriesRes.error) {
        console.error('Error loading categories:', categoriesRes.error);
      }
      if (listingsRes.error) {
        console.error('Error loading listings:', listingsRes.error);
      }

      const categories = categoriesRes.data || [];
      const listings = listingsRes.data || [];

      const categoriesGrid = document.getElementById('categories-grid');
      if (categoriesGrid) {
        if (categories.length === 0) {
          categoriesGrid.innerHTML = '<p style="text-align: center; padding: calc(var(--spacing) * 4);">No categories available</p>';
        } else {
          categoriesGrid.innerHTML = categories.map(cat => `
            <div class="category-card">
              <div class="category-icon">${cat.icon || '📁'}</div>
              <div class="category-name">${lang === 'en' ? cat.name_en : cat.name_es}</div>
            </div>
          `).join('');
        }
      }

      const featuredGrid = document.getElementById('featured-listings');
      if (featuredGrid) {
        if (listings.length === 0) {
          featuredGrid.innerHTML = `<p style="text-align: center; padding: calc(var(--spacing) * 4);">${t('common.noResults')}</p>`;
        } else {
          featuredGrid.innerHTML = listings.map(listing => {
            const title = lang === 'en' ? listing.title_en : listing.title_es;
            const locationName = listing.location ?
              (lang === 'en' ? listing.location.name_en : listing.location.name_es) :
              '';

            return `
              <div class="listing-card">
                ${listing.featured ? `<span class="badge badge-featured">${t('listing.featured')}</span>` : ''}
                <img
                  src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="${title}"
                  class="listing-image"
                />
                <div class="listing-content">
                  <h3 class="listing-title">${title}</h3>
                  <div class="listing-meta">
                    <span class="listing-location">📍 ${locationName}</span>
                    ${listing.price ? `<span class="listing-price">$${listing.price}</span>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    } catch (error) {
      console.error('Error in loadHomeData:', error);
      const categoriesGrid = document.getElementById('categories-grid');
      if (categoriesGrid) {
        categoriesGrid.innerHTML = '<p style="color: red;">Error loading data. Please check console.</p>';
      }
    }
  }

  attachHeaderEvents() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        i18n.setLanguage(lang);
        this.render();
      });
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          router.navigate(href);
        }
      });
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        router.navigate('/');
      });
    }

    const logoLink = document.querySelector('.logo');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/');
      });
    }
  }
}

new App();
