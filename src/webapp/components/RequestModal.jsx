import React, { useState } from 'react';

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function RequestModal({ open, onClose, user, onSuccess }) {
  const [level, setLevel] = useState(100);
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('past_questions');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide the title of the resource needed.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 8603471859,
          level: Number(level),
          courseCode: courseCode.trim().toUpperCase() || 'GENERAL',
          title: title.trim(),
          type,
          description: notes.trim() || `Requested via Telegram Mini App for Level ${level}`
        })
      });

      const data = await res.json();
      if (data.success) {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        onSuccess('Request submitted! GASS academic team will review it.');
        setTitle('');
        setCourseCode('');
        setNotes('');
        onClose();
      } else {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
        setError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Request error', err);
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      setError('Network error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="walt-modal-overlay" onClick={onClose}>
      <div className="walt-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Close Button in Circle */}
        <button type="button" className="walt-modal-close" onClick={onClose}>
          <IconClose />
        </button>

        {/* Modal Header */}
        <div className="walt-modal-header">
          <div className="walt-modal-icon-wrap">
            <img src="/img/nav-search.png" alt="Request" />
          </div>
          <h2 className="walt-modal-title">Request Academic Material</h2>
          <p className="walt-modal-desc">
            Directly notify the GASS Academic Board to source and upload missing resources.
          </p>
        </div>

        {error && (
          <div className="walt-error-pill">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="walt-form-group">
          <div className="walt-form-row">
            <label className="walt-form-label">Academic Level</label>
            <select
              className="walt-form-select"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
            >
              <option value={100}>Level 100</option>
              <option value={200}>Level 200</option>
              <option value={300}>Level 300</option>
              <option value={400}>Level 400</option>
            </select>
          </div>

          <div className="walt-form-row">
            <label className="walt-form-label">Resource Type</label>
            <select
              className="walt-form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="past_questions">Past Examination Questions</option>
              <option value="lecture_notes">Lecture Slides & Notes</option>
              <option value="textbook">Core Reference Textbook</option>
              <option value="tutorials">Tutorial Sheet & Solutions</option>
              <option value="software">Software Guide (R / Python / SQL)</option>
            </select>
          </div>

          <div className="walt-form-row">
            <label className="walt-form-label">Course Code (Optional)</label>
            <input
              type="text"
              className="walt-form-input"
              placeholder="e.g. STAT 261, MATH 153"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
          </div>

          <div className="walt-form-row">
            <label className="walt-form-label">Resource Title *</label>
            <input
              type="text"
              className="walt-form-input"
              placeholder="e.g. 2023 End of Semester Exam Papers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="walt-form-row">
            <label className="walt-form-label">Additional Notes</label>
            <input
              type="text"
              className="walt-form-input"
              placeholder="Specific lecturer or questions needed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="walt-btn-primary walt-btn-full"
            style={{ marginTop: '16px' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
