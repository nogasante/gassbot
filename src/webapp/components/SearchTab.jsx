import React, { useState, useEffect } from 'react';
import { Section, Cell, Input, Spinner, Placeholder, Badge } from '@telegram-apps/telegram-ui';
import { Search as SearchIcon, FileText, BookOpen, Download, Star, X } from 'lucide-react';

export function SearchTab({ onSelectCourse, isBookmarked, onToggleBookmark }) {
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
    <div style={{ paddingBottom: '20px' }}>
      {/* Search Input Bar */}
      <div style={{ padding: '12px 16px' }}>
        <Input
          header="Global Academic Search"
          placeholder="Search by code (e.g. STAT 151), topic, or keyword..."
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spinner size="l" />
        </div>
      ) : query && results.length > 0 ? (
        <Section header={`Search Results (${results.length})`}>
          {results.map((res) => {
            const bookmarked = isBookmarked(res.id);
            return (
              <Cell
                key={res.id}
                before={<FileText size={22} color="#0B536F" />}
                subhead={(res.resource_type || res.type_name || 'Document').toUpperCase()}
                subtitle={res.description || res.course_title || 'Verified GASS academic document'}
                after={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(res);
                      }}
                      style={{
                        background: bookmarked ? '#FEF3C7' : '#F1F5F9',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: bookmarked ? '#D97706' : '#64748B'
                      }}
                    >
                      <Star size={16} fill={bookmarked ? '#D97706' : 'none'} />
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
            );
          })}
        </Section>
      ) : query ? (
        <Placeholder
          header="No Results Found"
          description={`We couldn't find any resources matching "${query}". Try searching for course codes like "MATH 151" or topics like "calculus".`}
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
