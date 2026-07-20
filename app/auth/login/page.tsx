'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // ----- Theme States -----
  const [isDark, setIsDark] = useState(true);
  const [accentColor, setAccentColor] = useState('#00f2fe');

  useEffect(() => {
    const savedTheme = localStorage.getItem('writingchoice_theme');
    setIsDark(savedTheme !== 'light');

    const savedAccent = localStorage.getItem('user_accent_color');
    const accentColors: { [key: string]: string } = {
      default: '#00f2fe', emerald: '#00ff9d', purple: '#b366ff',
      crimson: '#ff3366', orange: '#ff9900', amber: '#ffbf00',
      mint: '#98fb98', silver: '#c0c8d0',
    };
    setAccentColor(savedAccent && accentColors[savedAccent] ? accentColors[savedAccent] : '#00f2fe');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('✅ Success! Check your email for verification link.');
      }
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(ellipse at top, #141c2e 0%, #0a0d14 100%)'
        : 'radial-gradient(ellipse at top, #eef2ff 0%, #f8fafc 100%)',
      color: isDark ? '#f8fafc' : '#0f172a',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
    }}>
      
      {/* Background Ambient Glow */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: accentColor,
        opacity: isDark ? 0.06 : 0.1,
        filter: 'blur(120px)',
        pointerEvents: 'none',
      }} />

      {/* Top Back Navigation */}
      <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
        <Link href="/">
          <button style={{
            background: 'transparent',
            border: `1px solid ${borderColor}`,
            color: isDark ? '#94a3b8' : '#475569',
            padding: '8px 18px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
          }}>
            ← Return to Home
          </button>
        </Link>
      </div>

      {/* Auth Card (Google SSO Style) */}
      <div style={{
        background: cardBg,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${borderColor}`,
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 20px 50px rgba(0,0,0,0.06)',
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Writing<span style={{ color: accentColor }}>Choice</span>
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b' }}>
            Sign in to access your research workspace.
          </p>
        </div>

        {/* Sliding Segmented Toggle */}
        <div style={{
          display: 'flex',
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
          borderRadius: '30px',
          padding: '4px',
          marginBottom: '24px',
          border: `1px solid ${borderColor}`,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '4px',
            left: isLogin ? '4px' : '50%',
            width: 'calc(50% - 4px)',
            height: 'calc(100% - 8px)',
            background: accentColor,
            borderRadius: '26px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
          
          <button
            type="button"
            onClick={() => { setIsLogin(true); setMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'transparent',
              border: 'none',
              color: isLogin ? '#000' : isDark ? '#94a3b8' : '#64748b',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              zIndex: 2,
            }}
          >
            Sign In
          </button>
          
          <button
            type="button"
            onClick={() => { setIsLogin(false); setMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'transparent',
              border: 'none',
              color: !isLogin ? '#000' : isDark ? '#94a3b8' : '#64748b',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              zIndex: 2,
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
                border: `1px solid ${borderColor}`,
                color: isDark ? '#f8fafc' : '#0f172a',
                borderRadius: '14px',
                fontSize: '0.95rem',
                outline: 'none',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
                border: `1px solid ${borderColor}`,
                color: isDark ? '#f8fafc' : '#0f172a',
                borderRadius: '14px',
                fontSize: '0.95rem',
                outline: 'none',
              }}
              required
            />
          </div>

          {message && (
            <div style={{
              background: message.includes('✅') ? 'rgba(37, 211, 102, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.includes('✅') ? 'rgba(37, 211, 102, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: message.includes('✅') ? '#25d366' : '#ef4444',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '700',
              textAlign: 'center',
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
              color: '#000',
              padding: '14px',
              border: 'none',
              borderRadius: '14px',
              cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
              fontWeight: '900',
              fontSize: '0.95rem',
              marginTop: '8px',
              opacity: (loading || !email || !password) ? 0.6 : 1,
              boxShadow: `0 4px 20px ${accentColor}44`,
            }}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Access Workspace →' : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  );
}