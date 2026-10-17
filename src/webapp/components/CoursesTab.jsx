import React, { useState, useEffect } from 'react';
import { Section, Cell, SegmentedControl, Spinner, Placeholder, Badge } from '@telegram-apps/telegram-ui';
import { ChevronRight, BookOpen, AlertCircle } from 'lucide-react';

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
    <div style={{ paddingBottom: '20px' }}>
      {/* Level Segmented Switcher */}
      <div style={{ padding: '12px 16px 8px' }}>
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
      <div style={{ padding: '0 16px 12px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spinner size="l" />
        </div>
      ) : courses.length > 0 ? (
        <Section header={`Level ${level} • Semester ${semester} Courses`}>
          {courses.map((course) => (
            <Cell
              key={course.id}
              before={
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '10px', 
                  background: '#F1F5F9', 
                  border: '1px solid #E2E8F0',
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '11px',
                  color: '#0B536F'
                }}>
                  <span>{course.credits || 3}</span>
                  <span style={{ fontSize: '8px', color: '#64748B' }}>CR</span>
                </div>
              }
              subhead={course.code}
              subtitle={course.title}
              description={course.description || 'Access syllabus, lecture slides, past questions and cheat sheets'}
              after={<ChevronRight size={18} color="#94A3B8" />}
              onClick={() => onSelectCourse(course)}
            >
              {course.code}
            </Cell>
          ))}
        </Section>
      ) : (
        <Placeholder
          header="No Courses Found"
          description={`No curriculum records found for Level ${level} Semester ${semester}.`}
        >
          <BookOpen size={48} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
        </Placeholder>
      )}
    </div>
  );
}
