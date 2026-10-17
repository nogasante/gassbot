import React, { useState, useEffect } from 'react';
import { Modal, List, Section, Cell, Button, IconButton, Badge, Spinner, Placeholder, Avatar } from '@telegram-apps/telegram-ui';
import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';
import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';

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

  if (!course) return null;

  return (
    <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div style={{ padding: '16px 16px 32px', maxHeight: '85vh', overflowY: 'auto' }}>
        <List>
          {/* Course Overview Header Cell */}
          <Section header={`${course.code} • Level ${course.level}`} footer={course.description || 'Verified course resources provided by the GASS Academic Board.'}>
            <Cell
              before={<Avatar size={48} acronym={course.code ? course.code.slice(0, 4) : 'STAT'} />}
              subhead={`SEMESTER ${course.semester} • ${course.credits || 3} CREDITS`}
              subtitle={course.title}
              multiline
            >
              {course.code}
            </Cell>
          </Section>

          {/* Resources List */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '36px 0' }}>
              <Spinner size="m" />
            </div>
          ) : resources.length > 0 ? (
            <Section header={`Available Materials (${resources.length})`}>
              {resources.map((res) => {
                const bookmarked = isBookmarked(res.id);
                return (
                  <Cell
                    key={res.id}
                    before={<Badge mode="primary">{(res.type_name || res.resource_type || 'DOC').toUpperCase()}</Badge>}
                    subhead={res.resource_type || 'Material'}
                    subtitle={res.description || 'Verified GASS academic file'}
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
                          <Icon28Heart style={{ color: bookmarked ? '#E00613' : 'inherit' }} />
                        </IconButton>

                        <Button
                          size="s"
                          mode="filled"
                          Component="a"
                          href={res.file_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
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
              header="No Uploaded Materials"
              description="No slides or past examination papers have been uploaded for this course yet."
            >
              <Icon28Archive />
            </Placeholder>
          )}

          <div style={{ marginTop: '16px' }}>
            <Button size="l" mode="bezeled" stretched onClick={onClose}>
              Close
            </Button>
          </div>
        </List>
      </div>
    </Modal>
  );
}
