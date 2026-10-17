/**
 * Real-Time Instant Search View Component
 * Spotlight-style search with instant live queries across courses and materials
 */
const SearchView = (() => {
  let debounceTimeout = null;

  async function render(container) {
    container.innerHTML = `
      <div class="section-title">
        <span>Instant Search</span>
      </div>
      <p class="section-subtitle">Search courses, lecture slides, past exam questions, and tech tutorials.</p>

      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="global-search-input" placeholder="Search by course code, title, or topic..." autofocus />
      </div>

      <!-- Quick Search Shortcuts -->
      <div class="pill-group" style="margin-bottom: 20px;">
        <button class="pill" onclick="SearchView.setQuery('MATH 171')">MATH 171</button>
        <button class="pill" onclick="SearchView.setQuery('STAT 266')">STAT 266</button>
        <button class="pill" onclick="SearchView.setQuery('Python')">Python</button>
        <button class="pill" onclick="SearchView.setQuery('R')">R Programming</button>
        <button class="pill" onclick="SearchView.setQuery('Probability')">Probability</button>
      </div>

      <div id="search-results-container">
        <div style="text-align: center; color: var(--text-muted); padding: 48px 16px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--text-muted);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Search Academic Portal</div>
          <p style="font-size: 12px; color: var(--text-muted);">Type at least 2 characters to search across all courses and resources.</p>
        </div>
      </div>
    `;

    const input = document.getElementById('global-search-input');
    if (input) {
      input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          executeSearch(query);
        }, 250);
      });
    }
  }

  function setQuery(text) {
    TelegramBridge.haptic('light');
    const input = document.getElementById('global-search-input');
    if (input) {
      input.value = text;
      executeSearch(text);
    }
  }

  async function executeSearch(query) {
    const container = document.getElementById('search-results-container');
    if (!container) return;

    if (!query || query.length < 2) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 48px 16px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Search Academic Portal</div>
          <p style="font-size: 12px; color: var(--text-muted);">Type at least 2 characters to search across all courses and resources.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="material-card skeleton" style="height: 64px;"></div>
      <div class="material-card skeleton" style="height: 64px;"></div>
    `;

    try {
      const results = await API.searchResources(query);

      if (results.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 16px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(74, 144, 226, 0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--gass-blue);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <div style="font-weight: 800; font-size: 15px; margin-bottom: 6px; color: #FFFFFF;">No Materials Found for "${query}"</div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Would you like our academic team to upload this document?</p>
            <button class="btn-primary" style="margin: 0 auto;" onclick="RequestModal.open({ topicTitle: '${query.replace(/'/g, "\\'")}' })">
              Request "${query}"
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.04em;">
          Found ${results.length} result${results.length === 1 ? '' : 's'}:
        </div>
        ${results.map(m => {
          const fileUrl = m.file_url || (m.telegram_file_id ? `https://t.me/gassknustbot?start=res_${m.id}` : '#');
          return `
            <div class="material-card">
              <div class="material-type-pill type-lecture-slide">DOC</div>
              <div class="material-info">
                <div class="material-title" title="${m.title}">${m.title}</div>
                <div class="material-meta">
                  <span style="color: var(--gass-blue); font-weight: 700;">${m.course_code || 'General'}</span>
                  <span>•</span>
                  <span>${m.file_format || 'PDF'}</span>
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
        }).join('')}
      `;
    } catch (err) {
      container.innerHTML = `<div style="color: var(--gass-red); text-align: center; padding: 24px;">Search query failed.</div>`;
    }
  }

  return {
    render,
    setQuery,
    executeSearch
  };
})();
