import React from 'react';
import { Tabbar } from '@telegram-apps/telegram-ui';

export function Navbar({ activeTab, onTabChange }) {
  const tabs = [
    { key: 'home', label: 'Home', icon: '/img/nav-home.png' },
    { key: 'courses', label: 'Courses', icon: '/img/nav-courses.png' },
    { key: 'beyond', label: 'Skills', icon: '/img/nav-skills.png' },
    { key: 'search', label: 'Search', icon: '/img/nav-search.png' },
    { key: 'saved', label: 'Saved', icon: '/img/nav-saved.png' }
  ];

  return (
    <Tabbar style={{ zIndex: 99, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)' }}>
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.key;
        return (
          <Tabbar.Item
            key={tab.key}
            selected={isSelected}
            text={tab.label}
            onClick={() => onTabChange(tab.key)}
            className={isSelected ? 'tabbar-item-active' : ''}
          >
            <img
              src={tab.icon}
              alt={tab.label}
              className="tab-3d-icon"
              style={{
                filter: isSelected ? 'drop-shadow(0 2px 6px rgba(11, 83, 111, 0.4))' : 'grayscale(30%) opacity(0.8)'
              }}
            />
          </Tabbar.Item>
        );
      })}
    </Tabbar>
  );
}
