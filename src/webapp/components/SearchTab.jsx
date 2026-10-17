import React, { useState, useEffect } from 'react';
import { List, Section, Cell, Input, Spinner, Placeholder, Chip, Button, IconButton } from '@telegram-apps/telegram-ui';
import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';

function Icon24Search(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.5 3a7.5 7.5 0 104.68 13.37l4.72 4.73a1 1 0 001.42-1.42l-4.73-4.72A7.5 7.5 0 0010.5 3zm-5.5 7.5a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SearchTab({ isBookmarked, onToggleBookmark }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources?search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Search error', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <List>
      {/* Telegram UI Search Input Field */}
      <Input
        header="Search Academic Database"
        placeholder="Course code (e.g. STAT 151), topic, or keyword..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        after={
          query ? (
            <IconButton size="s" mode="plain" onClick={() => setQuery('')}>
              <Icon24Close />
            </IconButton>
          ) : (
            <Icon24Search style={{ color: 'var(--tgui--hint_color)' }} />
          )
        }
      />

      {/* Results Section */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <Spinner size="l" />
        </div>
      ) : query && results.length > 0 ? (
        <Section header={`Search Results (${results.length})`} footer="Tap Open to access document or Star to save for offline revision">
          {results.map((res) => {
            const bookmarked = isBookmarked(res.id);
            return (
              <Cell
                key={res.id}
                before={<Chip mode="mono" className="resource-chip">{(res.resource_type || res.type_name || 'DOC').toUpperCase()}</Chip>}
                subhead={res.resource_type || 'Document'}
                subtitle={res.description || res.course_title || 'Verified GASS academic document'}
                after={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconButton
                      size="s"
                      mode={bookmarked ? 'bezeled' : 'gray'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(res);
                      }}
                    >
                      <Icon28Heart style={{ color: bookmarked ? '#E00613' : '#94A3B8' }} />
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
            );
          })}
        </Section>
      ) : query ? (
        <Placeholder
          header="No Results Found"
          description={`We couldn't find any resources matching "${query}". Try searching for course codes like "STAT 151" or topics like "probability".`}
        >
          <Icon24Search style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: 'var(--tgui--hint_color)' }} />
        </Placeholder>
      ) : (
        <Placeholder
          header="Instant Library Search"
          description="Type any course code, topic, software, or document name to find verified lecture notes, exam papers, and guides."
        >
          <Icon24Search style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: 'var(--tgui--link_color)' }} />
        </Placeholder>
      )}
    </List>
  );
}
