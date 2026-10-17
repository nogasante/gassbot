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

export function CourseModal({ course, open, onClose, isBookmarked, onToggleBookmark }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course && open) {
      fetchResources();
    }
  }, [course, open]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources?courseId=${course.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setResources(data.data);
      } else {
        setResources([]);
      }
    } catch (err) {
      console.error('Failed to load course resources', err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !course) return null;

  return (
    <div className="walt-modal-overlay" onClick={onClose}>
      <div className="walt-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Close Button in Circle (Walt Style) */}
        <button type="button" className="walt-modal-close" onClick={onClose}>
          <IconClose />
        </button>

        {/* Top 3D Icon & Title */}
        <div className="walt-modal-header">
          <div className="walt-modal-icon-wrap">
            <img src="/img/nav-courses.png" alt="Course" />
          </div>
          <div className="walt-modal-course-badge">{course.code} • Level {course.level}</div>
          <h2 className="walt-modal-title">{course.title}</h2>
          <p className="walt-modal-desc">
            Semester {course.semester} • {course.credits || 3} Academic Credits
          </p>
        </div>

        {/* Resources Grouped Section */}
        <div className="walt-section-header-row" style={{ marginTop: '16px' }}>
          <span className="walt-section-title">Course Materials</span>
          <span className="walt-section-badge">{resources.length} Available</span>
        </div>

        {loading ? (
          <div className="walt-loading-box">
            <div className="walt-spinner" />
            <span>Loading files...</span>
          </div>
        ) : resources.length > 0 ? (
          <section className="walt-card-group" style={{ maxHeight: '38vh', overflowY: 'auto' }}>
            {resources.map((res, idx) => {
              const saved = isBookmarked(res.id);
              const tag = (res.type_name || res.resource_type || 'DOC').toUpperCase();
              return (
                <React.Fragment key={res.id}>
                  {idx > 0 && <div className="walt-row-divider" />}
                  <div className="walt-list-row">
                    <div className="walt-type-tag-pill">{tag}</div>
                    <div className="walt-row-content">
                      <div className="walt-row-title">{res.title}</div>
                      <div className="walt-row-subtitle">
                        {res.description || 'Official academic syllabus resource'}
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
          <div className="walt-empty-box" style={{ padding: '24px 16px' }}>
            <div className="walt-empty-title">No Files Uploaded Yet</div>
            <div className="walt-empty-desc">
              Request this syllabus or past questions using the Request button in the header.
            </div>
          </div>
        )}

        {/* Bottom Full-Width Got It Button (Walt Image 5 style) */}
        <button
          type="button"
          className="walt-btn-primary walt-btn-full"
          style={{ marginTop: '20px' }}
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
