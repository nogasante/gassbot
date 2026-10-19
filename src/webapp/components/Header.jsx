import React from 'react';

// Official Telegram Blue Verified Badge SVG
function VerifiedBadge() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M10.29 2.3c.7-.6 1.72-.6 2.42 0l1.24 1.07c.4.34.9.5 1.41.44l1.63-.17c.92-.1 1.77.46 2.05 1.34l.5 1.57c.16.5.49.92.93 1.18l1.41.83c.8.47 1.18 1.44.92 2.33l-.47 1.58c-.15.5-.1.1.03.49l.77 1.46c.44.83.21 1.86-.54 2.43l-1.32 1.02c-.41.32-.67.79-.73 1.3l-.2 1.62c-.12.92-.85 1.62-1.77 1.7l-1.63.15c-.52.05-1 .31-1.35.7l-1.12 1.2c-.63.68-1.65.8-2.42.28l-1.37-.92c-.44-.3-.98-.42-1.51-.33l-1.63.27c-.92.15-1.8-.32-2.12-1.19l-.58-1.54c-.18-.5-.54-.9-1-.13l-1.46-.74c-.83-.42-1.25-1.38-1.02-2.28l.41-1.6c.13-.5.06-1.03-.2-1.49l-.83-1.42c-.47-.81-.3-1.85.4-2.46l1.25-1.1c.39-.34.62-.83.64-1.35l.07-1.64c.04-.93.72-1.69 1.64-1.83l1.62-.24c.52-.08 1-.36 1.32-.78l1.04-1.27z"
        fill="#2481CC"
      />
      <path
        d="M9.5 12.5l2 2 4.5-4.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header({ onRequestOpen }) {
  const handleRequest = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
    onRequestOpen();
  };

  return (
    <header className="walt-header">
      <div className="walt-header-left">
        <div className="walt-avatar-wrap">
          <img src="/img/logo.png" alt="GASS Logo" className="walt-avatar-img" />
        </div>
        <div className="walt-header-info">
          <div className="walt-header-title-row">
            <span className="walt-header-title">GASS-KNUST</span>
            <VerifiedBadge />
          </div>
          <div className="walt-header-sub">
            <span className="walt-slogan">Statistics for Development</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="walt-header-action-btn"
        onClick={handleRequest}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Request</span>
      </button>
    </header>
  );
}
