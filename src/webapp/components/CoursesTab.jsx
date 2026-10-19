import React, { useState, useEffect } from 'react';

function IconChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function CoursesTab({ initialLevel = 100, onSelectCourse }) {
  const [levels, setLevels] = useState([100, 200, 300, 400]);
  const [level, setLevel] = useState(initialLevel);
  const [semester, setSemester] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Dynamic Distinct Levels from Database
  useEffect(() => {
    async function fetchLevels() {
      try {
        const res = await fetch('/api/courses/levels');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setLevels(data.data);
          if (!data.data.includes(level)) {
            setLevel(data.data[0]);
          }
        }
      } catch (err) {
        console.warn('Using default academic levels', err);
      }
    }
    fetchLevels();
  }, []);

  // 2. Fetch Courses for Selected Dynamic Level and Semester
  useEffect(() => {
    fetchCourses();
  }, [level, semester]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses?level=${encodeURIComponent(level)}&semester=${encodeURIComponent(semester)}`);
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

  const handleLevelChange = (lvl) => {
    if (lvl === level) return;
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
    setLevel(lvl);
  };

  const handleSemesterChange = (sem) => {
    if (sem === semester) return;
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
    setSemester(sem);
  };

  const handleCourseClick = (course) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    onSelectCourse(course);
  };

  return (
    <div className="walt-page-content">
      {/* Dynamic Capsule Switchers */}
      <div className="walt-filter-row">
        {/* Dynamic Level Switcher */}
        <div className="walt-capsule-switcher walt-switcher-level">
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`walt-switcher-item ${level === lvl ? 'active' : ''}`}
              onClick={() => handleLevelChange(lvl)}
            >
              L{lvl}
            </button>
          ))}
        </div>

        {/* Semester Switcher */}
        <div className="walt-capsule-switcher walt-switcher-sem">
          {[1, 2].map((sem) => (
            <button
              key={sem}
              type="button"
              className={`walt-switcher-item ${semester === sem ? 'active' : ''}`}
              onClick={() => handleSemesterChange(sem)}
            >
              Sem {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Section Header */}
      <div className="walt-section-header-row">
        <span className="walt-section-title">
          Level {level} • Semester {semester}
        </span>
        <span className="walt-section-badge">{courses.length} Courses</span>
      </div>

      {/* Courses Grouped Card */}
      {loading ? (
        <div className="walt-loading-box">
          <div className="walt-spinner" />
          <span>Loading curriculum...</span>
        </div>
      ) : courses.length > 0 ? (
        <section className="walt-card-group">
          {courses.map((course, idx) => {
            const acronym = course.code ? course.code.split(' ')[0] : 'STAT';
            const credits = course.credits || 3;
            return (
              <React.Fragment key={course.id}>
                {idx > 0 && <div className="walt-row-divider" />}
                <div
                  className="walt-list-row"
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="walt-row-badge-pill">{acronym}</div>
                  <div className="walt-row-content">
                    <div className="walt-row-title">
                      <span className="walt-course-code">{course.code}</span>
                      <span className="walt-course-name">{course.title}</span>
                    </div>
                    <div className="walt-row-subtitle">
                      {credits} Credits • {course.description || 'Core Curriculum Syllabus'}
                    </div>
                  </div>
                  <div className="walt-row-after">
                    <IconChevronRight />
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </section>
      ) : (
        <div className="walt-empty-box">
          <img src="/img/nav-courses.png" alt="No Courses" className="walt-empty-img" />
          <div className="walt-empty-title">No Courses Listed</div>
          <div className="walt-empty-desc">
            No courses are currently registered for Level {level} Semester {semester}.
          </div>
        </div>
      )}
    </div>
  );
}
