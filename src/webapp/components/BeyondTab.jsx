import React, { useState, useEffect } from 'react';

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

const PILLARS = [
  { key: 'ds_ml', label: 'AI & ML', title: 'Data Science & AI', desc: 'PyTorch, Machine Learning, Deep Neural Nets & Predictive Modeling', img: '/img/track-ds.png' },
  { key: 'prog_tools', label: 'Software', title: 'Programming & Tools', desc: 'R Studio, Python, SQL, LaTeX & Computational Analytics', img: '/img/track-code.png' },
  { key: 'career_growth', label: 'Careers', title: 'Careers & Industry', desc: 'Internships, Global Scholarships, CV Building & Portfolio Review', img: '/img/track-career.png' },
  { key: 'research_thesis', label: 'Research', title: 'Research & Thesis', desc: 'Biostatistics, Actuarial Science, Methodology & Paper Writing', img: '/img/track-research.png' }
];

const FEATURED_TOOLS = [
  { name: 'Python', role: 'Data Science & ML', badge: 'HOT', icon: '/img/track-ds.png', pillar: 'ds_ml' },
  { name: 'R Studio', role: 'Statistical Computing', badge: 'CORE', icon: '/img/track-code.png', pillar: 'prog_tools' },
  { name: 'SQL', role: 'Database & Big Data', badge: 'ESSENTIAL', icon: '/img/track-code.png', pillar: 'prog_tools' },
  { name: 'LaTeX', role: 'Academic Publishing', badge: 'THESIS', icon: '/img/track-research.png', pillar: 'research_thesis' },
  { name: 'Git & GitHub', role: 'Version Control', icon: '/img/track-code.png', pillar: 'prog_tools' },
  { name: 'Scholarships', role: 'Global Grants & Study', badge: 'CAREER', icon: '/img/track-career.png', pillar: 'career_growth' },
];

export function BeyondTab({ initialPillar = 'ds_ml', isBookmarked, onToggleBookmark }) {
  const [selectedPillar, setSelectedPillar] = useState(initialPillar);
  const [subTopics, setSubTopics] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPillarData();
  }, [selectedPillar]);

  const loadPillarData = async () => {
    setLoading(true);
    try {
      const [subRes, resRes] = await Promise.all([
        fetch(`/api/beyond-categories/${selectedPillar}/sub-topics`).then(r => r.json()),
        fetch(`/api/resources?category=${selectedPillar}`).then(r => r.json())
      ]);

      if (subRes.success && Array.isArray(subRes.data)) {
        setSubTopics(subRes.data);
      } else {
        setSubTopics([]);
      }

      if (resRes.success && Array.isArray(resRes.data)) {
        setResources(resRes.data);
      } else {
        setResources([]);
      }
    } catch (err) {
      console.error('Failed to load beyond data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePillarChange = (key) => {
    if (key === selectedPillar) return;
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
    setSelectedPillar(key);
  };

  const currentPillar = PILLARS.find(p => p.key === selectedPillar) || PILLARS[0];

  return (
    <div className="walt-page-content">
      {/* Walt Earn-Style 3D Header Graphic */}
      <div className="walt-earn-header">
        <div className="walt-earn-graphic-wrap">
          <img src={currentPillar.img} alt={currentPillar.title} className="walt-earn-graphic" />
        </div>
        <h2 className="walt-earn-title">{currentPillar.title}</h2>
        <p className="walt-earn-desc">{currentPillar.desc}</p>
      </div>

      {/* Capsule Switcher (like Walt's Active / Ended) */}
      <div className="walt-capsule-switcher walt-switcher-full" style={{ marginBottom: '18px' }}>
        {PILLARS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`walt-switcher-item ${selectedPillar === p.key ? 'active' : ''}`}
            onClick={() => handlePillarChange(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Walt 2-Column Grid of Tools (Image 2 style) */}
      <div className="walt-section-header-row">
        <span className="walt-section-title">Industry Toolchains</span>
        <span className="walt-section-badge">6 Featured</span>
      </div>

      <div className="walt-grid-2col" style={{ marginBottom: '22px' }}>
        {FEATURED_TOOLS.map((tool) => (
          <div
            key={tool.name}
            className={`walt-grid-card ${tool.pillar === selectedPillar ? 'highlighted' : ''}`}
            onClick={() => handlePillarChange(tool.pillar)}
          >
            {tool.badge && <div className="walt-grid-badge">{tool.badge}</div>}
            <div className="walt-grid-icon-wrap">
              <img src={tool.icon} alt={tool.name} />
            </div>
            <div className="walt-grid-title">{tool.name}</div>
            <div className="walt-grid-value">{tool.role}</div>
          </div>
        ))}
      </div>

      {/* Subtopics Pills */}
      {subTopics.length > 0 && (
        <div className="walt-chips-scroll no-scrollbar">
          {subTopics.map((sub) => (
            <span key={sub.id || sub.key} className="walt-subtopic-chip">
              {sub.title || sub.name}
            </span>
          ))}
        </div>
      )}

      {/* Grouped Materials Section */}
      <div className="walt-section-header-row">
        <span className="walt-section-title">
          {currentPillar.label} Resources
        </span>
        <span className="walt-section-badge">{resources.length} Available</span>
      </div>

      {loading ? (
        <div className="walt-loading-box">
          <div className="walt-spinner" />
          <span>Fetching resources...</span>
        </div>
      ) : resources.length > 0 ? (
        <section className="walt-card-group">
          {resources.map((res, idx) => {
            const saved = isBookmarked(res.id);
            const tag = (res.type_name || res.resource_type || 'TOOL').toUpperCase();
            return (
              <React.Fragment key={res.id}>
                {idx > 0 && <div className="walt-row-divider" />}
                <div className="walt-list-row">
                  <div className="walt-type-tag-pill">{tag}</div>
                  <div className="walt-row-content">
                    <div className="walt-row-title">{res.title}</div>
                    <div className="walt-row-subtitle">
                      {res.description || 'Verified practical resource from the GASS board.'}
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
          <img src="/img/nav-skills.png" alt="No Resources" className="walt-empty-img" />
          <div className="walt-empty-title">Materials Being Curated</div>
          <div className="walt-empty-desc">
            The GASS Academic & Software Board is reviewing materials for this specialization.
          </div>
        </div>
      )}
    </div>
  );
}
