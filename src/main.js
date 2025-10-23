import { initI18n } from './lib/i18n.js';
import { resolveRoute } from './lib/routeResolver.js';
import { HomePage } from './pages/HomePage.js';
import { CountryPage } from './pages/CountryPage.js';
import { StatePage } from './pages/StatePage.js';
import { CityPage } from './pages/CityPage.js';
import { CategoryCountryPage } from './pages/CategoryCountryPage.js';
import { CategoryStatePage } from './pages/CategoryStatePage.js';
import { CategoryCityPage } from './pages/CategoryCityPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { PostAdPage } from './pages/PostAdPage.js';
import { EditAdPage } from './pages/EditAdPage.js';
import { Header, initHeaderEvents } from './components/Header.js';
import { Footer } from './components/Footer.js';
import './styles/app.css';

console.log('🚀 ENCUENTRAME / FIND ME - Starting with routing...');

initI18n();

async function handleRoute() {
  const path = window.location.pathname;
  const segments = path.split('/').filter(s => s);

  if (path === '/auth') {
    await renderNoLayout(AuthPage);
    return;
  }

  if (path === '/dashboard') {
    await renderNoLayout(DashboardPage);
    return;
  }

  if (path === '/post-ad') {
    await renderNoLayout(PostAdPage);
    return;
  }

  if (path.startsWith('/edit-ad/')) {
    const listingId = segments[1];
    await renderNoLayout(() => EditAdPage(listingId));
    return;
  }

  const route = await resolveRoute(segments);

  switch (route.type) {
    case 'home':
      await render(HomePage);
      break;
    case 'country':
      await render(() => CountryPage({ countryCode: route.countryCode }));
      break;
    case 'state':
      await render(() => StatePage({ countryCode: route.countryCode, stateSlug: route.stateSlug }));
      break;
    case 'city':
      await render(() => CityPage({ countryCode: route.countryCode, stateSlug: route.stateSlug, citySlug: route.citySlug }));
      break;
    case 'category-country':
      await render(() => CategoryCountryPage({ countryCode: route.countryCode, categorySlug: route.categorySlug }));
      break;
    case 'category-state':
      await render(() => CategoryStatePage({ countryCode: route.countryCode, categorySlug: route.categorySlug, stateSlug: route.stateSlug }));
      break;
    case 'category-city':
      await render(() => CategoryCityPage({ countryCode: route.countryCode, categorySlug: route.categorySlug, stateSlug: route.stateSlug, citySlug: route.citySlug }));
      break;
    default:
      await render(() => '<div class="error-page"><div class="container"><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p><a href="/" data-link class="btn-primary">Go Home</a></div></div>');
  }
}

window.addEventListener('popstate', handleRoute);

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]') || e.target.closest('[data-link]')) {
    e.preventDefault();
    const link = e.target.matches('[data-link]') ? e.target : e.target.closest('[data-link]');
    const href = link.getAttribute('href');
    if (href && href !== window.location.pathname) {
      window.history.pushState(null, null, href);
      handleRoute();
    }
  }
});

async function render(pageFunction) {
  const app = document.getElementById('app');
  if (!app) return;

  const content = await pageFunction();

  app.innerHTML = `
    ${Header()}
    <main class="app-main">
      ${content}
    </main>
    ${Footer()}
  `;

  initHeaderEvents();
}

async function renderNoLayout(pageFunction) {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '';
  await pageFunction();
}

handleRoute();
