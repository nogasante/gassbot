/**
 * Main Application Controller & View Router for GASS-KNUST Mini App
 */
const App = (() => {
  let currentRoute = 'home';
  const historyStack = [];

  function init() {
    TelegramBridge.init();
    RequestModal.init();

    // Setup user greeting in header
    const user = TelegramBridge.getUser();
    const avatarEl = document.getElementById('header-avatar');
    const nameEl = document.getElementById('header-username');
    if (avatarEl && user.first_name) {
      avatarEl.textContent = user.first_name.charAt(0).toUpperCase();
    }
    if (nameEl && user.first_name) {
      nameEl.textContent = user.first_name;
    }

    // Authenticate with backend in background
    API.authenticate().catch(() => {});

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Initial route
    handleHashChange();
  }

  function handleHashChange() {
    const rawHash = window.location.hash.replace('#', '') || 'home';
    const parts = rawHash.split('/');
    const viewName = parts[0] || 'home';
    const paramId = parts[1] || null;

    renderRoute(viewName, { id: paramId });
  }

  function navigate(viewName, params = {}) {
    TelegramBridge.haptic('light');

    if (viewName === 'course' && params.id) {
      window.location.hash = `course/${params.id}`;
      return;
    }

    window.location.hash = viewName;
    if (params && Object.keys(params).length > 0) {
      // Pass params directly if navigating programmatically
      renderRoute(viewName, params);
    }
  }

  async function renderRoute(viewName, params = {}) {
    const container = document.getElementById('app-view-root');
    if (!container) return;

    currentRoute = viewName;

    // Update bottom navigation bar active states
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
      const target = item.getAttribute('data-view');
      item.classList.toggle('active', target === viewName);
    });

    // Configure Telegram Back Button
    if (viewName === 'home') {
      TelegramBridge.setBackButton(false);
    } else {
      TelegramBridge.setBackButton(true, () => {
        TelegramBridge.haptic('light');
        if (viewName === 'course') {
          navigate('academic');
        } else {
          navigate('home');
        }
      });
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Render corresponding view
    switch (viewName) {
      case 'academic':
        await AcademicView.render(container, params);
        break;
      case 'course':
        await CourseDetailView.render(container, params);
        break;
      case 'beyond':
        await BeyondView.render(container, params);
        break;
      case 'search':
        await SearchView.render(container, params);
        break;
      case 'saved':
        await BookmarksView.render(container, params);
        break;
      case 'home':
      default:
        await HomeView.render(container, params);
        break;
    }
  }

  return {
    init,
    navigate
  };
})();

// Bootstrap app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
