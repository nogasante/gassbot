import React from 'react';
import { Avatar, Button } from '@telegram-apps/telegram-ui';

export function Header({ user, onRequestOpen }) {
  const firstName = user?.first_name || 'Scholar';

  return (
    <header className="gass-portal-header">
      <div className="header-brand-block">
        <Avatar size={42} src="/img/logo.png" acronym="GS" />
        <div className="header-text-block">
          <div className="header-title-row">
            <span className="header-org-name">GASS-KNUST</span>
            <span className="header-scholar-pill">Scholar: {firstName}</span>
          </div>
          <div className="header-slogan">Statistics for Development</div>
        </div>
      </div>

      <Button
        size="s"
        mode="filled"
        onClick={() => {
          if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
          }
          onRequestOpen();
        }}
      >
        Request
      </Button>
    </header>
  );
}
