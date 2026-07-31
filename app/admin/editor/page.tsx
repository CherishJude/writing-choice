'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPageEditor() {
  const [sections, setSections] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/auth/login');
      const { data: member } = await supabase.from('members').select('role').eq('email', user.email).single();
      if (!member || member.role !== 'super_admin') return router.push('/dashboard');
      setCurrentUser(user);
      fetchSections();
    };
    checkUser();
  }, []);

  const fetchSections = async () => {
    const res = await fetch('/api/admin/page-sections');
    const data = await res.json();
    const secObj: any = {};
    data.sections?.forEach((s: any) => {
      secObj[s.section_key] = s.content;
    });
    setSections(secObj);
    setLoading(false);
  };

  const handleChange = (key: string, field: string, value: string) => {
    setSections((prev: any) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const saveSection = async (key: string) => {
    setMessage('Saving...');
    const res = await fetch('/api/admin/page-sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_key: key, content: sections[key] })
    });
    const data = await res.json();
    setMessage(data.success ? '✅ Saved!' : '❌ Error saving');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) return <div style={{ padding: '40px', color: '#fff' }}>Loading editor...</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', color: '#f0f0f0' }}>
      <h1 style={{ color: '#00f2fe' }}>🛠️ Front Page Editor</h1>
      {message && <p style={{ background: '#00f2fe20', padding: '10px', borderRadius: '8px' }}>{message}</p>}

      <SectionEditor
        title="🚀 Hero Section"
        sectionKey="hero"
        content={sections.hero || { title: '', subtitle: '' }}
        onChange={handleChange}
        onSave={saveSection}
        fields={[
          { name: 'title', label: 'Main Title' },
          { name: 'subtitle', label: 'Subtitle' },
        ]}
      />

      <SectionEditor
        title="🏃 LED Scrolling Ticker"
        sectionKey="led_ticker"
        content={sections.led_ticker || { text: '' }}
        onChange={handleChange}
        onSave={saveSection}
        fields={[
          { name: 'text', label: 'Ticker Text (separate items with •)' },
        ]}
      />

      <SectionEditor
        title="💎 Pricing Section"
        sectionKey="pricing"
        content={sections.pricing || { title: '' }}
        onChange={handleChange}
        onSave={saveSection}
        fields={[
          { name: 'title', label: 'Pricing Title' },
        ]}
      />

      <SectionEditor
        title="✨ Welcome Note"
        sectionKey="welcome"
        content={sections.welcome || { title: '', text: '' }}
        onChange={handleChange}
        onSave={saveSection}
        fields={[
          { name: 'title', label: 'Welcome Title' },
          { name: 'text', label: 'Welcome Text' },
        ]}
      />

      <SectionEditor
        title="❓ FAQ Section"
        sectionKey="faq"
        content={sections.faq || { title: '' }}
        onChange={handleChange}
        onSave={saveSection}
        fields={[
          { name: 'title', label: 'FAQ Title' },
        ]}
      />
    </div>
  );
}

function SectionEditor({ title, sectionKey, content, onChange, onSave, fields }: any) {
  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '16px',
      padding: '20px',
      margin: '20px 0',
      border: '1px solid #00f2fe33',
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#00f2fe' }}>{title}</h3>
      {fields.map((field: any) => (
        <div key={field.name} style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>{field.label}</label>
          {field.name === 'text' ? (
            <textarea
              value={content[field.name] || ''}
              onChange={(e) => onChange(sectionKey, field.name, e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                background: '#0a0d14',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
          ) : (
            <input
              type="text"
              value={content[field.name] || ''}
              onChange={(e) => onChange(sectionKey, field.name, e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#0a0d14',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
          )}
        </div>
      ))}
      <button
        onClick={() => onSave(sectionKey)}
        style={{
          padding: '10px 24px',
          background: '#00f2fe',
          color: '#000',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          marginTop: '12px',
        }}
      >
        Save {title}
      </button>
    </div>
  );
}