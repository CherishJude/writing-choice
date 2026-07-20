'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [hasContent, setHasContent] = useState(false);
  const router = useRouter();

  // ----- Theme States -----
  const [isDark, setIsDark] = useState(true);
  const [accentColor, setAccentColor] = useState('#00f2fe');

  // ----- Theme Sync Effect -----
  useEffect(() => {
    const savedTheme = localStorage.getItem('writingchoice_theme');
    const currentIsDark = savedTheme !== 'light';
    setIsDark(currentIsDark);

    const savedAccent = localStorage.getItem('user_accent_color');
    const accentColors: { [key: string]: string } = {
      default: '#00f2fe', emerald: '#00ff9d', purple: '#b366ff',
      crimson: '#ff3366', orange: '#ff9900', amber: '#ffbf00',
      mint: '#98fb98', silver: '#c0c8d0',
    };
    const currentAccent = (savedAccent && accentColors[savedAccent]) ? accentColors[savedAccent] : '#00f2fe';
    setAccentColor(currentAccent);

    const root = document.documentElement;
    root.style.setProperty('--accent-color', currentAccent);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      const savedAvatar = localStorage.getItem(`avatar_${user.email}`);
      if (savedAvatar) setAvatarUrl(savedAvatar);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('email', user.email)
        .order('timestamp', { ascending: false });

      if (!error) setOrders(data || []);
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarUrl(base64String);
        if (user?.email) {
          localStorage.setItem(`avatar_${user.email}`, base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatText = (command: string, value: string | undefined = undefined) => {
    try {
      document.execCommand(command, false, value);
    } catch (error) {
      console.warn('Rich text formatting warning:', error);
    }
    editorRef.current?.focus();
  };

  const handleDownload = () => {
    if (!editorRef.current) return;
    const textContent = editorRef.current.innerText;
    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'My_Draft.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const cardStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
    borderRadius: '24px',
    padding: '28px',
    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.06)',
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark ? '#0a0d14' : '#f8fafc',
        color: isDark ? '#f8fafc' : '#0f172a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Segoe UI", sans-serif'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            border: `3px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderTop: `3px solid ${accentColor}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '600' }}>
            Syncing Member Workspace...
          </span>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(ellipse at top, #141c2e 0%, #0a0d14 100%)'
        : 'radial-gradient(ellipse at top, #eef2ff 0%, #f8fafc 100%)',
      color: isDark ? '#f8fafc' : '#0f172a',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      padding: '30px 20px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Top Controls Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'transparent',
                border: `1px solid ${accentColor}`,
                color: accentColor,
                padding: '8px 18px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.85rem',
              }}
            >
              ← Back
            </button>
            <h1 style={{ color: accentColor, margin: 0, fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
              Member Dashboard
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/">
              <button style={{
                background: 'transparent',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? '#f8fafc' : '#0f172a',
                padding: '8px 18px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.85rem',
              }}>
                🏠 Home
              </button>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                border: 'none',
                color: '#fff',
                padding: '8px 18px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '0.85rem',
                boxShadow: '0 4px 15px rgba(239,68,68,0.3)'
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Modules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Module 1: Profile & Avatar Card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '88px', height: '88px' }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${accentColor}, #0a0d14)`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: '#000',
                  border: `3px solid ${accentColor}`,
                  boxShadow: `0 0 20px ${accentColor}33`,
                  overflow: 'hidden'
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user?.email ? user.email.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <label style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: accentColor,
                  color: '#000',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}>
                  📷
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </label>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: accentColor, fontWeight: '800' }}>
                  VERIFIED MEMBER WORKSPACE
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '800' }}>{user?.email}</h2>
                <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                  Reference ID: <span style={{ fontFamily: 'monospace', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '6px' }}>{user?.id?.substring(0, 12)}...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Module 2: Statistics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={cardStyle}>
              <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>Total Orders Tracked</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '8px', color: accentColor }}>{orders.length}</div>
            </div>
            
            <div style={cardStyle}>
              <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>Active Processing</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '8px', color: '#ffbf00' }}>
                {orders.filter(o => o.status === 'In Progress' || o.status === 'Pending' || o.status === 'Revision').length}
              </div>
            </div>
          </div>

          {/* Module 3: Project Orders Pipeline */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📦 Project Task Orders
            </h3>

            {orders.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.9rem' }}>
                No registered order history found inside your account record.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    borderLeft: `4px solid ${
                      order.status === 'Completed' ? '#25d366' :
                      order.status === 'In Progress' ? accentColor :
                      order.status === 'Revision' ? '#ff9900' : '#ffbf00'
                    }`,
                    padding: '18px 20px',
                    borderRadius: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>{order.service}</h4>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
                        <span>Tier: <strong>{order.tier}</strong></span>
                        <span>Words: <strong>{order.word_count}</strong></span>
                        <span>Date: {new Date(order.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>₦{order.price?.toLocaleString()}</span>
                      <span style={{
                        background: order.status === 'Completed' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(0, 242, 254, 0.15)',
                        color: order.status === 'Completed' ? '#25d366' : accentColor,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                      }}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Module 4: Advanced Draft Editor */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '800' }}>
              ✍️ Built-in Draft Editor
            </h3>
            <p style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '16px' }}>
              Draft and format your document before submission or download.
            </p>

            <div style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '16px', overflow: 'hidden' }}>
              {/* Toolbar */}
              <div style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                padding: '10px 14px',
                display: 'flex',
                gap: '8px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                flexWrap: 'wrap'
              }}>
                <button onClick={() => formatText('bold')} style={{ background: 'transparent', color: isDark ? '#fff' : '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
                <button onClick={() => formatText('italic')} style={{ background: 'transparent', color: isDark ? '#fff' : '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
                <button onClick={() => formatText('underline')} style={{ background: 'transparent', color: isDark ? '#fff' : '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', textDecoration: 'underline' }}>U</button>
                <button onClick={() => formatText('formatBlock', 'H1')} style={{ background: 'transparent', color: isDark ? '#fff' : '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>H1</button>
                <button onClick={() => formatText('insertUnorderedList')} style={{ background: 'transparent', color: isDark ? '#fff' : '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>• List</button>
              </div>

              {/* Text Area */}
              <div
                ref={editorRef}
                contentEditable
                onInput={() => setHasContent(!!editorRef.current?.innerText.trim())}
                style={{
                  minHeight: '220px',
                  padding: '16px',
                  background: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  outline: 'none',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={handleDownload}
                disabled={!hasContent}
                style={{
                  background: hasContent ? accentColor : 'transparent',
                  color: hasContent ? '#000' : isDark ? '#94a3b8' : '#64748b',
                  border: hasContent ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  padding: '10px 24px',
                  borderRadius: '30px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: hasContent ? 'pointer' : 'not-allowed',
                }}
              >
                ⬇️ Download Draft
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}