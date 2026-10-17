import React, { useState, useEffect } from 'react';
import { Section, Cell, Input, Spinner, Placeholder, Badge, Button, IconButton } from '@telegram-apps/telegram-ui';
import { Search as SearchIcon, Download, Star, X } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0 24px' }}>
      {/* Telegram UI Search Input Field */}
      <div style={{ padding: '0 16px' }}>
        <Input
          header="Search Academic Database"
          placeholder="Course code (e.g. STAT 151), topic, or keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          after={
            query ? (
              <X 
                size={18} 
                color="#64748B" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setQuery('')} 
              />
            ) : (
              <SearchIcon size={18} color="#64748B" />
            )
          }
        />
      </div>

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
                before={<Badge mode="primary">{(res.resource_type || res.type_name || 'DOC').toUpperCase()}</Badge>}
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
                      <Star size={16} fill={bookmarked ? '#D97706' : 'none'} color={bookmarked ? '#D97706' : '#64748B'} />
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
            );
          })}
        </Section>
      ) : query ? (
        <Placeholder
          header="No Results Found"
          description={`We couldn't find any resources matching "${query}". Try searching for course codes like "STAT 151" or topics like "probability".`}
        >
          <SearchIcon size={48} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
        </Placeholder>
      ) : (
        <Placeholder
          header="Instant Library Search"
          description="Type any course code, topic, software, or document name to find verified lecture notes, exam papers, and guides."
        >
          <SearchIcon size={48} color="#0B536F" style={{ margin: '0 auto 12px' }} />
        </Placeholder>
      )}
    </div>
  );
}
