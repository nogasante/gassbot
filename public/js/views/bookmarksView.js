/**
 * Saved Materials & Bookmarks View Component
 * Instant local cache + backend synchronization and smooth bookmark management
 */
const BookmarksView = (() => {
  async function render(container) {
    container.innerHTML = `
      <div class="section-title">
        <span>Saved Materials</span>
      </div>
      <p class="section-subtitle">Quick access to all lecture notes, past exams, and guides you have bookmarked.</p>
      <div id="bookmarks-list"></div>
    `;

    const user = TelegramBridge.getUser();
    const list = document.getElementById('bookmarks-list');

    // 1. Immediately load and render from localStorage
    let localSaved = [];
    try {
      localSaved = JSON.parse(localStorage.getItem('gass_saved_resources') || '[]');
    } catch (e) {
      localSaved = [];
    }

    if (localSaved.length > 0) {
      renderSavedList(list, localSaved);
    } else {
      list.innerHTML = `
        <div class="material-card skeleton" style="height: 64px;"></div>
        <div class="material-card skeleton" style="height: 64px;"></div>
      `;
    }

    // 2. Fetch server saved resources in background and sync
    try {
      const serverSaved = await API.getSavedResources(user.id);
      if (Array.isArray(serverSaved) && serverSaved.length > 0) {
        const mergedMap = new Map();
        localSaved.forEach(item => mergedMap.set(item.id, item));
        serverSaved.forEach(item => mergedMap.set(item.id, item));
        const combined = Array.from(mergedMap.values());
        localStorage.setItem('gass_saved_resources', JSON.stringify(combined));
        renderSavedList(list, combined);
        return;
      }
    } catch (err) {
      console.warn('Could not sync bookmarks from server:', err);
    }

    // 3. Fallback to localSaved or empty state
    if (localSaved.length > 0) {
      renderSavedList(list, localSaved);
    } else {
      renderEmptyState(list);
    }
  }

  function renderEmptyState(list) {
    if (!list) return;
    list.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle); box-shadow: var(--shadow-card);">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(217, 119, 6, 0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: #D97706;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div style="font-weight: 800; font-size: 16px; margin-bottom: 6px; color: var(--text-primary);">No Bookmarks Yet</div>
        <p style="font-size: 13px; color: var(--text-secondary); max-width: 320px; margin: 0 auto 18px; line-height: 1.45;">
          Tap the bookmark ribbon icon on any course material or guide to pin it here for one-click access.
        </p>
        <button class="btn-primary" style="margin: 0 auto;" onclick="App.navigate('academic')">
          Explore Courses
        </button>
      </div>
    `;
  }

  function renderSavedList(list, items) {
    if (!list) return;
    if (!items || items.length === 0) {
      renderEmptyState(list);
      return;
    }

    list.innerHTML = items.map(m => {
      const fileUrl = m.file_url || (m.telegram_file_id ? `https://t.me/gassknustbot?start=res_${m.id}` : '#');
      return `
        <div class="material-card">
          <div class="material-type-pill type-default" style="background: rgba(217, 119, 6, 0.1); color: #D97706; border-color: rgba(217, 119, 6, 0.25);">
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
            <button class="btn-icon bookmarked" title="Remove Bookmark" onclick="BookmarksView.removeBookmark(${m.id})">
              <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
            <button class="btn-primary" onclick="CourseDetailView.openMaterial('${fileUrl}', ${m.id})">Open</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function removeBookmark(id) {
    TelegramBridge.haptic('light');
    try {
      const stored = JSON.parse(localStorage.getItem('gass_saved_resources') || '[]');
      const filtered = stored.filter(item => item.id !== id);
      localStorage.setItem('gass_saved_resources', JSON.stringify(filtered));
      const list = document.getElementById('bookmarks-list');
      if (list) renderSavedList(list, filtered);
      TelegramBridge.showToast('Bookmark removed', 'bookmark');
    } catch (e) {}
  }

  return {
    render,
    removeBookmark
  };
})();
