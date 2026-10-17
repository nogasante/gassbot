import React from 'react';
import { List, Section, Cell, Button, IconButton, Placeholder, Chip } from '@telegram-apps/telegram-ui';
import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';

export function SavedTab({ savedResources, onToggleBookmark, onNavigateCourses }) {
  return (
    <List>
      {savedResources && savedResources.length > 0 ? (
        <Section 
          header={`Pinned Materials (${savedResources.length})`}
          footer="Items are saved locally for instant offline access and synced to your Telegram account."
        >
          {savedResources.map((res) => (
            <Cell
              key={res.id}
              before={<Chip mode="mono" className="resource-chip">{(res.type_name || res.resource_type || 'SAVED').toUpperCase()}</Chip>}
              subhead={res.resource_type || 'Saved Resource'}
              subtitle={res.description || res.course_title || 'Verified GASS academic document'}
              after={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconButton
                    size="s"
                    mode="gray"
                    onClick={() => onToggleBookmark(res)}
                    title="Remove from saved"
                  >
                    <Icon24Close style={{ color: '#E00613' }} />
                  </IconButton>

                  <Button
                    size="s"
                    mode="filled"
                    Component="a"
                    href={res.file_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </Button>
                </div>
              }
            >
              {res.title}
            </Cell>
          ))}
        </Section>
      ) : (
        <Placeholder
          header="No Bookmarks Saved"
          description="Bookmark your core lecture slides, formula sheets, and past questions to easily reference them during revision."
          action={
            <Button size="m" mode="filled" onClick={onNavigateCourses}>
              Browse Curriculum
            </Button>
          }
        >
          <Icon28Heart style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: 'var(--tgui--link_color)' }} />
        </Placeholder>
      )}
    </List>
  );
}
