import { initI18n } from './lib/i18n.js';
import { router } from './router.js';
import { HomePage } from './pages/HomePage.js';
import { CountryPage } from './pages/CountryPage.js';
import { Header, initHeaderEvents } from './components/Header.js';
import { Footer } from './components/Footer.js';
import './styles/app.css';

console.log('🚀 ENCUENTRAME / FIND ME - Starting with routing...');

initI18n();

router.addRoute('/', async () => {
  await render(HomePage);
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
