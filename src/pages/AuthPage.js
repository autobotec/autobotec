import { auth } from '../lib/auth.js';
import { i18n } from '../lib/i18n.js';

export function AuthPage() {
  let isLogin = true;

  const t = (key) => i18n.t(key);

  function toggleMode() {
    isLogin = !isLogin;
    render();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const username = formData.get('username');

    const errorDiv = document.getElementById('auth-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    errorDiv.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = t('loading');

    try {
      if (isLogin) {
        await auth.signIn(email, password);
        window.location.href = '/dashboard';
      } else {
        if (!username || username.trim().length < 3) {
          throw new Error(t('usernameRequired'));
        }
        await auth.signUp(email, password, username.trim());
        alert(t('accountCreated'));
        window.location.href = '/dashboard';
      }
    } catch (error) {
      errorDiv.textContent = error.message || t('authError');
      submitBtn.disabled = false;
      submitBtn.textContent = isLogin ? t('login') : t('register');
    }
  }

  function render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-container">
          <div class="auth-card">
            <div class="auth-header">
              <h1>${isLogin ? t('login') : t('register')}</h1>
              <p>${isLogin ? t('loginSubtitle') : t('registerSubtitle')}</p>
            </div>

            <form id="auth-form" class="auth-form">
              ${!isLogin ? `
                <div class="form-group">
                  <label for="username">${t('username')}</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    minlength="3"
                    placeholder="${t('usernamePlaceholder')}"
                  />
                </div>
              ` : ''}

              <div class="form-group">
                <label for="email">${t('email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="${t('emailPlaceholder')}"
                />
              </div>

              <div class="form-group">
                <label for="password">${t('password')}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minlength="6"
                  placeholder="${t('passwordPlaceholder')}"
                />
              </div>

              <div id="auth-error" class="error-message"></div>

              <button type="submit" class="btn-primary">
                ${isLogin ? t('login') : t('register')}
              </button>
            </form>

            <div class="auth-footer">
              <button class="btn-link" id="toggle-mode">
                ${isLogin ? t('needAccount') : t('haveAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('auth-form').addEventListener('submit', handleSubmit);
    document.getElementById('toggle-mode').addEventListener('click', toggleMode);
  }

  render();
}
