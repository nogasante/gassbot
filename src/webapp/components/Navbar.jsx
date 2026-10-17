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
    <Tabbar style={{ zIndex: 99 }}>
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.key;
        return (
          <Tabbar.Item
            key={tab.key}
            selected={isSelected}
            text={tab.label}
            onClick={() => onTabChange(tab.key)}
            className={isSelected ? 'tab-active' : ''}
          >
            <img
              src={tab.icon}
              alt={tab.label}
              className="tab-icon-img"
              style={{
                filter: isSelected ? 'drop-shadow(0 2px 6px rgba(11, 83, 111, 0.4))' : 'grayscale(35%) opacity(0.75)'
              }}
            />
          </Tabbar.Item>
        );
      })}
    </Tabbar>
  );
}
