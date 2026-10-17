import React from 'react';
import { Section, Cell, Button, Placeholder, Badge } from '@telegram-apps/telegram-ui';
import { Bookmark, Star, Download, Trash2, BookOpen } from 'lucide-react';

export function SavedTab({ savedResources, onToggleBookmark, onNavigateCourses }) {
  return (
    <div style={{ paddingBottom: '20px' }}>
      {savedResources && savedResources.length > 0 ? (
        <Section 
          header={`Pinned Materials (${savedResources.length})`}
          footer="Items are saved locally for instant offline access and synced to your Telegram account."
        >
          {savedResources.map((res) => (
            <Cell
              key={res.id}
              before={
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706'
                }}>
                  <Star size={20} fill="#D97706" />
                </div>
              }
              subhead={(res.type_name || res.resource_type || 'Saved').toUpperCase()}
              subtitle={res.description || res.course_title || 'Verified GASS resource'}
              after={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => onToggleBookmark(res)}
                    style={{
                      background: '#FEE2E2',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Remove from bookmarks"
                  >
                    <Trash2 size={16} />
                  </button>

                  <a
                    href={res.file_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#0B536F',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={14} />
                    Open
                  </a>
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
