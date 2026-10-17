import React, { useState } from 'react';
import { Modal, Input, Select, Button, Textarea } from '@telegram-apps/telegram-ui';
import { Send, CheckCircle2 } from 'lucide-react';

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
        onSuccess(`Request submitted! GASS academic team will review it.`);
        setTitle('');
        setCourseCode('');
        setNotes('');
        onClose();
      } else {
        setError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Request error', err);
      setError('Network error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div style={{ padding: '16px 20px 24px', maxHeight: '85vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
          Request Academic Resource
        </h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B' }}>
          Can't find a specific past question, lecture slide, or textbook? Let the GASS academic committee know.
        </p>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Academic Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '14px',
                color: '#0F172A',
                outline: 'none'
              }}
            >
              <option value={100}>Level 100</option>
              <option value={200}>Level 200</option>
              <option value={300}>Level 300</option>
              <option value={400}>Level 400</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Material Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '14px',
                color: '#0F172A',
                outline: 'none'
              }}
            >
              <option value="past_questions">Past Examination Questions</option>
              <option value="lecture_notes">Lecture Notes / Slides</option>
              <option value="textbook">Core Reference Textbook</option>
              <option value="tutorials">Tutorial Sheet & Solution</option>
              <option value="software">Software Guide (R / Python / SQL)</option>
            </select>
          </div>

          <Input
            header="Course Code (Optional)"
            placeholder="e.g. STAT 151, MATH 221"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />

          <Input
            header="Resource Title / Description"
            placeholder="e.g. 2023 End of Semester Past Questions with Solutions"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Button
            size="l"
            mode="filled"
            type="submit"
            stretched
            loading={submitting}
            style={{ marginTop: '10px', background: '#0B536F', color: '#FFFFFF' }}
          >
            Submit Request
          </Button>

          <Button size="m" mode="bezeled" stretched onClick={onClose} type="button">
            Cancel
          </Button>
        </form>
      </div>
    </Modal>
  );
}
