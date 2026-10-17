import React, { useState } from 'react';
import { Modal, List, Input, Select, Button, Section, Cell } from '@telegram-apps/telegram-ui';

export function RequestModal({ open, onClose, user, onSuccess }) {
  const [level, setLevel] = useState(100);
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('past_questions');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div style={{ padding: '16px 16px 32px', maxHeight: '85vh', overflowY: 'auto' }}>
        <List>
          <Section 
            header="Request Academic Resource" 
            footer="Submissions are sent directly to the departmental executive board for fulfillment."
          >
            {error && (
              <Cell subhead="ERROR" subtitle={error} multiline style={{ color: 'var(--tgui--destructive_text_color)' }}>
                Validation Issue
              </Cell>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Select
                header="Academic Level"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
              >
                <option value={100}>Level 100</option>
                <option value={200}>Level 200</option>
                <option value={300}>Level 300</option>
                <option value={400}>Level 400</option>
              </Select>

              <Select
                header="Resource Category"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="past_questions">Past Examination Questions</option>
                <option value="lecture_notes">Lecture Notes / Slides</option>
                <option value="textbook">Core Reference Textbook</option>
                <option value="tutorials">Tutorial Sheet & Solution</option>
                <option value="software">Software Guide (R / Python / SQL)</option>
              </Select>

              <Input
                header="Course Code (Optional)"
                placeholder="e.g. STAT 151, MATH 221"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />

              <Input
                header="Resource Title & Details"
                placeholder="e.g. 2023 End of Semester Past Questions with Solutions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                  size="l"
                  mode="filled"
                  type="submit"
                  stretched
                  loading={submitting}
                >
                  Submit Request
                </Button>

                <Button size="m" mode="bezeled" stretched onClick={onClose} type="button">
                  Cancel
                </Button>
              </div>
            </form>
          </Section>
        </List>
      </div>
    </Modal>
  );
}
