import React, { useState, useEffect } from 'react';
import { List, Section, Cell, SegmentedControl, Spinner, Placeholder } from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';

export function CoursesTab({ initialLevel = 100, onSelectCourse }) {
  const [level, setLevel] = useState(initialLevel);
  const [semester, setSemester] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [level, semester]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses?level=${level}&semester=${semester}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCourses(data.data);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <List>
      {/* Sleek Dual Switcher: Level & Semester in One Compact Row */}
      <div style={{ display: 'flex', gap: '8px', padding: '4px 16px 12px' }}>
        <div style={{ flex: 3 }}>
          <SegmentedControl>
            <SegmentedControl.Item 
              selected={level === 100} 
              onClick={() => {
                if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.selectionChanged();
                setLevel(100);
              }}
            >
              L100
            </SegmentedControl.Item>
            <SegmentedControl.Item 
              selected={level === 200} 
              onClick={() => {
                if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.selectionChanged();
                setLevel(200);
              }}
            >
              L200
            </SegmentedControl.Item>
            <SegmentedControl.Item 
              selected={level === 300} 
              onClick={() => {
                if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.selectionChanged();
                setLevel(300);
              }}
            >
              L300
            </SegmentedControl.Item>
            <SegmentedControl.Item 
              selected={level === 400} 
              onClick={() => {
                if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.selectionChanged();
                setLevel(400);
              }}
            >
              L400
            </SegmentedControl.Item>
          </SegmentedControl>
        </div>

        <div style={{ flex: 2 }}>
          <SegmentedControl>
            <SegmentedControl.Item 
              selected={semester === 1} 
              onClick={() => {
                if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.selectionChanged();
                setSemester(1);
              }}
            >
              Sem 1
            </SegmentedControl.Item>
            <SegmentedControl.Item 
              selected={semester === 2} 
              onClick={() => {
                if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.selectionChanged();
                setSemester(2);
              }}
            >
              Sem 2
            </SegmentedControl.Item>
          </SegmentedControl>
        </div>
      </div>

      {/* Course List Section */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <Spinner size="l" />
        </div>
      ) : courses.length > 0 ? (
        <Section header={`Level ${level} • Semester ${semester} Curriculum (${courses.length})`}>
          {courses.map((course) => (
            <Cell
              key={course.id}
              subhead={course.code}
              subtitle={`${course.credits || 3} Credit Units • Core Syllabus`}
              after={<Icon24ChevronRight />}
              onClick={() => {
                if (window.Telegram?.WebApp?.HapticFeedback) {
                  window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
                onSelectCourse(course);
              }}
            >
              {course.title}
            </Cell>
          ))}
        </Section>
      ) : (
        <Placeholder
          header="No Courses Available"
          description={`No curriculum records found for Level ${level} Semester ${semester}.`}
        >
          <img 
            src="/img/nav-courses.png" 
            alt="Curriculum" 
            style={{ width: '80px', height: '80px', objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} 
          />
        </Placeholder>
      )}
    </List>
  );
}
