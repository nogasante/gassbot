import React, { useState, useEffect } from 'react';

// Icons for Quick Actions
function IconBook() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconMegaphone() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function getCategoryGraphic(key) {
  const k = (key || '').toLowerCase();
  if (k.includes('prog') || k.includes('code') || k.includes('software')) return '/img/track-code.png';
  if (k.includes('data') || k.includes('ml') || k.includes('ai')) return '/img/track-ds.png';
  if (k.includes('career') || k.includes('job') || k.includes('opp')) return '/img/track-career.png';
  if (k.includes('research') || k.includes('thesis')) return '/img/track-research.png';
  return '/img/nav-skills.png';
}

export function HomeTab({ stats, announcements, onSelectLevel, onSelectPillar, onNavigateTab, onRequestOpen }) {
  const latestAnnouncement = announcements && announcements.length > 0 ? announcements[0] : null;
  const [levels, setLevels] = useState([100, 200, 300, 400]);
  const [categories, setCategories] = useState([]);

  // Fetch Dynamic Levels and Categories from Database
  useEffect(() => {
    async function loadDynamicHomeData() {
      try {
        const [lvlRes, catRes] = await Promise.all([
          fetch('/api/courses/levels').then(r => r.json()),
          fetch('/api/beyond-categories').then(r => r.json())
        ]);

        if (lvlRes.success && Array.isArray(lvlRes.data) && lvlRes.data.length > 0) {
          setLevels(lvlRes.data);
        }

        if (catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.warn('Could not load dynamic home data', err);
      }
    }
    loadDynamicHomeData();
  }, []);

  const triggerHaptic = (type = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  };

  return (
    <div className="walt-page-content">
      {/* 1. Hero Arc / Status Card */}
      <section className="walt-hero-card">
        <div className="walt-hero-badge">
          <span className="walt-pulse-dot" />
          <span>2026/2027 ACADEMIC YEAR</span>
        </div>
        <h1 className="walt-hero-title">Statistics Academic Hub</h1>
        <p className="walt-hero-desc">
          Official departmental archive of lecture syllabi, verified past exam questions, and data science guides.
        </p>

        <div className="walt-hero-action-row">
          <button
            type="button"
            className="walt-btn-primary"
            onClick={() => {
              triggerHaptic('medium');
              onNavigateTab('courses');
            }}
          >
            Explore Curriculum
          </button>
          <div className="walt-hero-stats-pill">
            <span>{stats?.totalResources || 58} Materials</span>
            <span className="walt-bullet">•</span>
            <span>{stats?.totalUsers || 240} Scholars</span>
          </div>
        </div>
      </section>

      {/* 2. 4 Circular Quick Action Buttons */}
      <section className="walt-quick-actions-row">
        <div 
          className="walt-action-btn-item"
          onClick={() => {
            triggerHaptic('light');
            onNavigateTab('courses');
          }}
        >
          <div className="walt-circle-btn walt-btn-courses">
            <IconBook />
          </div>
          <span className="walt-action-label">Courses</span>
        </div>

        <div 
          className="walt-action-btn-item"
          onClick={() => {
            triggerHaptic('light');
            onNavigateTab('beyond');
          }}
        >
          <div className="walt-circle-btn walt-btn-skills">
            <IconCode />
          </div>
          <span className="walt-action-label">Skills</span>
        </div>

        <div 
          className="walt-action-btn-item"
          onClick={() => {
            triggerHaptic('light');
            onNavigateTab('search');
          }}
        >
          <div className="walt-circle-btn walt-btn-search">
            <IconSearch />
          </div>
          <span className="walt-action-label">Search</span>
        </div>

        <div 
          className="walt-action-btn-item"
          onClick={() => {
            triggerHaptic('medium');
            if (onRequestOpen) onRequestOpen();
            else onNavigateTab('courses');
          }}
        >
          <div className="walt-circle-btn walt-btn-request">
            <IconPlus />
          </div>
          <span className="walt-action-label">Request</span>
        </div>
      </section>

      {/* 3. Official Departmental Announcement Card (if present) */}
      {latestAnnouncement && (
        <section className="walt-announcement-card">
          <div className="walt-announcement-header">
            <div className="walt-announcement-badge-group">
              <div className="walt-announcement-icon-wrap">
                <IconMegaphone />
              </div>
              <span className="walt-announcement-pill">OFFICIAL NOTICE</span>
            </div>
            <span className="walt-announcement-board">Executive Board</span>
          </div>
          <h3 className="walt-announcement-title">{latestAnnouncement.title}</h3>
          <p className="walt-announcement-body">{latestAnnouncement.content}</p>
        </section>
      )}

      {/* 4. Dynamic Grouped List: Academic Levels from Database */}
      <div className="walt-section-header-row">
        <span className="walt-section-title">Academic Curriculum</span>
        <span className="walt-section-badge">{levels.length} Levels Available</span>
      </div>

      <section className="walt-card-group">
        {levels.map((lvl, idx) => {
          const avatarClass = lvl === 100 ? 'walt-lvl-100' : lvl === 200 ? 'walt-lvl-200' : lvl === 300 ? 'walt-lvl-300' : 'walt-lvl-400';
          const subtitle = lvl === 100 
            ? 'Calculus, Linear Algebra, Descriptive Stats, Probability I'
            : lvl === 200
            ? 'Probability Distributions, Statistical Computing, Linear Models'
            : lvl === 300
            ? 'Statistical Inference, Stochastic Processes, Regression Analysis'
            : 'Multivariate Analysis, Time Series, Biostatistics, Project Work';

          return (
            <React.Fragment key={lvl}>
              {idx > 0 && <div className="walt-row-divider" />}
              <div 
                className="walt-list-row"
                onClick={() => {
                  triggerHaptic('light');
                  onSelectLevel(lvl);
                }}
              >
                <div className={`walt-row-avatar ${avatarClass}`}>L{lvl}</div>
                <div className="walt-row-content">
                  <div className="walt-row-title">Level {lvl} Curriculum</div>
                  <div className="walt-row-subtitle">{subtitle}</div>
                </div>
                <div className="walt-row-after">
                  <IconChevronRight />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </section>

      {/* 5. Dynamic Specialization Tracks from Database */}
      {categories.length > 0 && (
        <>
          <div className="walt-section-header-row" style={{ marginTop: '20px' }}>
            <span className="walt-section-title">Specialization Tracks</span>
            <span className="walt-section-link" onClick={() => onNavigateTab('beyond')}>See All &gt;</span>
          </div>

          <section className="walt-grid-2col">
            {categories.map((cat) => (
              <div 
                key={cat.key}
                className="walt-grid-card"
                onClick={() => {
                  triggerHaptic('light');
                  onSelectPillar(cat.key);
                }}
              >
                <div className="walt-grid-icon-wrap">
                  <img src={getCategoryGraphic(cat.key)} alt={cat.label} />
                </div>
                <div className="walt-grid-title">{cat.label.replace(/^[^\w\s]+/, '').trim()}</div>
                <div className="walt-grid-value">
                  {cat.description || cat.desc || 'Curated Toolchains'}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
