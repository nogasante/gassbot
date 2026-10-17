import React from 'react';

function IconTrash() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E00613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

export function SavedTab({ savedResources, onToggleBookmark, onNavigateCourses }) {
  const count = savedResources ? savedResources.length : 0;

  return (
    <div className="walt-page-content">
      {/* Walt Rewards-Style Gradient Hero */}
      <section className="walt-saved-hero">
        <div className="walt-saved-hero-badge">OFFLINE LIBRARY</div>
        <div className="walt-saved-hero-stat">
          <span className="walt-saved-count">{count}</span>
          <span className="walt-saved-label">Materials Pinned</span>
        </div>
        <p className="walt-saved-hero-sub">
          Cached locally for instant offline access during exam periods.
        </p>
      </section>

      {/* Grouped Section Header */}
      <div className="walt-section-header-row">
        <span className="walt-section-title">Saved Resources</span>
        <span className="walt-section-badge">{count} Items</span>
      </div>

      {count > 0 ? (
        <section className="walt-card-group">
          {savedResources.map((res, idx) => {
            const tag = (res.type_name || res.resource_type || 'SAVED').toUpperCase();
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
                      title="Remove bookmark"
                    >
                      <IconTrash />
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
          <img src="/img/nav-saved.png" alt="No Saved Resources" className="walt-empty-img" />
          <div className="walt-empty-title">No Bookmarks Saved</div>
          <div className="walt-empty-desc">
            Bookmark your core lecture slides, formula sheets, and past questions to easily reference them during revision.
          </div>
          <button
            type="button"
            className="walt-btn-primary"
            style={{ marginTop: '16px' }}
            onClick={onNavigateCourses}
          >
            Browse Curriculum
          </button>
        </div>
      )}
    </div>
  );
}
