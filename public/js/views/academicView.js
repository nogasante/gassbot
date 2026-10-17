/**
 * Academic Curriculum Explorer View Component
 * Provides clean Level & Semester filtering for all KNUST Statistics Courses
 */
const AcademicView = (() => {
  let currentLevel = 100;
  let currentSemester = 1;

  async function render(container, params = {}) {
    if (params.level) currentLevel = parseInt(params.level, 10);
    if (params.semester) currentSemester = parseInt(params.semester, 10);

    container.innerHTML = `
      <div class="section-title">
        <span>Curriculum Explorer</span>
      </div>
      <p class="section-subtitle">Official KNUST Statistics syllabus, lecture slides, and past examinations.</p>

      <!-- Level Pill Selectors -->
      <div class="pill-group" id="level-pills">
        <button class="pill ${currentLevel === 100 ? 'active' : ''}" onclick="AcademicView.setLevel(100)">
          <span>Level 100</span>
        </button>
        <button class="pill ${currentLevel === 200 ? 'active' : ''}" onclick="AcademicView.setLevel(200)">
          <span>Level 200</span>
        </button>
        <button class="pill ${currentLevel === 300 ? 'active' : ''}" onclick="AcademicView.setLevel(300)">
          <span>Level 300</span>
        </button>
        <button class="pill ${currentLevel === 400 ? 'active' : ''}" onclick="AcademicView.setLevel(400)">
          <span>Level 400</span>
        </button>
      </div>

      <!-- Semester Segmented Controller -->
      <div class="segmented-control">
        <button class="segment-btn ${currentSemester === 1 ? 'active' : ''}" onclick="AcademicView.setSemester(1)">Semester 1</button>
        <button class="segment-btn ${currentSemester === 2 ? 'active' : ''}" onclick="AcademicView.setSemester(2)">Semester 2</button>
      </div>

      <!-- Course Cards Container -->
      <div class="course-grid" id="course-list-container">
        <div class="course-card skeleton" style="height: 130px;"></div>
        <div class="course-card skeleton" style="height: 130px;"></div>
        <div class="course-card skeleton" style="height: 130px;"></div>
        <div class="course-card skeleton" style="height: 130px;"></div>
      </div>
    `;

    await loadCourses();
  }

  async function setLevel(lvl) {
    TelegramBridge.haptic('light');
    currentLevel = lvl;
    document.querySelectorAll('#level-pills .pill').forEach((btn, idx) => {
      btn.classList.toggle('active', [100, 200, 300, 400][idx] === lvl);
    });
    await loadCourses();
  }

  async function setSemester(sem) {
    TelegramBridge.haptic('light');
    currentSemester = sem;
    document.querySelectorAll('.segmented-control .segment-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx + 1 === sem);
    });
    await loadCourses();
  }

  async function loadCourses() {
    const container = document.getElementById('course-list-container');
    if (!container) return;

    container.innerHTML = `
      <div class="course-card skeleton" style="height: 120px;"></div>
      <div class="course-card skeleton" style="height: 120px;"></div>
    `;

    try {
      const courses = await API.getCourses(currentLevel, currentSemester);
      if (courses.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(74, 144, 226, 0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--gass-blue);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div style="font-weight: 800; font-size: 15px; margin-bottom: 6px; color: var(--text-primary);">No Courses Listed Yet</div>
            <p style="font-size: 12px; color: var(--text-secondary); max-width: 320px; margin: 0 auto 16px; line-height: 1.4;">
              Courses for Level ${currentLevel} Semester ${currentSemester} are being synced with the department.
            </p>
            <button class="btn-primary" style="margin: 0 auto;" onclick="RequestModal.open({ level: ${currentLevel} })">
              Request Course Addition
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = courses.map(c => `
        <div class="course-card" onclick="App.navigate('course', { id: ${c.id} })">
          <div>
            <div class="course-card-header">
              <span class="course-code">${c.code}</span>
              <span class="course-level-badge">L${c.level} • SEM ${c.semester}</span>
            </div>
            <div class="course-title">${c.title}</div>
            <div class="course-desc">${c.description || 'Access course syllabus, slides, lecture notes, and past exam questions.'}</div>
          </div>
          <div class="course-footer">
            <span>View Materials</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--gass-red); text-align: center; padding: 24px;">Failed to load courses. Please refresh.</div>`;
    }
  }

  return {
    render,
    setLevel,
    setSemester
  };
})();
