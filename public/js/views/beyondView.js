/**
 * Beyond Curriculum Tracks & Practical Skills View Component
 * Structured into 4 Core Pillars with Sub-topics and Curated Material Cards
 */
const BeyondView = (() => {
  let categories = [];
  let selectedPillar = null;
  let selectedSubTopic = null;

  async function render(container, params = {}) {
    if (params.pillar) selectedPillar = params.pillar;
    if (params.subTopic) selectedSubTopic = params.subTopic;

    container.innerHTML = `
      <div class="section-title">
        <span>Beyond Curriculum</span>
      </div>
      <p class="section-subtitle">Practical computing stacks, data science pathways, careers, and academic research.</p>
      <div id="beyond-content">
        <div class="course-card skeleton" style="height: 100px; margin-bottom: 12px;"></div>
        <div class="course-card skeleton" style="height: 100px; margin-bottom: 12px;"></div>
      </div>
    `;

    if (selectedSubTopic) {
      await renderSubTopicMaterials(selectedSubTopic);
    } else if (selectedPillar) {
      await renderPillarSubTopics(selectedPillar);
    } else {
      await renderPillarsList();
    }
  }

  async function renderPillarsList() {
    const content = document.getElementById('beyond-content');
    if (!content) return;

    try {
      categories = await API.getBeyondCategories();

      const trackData = {
        data_science_ai: {
          img: 'img/track-ds.jpg',
          badge: 'TRACK 01',
          color: '#60A5FA'
        },
        programming_software: {
          img: 'img/track-code.jpg',
          badge: 'TRACK 02',
          color: '#34D399'
        },
        career_professional: {
          img: 'img/track-career.jpg',
          badge: 'TRACK 03',
          color: '#FBBF24'
        },
        research_thesis: {
          img: 'img/track-research.jpg',
          badge: 'TRACK 04',
          color: '#A78BFA'
        }
      };

      content.innerHTML = categories.map(cat => {
        const meta = trackData[cat.key] || {
          img: 'img/track-ds.jpg',
          badge: 'TRACK',
          color: 'var(--gass-blue)'
        };

        return `
          <div class="category-card" onclick="BeyondView.selectPillar('${cat.key}')">
            <img src="${meta.img}" class="track-3d-icon" alt="${cat.label}" />
            <div class="category-details" style="flex: 1;">
              <div style="font-size: 10px; font-weight: 800; color: ${meta.color}; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.05em;">${meta.badge}</div>
              <h3>${cat.label}</h3>
              <p>${cat.desc || cat.description || 'Specialized learning guides and cheat sheets.'}</p>
            </div>
            <div style="color: var(--text-muted); display: flex; align-items: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      content.innerHTML = `<div style="text-align: center; color: var(--gass-red); padding: 20px;">Failed to load tracks.</div>`;
    }
  }

  async function selectPillar(pillarKey) {
    TelegramBridge.haptic('light');
    selectedPillar = pillarKey;
    await renderPillarSubTopics(pillarKey);
  }

  async function renderPillarSubTopics(pillarKey) {
    const content = document.getElementById('beyond-content');
    if (!content) return;

    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button class="pill" onclick="BeyondView.backToPillars()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>All Tracks</span>
        </button>
      </div>
      <div class="course-grid" id="subtopics-grid">
        <div class="course-card skeleton" style="height: 90px;"></div>
        <div class="course-card skeleton" style="height: 90px;"></div>
      </div>
    `;

    try {
      const subTopics = await API.getBeyondSubTopics(pillarKey);
      const grid = document.getElementById('subtopics-grid');

      if (subTopics.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--text-secondary);">No topics found in this track.</div>`;
        return;
      }

      grid.innerHTML = subTopics.map(sub => `
        <div class="course-card" onclick="BeyondView.selectSubTopic('${sub.key}')">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 14px; color: #FFFFFF;">${sub.label}</span>
            <span style="font-size: 11px; font-weight: 700; color: var(--gass-blue);">EXPLORE</span>
          </div>
          <div class="course-desc" style="margin-bottom: 6px;">${sub.description || 'Hands-on manuals, tutorials, and templates.'}</div>
          <div class="course-footer">
            <span>Browse Files</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      `).join('');
    } catch (err) {
      content.innerHTML = `<div style="color: var(--gass-red);">Failed to load topics.</div>`;
    }
  }

  async function selectSubTopic(subKey) {
    TelegramBridge.haptic('light');
    selectedSubTopic = subKey;
    await renderSubTopicMaterials(subKey);
  }

  async function renderSubTopicMaterials(subKey) {
    const content = document.getElementById('beyond-content');
    if (!content) return;

    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button class="pill" onclick="BeyondView.backToPillar('${selectedPillar || ''}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>Back to Topics</span>
        </button>
      </div>
      <div id="subtopic-materials">
        <div class="material-card skeleton" style="height: 70px;"></div>
      </div>
    `;

    try {
      const resources = await API.getResources({ beyond_sub_topic: subKey });
      const container = document.getElementById('subtopic-materials');

      if (resources.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 16px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(74, 144, 226, 0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--gass-blue);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div style="font-weight: 800; font-size: 15px; margin-bottom: 6px; color: #FFFFFF;">No Materials in This Topic Yet</div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Have a guide or cheatsheet to request? Submit to the team.</p>
            <button class="btn-primary" style="margin: 0 auto;" onclick="RequestModal.open({ topicTitle: '${subKey}' })">Request Guide</button>
          </div>
        `;
        return;
      }

      container.innerHTML = resources.map(m => {
        const fileUrl = m.file_url || (m.telegram_file_id ? `https://t.me/gassknustbot?start=res_${m.id}` : '#');
        return `
          <div class="material-card">
            <div class="material-type-pill type-default">CODE</div>
            <div class="material-info">
              <div class="material-title" title="${m.title}">${m.title}</div>
              <div class="material-meta">
                <span class="material-meta-badge">${m.file_format || 'LINK'}</span>
                <span>•</span>
                <span>${m.download_count || 0} views</span>
              </div>
            </div>
            <div class="material-actions">
              <button class="btn-icon" title="Save Bookmark" onclick="CourseDetailView.toggleBookmark(${m.id}, this)">
                <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </button>
              <button class="btn-primary" onclick="CourseDetailView.openMaterial('${fileUrl}', ${m.id})">Open</button>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      content.innerHTML = `<div style="color: var(--gass-red);">Failed to load materials.</div>`;
    }
  }

  function backToPillars() {
    TelegramBridge.haptic('light');
    selectedPillar = null;
    selectedSubTopic = null;
    renderPillarsList();
  }

  function backToPillar(pillarKey) {
    TelegramBridge.haptic('light');
    selectedSubTopic = null;
    if (pillarKey) {
      renderPillarSubTopics(pillarKey);
    } else {
      renderPillarsList();
    }
  }

  return {
    render,
    selectPillar,
    selectSubTopic,
    backToPillars,
    backToPillar
  };
})();
