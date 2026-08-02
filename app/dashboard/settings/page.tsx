'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [textSize, setTextSize] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Load settings directly from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? '');

      const { data: member, error } = await supabase
        .from('members')
        .select('settings')
        .eq('email', user.email)
        .single();

      if (!error && member?.settings) {
        setDisplayName(member.settings.display_name || '');
        setTextSize(member.settings.text_size || 'medium');
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Update both settings JSON and the direct display_name column
      const { error } = await supabase
        .from('members')
        .update({ 
          settings: { display_name: displayName, text_size: textSize },
          display_name: displayName  // This column is used by the header/sidebar directly
        })
        .eq('email', userEmail);

      if (error) {
        setMessage('❌ ' + error.message);
      } else {
        setMessage('✅ Settings saved!');
        // Notify the main page to refresh the display name everywhere
        window.dispatchEvent(new CustomEvent('userSettingsUpdated'));
      }
    } catch (err) {
      setMessage('❌ Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #0a0d14)',
      color: 'var(--text-primary, #f0f0f0)',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Back button – now inside the centered container */}
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'transparent',
            border: '1px solid var(--accent-color, #00f2fe)',
            color: 'var(--accent-color, #00f2fe)',
            padding: '8px 18px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
            marginBottom: '20px',
          }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', color: 'var(--accent-color, #00f2fe)' }}>
          ⚙️ Settings
        </h1>
        <p style={{ marginBottom: '30px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem' }}>
          Personalise your experience. Changes are saved automatically to your account.
        </p>

        <div style={{
          background: 'var(--surface-card, rgba(255,255,255,0.04))',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '16px',
          border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
        }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-primary, #0a0d14)',
              border: '1px solid var(--surface-border, rgba(255,255,255,0.1))',
              borderRadius: '12px',
              color: 'var(--text-primary, #fff)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{
          background: 'var(--surface-card, rgba(255,255,255,0.04))',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '16px',
          border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
        }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
            Text Size
          </label>
          <select
            value={textSize}
            onChange={(e) => setTextSize(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-primary, #0a0d14)',
              border: '1px solid var(--surface-border, rgba(255,255,255,0.1))',
              borderRadius: '12px',
              color: 'var(--text-primary, #fff)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            background: saving ? 'var(--accent-color-muted, #00f2fe88)' : 'var(--accent-color, #00f2fe)',
            color: '#000',
            fontWeight: '800',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '14px',
            cursor: saving ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
            transition: 'background 0.2s',
          }}
        >
          {saving ? 'Saving…' : '💾 Save Settings'}
        </button>

        {message && (
          <p style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: message.includes('✅') ? '#4CAF50' : '#f44336',
            margin: 0,
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}