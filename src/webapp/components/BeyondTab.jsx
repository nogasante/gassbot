import React, { useState, useEffect } from 'react';
import { List, Section, Cell, SegmentedControl, Spinner, Placeholder, Badge, Button, IconButton, Banner, Chip } from '@telegram-apps/telegram-ui';
import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';
import { Icon28Devices } from '@telegram-apps/telegram-ui/dist/icons/28/devices';

const PILLARS = [
  { key: 'ds_ml', label: 'AI & ML', desc: 'Machine Learning, Deep Learning, Statistical Computing' },
  { key: 'prog_tools', label: 'SOFTWARE', desc: 'R, Python, SQL, LaTeX & Computational Analytics' },
  { key: 'career_growth', label: 'CAREERS', desc: 'Internships, Scholarships, Career Pathways' },
  { key: 'research_thesis', label: 'RESEARCH', desc: 'Biostatistics, Actuarial Science, Academic Writing' }
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
    <List>
      {/* Pillar Selection Segmented Control */}
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

      {/* Official Telegram UI Banner for Current Pillar */}
      <Banner
        type="section"
        callout="SPECIALIZATION PILLAR"
        header={currentPillarInfo.label}
        description={currentPillarInfo.desc}
      />

      {/* Dynamic Subtopics Chips */}
      {subTopics.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 8px' }}>
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
                before={<Chip mode="mono" className="resource-chip">{(res.type_name || res.resource_type || 'TOOL').toUpperCase()}</Chip>}
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
                      <Icon28Heart style={{ color: bookmarked ? '#E00613' : '#94A3B8' }} />
                    </IconButton>

                    <Button
                      size="s"
                      mode="filled"
                      Component="a"
                      href={res.file_url}
                      target="_blank"
                      rel="noreferrer"
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
          <Icon28Devices />
        </Placeholder>
      )}
    </List>
  );
}
