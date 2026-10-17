import React, { useState, useEffect } from 'react';
import { AppRoot, Snackbar } from '@telegram-apps/telegram-ui';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HomeTab } from './components/HomeTab';
import { CoursesTab } from './components/CoursesTab';
import { BeyondTab } from './components/BeyondTab';
import { SearchTab } from './components/SearchTab';
import { SavedTab } from './components/SavedTab';
import { CourseModal } from './components/CourseModal';
import { RequestModal } from './components/RequestModal';
import { CheckCircle2, Bookmark, Star } from 'lucide-react';

export function App() {
  const [platform, setPlatform] = useState('base');
  const [user, setUser] = useState({ id: 8603471859, first_name: 'Scholar', username: 'scholar' });
  const [activeTab, setActiveTab] = useState('home');
  const [targetLevel, setTargetLevel] = useState(100);
  const [targetPillar, setTargetPillar] = useState('ds_ml');
  
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  
  const [savedResources, setSavedResources] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  
  const [snackbar, setSnackbar] = useState(null);

  // Initialize Telegram WebApp SDK & Platform
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      const isIos = tg.platform === 'ios' || tg.platform === 'macos';
      setPlatform(isIos ? 'ios' : 'base');

      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }

      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#F8FAFC');
    }

    // Load Local Bookmarks Cache immediately (0ms instant render)
    try {
      const cached = localStorage.getItem('gass_saved_resources');
      if (cached) {
        setSavedResources(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Could not read cached bookmarks', e);
    }

    fetchInitialData();
  }, []);

  // Sync Bookmarks from Server
  const fetchInitialData = async () => {
    try {
      const [statsRes, annRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/announcements').then(r => r.json())
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (annRes.success && Array.isArray(annRes.data)) setAnnouncements(annRes.data);

      // Background sync saved resources for this student
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 8603471859;
      const savedRes = await fetch(`/api/resources/saved/${userId}`).then(r => r.json());
      if (savedRes.success && Array.isArray(savedRes.data)) {
        setSavedResources(prev => {
          const map = new Map();
          prev.forEach(r => map.set(r.id, r));
          savedRes.data.forEach(r => map.set(r.id, r));
          const merged = Array.from(map.values());
          localStorage.setItem('gass_saved_resources', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.error('Initial data fetch error', err);
    }
  };

  const isBookmarked = (resourceId) => {
    return savedResources.some(r => r.id === resourceId);
  };

  const toggleBookmark = async (resource) => {
    const alreadySaved = isBookmarked(resource.id);
    let updated;

    if (alreadySaved) {
      updated = savedResources.filter(r => r.id !== resource.id);
      showSnackbar(`Removed "${resource.title}" from saved`);
    } else {
      updated = [resource, ...savedResources];
      showSnackbar(`Saved "${resource.title}" for quick access`);
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }

    setSavedResources(updated);
    localStorage.setItem('gass_saved_resources', JSON.stringify(updated));

    // Sync in background to PostgreSQL
    try {
      await fetch('/api/resources/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 8603471859,
          resourceId: resource.id
        })
      });
    } catch (e) {
      console.warn('Failed to sync bookmark to server', e);
    }
  };

  const showSnackbar = (message) => {
    setSnackbar({ message });
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const handleSelectLevel = (lvl) => {
    setTargetLevel(lvl);
    setActiveTab('courses');
  };

  const handleSelectPillar = (pillarKey) => {
    setTargetPillar(pillarKey);
    setActiveTab('beyond');
  };

  return (
    <AppRoot platform={platform} appearance="light">
      <div className="app-root-container">
        {/* Top Header */}
        <Header 
          user={user} 
          onRequestOpen={() => setRequestModalOpen(true)} 
        />

        {/* Dynamic View Panels */}
        <main>
          {activeTab === 'home' && (
            <HomeTab
              stats={stats}
              announcements={announcements}
              onSelectLevel={handleSelectLevel}
              onSelectPillar={handleSelectPillar}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesTab
              initialLevel={targetLevel}
              onSelectCourse={(course) => setSelectedCourse(course)}
            />
          )}

          {activeTab === 'beyond' && (
            <BeyondTab
              initialPillar={targetPillar}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {activeTab === 'search' && (
            <SearchTab
              onSelectCourse={(course) => setSelectedCourse(course)}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {activeTab === 'saved' && (
            <SavedTab
              savedResources={savedResources}
              onToggleBookmark={toggleBookmark}
              onNavigateCourses={() => setActiveTab('courses')}
            />
          )}
        </main>

        {/* Persistent Bottom Tabbar */}
        <Navbar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

        {/* Course Details Modal */}
        <CourseModal
          course={selectedCourse}
          open={Boolean(selectedCourse)}
          onClose={() => setSelectedCourse(null)}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
        />

        {/* Resource Request Modal */}
        <RequestModal
          open={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          user={user}
          onSuccess={(msg) => showSnackbar(msg)}
        />

        {/* Native Telegram UI Toast / Snackbar */}
        {snackbar && (
          <Snackbar
            onClose={() => setSnackbar(null)}
            duration={3000}
            before={<Star size={18} color="#F59E0B" fill="#F59E0B" />}
          >
            {snackbar.message}
          </Snackbar>
        )}
      </div>
    </AppRoot>
  );
}

export default App;
