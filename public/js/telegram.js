/**
 * Telegram WebApp SDK Bridge for GASS-KNUST Mini App
 */
const TelegramBridge = (() => {
  const tg = window.Telegram?.WebApp || null;

  function init() {
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#0B536F');
        tg.setBackgroundColor('#0B1320');
        tg.enableClosingConfirmation();
      } catch (err) {
        console.warn('Telegram WebApp initialization notice:', err);
      }
    }
  }

  function isTelegram() {
    return Boolean(tg && tg.initData);
  }

  function getUser() {
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      return tg.initDataUnsafe.user;
    }
    // Fallback for development / browser preview
    return {
      id: 999999999,
      first_name: 'Scholar',
      username: 'gass_student'
    };
  }

  function getInitData() {
    return tg ? tg.initData : '';
  }

  function haptic(type = 'light') {
    if (!tg || !tg.HapticFeedback) return;
    try {
      if (type === 'light') tg.HapticFeedback.impactOccurred('light');
      else if (type === 'medium') tg.HapticFeedback.impactOccurred('medium');
      else if (type === 'heavy') tg.HapticFeedback.impactOccurred('heavy');
      else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
      else if (type === 'error') tg.HapticFeedback.notificationOccurred('error');
    } catch (e) {}
  }

  function openLink(url) {
    if (tg && typeof tg.openLink === 'function') {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  function setBackButton(show, onClick) {
    if (!tg || !tg.BackButton) return;
    try {
      if (show) {
        tg.BackButton.show();
        if (onClick) {
          tg.BackButton.onClick(onClick);
        }
      } else {
        tg.BackButton.hide();
      }
    } catch (e) {}
  }

  function showToast(message, type = 'success') {
    const toast = document.getElementById('app-toast');
    if (!toast) return;

    let iconSvg = '';
    if (type === 'bookmark' || type === '⭐') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    toast.innerHTML = `<span style="display: flex; align-items: center;">${iconSvg}</span> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  return {
    init,
    isTelegram,
    getUser,
    getInitData,
    haptic,
    openLink,
    setBackButton,
    showToast
  };
})();
