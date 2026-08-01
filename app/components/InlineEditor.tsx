'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface InlineEditorProps {
  sectionKey: string;
  field: string;
  initialValue: string;
  type?: 'text' | 'textarea';
  onSave?: () => void;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

export default function InlineEditor({ sectionKey, field, initialValue, type = 'text', onSave, style, className, children }: InlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

    const handleSave = async () => {
    setSaving(true);
    try {
      // Directly upsert the page section using the browser's supabase client.
      // This client already has the logged-in user's session, so no auth error.
      const { error } = await supabase
        .from('page_sections')
        .upsert(
          { section_key: sectionKey, content: { [field]: value }, updated_at: new Date().toISOString() },
          { onConflict: 'section_key' }
        );

      if (error) {
        alert('Failed to save: ' + error.message);
      } else {
        setEditing(false);
        if (onSave) onSave(); // refresh the page data
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        style={{
          cursor: 'pointer',
          borderBottom: '2px dashed rgba(0,242,254,0.3)',
          padding: '2px 6px',
          borderRadius: '4px',
          transition: 'all 0.2s',
          display: 'inline-block',
          ...style,
        }}
        className={className}
        title="Click to edit"
      >
        {children || value}
        <span style={{ fontSize: '0.7rem', marginLeft: '6px', opacity: 0.5, verticalAlign: 'middle' }}>✎</span>
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: '10px',
      flexWrap: 'wrap',
      background: 'rgba(0,0,0,0.2)',
      padding: '12px',
      borderRadius: '12px',
      border: '1px solid rgba(0,242,254,0.4)',
      boxShadow: '0 4px 20px rgba(0,242,254,0.15)',
      margin: '4px 0',
      zIndex: 10,
      position: 'relative',
    }}>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(0,242,254,0.3)',
            background: '#0a0d14',
            color: '#f0f0f0',
            minWidth: '280px',
            fontSize: '0.95rem',
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(0,242,254,0.3)',
            background: '#0a0d14',
            color: '#f0f0f0',
            minWidth: '240px',
            fontSize: '0.95rem',
            outline: 'none',
            fontFamily: 'inherit',
          }}
          autoFocus
        />
      )}
      <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 18px',
            background: saving ? '#00f2fe88' : '#00f2fe',
            color: '#000',
            border: 'none',
            borderRadius: '10px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {saving ? '⏳' : '💾'} {saving ? 'Saving' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setValue(initialValue); }}
          style={{
            padding: '10px 14px',
            background: 'transparent',
            color: '#f44336',
            border: '1px solid #f44336',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
          }}
        >
          ✕ Cancel
        </button>
      </span>
    </span>
  );
}