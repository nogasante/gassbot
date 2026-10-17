import React from 'react';
import { Section, Cell, Avatar, Button } from '@telegram-apps/telegram-ui';
import { PlusCircle } from 'lucide-react';

export function Header({ user, onRequestOpen }) {
  const displayName = user?.first_name ? `Scholar: ${user.first_name}` : 'Digital Academic Hub';

  return (
    <Section style={{ margin: 0, borderBottom: '1px solid var(--tgui--divider)' }}>
      <Cell
        before={<Avatar size={48} src="/img/logo.png" acronym="GS" />}
        subhead="STATISTICS FOR DEVELOPMENT"
        subtitle={displayName}
        after={
          <Button
            size="s"
            mode="filled"
            onClick={onRequestOpen}
            before={<PlusCircle size={14} />}
            style={{ borderRadius: '16px' }}
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
