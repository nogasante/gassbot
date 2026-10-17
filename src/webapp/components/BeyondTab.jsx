import React, { useState, useEffect } from 'react';
import { Section, Cell, SegmentedControl, Spinner, Placeholder, Badge, Button, IconButton, Banner, Chip } from '@telegram-apps/telegram-ui';
import { Download, Star, Sparkles } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0 24px' }}>
      {/* Pillar Selection Tabs */}
      <div style={{ padding: '0 16px' }}>
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

      {/* Official Telegram UI Banner for Current Pillar */}
      <div style={{ padding: '4px 16px' }}>
        <Banner
          type="section"
          callout="SKILLS & COMPETENCY"
          header={currentPillarInfo.label}
          description={currentPillarInfo.desc}
          before={<img src={currentPillarInfo.icon} alt={currentPillarInfo.label} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />}
        />
      </div>

      {/* Official Telegram UI Chips for Dynamic Subtopics */}
      {subTopics.length > 0 && (
        <div style={{ padding: '0 16px 4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {subTopics.map(sub => (
            <Chip key={sub.id || sub.key} mode="elevated">
              {sub.title || sub.name}
            </Chip>
          ))}
        </div>
      )}

      {/* Resources List Section */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <Spinner size="l" />
        </div>
      ) : resources.length > 0 ? (
        <Section header={`${currentPillarInfo.label} Materials (${resources.length})`}>
          {resources.map(res => {
            const bookmarked = isBookmarked(res.id);
            return (
              <Cell
                key={res.id}
                before={<Badge mode="secondary">{(res.type_name || res.resource_type || 'TOOL').toUpperCase()}</Badge>}
                subhead={res.resource_type || 'Resource'}
                subtitle={res.description || 'Verified GASS technical toolkit'}
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
      ) : (
        <Placeholder
          header="Curating Content"
          description={`Materials for ${currentPillarInfo.label} are currently being curated by the academic committee.`}
        >
          <img src={currentPillarInfo.icon} alt="Empty" style={{ width: '56px', height: '56px', margin: '0 auto 12px', opacity: 0.6 }} />
        </Placeholder>
      )}
    </div>
  );
}
