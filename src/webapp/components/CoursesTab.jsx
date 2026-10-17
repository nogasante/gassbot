import React, { useState, useEffect } from 'react';
import { Section, Cell, SegmentedControl, Spinner, Placeholder, Avatar, Badge } from '@telegram-apps/telegram-ui';
import { ChevronRight, BookOpen } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0 24px' }}>
      {/* Level Segmented Switcher */}
      <div style={{ padding: '0 16px' }}>
        <SegmentedControl>
          <SegmentedControl.Item selected={level === 100} onClick={() => setLevel(100)}>
            L100
          </SegmentedControl.Item>
          <SegmentedControl.Item selected={level === 200} onClick={() => setLevel(200)}>
            L200
          </SegmentedControl.Item>
          <SegmentedControl.Item selected={level === 300} onClick={() => setLevel(300)}>
            L300
          </SegmentedControl.Item>
          <SegmentedControl.Item selected={level === 400} onClick={() => setLevel(400)}>
            L400
          </SegmentedControl.Item>
        </SegmentedControl>
      </div>

      {/* Semester Segmented Switcher */}
      <div style={{ padding: '0 16px 8px' }}>
        <SegmentedControl>
          <SegmentedControl.Item selected={semester === 1} onClick={() => setSemester(1)}>
            Semester 1
          </SegmentedControl.Item>
          <SegmentedControl.Item selected={semester === 2} onClick={() => setSemester(2)}>
            Semester 2
          </SegmentedControl.Item>
        </SegmentedControl>
      </div>

      {/* Course List Section */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <Spinner size="l" />
        </div>
      ) : courses.length > 0 ? (
        <Section 
          header={`Level ${level} • Semester ${semester} Curriculum (${courses.length})`}
          footer="Tap any course to explore lecture notes, slides, and past examination papers."
        >
          {courses.map((course) => (
            <Cell
              key={course.id}
              before={
                <Avatar 
                  size={44} 
                  acronym={course.code ? course.code.replace(/\s+/g, '').slice(0, 4) : 'STAT'} 
                />
              }
              subhead={course.code}
              subtitle={course.title}
              description={course.description || `${course.credits || 3} Credit Units`}
              after={<ChevronRight size={18} color="#94A3B8" />}
              onClick={() => onSelectCourse(course)}
            >
              {course.code}
            </Cell>
          ))}
        </Section>
      ) : (
        <Placeholder
          header="No Courses Available"
          description={`No curriculum records found for Level ${level} Semester ${semester}.`}
        >
          <BookOpen size={48} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
        </Placeholder>
      )}
    </div>
  );
}
