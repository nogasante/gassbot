import React, { useState, useEffect } from 'react';
import { Modal, Section, Cell, Button, Badge, Spinner, Placeholder } from '@telegram-apps/telegram-ui';
import { Download, ExternalLink, Bookmark, Star, FileText, Check } from 'lucide-react';

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
      <div style={{ padding: '16px 20px', maxHeight: '80vh', overflowY: 'auto' }}>
        {/* Course Header Summary */}
        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge mode="primary" style={{ background: '#0B536F', color: '#FFFFFF' }}>
              {course.code}
            </Badge>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Level {course.level} • Semester {course.semester} • {course.credits || 3} Credits
            </span>
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
            {course.title}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>
            {course.description || 'Access syllabus, lecture slides, past questions and cheat sheets for this course.'}
          </p>
        </div>

        {/* Resources Grouping */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
            <Spinner size="m" />
          </div>
        ) : resources.length > 0 ? (
          <Section header={`Verified Course Materials (${resources.length})`}>
            {resources.map((res) => {
              const bookmarked = isBookmarked(res.id);
              return (
                <Cell
                  key={res.id}
                  before={<FileText size={22} color="#0B536F" />}
                  subhead={(res.type_name || res.resource_type || 'Material').toUpperCase()}
                  subtitle={res.description || 'Verified GASS academic document'}
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
                        onClick={(e) => e.stopPropagation()}
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
            header="No Materials Yet"
            description="No slides or past questions have been verified for this course yet."
          >
            <FileText size={40} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
          </Placeholder>
        )}

        <div style={{ marginTop: '20px' }}>
          <Button size="l" mode="bezeled" stretched onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
