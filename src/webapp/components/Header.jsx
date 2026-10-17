import React from 'react';
import { Section, Cell, Avatar, Button } from '@telegram-apps/telegram-ui';

export function Header({ user, onRequestOpen }) {
  const displayName = user?.first_name ? `Scholar: ${user.first_name}` : 'Digital Academic Hub';

  return (
    <Section>
      <Cell
        before={<Avatar size={48} src="/img/logo.png" acronym="GS" />}
        subhead={<span className="header-motto">STATISTICS FOR DEVELOPMENT</span>}
        subtitle={displayName}
        after={
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
        }
      >
        GASS-KNUST
      </Cell>
    </Section>
  );
}
