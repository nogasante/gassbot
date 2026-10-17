/**
 * Course Detail & Materials Hub View Component
 * Refined document hub with category filters and high-density material tiles
 */
const CourseDetailView = (() => {
  let courseData = null;
  let activeTypeFilter = 'all';

  async function render(container, params = {}) {
    const courseId = params.id;
    if (!courseId) {
      App.navigate('academic');
      return;
    }

    container.innerHTML = `
      <div class="course-card skeleton" style="height: 160px; margin-bottom: 16px;"></div>
      <div class="course-card skeleton" style="height: 70px;"></div>
    `;

    try {
      courseData = await API.getCourseDetails(courseId);
      if (!courseData) {
        container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Course not found.</div>`;
        return;
      }

      const topicsHtml = (courseData.topics && courseData.topics.length > 0)
        ? `<div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px;">
            ${courseData.topics.map(t => `<span style="font-size: 11px; font-weight: 600; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); padding: 4px 10px; border-radius: var(--radius-sm); color: var(--text-secondary);">${t.title}</span>`).join('')}
           </div>`
        : '';

      container.innerHTML = `
        <!-- Course Header Card -->
        <div class="course-card" style="margin-bottom: 20px; cursor: default;">
          <div class="course-card-header">
            <span class="course-code">${courseData.code}</span>
            <span class="course-level-badge">Level ${courseData.level} • Semester ${courseData.semester}</span>
          </div>
          <h2 style="font-size: 19px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF; margin-bottom: 8px;">${courseData.title}</h2>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.45;">${courseData.description || 'Departmental course syllabus and curated learning materials.'}</p>
          ${topicsHtml}
        </div>

        <!-- Materials Section Header -->
        <div class="section-title">
          <span>Course Materials (${courseData.resources ? courseData.resources.length : 0})</span>
          <button class="btn-primary" style="padding: 5px 12px; font-size: 11px;" onclick="RequestModal.open({ courseCode: '${courseData.code}', courseId: ${courseData.id} })">
            + Request File
          </button>
        </div>

        <!-- Material Filter Chips -->
        <div class="pill-group" id="material-type-pills">
          <button class="pill active" onclick="CourseDetailView.filterType('all')">All</button>
          <button class="pill" onclick="CourseDetailView.filterType('past_question')">Past Questions</button>
          <button class="pill" onclick="CourseDetailView.filterType('lecture_slide')">Lecture Slides</button>
          <button class="pill" onclick="CourseDetailView.filterType('note')">Notes</button>
          <button class="pill" onclick="CourseDetailView.filterType('syllabus')">Syllabus</button>
        </div>

        <div id="course-materials-list"></div>
      `;

      renderMaterialsList();
    } catch (err) {
      container.innerHTML = `<div style="color: var(--gass-red); text-align: center; padding: 30px;">Failed to load course details.</div>`;
    }
  }

  function filterType(typeKey) {
    TelegramBridge.haptic('light');
    activeTypeFilter = typeKey;
    document.querySelectorAll('#material-type-pills .pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('onclick').includes(typeKey));
    });
    renderMaterialsList();
  }

  function renderMaterialsList() {
    const listContainer = document.getElementById('course-materials-list');
    if (!listContainer || !courseData) return;

    let materials = courseData.resources || [];
    if (activeTypeFilter !== 'all') {
      materials = materials.filter(m => m.resource_type === activeTypeFilter);
    }

    if (materials.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(74, 144, 226, 0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--gass-blue);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div style="font-weight: 800; font-size: 15px; margin-bottom: 6px; color: #FFFFFF;">No Files in This Category</div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Need this document? Submit a request and our executives will upload it.</p>
          <button class="btn-primary" style="margin: 0 auto;" onclick="RequestModal.open({ courseCode: '${courseData.code}', courseId: ${courseData.id} })">Request for ${courseData.code}</button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = materials.map(m => {
      let typeLabel = 'DOC';
      let typeClass = 'type-default';

      if (m.resource_type === 'past_question') {
        typeLabel = 'PQ';
        typeClass = 'type-past-question';
      } else if (m.resource_type === 'lecture_slide') {
        typeLabel = 'SLIDE';
        typeClass = 'type-lecture-slide';
      } else if (m.resource_type === 'note') {
        typeLabel = 'NOTE';
        typeClass = 'type-note';
      } else if (m.resource_type === 'syllabus') {
        typeLabel = 'PLAN';
        typeClass = 'type-syllabus';
      }

      const fileUrl = m.file_url || (m.telegram_file_id ? `https://t.me/gassknustbot?start=res_${m.id}` : '#');
      const isTelegramOnly = m.telegram_file_id && !m.file_url.startsWith('http');
      const actionLabel = isTelegramOnly ? 'Get in Bot' : 'Open';

      return `
        <div class="material-card">
          <div class="material-type-pill ${typeClass}">${typeLabel}</div>
          <div class="material-info">
            <div class="material-title" title="${m.title}">${m.title}</div>
            <div class="material-meta">
              <span class="material-meta-badge">${m.file_format || 'PDF'}</span>
              <span>•</span>
              <span>${m.download_count || 0} views</span>
            </div>
          </div>
          <div class="material-actions">
            <button class="btn-icon" title="Save Bookmark" onclick="CourseDetailView.toggleBookmark(${m.id}, this)">
              <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
            <button class="btn-primary" onclick="CourseDetailView.openMaterial('${fileUrl}', ${m.id})">${actionLabel}</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function openMaterial(url, id) {
    TelegramBridge.haptic('medium');
    TelegramBridge.openLink(url);
  }

  async function toggleBookmark(resourceId, btnElement) {
    TelegramBridge.haptic('success');
    if (btnElement) btnElement.classList.toggle('bookmarked');
    const user = TelegramBridge.getUser();
    try {
      await API.bookmarkResource(user.id, resourceId);
      TelegramBridge.showToast('Material saved to Bookmarks!', 'bookmark');
    } catch (e) {
      TelegramBridge.showToast('Saved to Bookmarks!', 'bookmark');
    }
  }

  return {
    render,
    filterType,
    openMaterial,
    toggleBookmark
  };
})();
