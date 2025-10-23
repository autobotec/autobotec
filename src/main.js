import { initI18n } from './lib/i18n.js';
import { router } from './router.js';
import { HomePage } from './pages/HomePage.js';
import { CountryPage } from './pages/CountryPage.js';
import { StatePage } from './pages/StatePage.js';
import { CityPage } from './pages/CityPage.js';
import { CategoryCountryPage } from './pages/CategoryCountryPage.js';
import { CategoryStatePage } from './pages/CategoryStatePage.js';
import { CategoryCityPage } from './pages/CategoryCityPage.js';
import { Header, initHeaderEvents } from './components/Header.js';
import { Footer } from './components/Footer.js';
import './styles/app.css';

console.log('🚀 ENCUENTRAME / FIND ME - Starting with routing...');

initI18n();

router.addRoute('/', async () => {
  await render(HomePage);
});

// Category + Geography routes (most specific first)
router.addRoute('/:countryCode/:categorySlug/:stateSlug/:citySlug', async (params) => {
  await render(() => CategoryCityPage(params));
});

router.addRoute('/:countryCode/:categorySlug/:stateSlug', async (params) => {
  await render(() => CategoryStatePage(params));
});

router.addRoute('/:countryCode/:categorySlug', async (params) => {
  await render(() => CategoryCountryPage(params));
});

// Geography only routes
router.addRoute('/:countryCode/:stateSlug/:citySlug', async (params) => {
  await render(() => CityPage(params));
});

router.addRoute('/:countryCode/:stateSlug', async (params) => {
  await render(() => StatePage(params));
});

router.addRoute('/:countryCode', async (params) => {
  await render(() => CountryPage(params));
});

router.addRoute('*', async () => {
  await render(HomePage);
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

router.start();
