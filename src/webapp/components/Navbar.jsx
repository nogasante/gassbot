import React from 'react';
import { Tabbar } from '@telegram-apps/telegram-ui';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';
import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';

function Icon28Search(props) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12.5 4a8.5 8.5 0 105.3 15.15l5.02 5.03a1 1 0 001.42-1.42l-5.03-5.02A8.5 8.5 0 0012.5 4zm-6.5 8.5a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Navbar({ activeTab, onTabChange }) {
  return (
    <Tabbar>
      <Tabbar.Item
        selected={activeTab === 'home'}
        text="Home"
        onClick={() => onTabChange('home')}
      >
        <Icon28Stats />
      </Tabbar.Item>

      <Tabbar.Item
        selected={activeTab === 'courses'}
        text="Courses"
        onClick={() => onTabChange('courses')}
      >
        <Icon28Archive />
      </Tabbar.Item>

      <Tabbar.Item
        selected={activeTab === 'beyond'}
        text="Skills"
        onClick={() => onTabChange('beyond')}
      >
        <Icon28Devices />
      </Tabbar.Item>

      <Tabbar.Item
        selected={activeTab === 'search'}
        text="Search"
        onClick={() => onTabChange('search')}
      >
        <Icon28Search />
      </Tabbar.Item>

      <Tabbar.Item
        selected={activeTab === 'saved'}
        text="Saved"
        onClick={() => onTabChange('saved')}
      >
        <Icon28Heart />
      </Tabbar.Item>
    </Tabbar>
  );
}
