import React, { useState, useEffect } from 'react';

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconBookmark({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#E00613" : "none"} stroke={active ? "#E00613" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function SearchTab({ isBookmarked, onToggleBookmark, onSelectCourse }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quickCourses, setQuickCourses] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);

  // Fetch dynamic courses and resource types from database
  useEffect(() => {
    async function loadDynamicSearchMeta() {
      try {
        const [cRes, tRes] = await Promise.all([
          fetch('/api/courses').then(r => r.json()),
          fetch('/api/resource-types').then(r => r.json())
        ]);

        if (cRes.success && Array.isArray(cRes.data) && cRes.data.length > 0) {
          setQuickCourses(cRes.data.slice(0, 8));
        }

        if (tRes.success && Array.isArray(tRes.data) && tRes.data.length > 0) {
          setResourceTypes(tRes.data);
        }
      } catch (err) {
        console.warn('Could not load dynamic search metadata', err);
      }
    }
    loadDynamicSearchMeta();
  }, []);

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

  const handleQuickChip = (term) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    setQuery(term);
  };

  return (
    <div className="walt-page-content">
      {/* Walt-Style Rounded Search Input */}
      <div className="walt-search-container">
        <div className="walt-search-bar">
          <div className="walt-search-icon">
            <IconSearch />
          </div>
          <input
            type="text"
            className="walt-search-input"
            placeholder="Search courses, past questions, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="walt-search-clear"
              onClick={() => setQuery('')}
            >
              <IconClose />
            </button>
          )}
        </div>
      </div>

      {/* When Empty: Dynamic 4-Column Quick Access Grid from Database Courses */}
      {!query && (
        <>
          <div className="walt-section-header-row" style={{ marginTop: '16px' }}>
            <span className="walt-section-title">Quick Course Access</span>
            <span className="walt-section-badge">From Database</span>
          </div>

          <div className="walt-grid-4col">
            {quickCourses.length > 0 ? (
              quickCourses.map((c) => (
                <div
                  key={c.id}
                  className="walt-4col-item"
                  onClick={() => handleQuickChip(c.code)}
                >
                  <div className="walt-4col-circle">
                    <span>{c.code.split(' ')[0]}</span>
                  </div>
                  <div className="walt-4col-label">{c.code}</div>
                  <div className="walt-4col-sub">L{c.level} • S{c.semester}</div>
                </div>
              ))
            ) : (
              ['STAT 151', 'MATH 153', 'STAT 261', 'MATH 251'].map((code) => (
                <div
                  key={code}
                  className="walt-4col-item"
                  onClick={() => handleQuickChip(code)}
                >
                  <div className="walt-4col-circle">
                    <span>{code.slice(0, 4)}</span>
                  </div>
                  <div className="walt-4col-label">{code}</div>
                  <div className="walt-4col-sub">Core</div>
                </div>
              ))
            )}
          </div>

          {/* Dynamic Category Filter Pills from Database Resource Types */}
          {resourceTypes.length > 0 && (
            <>
              <div className="walt-section-header-row" style={{ marginTop: '24px' }}>
                <span className="walt-section-title">Browse by Category</span>
                <span className="walt-section-badge">{resourceTypes.length} Types</span>
              </div>

              <div className="walt-category-pills-row">
                {resourceTypes.map((rt) => (
                  <button
                    key={rt.key}
                    type="button"
                    className="walt-cat-pill"
                    onClick={() => handleQuickChip(rt.label.replace(/^[^\w\s]+/, '').trim())}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* When Searching: Results or Loading */}
      {query && (
        <>
          <div className="walt-section-header-row" style={{ marginTop: '16px' }}>
            <span className="walt-section-title">Search Results</span>
            <span className="walt-section-badge">{results.length} found</span>
          </div>

          {loading ? (
            <div className="walt-loading-box">
              <div className="walt-spinner" />
              <span>Searching database...</span>
            </div>
          ) : results.length > 0 ? (
            <section className="walt-card-group">
              {results.map((res, idx) => {
                const saved = isBookmarked(res.id);
                const tag = (res.resource_type || res.type_name || 'DOC').toUpperCase();
                return (
                  <React.Fragment key={res.id}>
                    {idx > 0 && <div className="walt-row-divider" />}
                    <div className="walt-list-row">
                      <div className="walt-type-tag-pill">{tag}</div>
                      <div className="walt-row-content">
                        <div className="walt-row-title">{res.title}</div>
                        <div className="walt-row-subtitle">
                          {res.description || res.course_title || 'Verified academic resource'}
                        </div>
                      </div>
                      <div className="walt-row-actions">
                        <button
                          type="button"
                          className="walt-icon-btn"
                          onClick={() => onToggleBookmark(res)}
                          title={saved ? 'Remove bookmark' : 'Bookmark'}
                        >
                          <IconBookmark active={saved} />
                        </button>
                        <a
                          href={res.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="walt-row-open-btn"
                        >
                          <span>Open</span>
                          <IconExternalLink />
                        </a>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </section>
          ) : (
            <div className="walt-empty-box">
              <img src="/img/nav-search.png" alt="No matches" className="walt-empty-img" />
              <div className="walt-empty-title">No Matches Found</div>
              <div className="walt-empty-desc">
                No documents matched "{query}". Try checking course code (e.g. STAT 151) or submit a resource request.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
