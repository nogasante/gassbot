/**
 * Utility for detecting network availability and managing local offline data.
 */

export function isDeviceOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function subscribeNetworkStatus(onChange) {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => onChange(true);
  const handleOffline = () => onChange(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Checks if a resource URL is an external web link or downloadable document
 */
export function isExternalWebLink(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  const isDirectFile = lower.endsWith('.pdf') || lower.endsWith('.docx') || lower.endsWith('.pptx') || lower.endsWith('.epub') || lower.endsWith('.zip');
  return !isDirectFile && (lower.startsWith('http://') || lower.startsWith('https://'));
}
