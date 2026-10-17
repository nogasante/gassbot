/**
 * Home View Component for GASS-KNUST Student Mini WebApp
 * Designed with Apple/Telegram native ergonomics, Google Fonts (Outfit & Plus Jakarta Sans),
 * and custom 3D in-app graphics
 */
const HomeView = (() => {
  async function render(container) {
    const user = TelegramBridge.getUser();
    const studentName = user.first_name ? user.first_name : 'Scholar';

    container.innerHTML = `
      <!-- Departmental Hero Card with 3D Banner Backdrop -->
      <div class="hero-card">
        <div class="hero-banner-backdrop">
          <img src="img/hero-banner.jpg" alt="Statistics for Development" />
        </div>
        <div class="hero-inner">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span class="hero-tag">GASS-KNUST</span>
            <span style="font-size: 11px; font-weight: 800; color: #7DD3FC; letter-spacing: 0.05em; text-transform: uppercase;">ACADEMIC HUB</span>
          </div>
          <h2 class="hero-title">Welcome, ${studentName}</h2>
          <p class="hero-slogan">"Statistics for Development"</p>

          <!-- Live Metrics Strip -->
          <div class="hero-stats" id="hero-stats-row">
            <div class="hero-stat-item">
              <strong id="stat-courses">63</strong>
              <span>Courses</span>
            </div>
            <div class="hero-stat-item">
              <strong id="stat-resources">11+</strong>
              <span>Materials</span>
            </div>
            <div class="hero-stat-item">
              <strong id="stat-students">Live</strong>
              <span>Portal</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Academic Curriculum Quick Access -->
      <div class="section-title">
        <span>Academic Syllabus</span>
        <a href="#academic" onclick="TelegramBridge.haptic('light')">Explore All →</a>
      </div>
      <p class="section-subtitle">Official KNUST Statistics & Actuarial Science courses by level.</p>

      <div class="pill-group" style="margin-bottom: 22px;">
        <button class="pill" onclick="App.navigate('academic', { level: 100 })">
          <span>Level 100</span>
        </button>
        <button class="pill" onclick="App.navigate('academic', { level: 200 })">
          <span>Level 200</span>
        </button>
        <button class="pill" onclick="App.navigate('academic', { level: 300 })">
          <span>Level 300</span>
        </button>
        <button class="pill" onclick="App.navigate('academic', { level: 400 })">
          <span>Level 400</span>
        </button>
      </div>

      <!-- Beyond Curriculum Skill Tracks with 3D App Graphics -->
      <div class="section-title">
        <span>Specialized Skill Tracks</span>
        <a href="#beyond" onclick="TelegramBridge.haptic('light')">All Tracks →</a>
      </div>
      <p class="section-subtitle">Practical tools, data science stacks, and career preparation.</p>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
        <div class="course-card" onclick="App.navigate('beyond', { pillar: 'data_science_ai' })">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <img src="img/track-ds.jpg" class="track-3d-icon" alt="Data Science & AI" />
            <span style="font-size: 10px; font-weight: 800; color: #60A5FA; text-transform: uppercase;">TRACK 01</span>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px; letter-spacing: -0.01em;">Data Science & AI</div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.35;">R, Python, ML, Biostats</div>
        </div>

        <div class="course-card" onclick="App.navigate('beyond', { pillar: 'programming_software' })">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <img src="img/track-code.jpg" class="track-3d-icon" alt="Programming Tools" />
            <span style="font-size: 10px; font-weight: 800; color: #34D399; text-transform: uppercase;">TRACK 02</span>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px; letter-spacing: -0.01em;">Programming Tools</div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.35;">SQL, Git, LaTeX, Excel</div>
        </div>

        <div class="course-card" onclick="App.navigate('beyond', { pillar: 'career_professional' })">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <img src="img/track-career.jpg" class="track-3d-icon" alt="Careers & Growth" />
            <span style="font-size: 10px; font-weight: 800; color: #FBBF24; text-transform: uppercase;">TRACK 03</span>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px; letter-spacing: -0.01em;">Careers & Growth</div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.35;">Internships & CV Writing</div>
        </div>

        <div class="course-card" onclick="App.navigate('beyond', { pillar: 'research_thesis' })">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <img src="img/track-research.jpg" class="track-3d-icon" alt="Research & Thesis" />
            <span style="font-size: 10px; font-weight: 800; color: #A78BFA; text-transform: uppercase;">TRACK 04</span>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px; letter-spacing: -0.01em;">Research & Thesis</div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.35;">Academic Writing & Stats</div>
        </div>
      </div>

      <!-- Quick Document Request Action -->
      <div class="course-card" style="background: linear-gradient(135deg, rgba(224, 6, 19, 0.12), rgba(11, 83, 111, 0.2)); border-color: rgba(224, 6, 19, 0.35); padding: 18px;" onclick="RequestModal.open()">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px;">
          <div>
            <div style="font-weight: 800; font-size: 14px; color: #FFFFFF; margin-bottom: 3px; display: flex; align-items: center; gap: 6px;">
              <span>Need a Specific Past Question or Slide?</span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
              Submit a quick request and our academic team will source and upload it.
            </div>
          </div>
          <button class="btn-primary" style="flex-shrink: 0;" onclick="event.stopPropagation(); RequestModal.open()">Request</button>
        </div>
      </div>
    `;

    // Fetch and sync live statistics
    API.getStats().then(stats => {
      if (stats) {
        const stdEl = document.getElementById('stat-students');
        const resEl = document.getElementById('stat-resources');
        const crsEl = document.getElementById('stat-courses');
        if (stdEl) stdEl.textContent = stats.totalStudents || '1';
        if (resEl) resEl.textContent = stats.totalResources || '11';
        if (crsEl) crsEl.textContent = stats.totalCourses || '63';
      }
    }).catch(() => {});
  }

  return {
    render
  };
})();
