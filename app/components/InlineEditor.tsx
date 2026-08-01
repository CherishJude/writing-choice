'use client';

import { useState } from 'react';

interface InlineEditorProps {
  sectionKey: string;
  field: string;
  initialValue: string;
  type?: 'text' | 'textarea';
  onSave?: () => void;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode; // fallback display when not editing
}

export default function InlineEditor({ sectionKey, field, initialValue, type = 'text', onSave, style, className, children }: InlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/page-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_key: sectionKey,
          content: { [field]: value },
        }),
      });
      if (res.ok) {
        setEditing(false);
        if (onSave) onSave();
      } else {
        alert('Failed to save');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };

  // If not editing, show the value (with optional children fallback)
  if (!editing) {
    return (
      <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', ...style }} className={className}>
        {children || value}
      </span>
    );
  }

  // Editing mode
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
        />
      )}
      <button onClick={handleSave} disabled={saving} style={{ padding: '4px 12px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button onClick={() => { setEditing(false); setValue(initialValue); }} style={{ padding: '4px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Cancel
      </button>
    </span>
  );
}