/**
 * Saved Materials & Bookmarks View Component
 * Clean personal library with offline cache indicators and instant opening
 */
const BookmarksView = (() => {
  async function render(container) {
    container.innerHTML = `
      <div class="section-title">
        <span>Saved Materials</span>
      </div>
      <p class="section-subtitle">Quick access to all lecture notes, past exams, and guides you have bookmarked.</p>
      <div id="bookmarks-list">
        <div class="material-card skeleton" style="height: 64px;"></div>
        <div class="material-card skeleton" style="height: 64px;"></div>
      </div>
    `;

    const user = TelegramBridge.getUser();
    const list = document.getElementById('bookmarks-list');

    try {
      const saved = await API.getSavedResources(user.id);
      if (saved.length === 0) {
        list.innerHTML = `
          <div style="text-align: center; padding: 48px 16px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: #F59E0B;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div style="font-weight: 800; font-size: 15px; margin-bottom: 6px; color: #FFFFFF;">No Bookmarks Yet</div>
            <p style="font-size: 12px; color: var(--text-secondary); max-width: 320px; margin: 0 auto 16px; line-height: 1.4;">
              Tap the bookmark ribbon icon on any course material or guide to pin it here for one-click access.
            </p>
            <button class="btn-primary" style="margin: 0 auto;" onclick="App.navigate('academic')">
              Explore Courses
            </button>
          </div>
        `;
        return;
      }

      list.innerHTML = saved.map(m => {
        const fileUrl = m.file_url || (m.telegram_file_id ? `https://t.me/gassknustbot?start=res_${m.id}` : '#');
        return `
          <div class="material-card">
            <div class="material-type-pill type-default" style="background: rgba(245, 158, 11, 0.12); color: #FBBF24; border-color: rgba(245, 158, 11, 0.3);">
              PIN
            </div>
            <div class="material-info">
              <div class="material-title" title="${m.title}">${m.title}</div>
              <div class="material-meta">
                <span style="color: var(--gass-blue); font-weight: 700;">${m.course_code || 'Document'}</span>
                <span>•</span>
                <span>${m.file_format || 'PDF'}</span>
              </div>
            </div>
            <div class="material-actions">
              <button class="btn-primary" onclick="CourseDetailView.openMaterial('${fileUrl}', ${m.id})">Open</button>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      list.innerHTML = `<div style="text-align: center; color: var(--gass-red); padding: 24px;">Could not load bookmarks.</div>`;
    }
  }

  return {
    render
  };
})();
