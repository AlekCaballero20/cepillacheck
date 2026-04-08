import './config/firebase.js';
import { byId } from './core/dom.js';
import { navigate, registerNavigateHandler, showScreen } from './core/router.js';
import { setCurrentUser } from './core/state.js';
import { onAuthChanged, resolveCurrentUser } from './services/auth.service.js';
import { bindLoginEvents, resetLoginState } from './features/login/login.controller.js';
import { bindDashboardEvents, loadDashboard } from './features/dashboard/dashboard.controller.js';
import { loadStats } from './features/stats/stats.controller.js';
import { bindSettingsEvents, loadSettings } from './features/settings/settings.controller.js';

function hideLoadingOverlay() {
  const loading = byId('app-loading');
  loading.classList.add('hidden');
  setTimeout(() => {
    loading.style.display = 'none';
  }, 350);
}

function setNavVisibility(isVisible) {
  byId('bottom-nav').classList.toggle('visible', isVisible);
}

async function handleNavigation(screen) {
  if (screen === 'dashboard') await loadDashboard();
  if (screen === 'stats') await loadStats();
  if (screen === 'settings') await loadSettings();
}

function bindNavEvents() {
  document.querySelectorAll('[data-nav-screen]').forEach((button) => {
    button.addEventListener('click', async () => {
      await navigate(button.dataset.navScreen);
    });
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then(() => console.log('SW registrado ✓'))
        .catch((err) => console.warn('SW no pudo registrarse:', err));
    });
  }
}

function bootstrap() {
  registerNavigateHandler(handleNavigation);
  bindLoginEvents();
  bindDashboardEvents();
  bindSettingsEvents();
  bindNavEvents();
  registerServiceWorker();

  onAuthChanged(async (firebaseUser) => {
    const currentUser = resolveCurrentUser(firebaseUser);
    setCurrentUser(currentUser);
    hideLoadingOverlay();

    if (currentUser) {
      setNavVisibility(true);
      resetLoginState();
      await navigate('dashboard');
    } else {
      setNavVisibility(false);
      resetLoginState();
      showScreen('login');
    }
  });
}

bootstrap();
