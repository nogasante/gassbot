import React from 'react';

// Crisp, dedicated SVG icons matching Telegram native aesthetic
function IconHome({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.4" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

function IconCourses({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.4" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="14" y2="10" />
    </svg>
  );
}

function IconSkills({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.4" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  );
}

function IconSearch({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.4" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconSaved({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "1" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const TABS = [
  { key: 'home', label: 'Home', icon: IconHome },
  { key: 'courses', label: 'Courses', icon: IconCourses },
  { key: 'beyond', label: 'Skills', icon: IconSkills },
  { key: 'search', label: 'Search', icon: IconSearch },
  { key: 'saved', label: 'Saved', icon: IconSaved },
];

export function Navbar({ activeTab, onTabChange }) {
  const handleTabClick = (key) => {
    if (key === activeTab) return;
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
    onTabChange(key);
  };

  return (
    <div className="walt-dock-wrapper">
      <nav className="walt-dock-capsule">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={`walt-dock-tab ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.key)}
              aria-label={tab.label}
            >
              <div className="walt-dock-icon">
                <Icon active={isActive} />
              </div>
              <span className="walt-dock-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="walt-dock-handle">@gassknustbot</div>
    </div>
  );
}
