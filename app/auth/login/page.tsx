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
    // Load saved theme
    const savedTheme = localStorage.getItem('writingchoice_theme');
    setIsDark(savedTheme !== 'light');

    // Load saved accent color
    const savedAccent = localStorage.getItem('user_accent_color');
    const accentColors: { [key: string]: string } = {
      default: '#00f2fe', emerald: '#00ff9d', purple: '#b366ff',
      crimson: '#ff3366', orange: '#ff9900', amber: '#ffbf00',
      mint: '#98fb98', silver: '#c0c8d0',
    };
    setAccentColor(savedAccent && accentColors[savedAccent] ? accentColors[savedAccent] : '#00f2fe');
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage('❌ ' + error.message);
      setLoading(false);
    }
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
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
            border: `1px solid var(--surface-border)`,
            color: 'var(--text-secondary)',
            padding: '8px 18px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-color)';
            e.currentTarget.style.color = 'var(--accent-color)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--surface-border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}>
            ← Return to Home
          </button>
        </Link>
      </div>

      {/* Auth Card */}
      <div style={{
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        border: `1px solid var(--surface-border)`,
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: 'var(--shadow-elevation-2)',
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Writing<span style={{ color: accentColor }}>Choice</span>
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isLogin ? 'Sign in to access your workspace.' : 'Join WritingChoice today.'}
          </p>
        </div>

        {/* Sliding Segmented Toggle */}
        <div style={{
          display: 'flex',
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
          borderRadius: '30px',
          padding: '4px',
          marginBottom: '24px',
          border: `1px solid var(--surface-border)`,
          position: 'relative',
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
            boxShadow: `0 0 20px ${accentColor}44`,
          }} />
          
          <button
            type="button"
            onClick={() => { setIsLogin(true); setMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'transparent',
              border: 'none',
              color: isLogin ? '#000' : 'var(--text-secondary)',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'color 0.3s ease',
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
              color: !isLogin ? '#000' : 'var(--text-secondary)',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'color 0.3s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
            border: `1px solid var(--surface-border)`,
            borderRadius: '14px',
            color: 'var(--text-primary)',
            fontWeight: '700',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#f8fafc';
              e.currentTarget.style.borderColor = accentColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
              e.currentTarget.style.borderColor = 'var(--surface-border)';
            }
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          Continue with Google
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
          <span>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
                border: `1px solid var(--surface-border)`,
                color: 'var(--text-primary)',
                borderRadius: '14px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = accentColor}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--surface-border)'}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
                border: `1px solid var(--surface-border)`,
                color: 'var(--text-primary)',
                borderRadius: '14px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = accentColor}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--surface-border)'}
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
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Access Workspace →' : 'Create Account →'}
          </button>
        </form>

        {/* Toggle between Login and Sign Up */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: accentColor,
              fontWeight: '800',
              cursor: 'pointer',
              marginLeft: '8px',
              fontSize: '0.9rem',
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}