import React from 'react';

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

export function HomeTab({ stats, announcements, onSelectLevel, onSelectPillar, onNavigateTab, onRequestOpen }) {
  const latestAnnouncement = announcements && announcements.length > 0 ? announcements[0] : null;

  const triggerHaptic = (type = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  };

  return (
    <div className="walt-page-content">
      {/* 1. Hero Arc / Status Card (Walt Style) */}
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

      {/* 2. Walt's 4 Circular Quick Action Buttons */}
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

      {/* 3. Walt's Cyan Announcement Banner Card with 3D Graphics */}
      <section 
        className="walt-cyan-banner"
        onClick={() => {
          triggerHaptic('light');
          onNavigateTab('search');
        }}
      >
        <div className="walt-banner-text-block">
          <div className="walt-banner-tag">SEMESTER 1 EXAM PREP</div>
          <h3 className="walt-banner-heading">Past Questions Ready</h3>
          <p className="walt-banner-sub">Step-by-step revision solutions & formula sheets.</p>
          <span className="walt-banner-link">Instant Search &gt;</span>
        </div>
        <div className="walt-banner-graphic">
          <img src="/img/hero-banner.png" alt="Portal 3D Banner" />
        </div>
      </section>

      {/* 4. Official Departmental Announcement Card */}
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

      {/* 5. Walt's Grouped List Card: Academic Levels (4 Levels) */}
      <div className="walt-section-header-row">
        <span className="walt-section-title">Academic Curriculum</span>
        <span className="walt-section-badge">4 Levels • 8 Semesters</span>
      </div>

      <section className="walt-card-group">
        <div 
          className="walt-list-row"
          onClick={() => {
            triggerHaptic('light');
            onSelectLevel(100);
          }}
        >
          <div className="walt-row-avatar walt-lvl-100">L100</div>
          <div className="walt-row-content">
            <div className="walt-row-title">Level 100 Foundation</div>
            <div className="walt-row-subtitle">Calculus, Linear Algebra, Descriptive Stats, Probability I</div>
          </div>
          <div className="walt-row-after">
            <IconChevronRight />
          </div>
        </div>

        <div className="walt-row-divider" />

        <div 
          className="walt-list-row"
          onClick={() => {
            triggerHaptic('light');
            onSelectLevel(200);
          }}
        >
          <div className="walt-row-avatar walt-lvl-200">L200</div>
          <div className="walt-row-content">
            <div className="walt-row-title">Level 200 Core</div>
            <div className="walt-row-subtitle">Probability Distributions, Statistical Computing, Linear Models</div>
          </div>
          <div className="walt-row-after">
            <IconChevronRight />
          </div>
        </div>

        <div className="walt-row-divider" />

        <div 
          className="walt-list-row"
          onClick={() => {
            triggerHaptic('light');
            onSelectLevel(300);
          }}
        >
          <div className="walt-row-avatar walt-lvl-300">L300</div>
          <div className="walt-row-content">
            <div className="walt-row-title">Level 300 Advanced</div>
            <div className="walt-row-subtitle">Statistical Inference, Stochastic Processes, Regression Analysis</div>
          </div>
          <div className="walt-row-after">
            <IconChevronRight />
          </div>
        </div>

        <div className="walt-row-divider" />

        <div 
          className="walt-list-row"
          onClick={() => {
            triggerHaptic('light');
            onSelectLevel(400);
          }}
        >
          <div className="walt-row-avatar walt-lvl-400">L400</div>
          <div className="walt-row-content">
            <div className="walt-row-title">Level 400 Honours</div>
            <div className="walt-row-subtitle">Multivariate Analysis, Time Series, Biostatistics, Project Work</div>
          </div>
          <div className="walt-row-after">
            <IconChevronRight />
          </div>
        </div>
      </section>

      {/* 6. Featured Specializations (Walt 2-Column Grid) */}
      <div className="walt-section-header-row" style={{ marginTop: '20px' }}>
        <span className="walt-section-title">Specialization Tracks</span>
        <span className="walt-section-link" onClick={() => onNavigateTab('beyond')}>See All &gt;</span>
      </div>

      <section className="walt-grid-2col">
        <div 
          className="walt-grid-card"
          onClick={() => {
            triggerHaptic('light');
            onSelectPillar('ds_ml');
          }}
        >
          <div className="walt-grid-badge">HOT</div>
          <div className="walt-grid-icon-wrap">
            <img src="/img/track-ds.png" alt="Data Science" />
          </div>
          <div className="walt-grid-title">Data Science & AI</div>
          <div className="walt-grid-value">PyTorch • Machine Learning</div>
        </div>

        <div 
          className="walt-grid-card"
          onClick={() => {
            triggerHaptic('light');
            onSelectPillar('prog_tools');
          }}
        >
          <div className="walt-grid-badge walt-badge-cyan">ESSENTIAL</div>
          <div className="walt-grid-icon-wrap">
            <img src="/img/track-code.png" alt="Computing" />
          </div>
          <div className="walt-grid-title">Software & Tools</div>
          <div className="walt-grid-value">R • Python • SQL • LaTeX</div>
        </div>

        <div 
          className="walt-grid-card"
          onClick={() => {
            triggerHaptic('light');
            onSelectPillar('research_thesis');
          }}
        >
          <div className="walt-grid-icon-wrap">
            <img src="/img/track-research.png" alt="Research" />
          </div>
          <div className="walt-grid-title">Research & Thesis</div>
          <div className="walt-grid-value">Biostats • Actuarial</div>
        </div>

        <div 
          className="walt-grid-card"
          onClick={() => {
            triggerHaptic('light');
            onSelectPillar('career_growth');
          }}
        >
          <div className="walt-grid-icon-wrap">
            <img src="/img/track-career.png" alt="Careers" />
          </div>
          <div className="walt-grid-title">Careers & Growth</div>
          <div className="walt-grid-value">Scholarships • Internships</div>
        </div>
      </section>
    </div>
  );
}
