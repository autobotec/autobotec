import { supabase } from './lib/supabase.js';
import { initI18n, setLanguage, getLanguage } from './lib/i18n.js';

console.log('ENCUENTRAME / FIND ME - Application starting...');

initI18n();

const app = document.getElementById('app');

if (app) {
  app.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: 'Inter', sans-serif;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">💋 ENCUENTRAME / FIND ME</h1>
        <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Adult Classifieds Platform</p>
        <p style="opacity: 0.8;">Database configured with ${getLanguage() === 'es' ? '11 países y 7 categorías' : '11 countries and 7 categories'}</p>
        <div style="margin-top: 2rem;">
          <button id="langBtn" style="padding: 0.75rem 2rem; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem;">
            ${getLanguage() === 'es' ? '🇺🇸 Switch to English' : '🇪🇸 Cambiar a Español'}
          </button>
        </div>
      </div>
    </div>
  `;

  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const newLang = getLanguage() === 'es' ? 'en' : 'es';
      setLanguage(newLang);
      location.reload();
    });
  }
}

async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('countries').select('count');
    if (error) throw error;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabaseConnection();
