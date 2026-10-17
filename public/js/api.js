/**
 * GASS API Client for Student Mini WebApp
 */
const API = (() => {
  const urlParams = new URLSearchParams(window.location.search);
  const explicitApiUrl = urlParams.get('api_url') || (window.GASS_CONFIG && window.GASS_CONFIG.API_URL);
  const BASE_URL = explicitApiUrl ? `${explicitApiUrl.replace(/\/$/, '')}/api` : '/api';
  const cache = new Map();

  async function request(endpoint, options = {}) {
    const initData = TelegramBridge.getInitData();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (initData) {
      headers['Authorization'] = `TelegramInitData ${initData}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  }

  async function getCourses(level = null, semester = null) {
    let query = '';
    if (level && semester) {
      query = `?level=${level}&semester=${semester}`;
    }
    const cacheKey = `courses_${level}_${semester}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const res = await request(`/courses${query}`);
    cache.set(cacheKey, res.data || []);
    return res.data || [];
  }

  async function getCourseDetails(id) {
    const res = await request(`/courses/${id}`);
    return res.data || null;
  }

  async function getResources(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/resources${query ? `?${query}` : ''}`);
    return res.data || [];
  }

  async function searchResources(searchTerm) {
    const res = await request(`/resources?search=${encodeURIComponent(searchTerm)}`);
    return res.data || [];
  }

  async function getBeyondCategories() {
    if (cache.has('beyond_categories')) return cache.get('beyond_categories');
    const res = await request('/beyond-categories');
    cache.set('beyond_categories', res.data || []);
    return res.data || [];
  }

  async function getBeyondSubTopics(pillarKey = null) {
    const endpoint = pillarKey ? `/beyond-categories/${pillarKey}/sub-topics` : '/beyond-sub-topics';
    const res = await request(endpoint);
    return res.data || [];
  }

  async function getStats() {
    const res = await request('/stats');
    return res.data || null;
  }

  async function getAnnouncements() {
    const res = await request('/announcements');
    return res.data || [];
  }

  async function submitRequest({ courseCode, topicTitle, details, userId }) {
    const res = await request('/requests', {
      method: 'POST',
      body: JSON.stringify({ courseCode, topicTitle, details, userId })
    });
    return res.data;
  }

  async function bookmarkResource(userId, resourceId) {
    const res = await request('/resources/bookmark', {
      method: 'POST',
      body: JSON.stringify({ userId, resourceId })
    });
    return res.data;
  }

  async function getSavedResources(userId) {
    const res = await request(`/resources/saved/${userId}`);
    return res.data || [];
  }

  async function authenticate() {
    const initData = TelegramBridge.getInitData();
    if (!initData) return null;
    try {
      const res = await request('/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({ initData })
      });
      return res.user;
    } catch (e) {
      console.warn('Telegram auth verification fallback:', e.message);
      return null;
    }
  }

  return {
    getCourses,
    getCourseDetails,
    getResources,
    searchResources,
    getBeyondCategories,
    getBeyondSubTopics,
    getStats,
    getAnnouncements,
    submitRequest,
    bookmarkResource,
    getSavedResources,
    authenticate
  };
})();
