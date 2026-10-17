import React from 'react';
import { Section, Cell, Button, IconButton, Placeholder, Badge } from '@telegram-apps/telegram-ui';
import { Star, Download, Trash2 } from 'lucide-react';

export function SavedTab({ savedResources, onToggleBookmark, onNavigateCourses }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0 24px' }}>
      {savedResources && savedResources.length > 0 ? (
        <Section 
          header={`Pinned Materials (${savedResources.length})`}
          footer="Items are saved locally for instant offline access and synced to your Telegram account."
        >
          {savedResources.map((res) => (
            <Cell
              key={res.id}
              before={<Badge mode="primary">{(res.type_name || res.resource_type || 'SAVED').toUpperCase()}</Badge>}
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
                    <Trash2 size={16} color="#DC2626" />
                  </IconButton>

                  <Button
                    size="s"
                    mode="filled"
                    Component="a"
                    href={res.file_url}
                    target="_blank"
                    rel="noreferrer"
                    before={<Download size={14} />}
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
          <img 
            src="/img/nav-saved.png" 
            alt="Saved" 
            style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 12px' }} 
          />
        </Placeholder>
      )}
    </div>
  );
}
