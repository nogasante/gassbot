import React, { useState, useEffect } from 'react';

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

// Category visual theme mapper for graphics
function getCategoryGraphic(key) {
  const k = (key || '').toLowerCase();
  if (k.includes('prog') || k.includes('code') || k.includes('software')) return '/img/track-code.png';
  if (k.includes('data') || k.includes('ml') || k.includes('ai')) return '/img/track-ds.png';
  if (k.includes('career') || k.includes('job') || k.includes('opp')) return '/img/track-career.png';
  if (k.includes('research') || k.includes('thesis')) return '/img/track-research.png';
  return '/img/nav-skills.png';
}

export function BeyondTab({ initialPillar = '', isBookmarked, onToggleBookmark }) {
  const [categories, setCategories] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);

  // 1. Fetch Dynamic Categories from Database
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/beyond-categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
          // Match initial pillar alias or key, otherwise select first active category
          const found = data.data.find(c => 
            c.key === initialPillar || 
            (c.key.includes('prog') && initialPillar.includes('prog')) ||
            (c.key.includes('data') && initialPillar.includes('ds')) ||
            (c.key.includes('career') && initialPillar.includes('career')) ||
            (c.key.includes('research') && initialPillar.includes('research'))
          );
          setSelectedKey(found ? found.key : data.data[0].key);
        }
      } catch (err) {
        console.error('Failed to load dynamic beyond categories', err);
      }
    }
    fetchCategories();
  }, [initialPillar]);

  // 2. Fetch Resources for Selected Dynamic Category
  useEffect(() => {
    if (!selectedKey) return;
    loadCategoryResources(selectedKey);
  }, [selectedKey]);

  // Handle Telegram native BackButton when detail modal is open
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    if (selectedResource) {
      tg.BackButton.show();
      const onBack = () => {
        setSelectedResource(null);
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
      };
      tg.BackButton.onClick(onBack);
      return () => tg.BackButton.offClick(onBack);
    }
  }, [selectedResource]);

  const loadCategoryResources = async (catKey) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources?beyond_category=${encodeURIComponent(catKey)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setResources(data.data);
      } else {
        setResources([]);
      }
    } catch (err) {
      console.error('Failed to load category resources', err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (key) => {
    if (key === selectedKey) return;
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
    setSelectedKey(key);
  };

  const handleCardClick = (res) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    setSelectedResource(res);
  };

  const currentCategory = categories.find(c => c.key === selectedKey) || categories[0] || {
    key: selectedKey,
    label: 'Specialization',
    description: 'Practical industry tools and computational frameworks.'
  };

  return (
    <div className="walt-page-content">
      {/* 1. Header with Dynamic Category Info & Graphic */}
      <div className="walt-earn-header">
        <div className="walt-earn-graphic-wrap">
          <img 
            src={getCategoryGraphic(currentCategory.key)} 
            alt={currentCategory.label} 
            className="walt-earn-graphic" 
          />
        </div>
        <h2 className="walt-earn-title">{currentCategory.label}</h2>
        <p className="walt-earn-desc">
          {currentCategory.description || currentCategory.desc || 'Explore curated industry resources and tools.'}
        </p>
      </div>

      {/* 2. Dynamic Capsule Switcher from Database Categories */}
      {categories.length > 0 && (
        <div className="walt-capsule-switcher walt-switcher-full" style={{ marginBottom: '20px' }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`walt-switcher-item ${selectedKey === cat.key ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.key)}
            >
              {cat.label.replace(/^[^\w\s]+/, '').trim()}
            </button>
          ))}
        </div>
      )}

      {/* 3. Section Header */}
      <div className="walt-section-header-row">
        <span className="walt-section-title">
          {currentCategory.label.replace(/^[^\w\s]+/, '').trim()} Toolchains
        </span>
        <span className="walt-section-badge">{resources.length} Modules</span>
      </div>

      {/* 4. Dynamic 2-Column Grid of Resources (Zero Hardcoding, Zero Dumped List) */}
      {loading ? (
        <div className="walt-loading-box">
          <div className="walt-spinner" />
          <span>Loading resources from database...</span>
        </div>
      ) : resources.length > 0 ? (
        <div className="walt-grid-2col">
          {resources.map((item) => {
            const badge = (item.resource_type || 'TOOL').toUpperCase();
            return (
              <div
                key={item.id}
                className="walt-grid-card"
                onClick={() => handleCardClick(item)}
              >
                <div className="walt-grid-badge">{badge}</div>
                <div className="walt-grid-icon-wrap">
                  <img src={getCategoryGraphic(item.beyond_category || selectedKey)} alt={item.title} />
                </div>
                <div className="walt-grid-title">{item.title}</div>
                <div className="walt-grid-value">
                  {item.tags && item.tags.length > 0 
                    ? item.tags.slice(0, 2).join(' • ') 
                    : item.description 
                      ? item.description.slice(0, 30) + '...'
                      : 'Verified Material'}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="walt-empty-box">
          <img src={getCategoryGraphic(selectedKey)} alt="No Resources" className="walt-empty-img" />
          <div className="walt-empty-title">No Resources in Category</div>
          <div className="walt-empty-desc">
            The GASS Academic & Software Board will upload materials for this category soon.
          </div>
        </div>
      )}

      {/* 5. Detail Bottom-Sheet Modal (1:1 with tapped card) */}
      {selectedResource && (
        <div className="walt-modal-overlay" onClick={() => setSelectedResource(null)}>
          <div className="walt-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="walt-modal-close"
              onClick={() => setSelectedResource(null)}
            >
              <IconClose />
            </button>

            <div className="walt-modal-header">
              <div className="walt-modal-icon-wrap">
                <img 
                  src={getCategoryGraphic(selectedResource.beyond_category || selectedKey)} 
                  alt={selectedResource.title} 
                />
              </div>
              <div className="walt-modal-course-badge">
                {currentCategory.label.replace(/^[^\w\s]+/, '').trim().toUpperCase()} • {(selectedResource.resource_type || 'TOOL').toUpperCase()}
              </div>
              <h2 className="walt-modal-title">{selectedResource.title}</h2>
              <p className="walt-modal-desc">
                {selectedResource.description || 'Verified academic and practical resource from GASS-KNUST.'}
              </p>
            </div>

            {selectedResource.tags && selectedResource.tags.length > 0 && (
              <div className="walt-chips-scroll no-scrollbar" style={{ justifyContent: 'center', marginBottom: '16px' }}>
                {selectedResource.tags.map((tag) => (
                  <span key={tag} className="walt-subtopic-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="walt-icon-btn"
                style={{ width: '48px', height: '48px', borderRadius: '16px', flexShrink: 0 }}
                onClick={() => {
                  onToggleBookmark(selectedResource);
                  if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                  }
                }}
                title={isBookmarked(selectedResource.id) ? 'Remove bookmark' : 'Bookmark'}
              >
                <IconBookmark active={isBookmarked(selectedResource.id)} />
              </button>

              <a
                href={selectedResource.file_url}
                target="_blank"
                rel="noreferrer"
                className="walt-btn-primary walt-btn-full"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none'
                }}
              >
                <span>Open Material</span>
                <IconExternalLink />
              </a>
            </div>

            <button
              type="button"
              className="walt-btn-primary walt-btn-full"
              style={{
                marginTop: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--tgui--text_color, #FFFFFF)'
              }}
              onClick={() => setSelectedResource(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
