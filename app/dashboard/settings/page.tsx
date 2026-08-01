'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [textSize, setTextSize] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setDisplayName(data.settings.display_name || '');
          setTextSize(data.settings.text_size || 'medium');
        }
      })
      .catch(err => console.error('Failed to load settings', err));
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { display_name: displayName, text_size: textSize } })
      });
      if (res.ok) {
        setMessage('✅ Settings saved!');
      } else {
        setMessage('❌ Error saving settings.');
      }
    } catch (err) {
      setMessage('❌ Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto', color: '#f0f0f0' }}>
      <h1 style={{ color: '#00f2fe' }}>⚙️ User Settings</h1>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px' }}>Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px' }}>Text Size</label>
        <select
          value={textSize}
          onChange={(e) => setTextSize(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
          }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      {message && <p style={{ margin: '10px 0', color: message.includes('✅') ? '#4CAF50' : '#f44336' }}>{message}</p>}
      <button
        onClick={saveSettings}
        disabled={saving}
        style={{
          padding: '12px 24px',
          background: '#00f2fe',
          color: '#000',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
        }}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}