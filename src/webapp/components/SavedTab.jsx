import React, { useState, useEffect } from 'react';
import { getOfflineCheatsheetForResource } from '../data/offlineCheatsheets';
import { isDeviceOnline, subscribeNetworkStatus, isExternalWebLink } from '../utils/offlineStorage';

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E00613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function SavedTab({ savedResources, onToggleBookmark, onNavigateCourses }) {
  const [isOnline, setIsOnline] = useState(isDeviceOnline());
  const [selectedCheatsheet, setSelectedCheatsheet] = useState(null);
  const [filter, setFilter] = useState('all');
  const [copiedSnippet, setCopiedSnippet] = useState(null);
  const [sendingTelegramId, setSendingTelegramId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const unsub = subscribeNetworkStatus((online) => {
      setIsOnline(online);
      if (!online && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      }
    });
    return unsub;
  }, []);

  // BackButton integration for cheatsheet modal
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    if (selectedCheatsheet) {
      tg.BackButton.show();
      const onBack = () => setSelectedCheatsheet(null);
      tg.BackButton.onClick(onBack);
      return () => tg.BackButton.offClick(onBack);
    }
  }, [selectedCheatsheet]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (code, idx) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedSnippet(idx);
        setTimeout(() => setCopiedSnippet(null), 2000);
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      });
    }
  };

  const handleSendToTelegram = async (res) => {
    setSendingTelegramId(res.id);
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 8603471859;
    try {
      const response = await fetch(`/api/resources/${res.id}/send-telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      }).then(r => r.json());

      if (response.success) {
        showToast('✅ Sent to your Telegram chat for offline storage!');
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } else {
        showToast(response.message || 'Could not send to Telegram');
      }
    } catch (e) {
      showToast('Offline — cannot contact server currently');
    } finally {
      setSendingTelegramId(null);
    }
  };

  const handleOpenLink = (e, res) => {
    const isWeb = isExternalWebLink(res.file_url);
    if (!isOnline && isWeb) {
      e.preventDefault();
      const cheatsheet = getOfflineCheatsheetForResource(res);
      if (cheatsheet) {
        showToast('📶 You are offline. Opening offline cheatsheet instead!');
        setSelectedCheatsheet(cheatsheet);
      } else {
        alert('You are currently offline. This external web portal requires an internet connection.');
      }
    }
  };

  const rawList = savedResources || [];
  const count = rawList.length;

  const filteredList = rawList.filter((res) => {
    if (filter === 'offline') {
      return Boolean(getOfflineCheatsheetForResource(res));
    }
    if (filter === 'online') {
      return isExternalWebLink(res.file_url);
    }
    return true;
  });

  return (
    <div className="walt-page-content">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="walt-offline-toast">
          {toastMessage}
        </div>
      )}

      {/* Walt Rewards-Style Gradient Hero */}
      <section className="walt-saved-hero">
        <div className="walt-saved-hero-badge">ACADEMIC VAULT</div>
        <div className="walt-saved-hero-stat">
          <span className="walt-saved-count">{count}</span>
          <span className="walt-saved-label">{count === 1 ? 'Material Pinned' : 'Materials Pinned'}</span>
        </div>
        <p className="walt-saved-hero-sub">
          Quick-access repository. Interactive cheatsheets & course syllabi are stored locally for revision with zero data.
        </p>

        {/* Live Network & Storage Status Indicator */}
        <div className={`walt-network-status-pill ${isOnline ? 'online' : 'offline'}`}>
          <span className="status-dot"></span>
          <span>{isOnline ? 'Online • Cloud Synced' : 'Offline Mode • Local Cheatsheets Active'}</span>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="walt-vault-filter-bar">
        <button
          type="button"
          className={`walt-vault-filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({count})
        </button>
        <button
          type="button"
          className={`walt-vault-filter-chip ${filter === 'offline' ? 'active' : ''}`}
          onClick={() => setFilter('offline')}
        >
          ⚡ Offline QuickRefs
        </button>
        <button
          type="button"
          className={`walt-vault-filter-chip ${filter === 'online' ? 'active' : ''}`}
          onClick={() => setFilter('online')}
        >
          🌐 Online Portals
        </button>
      </div>

      {/* Grouped Section Header */}
      <div className="walt-section-header-row">
        <span className="walt-section-title">Saved Items</span>
        <span className="walt-section-badge">{filteredList.length} Items</span>
      </div>

      {filteredList.length > 0 ? (
        <section className="walt-card-group">
          {filteredList.map((res, idx) => {
            const cheatsheet = getOfflineCheatsheetForResource(res);
            const isWeb = isExternalWebLink(res.file_url);

            let tag = 'DOCUMENT';
            let tagClass = 'tag-doc';
            if (cheatsheet) {
              tag = '⚡ OFFLINE QUICKREF';
              tagClass = 'tag-offline';
            } else if (isWeb) {
              tag = '🌐 ONLINE PORTAL';
              tagClass = 'tag-online';
            }

            return (
              <React.Fragment key={res.id}>
                {idx > 0 && <div className="walt-row-divider" />}
                <div className="walt-list-row walt-vault-row">
                  <div className={`walt-type-tag-pill ${tagClass}`}>{tag}</div>
                  <div className="walt-row-content">
                    <div className="walt-row-title">{res.title}</div>
                    <div className="walt-row-subtitle">
                      {isWeb
                        ? 'External web portal (Requires internet to browse full site)'
                        : (res.description || res.course_title || 'Verified academic resource')}
                    </div>
                  </div>
                  <div className="walt-row-actions">
                    {/* Offline Cheatsheet Viewer Button */}
                    {cheatsheet && (
                      <button
                        type="button"
                        className="walt-quickref-btn"
                        onClick={() => setSelectedCheatsheet(cheatsheet)}
                        title="View Offline Cheatsheet"
                      >
                        <IconBook />
                        <span>QuickRef</span>
                      </button>
                    )}

                    {/* Send to Telegram for Native Device Caching */}
                    <button
                      type="button"
                      className="walt-tg-send-btn"
                      onClick={() => handleSendToTelegram(res)}
                      disabled={sendingTelegramId === res.id}
                      title="Send to Telegram chat for permanent device caching"
                    >
                      <IconTelegram />
                      <span>{sendingTelegramId === res.id ? '...' : 'Chat'}</span>
                    </button>

                    {/* External Link or Local File */}
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className={`walt-row-open-btn ${!isOnline && isWeb ? 'disabled-offline' : ''}`}
                      onClick={(e) => handleOpenLink(e, res)}
                    >
                      <span>Open</span>
                      <IconExternalLink />
                    </a>

                    {/* Remove Bookmark */}
                    <button
                      type="button"
                      className="walt-icon-btn"
                      onClick={() => onToggleBookmark(res)}
                      title="Remove bookmark"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </section>
      ) : (
        <div className="walt-empty-box">
          <img src="/img/nav-saved.png" alt="No Saved Resources" className="walt-empty-img" />
          <div className="walt-empty-title">No Materials Pinned</div>
          <div className="walt-empty-desc">
            Bookmark your statistical tools and lecture materials. All core tools include embedded offline syntax cheatsheets for exam revision without internet!
          </div>
          <button
            type="button"
            className="walt-btn-primary"
            style={{ marginTop: '16px' }}
            onClick={onNavigateCourses}
          >
            Browse Curriculum
          </button>
        </div>
      )}

      {/* Offline Cheatsheet Modal Sheet */}
      {selectedCheatsheet && (
        <div className="walt-modal-overlay" onClick={() => setSelectedCheatsheet(null)}>
          <div className="walt-modal-sheet walt-cheatsheet-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="walt-sheet-grabber" />

            <div className="walt-sheet-header">
              <div className="walt-sheet-header-left">
                <span className="walt-sheet-badge">⚡ 100% OFFLINE READY</span>
                <h3 className="walt-sheet-title">{selectedCheatsheet.title}</h3>
                <p className="walt-sheet-code">{selectedCheatsheet.subtitle}</p>
              </div>
              <button
                type="button"
                className="walt-sheet-close-btn"
                onClick={() => setSelectedCheatsheet(null)}
              >
                <IconClose />
              </button>
            </div>

            <div className="walt-cheatsheet-body">
              {selectedCheatsheet.sections.map((section, sIdx) => (
                <div key={sIdx} className="walt-cheatsheet-section">
                  <h4 className="walt-cheatsheet-heading">{section.heading}</h4>
                  <div className="walt-cheatsheet-snippets">
                    {section.snippets.map((snip, snipIdx) => {
                      const copyKey = `${sIdx}-${snipIdx}`;
                      const isCopied = copiedSnippet === copyKey;
                      return (
                        <div key={snipIdx} className="walt-snippet-card">
                          <div className="walt-snippet-header">
                            <span className="walt-snippet-label">{snip.label}</span>
                            <button
                              type="button"
                              className="walt-snippet-copy-btn"
                              onClick={() => handleCopy(snip.code, copyKey)}
                            >
                              <IconCopy />
                              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="walt-snippet-code">
                            <code>{snip.code}</code>
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="walt-sheet-actions">
              <button
                type="button"
                className="walt-btn-primary"
                onClick={() => setSelectedCheatsheet(null)}
              >
                Done Studying
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
