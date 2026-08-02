'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GlobalSettingsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applySettings = (textSize: string, fontFamily: string) => {
      const root = document.documentElement;
      
      // Apply text size
      if (textSize === 'small') {
        root.style.setProperty('--global-font-size', '14px');
      } else if (textSize === 'large') {
        root.style.setProperty('--global-font-size', '18px');
      } else {
        root.style.setProperty('--global-font-size', '16px'); // medium
      }

      // Apply font family
      if (fontFamily === 'inter') {
        root.style.setProperty('--global-font-family', '"Inter", sans-serif');
      } else if (fontFamily === 'serif') {
        root.style.setProperty('--global-font-family', 'Georgia, serif');
      } else if (fontFamily === 'comic-sans') {
        root.style.setProperty('--global-font-family', '"Comic Sans MS", "Comic Sans", cursive');
      } else if (fontFamily === 'geist-mono') {
        root.style.setProperty('--global-font-family', 'var(--font-geist-mono), monospace');
      } else {
        root.style.setProperty('--global-font-family', 'var(--font-geist-sans), sans-serif'); // default
      }
    };

    const loadSettings = () => {
      // 1. Try local cache first for instant load
      const cached = localStorage.getItem('user_settings_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          applySettings(parsed.text_size || 'medium', parsed.font_family || 'geist-sans');
        } catch (e) {}
      }

      // 2. Fetch fresh from API if logged in
      supabase.auth.getSession().then(({ data: { session } }) => {
        const token = session?.access_token;
        fetch('/api/user/settings', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Not logged in or error');
        })
        .then(data => {
          if (data.settings) {
            applySettings(data.settings.text_size || 'medium', data.settings.font_family || 'geist-sans');
            localStorage.setItem('user_settings_cache', JSON.stringify({
              text_size: data.settings.text_size,
              font_family: data.settings.font_family
            }));
          }
        })
        .catch(() => {});
      });
    };

    // Load initially
    loadSettings();

    // Listen for updates from Settings page
    const handleUpdate = () => {
      loadSettings();
    };

    window.addEventListener('userSettingsUpdated', handleUpdate);
    return () => window.removeEventListener('userSettingsUpdated', handleUpdate);
  }, []);

  return <>{children}</>;
}
