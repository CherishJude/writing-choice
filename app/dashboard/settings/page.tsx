'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [textSize, setTextSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('geist-sans');
  const [adminEditMode, setAdminEditMode] = useState(true);
  const [userRole, setUserRole] = useState('member');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Load settings securely via API to bypass RLS
  useEffect(() => {
    const loadSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserEmail(session.user.email ?? '');

      try {
        const res = await fetch('/api/user/settings', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await res.json();
        
        if (res.ok && data) {
          if (data.role) {
            setUserRole(data.role);
          }
          if (data.settings) {
            setDisplayName(data.settings.display_name || '');
            setTextSize(data.settings.text_size || 'medium');
            setFontFamily(data.settings.font_family || 'geist-sans');
            if (data.settings.admin_edit_mode !== undefined) {
              setAdminEditMode(data.settings.admin_edit_mode);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          settings: { 
            display_name: displayName, 
            text_size: textSize,
            font_family: fontFamily,
            admin_edit_mode: adminEditMode
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage('❌ ' + (data.error || 'Failed to save settings'));
      } else {
        setMessage('✅ Settings saved!');
        // Update local storage so the provider can apply immediately
        localStorage.setItem('user_settings_cache', JSON.stringify({
          text_size: textSize,
          font_family: fontFamily
        }));
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

        <div style={{
          background: 'var(--surface-card, rgba(255,255,255,0.04))',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '16px',
          border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
        }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
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
            <option value="geist-sans">System Default (Geist Sans)</option>
            <option value="geist-mono">Monospace (Geist Mono)</option>
            <option value="inter">Inter (Modern Sans)</option>
            <option value="serif">Elegant Serif</option>
            <option value="comic-sans">Playful (Comic Sans)</option>
          </select>
        </div>

        {userRole === 'super_admin' && (
          <div style={{
            background: 'var(--surface-card, rgba(255,255,255,0.04))',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '16px',
            border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>
                Admin Edit Mode
              </label>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>
                Toggle OFF to view the site as a regular member.
              </p>
            </div>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '28px'
            }}>
              <input 
                type="checkbox" 
                checked={adminEditMode}
                onChange={(e) => setAdminEditMode(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: adminEditMode ? 'var(--accent-color, #00f2fe)' : '#334155',
                transition: '.4s',
                borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: '4px',
                  bottom: '4px',
                  backgroundColor: adminEditMode ? '#000' : '#fff',
                  transition: '.4s',
                  borderRadius: '50%',
                  transform: adminEditMode ? 'translateX(22px)' : 'translateX(0)'
                }}></span>
              </span>
            </label>
          </div>
        )}

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