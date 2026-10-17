import React, { useState, useEffect } from 'react';
import { Section, Cell, SegmentedControl, Spinner, Placeholder, Badge, Button } from '@telegram-apps/telegram-ui';
import { FileText, Download, Star, ChevronRight } from 'lucide-react';

const PILLARS = [
  { key: 'ds_ml', label: 'AI & ML', icon: '/img/track-ds.png', desc: 'Machine Learning, Deep Learning, Statistical Computing' },
  { key: 'prog_tools', label: 'SOFTWARE', icon: '/img/track-code.png', desc: 'R, Python, SQL, LaTeX & Computational Analytics' },
  { key: 'career_growth', label: 'CAREERS', icon: '/img/track-career.png', desc: 'Internships, Scholarships, Career Pathways' },
  { key: 'research_thesis', label: 'RESEARCH', icon: '/img/track-research.png', desc: 'Biostatistics, Actuarial Science, Academic Writing' }
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

  const currentPillarInfo = PILLARS.find(p => p.key === selectedPillar) || PILLARS[0];

  return (
    <div style={{ paddingBottom: '20px' }}>
      {/* Pillar Selection Tabs */}
      <div style={{ padding: '12px 16px 8px' }}>
        <SegmentedControl>
          {PILLARS.map(p => (
            <SegmentedControl.Item
              key={p.key}
              selected={selectedPillar === p.key}
              onClick={() => setSelectedPillar(p.key)}
            >
              {p.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </div>

      {/* Pillar Hero Header */}
      <div style={{ padding: '8px 16px 12px' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <img src={currentPillarInfo.icon} alt={currentPillarInfo.label} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
              {currentPillarInfo.label}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
              {currentPillarInfo.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Subtopics Chips */}
      {subTopics.length > 0 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {subTopics.map(sub => (
            <div
              key={sub.id || sub.key}
              style={{
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0B536F'
              }}
            >
              {sub.title || sub.name}
            </div>
          ))}
        </div>
      )}

      {/* Resources List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spinner size="l" />
        </div>
      ) : resources.length > 0 ? (
        <Section header={`${currentPillarInfo.label} Resources (${resources.length})`}>
          {resources.map(res => {
            const bookmarked = isBookmarked(res.id);
            return (
              <Cell
                key={res.id}
                before={<FileText size={22} color="#0B536F" />}
                subhead={(res.type_name || res.resource_type || 'Toolkit').toUpperCase()}
                subtitle={res.description || 'Verified GASS technical resource'}
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
      ) : (
        <Placeholder
          header="No Resources Yet"
          description={`Materials for ${currentPillarInfo.label} are currently being curated by the GASS academic committee.`}
        >
          <img src={currentPillarInfo.icon} alt="Empty" style={{ width: '64px', height: '64px', margin: '0 auto 12px', opacity: 0.6 }} />
        </Placeholder>
      )}
    </div>
  );
}
