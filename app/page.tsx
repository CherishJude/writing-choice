'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ChatWidget from '@/app/components/ChatWidget';

export default function Home() {
  // ----- User & Auth State -----
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'super_admin' | 'moderator' | 'member'>('member');
  const [displayName, setDisplayName] = useState('');

  // ----- Navigation & Menu States (Blogger Style) -----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGroupSubmenuOpen, setIsGroupSubmenuOpen] = useState(false);

  // ----- Adjustable View Mode State (Auto-Fit | Mobile | Desktop) -----
  const [viewMode, setViewMode] = useState<'auto' | 'mobile' | 'desktop'>('auto');

  // ----- Modal States -----
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [showSectorsMenu, setShowSectorsMenu] = useState(false);
  const [briefFileName, setBriefFileName] = useState('');

  // ----- Blogger Calculator & Tier State -----
  const [selectedTierRate, setSelectedTierRate] = useState(70);
  const [selectedTierName, setSelectedTierName] = useState('100% Plag-Free');
  const [selectedTierDiscount, setSelectedTierDiscount] = useState(0.15);
  const [selectedTierCorrections, setSelectedTierCorrections] = useState('4 Corrections');
  const [wordCount, setWordCount] = useState(1000);
  const [finalPrice, setFinalPrice] = useState(7000);

  // ----- Selected Sector State -----
  const [selectedSector, setSelectedSector] = useState('');

  // ----- FAQ State -----
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ----- Real-time Clock & Business Hours State -----
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // ----- Theme & Swatch State Engine -----
  const [isDark, setIsDark] = useState(true);
  const [accentName, setAccentName] = useState('default');
  const [accentColor, setAccentColor] = useState('#00f2fe');

  const accentColors: { [key: string]: { name: string; hex: string } } = {
    default: { name: 'Default Cyan', hex: '#00f2fe' },
    crimson: { name: 'Crimson Red', hex: '#ff3366' },
    emerald: { name: 'Emerald Green', hex: '#00ff9d' },
    purple: { name: 'Royal Purple', hex: '#b366ff' },
    orange: { name: 'Sunset Orange', hex: '#ff9900' },
    amber: { name: 'Amber Gold', hex: '#ffbf00' },
    mint: { name: 'Mint Green', hex: '#98fb98' },
    silver: { name: 'Glass Silver', hex: '#C0C8D0' },
  };

  // ----- Pricing Tiers Data from Blogger File -----
  const bloggerTiers = [
    { rate: 70, name: '100% Plag-Free', discount: 0.15, dscTxt: '15% off @ 10k+ words', corrections: '4 Corrections', plagLimit: 'Above 10%' },
    { rate: 60, name: '90% Plag-Free', discount: 0.12, dscTxt: '12% off @ 10k+ words', corrections: '3 Corrections', plagLimit: 'Above 20%' },
    { rate: 50, name: '80% Plag-Free', discount: 0.10, dscTxt: '10% off @ 10k+ words', corrections: '2 Corrections', plagLimit: 'Above 30%' },
    { rate: 40, name: '60% Plag-Free', discount: 0.08, dscTxt: '8% off @ 10k+ words', corrections: '1 Correction', plagLimit: 'Above 40%' },
    { rate: 30, name: '50% Plag-Free', discount: 0.05, dscTxt: '5% off @ 10k+ words', corrections: 'No Corrections', plagLimit: 'Above 50%' },
  ];

  // ----- Initialize Theme & Clock Effects -----
  useEffect(() => {
    const savedTheme = localStorage.getItem('writingchoice_theme');
    const initialIsDark = savedTheme !== 'light';
    setIsDark(initialIsDark);
    if (!initialIsDark) {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    const savedAccent = localStorage.getItem('user_accent_color');
    if (savedAccent && accentColors[savedAccent]) {
      setAccentName(savedAccent);
      setAccentColor(accentColors[savedAccent].hex);
      document.documentElement.style.setProperty('--accent-color', accentColors[savedAccent].hex);
    }

    const savedViewMode = localStorage.getItem('writingchoice_view_mode');
    if (savedViewMode === 'desktop' || savedViewMode === 'auto') {
      setViewMode(savedViewMode as any);
    }

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        if (user.email === 'judecherish23@gmail.com') {
          setUserRole('super_admin');
          setDisplayName('Admin (Cherish Jude)');
        } else {
          const emailPrefix = user.email ? user.email.split('@')[0] : 'User';
          const { data: member } = await supabase.from('members').select('role').eq('email', user.email).single();
          if (member && member.role === 'moderator') {
            setUserRole('moderator');
            setDisplayName(`Moderator (${emailPrefix})`);
          } else {
            setUserRole('member');
            setDisplayName(`Member (${emailPrefix})`);
          }
        }
      }
    };
    checkUser();

    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { timeZone: 'Africa/Lagos', weekday: 'short', month: 'short', day: 'numeric' }));

      const lagosHours = parseInt(now.toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour: '2-digit', hour12: false }));
      const lagosDay = now.getDay(); // 0 is Sunday
      setIsOpen(lagosDay !== 0 && lagosHours >= 8 && lagosHours < 22);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Click outside listener for top menu dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDisplayName('');
    setUserRole('member');
    setIsSidebarOpen(false);
    setIsMenuOpen(false);
  };

  // Theme Toggler
  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    if (nextTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('writingchoice_theme', nextTheme);
  };

  // Change Accent Color
  const changeAccent = (key: string) => {
    if (accentColors[key]) {
      setAccentName(key);
      setAccentColor(accentColors[key].hex);
      document.documentElement.style.setProperty('--accent-color', accentColors[key].hex);
      localStorage.setItem('user_accent_color', key);
    }
  };

  // Price Calculation Logic (Blogger Formula)
  useEffect(() => {
    let basePrice = selectedTierRate * wordCount;
    if (wordCount >= 10000) {
      basePrice = basePrice * (1 - selectedTierDiscount);
    }
    setFinalPrice(Math.round(basePrice));
  }, [wordCount, selectedTierRate, selectedTierDiscount]);

  const selectBloggerTier = (tier: typeof bloggerTiers[0]) => {
    setSelectedTierRate(tier.rate);
    setSelectedTierName(tier.name);
    setSelectedTierDiscount(tier.discount);
    setSelectedTierCorrections(tier.corrections);
    setShowCalculator(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleBriefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBriefFileName(file.name);
    }
  };

  const sendWhatsAppOrder = () => {
    const message = `*NEW ORDER*%0A%0A` +
      `*Customer:* ${displayName || 'Guest'}%0A` +
      `*Service:* ${selectedSector || 'General Research'}%0A` +
      `*Brief File:* ${briefFileName || 'Attached / Provided via Chat'}%0A` +
      `*Tier:* ₦${selectedTierRate}pw (${selectedTierName})%0A` +
      `*Corrections:* ${selectedTierCorrections}%0A` +
      `*Word Count:* ${wordCount} words%0A` +
      `*Total Price:* ₦${finalPrice.toLocaleString()}`;
    window.open(`https://wa.me/2348138842719?text=${message}`, '_blank');
  };

  const surfaceCardStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)'}`,
    borderRadius: '20px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0a0d14' : '#f8fafc',
      color: isDark ? '#f0f0f0' : '#0f172a',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* ===== BLOGGER TOP MENU BUTTON & DROPDOWN ===== */}
      <div className="menu-container">
        <button
          className="menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Platform Menu"
        >
          ⋮
        </button>

        {isMenuOpen && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={() => { setIsSidebarOpen(true); setIsMenuOpen(false); }}>
              <span>☰</span> Main Menu
            </button>

            {user ? (
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <button className="menu-item">
                  <span>👤</span> {displayName || 'Member Workspace'}
                </button>
              </Link>
            ) : (
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <button className="menu-item">
                  <span>🔐</span> Login / Sign Up
                </button>
              </Link>
            )}

            <Link href="/about" onClick={() => setIsMenuOpen(false)}>
              <button className="menu-item">
                <span>ℹ️</span> About Platform
              </button>
            </Link>

            {user && (
              <button className="menu-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                <span>🚪</span> Logout / Sign Out
              </button>
            )}

            <div className="theme-selector-container">
              <p style={{ color: isDark ? '#fff' : '#000', margin: '0 0 8px 0', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>
                Theme Color
              </p>
              <div className="theme-swatches">
                {Object.entries(accentColors).map(([key, item]) => (
                  <div
                    key={key}
                    className={`swatch ${accentName === key ? 'active-swatch' : ''}`}
                    onClick={() => changeAccent(key)}
                    style={{ background: item.hex }}
                    title={item.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== CLEAN TOP HEADER (MOBILE/DESKTOP FRAME & DARK MODE TOGGLES) ===== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 9990,
        background: isDark ? 'rgba(10, 13, 20, 0.85)' : 'rgba(248, 250, 252, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ marginLeft: '60px', fontWeight: '800', fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b' }}>
          {user ? (
            <span style={{ color: user.email === 'judecherish23@gmail.com' ? '#ef4444' : accentColor }}>
              {displayName}
            </span>
          ) : (
            'WritingChoice • Portal'
          )}
        </div>

        {/* TOP RIGHT CONTROLS: DESKTOP SITE TOGGLE & DARK MODE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* DESKTOP SITE / MOBILE VIEW TOGGLE */}
          <button
            onClick={() => {
              const nextMode = viewMode === 'desktop' ? 'auto' : 'desktop';
              setViewMode(nextMode);
              localStorage.setItem('writingchoice_view_mode', nextMode);
            }}
            style={{
              background: viewMode === 'desktop' ? accentColor : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              color: viewMode === 'desktop' ? '#000' : isDark ? '#fff' : '#000',
              border: `1px solid ${accentColor}`,
              padding: '6px 14px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.78rem',
            }}
            title="Toggle between Mobile/Responsive and Full Desktop Site view"
          >
            {viewMode === 'desktop' ? '📱 Switch to Mobile View' : '💻 Desktop Site View'}
          </button>

          <button
            onClick={toggleTheme}
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
              color: isDark ? '#fff' : '#000',
              padding: '6px 14px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.82rem',
            }}
          >
            {isDark ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      {/* ===== 100% FLUID EDGE-TO-EDGE RESPONSIVE MAIN CONTENT WRAPPER ===== */}
      <div style={{
        overflowX: viewMode === 'desktop' ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
        width: '100%'
      }}>
        <main style={{
          width: '100%',
          maxWidth: viewMode === 'desktop' ? '1200px' : '100%',
          minWidth: viewMode === 'desktop' ? '1000px' : 'auto',
          margin: '0 auto',
          padding: viewMode === 'desktop' ? '20px' : '0 12px',
          boxSizing: 'border-box',
          transition: 'all 0.25s ease',
        }}>

        {/* DESKTOP MODE ACTIVE NOTIFICATION BANNER */}
        {viewMode === 'desktop' && (
          <div style={{
            background: isDark ? 'rgba(0, 242, 254, 0.08)' : 'rgba(0, 242, 254, 0.12)',
            border: `1px solid ${accentColor}`,
            borderRadius: '16px',
            padding: '10px 18px',
            margin: '12px auto 0 auto',
            maxWidth: '1200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            fontWeight: '800',
            color: accentColor,
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <span>💻 Desktop Site Mode Saved — Swipe horizontally to view full desktop columns</span>
            <button
              onClick={() => {
                setViewMode('auto');
                localStorage.setItem('writingchoice_view_mode', 'auto');
              }}
              style={{
                background: accentColor,
                color: '#000',
                border: 'none',
                padding: '4px 14px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '900',
                fontSize: '0.78rem',
              }}
            >
              📱 Switch to Mobile View
            </button>
          </div>
        )}

        {/* ===== HERO SECTION ===== */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px 10px 20px',
          textAlign: 'center',
        }}>
          {/* Blogger Cool Title Badge */}
          <div className="cool-title">
            WritingChoice
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
            fontWeight: '900',
            letterSpacing: '-1.5px',
            lineHeight: '1.15',
            margin: '10px 0 20px 0',
            color: isDark ? '#ffffff' : '#0f172a',
          }}>
            Elevate Your Academic & Professional Research
          </h1>

          <p style={{
            maxWidth: '740px',
            margin: '0 auto 24px auto',
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            color: isDark ? '#94a3b8' : '#475569',
            lineHeight: '1.7',
          }}>
            100% human-crafted research, dissertations, essays, and programming projects. 
            Powered by vetted subject specialists and integrated with our AI assistant <strong style={{ color: accentColor }}>Cherish SI</strong>.
          </p>
        </section>

        {/* ===== LED SCROLLING TICKER (BLOGGER MATRIX SCANLINE) ===== */}
        <div style={{ maxWidth: '1000px', margin: '15px auto 15px auto', padding: '0 20px' }}>
          <div className="led-bar">
            <div className="led-scroll">
              <span className="led-text">Project • Article • Essay • Dissertation • PowerPoint • Programming • Research Proposal • Analysis • Literature Review • Case Study</span>
              <span className="led-text">Project • Article • Essay • Dissertation • PowerPoint • Programming • Research Proposal • Analysis • Literature Review • Case Study</span>
            </div>
          </div>
        </div>

        {/* ===== REAL-TIME AVAILABILITY BADGE (EXACT CODE & COLOR FROM ABOUT PAGE) ===== */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 22px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '700',
            background: isOpen ? 'rgba(37, 211, 102, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: isOpen ? '1px solid #25d366' : '1px solid #ef4444',
            color: isOpen ? '#25d366' : '#ef4444',
            boxShadow: isOpen ? '0 4px 15px rgba(37, 211, 102, 0.15)' : '0 4px 15px rgba(239, 68, 68, 0.15)',
          }}>
            <span>⏰ Current Time (WAT): {time}</span>
            <span>•</span>
            <span>{isOpen ? '🟢 Open: Mon–Sat, 8:00 AM – 10:00 PM' : '🔴 Closed'}</span>
          </div>
        </div>

        {/* ===== WRITINGCHOICE WELCOME NOTE (EXACT BLOGGER COPY) ===== */}
        <section style={{ maxWidth: '1000px', margin: '0 auto 35px auto', padding: '0 20px' }}>
          <div style={surfaceCardStyle} className="glass-card">
            <div style={{ padding: '30px 26px' }}>
              <h2 style={{ color: accentColor, margin: '0 0 12px 0', fontSize: '1.6rem', fontWeight: '800' }}>
                ✨ Welcome to WritingChoice
              </h2>
              <p style={{ color: isDark ? '#f0f0f0' : '#0f172a', lineHeight: '1.8', fontSize: '1rem', margin: 0 }}>
                Hello and welcome! Whether you're a student racing against a deadline, a researcher polishing a proposal, 
                or a professional needing a flawless document, <strong style={{ color: accentColor }}>WritingChoice</strong> is built for you. 
                Our platform combines expert human writers, a powerful AI assistant (Cherish SI), and a suite of smart tools 
                to deliver <strong>100% human-written, plagiarism-free academic and professional work</strong>. 
                We believe quality writing should be accessible, affordable, and stress-free. 
                Take a deep breath 😤 you're in the right place. 😮‍💨
              </p>
            </div>
          </div>
        </section>

        {/* ===== BLOGGER FULL PRICING TIERS GRID ===== */}
        <section style={{ maxWidth: '1100px', margin: '40px auto 45px auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <span style={{ color: accentColor, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', fontSize: '0.8rem' }}>
              STRICTLY ENFORCED PRICING
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '6px 0 0 0', color: isDark ? '#fff' : '#0f172a' }}>
              Choose Your Preferred Quality Tier
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {bloggerTiers.map((tier) => (
              <div
                key={tier.rate}
                onClick={() => selectBloggerTier(tier)}
                style={{
                  ...surfaceCardStyle,
                  border: selectedTierRate === tier.rate ? `2px solid ${accentColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
                  background: selectedTierRate === tier.rate ? (isDark ? 'rgba(0, 242, 254, 0.08)' : 'rgba(0, 242, 254, 0.12)') : surfaceCardStyle.background,
                  padding: '20px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                className="glass-card"
              >
                <h3 style={{ color: accentColor, margin: '0 0 4px 0', fontSize: '1.6rem', fontWeight: '900' }}>
                  ₦{tier.rate}pw
                </h3>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '800', color: isDark ? '#fff' : '#0f172a' }}>
                  {tier.name}
                </h4>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#475569', lineHeight: '1.8', textAlign: 'left' }}>
                  <li>✓ Turnitin Report</li>
                  <li>✓ {tier.corrections}</li>
                  <li>✓ Delivery: Variable</li>
                  <li style={{ color: '#ffbf00', fontWeight: 'bold' }}>✦ {tier.dscTxt}</li>
                </ul>
                <button style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '8px',
                  borderRadius: '20px',
                  background: selectedTierRate === tier.rate ? accentColor : 'transparent',
                  color: selectedTierRate === tier.rate ? '#000' : accentColor,
                  border: `1px solid ${accentColor}`,
                  fontWeight: '800',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}>
                  {selectedTierRate === tier.rate ? 'Selected Tier' : 'Select Tier'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 3 PRIMARY ACTION CARDS ===== */}
        <section className="responsive-grid" style={{
          maxWidth: '1200px',
          margin: '20px auto 40px auto',
          padding: '0 20px',
        }}>
          {/* Card 1: Research Sectors */}
          <div style={surfaceCardStyle} className="glass-card">
            <div style={{ padding: '28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '14px' }}>📝</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: '800', color: isDark ? '#fff' : '#0f172a' }}>
                Research Sectors
              </h3>
              <p style={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                Explore tailored sectors from academic research to software engineering builds.
              </p>

              <button
                onClick={() => setShowSectorsMenu(!showSectorsMenu)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '30px',
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                  color: '#000',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: `0 4px 15px ${accentColor}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{selectedSector ? `✓ ${selectedSector}` : 'Select Research Service'}</span>
                <span>{showSectorsMenu ? '▲' : '▼'}</span>
              </button>

              {showSectorsMenu && (
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '280px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}>
                  {[
                    { name: 'Article & Academic Paper', icon: '📄' },
                    { name: 'Essay & Term Assignment', icon: '✍️' },
                    { name: 'Dissertation & Master\'s Thesis', icon: '📚' },
                    { name: 'PowerPoint & Pitch Presentation', icon: '📊' },
                    { name: 'Final Year Project & Report', icon: '🎓' },
                    { name: 'Literature Review & Systematic Review', icon: '🔍' },
                    { name: 'Case Study & Business Analysis', icon: '💼' },
                    { name: 'Research Proposal & Methodology', icon: '💡' },
                    { name: 'Programming & Software Engineering', icon: '💻' },
                    { name: 'Data Analysis & Statistical Modeling', icon: '📈' },
                  ].map((sector) => (
                    <button
                      key={sector.name}
                      onClick={() => { setSelectedSector(sector.name); setShowSectorsMenu(false); }}
                      style={{
                        padding: '12px 16px',
                        background: selectedSector === sector.name ? accentColor : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        color: selectedSector === sector.name ? '#000' : isDark ? '#f0f0f0' : '#0f172a',
                        border: selectedSector === sector.name ? `2px solid ${accentColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                        borderRadius: '12px',
                        textAlign: 'left',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span>{sector.icon}</span>
                      <span style={{ flex: 1 }}>{sector.name}</span>
                      {selectedSector === sector.name && <span style={{ fontWeight: '900' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* MODERN GLASSMORPHIC DRAG & DROP BRIEF UPLOAD CARD */}
              <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: accentColor, marginBottom: '10px' }}>
                  📎 Attach Brief File
                </label>

                <div style={{
                  position: 'relative',
                  background: isDark ? 'rgba(0, 242, 254, 0.03)' : 'rgba(0, 242, 254, 0.06)',
                  border: `2px dashed ${briefFileName ? '#25d366' : accentColor}`,
                  borderRadius: '16px',
                  padding: '20px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.zip"
                    onChange={handleBriefUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 2,
                    }}
                  />
                  <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
                    {briefFileName ? '📄' : '☁️'}
                  </div>

                  {briefFileName ? (
                    <div>
                      <div style={{ color: '#25d366', fontWeight: '800', fontSize: '0.88rem' }}>
                        ✓ {briefFileName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                        File attached cleanly • Tap or drop to change file
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.88rem', color: isDark ? '#fff' : '#0f172a' }}>
                        Drop Brief File Here or <span style={{ color: accentColor, textDecoration: 'underline' }}>Browse</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
                        Supports PDF, DOCX, TXT, or ZIP (Up to 50MB)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pricing Calculator */}
          <div style={surfaceCardStyle} className="glass-card">
            <div style={{ padding: '28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '14px' }}>💎</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: '800', color: isDark ? '#fff' : '#0f172a' }}>
                Pricing Calculator
              </h3>
              <p style={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                Calculate transparent pricing based on word count, quality tier, and bulk discounts.
              </p>
              <button
                onClick={() => setShowCalculator(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '30px',
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                  color: '#000',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: `0 4px 15px ${accentColor}33`,
                }}
              >
                Open Calculator →
              </button>
            </div>
          </div>

          {/* Card 3: Service Terms */}
          <div style={surfaceCardStyle} className="glass-card">
            <div style={{ padding: '28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '14px' }}>📜</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: '800', color: isDark ? '#fff' : '#0f172a' }}>
                Service Terms & Refund Policy
              </h3>
              <p style={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                Review our 60/40 deposit contract, WhatsApp protocol, and Turnitin refund policy.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setShowTerms(true)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '30px',
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                    color: '#000',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Read Terms of Service →
                </button>
                <button
                  onClick={() => setShowRefundPolicy(true)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '30px',
                    background: 'transparent',
                    color: '#ffbf00',
                    border: '1px solid #ffbf00',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Refund Policy Details →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PERFORMANCE METRICS ===== */}
        <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: accentColor, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', fontSize: '0.8rem' }}>
              PERFORMANCE METRICS
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '6px 0 0 0', color: isDark ? '#fff' : '#0f172a' }}>
              Trusted Academic Execution
            </h2>
          </div>

          <div className="responsive-grid">
            <div style={surfaceCardStyle} className="glass-card">
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: accentColor, marginBottom: '6px' }}>
                  1,420+
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '700', color: isDark ? '#fff' : '#0f172a' }}>
                  Delivered Projects
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Academic research papers, dissertations, and code builds delivered worldwide.
                </p>
              </div>
            </div>

            <div style={surfaceCardStyle} className="glass-card">
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#25d366', marginBottom: '6px' }}>
                  18 Active
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '700', color: isDark ? '#fff' : '#0f172a' }}>
                  Vetted Specialists
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Elite subject specialists and software engineers ready for project tasks.
                </p>
              </div>
            </div>

            <div style={surfaceCardStyle} className="glass-card">
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffbf00', marginBottom: '6px' }}>
                  &lt; 24 Hours
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '700', color: isDark ? '#fff' : '#0f172a' }}>
                  Average Cycle Delivery
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Rapid turnaround timelines for urgent assignments and research drafts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== REPOSITIONED COSMIC QUOTE CARD (LOWER PART OF THE PAGE) ===== */}
        <section style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
          <div className="cosmic-quote-card">
            <div className="quote-heading">
              <span>✨</span>
              <h4>Quote For You</h4>
            </div>
            <div className="quote-text">
              Bullets only get their job done after they are fired. Stop waiting for perfection in the chamber. Publish the work, deploy the code, take the shot, and let your impact be felt.
            </div>
            <div className="quote-glow" />
          </div>
        </section>

        {/* ===== CLIENT TESTIMONIALS SECTION ===== */}
        <section style={{ maxWidth: '1000px', margin: '50px auto 40px auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: accentColor, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', fontSize: '0.8rem' }}>
              CLIENT FEEDBACK
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '6px 0 0 0', color: isDark ? '#fff' : '#0f172a' }}>
              What Our Clients Say
            </h2>
          </div>

          <div className="responsive-grid">
            {[
              {
                text: 'My 15,000-word dissertation was delivered two days before the deadline. The Turnitin report showed 4% similarity. My supervisor was impressed with the structure. Worth every kobo.',
                name: 'Adaeze O.',
                role: 'MSc Student • University of Lagos',
                avatar: 'A'
              },
              {
                text: 'I needed a Python data analysis project with documentation. Cherish delivered clean, commented code with a full README. I submitted it with confidence. Absolutely professional.',
                name: 'Emmanuel T.',
                role: 'BSc Computer Science • UNIABUJA',
                avatar: 'E'
              },
              {
                text: 'Used WritingChoice for a business proposal and a research article. Both were delivered on time, well-referenced, and required zero corrections. My go-to writing service now.',
                name: 'Funmilayo B.',
                role: 'Entrepreneur • Lagos',
                avatar: 'F'
              }
            ].map((item, idx) => (
              <div key={idx} style={surfaceCardStyle} className="glass-card">
                <div style={{ padding: '24px', position: 'relative' }}>
                  <div style={{ color: '#ffbf00', fontSize: '1rem', marginBottom: '10px' }}>
                    ★★★★★
                  </div>
                  <p style={{
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '0.9rem',
                    lineHeight: '1.7',
                    fontStyle: 'italic',
                    marginBottom: '16px'
                  }}>
                    "{item.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${accentColor}, #000)`,
                      color: '#fff',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem'
                    }}>
                      {item.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: accentColor }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>{item.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 4 MAJOR BLOGGER SECTIONS RIGHT UNDER WHAT OUR CLIENTS SAY ===== */}
        <section style={{ maxWidth: '1000px', margin: '0 auto 50px auto', padding: '0 20px' }}>
          
          {/* SECTION 1: HOW TO NAVIGATE WRITINGCHOICE A QUICK GUIDE */}
          <div style={{ ...surfaceCardStyle, marginBottom: '30px' }} className="glass-card">
            <div style={{ padding: '30px 25px' }}>
              <h3 style={{ color: accentColor, margin: '0 0 24px 0', fontSize: '1.4rem', fontWeight: '800' }}>
                🧭 How to Navigate WritingChoice — A Quick Guide
              </h3>
              <div className="responsive-grid">
                {[
                  { num: '1', title: 'Choose Your Service', desc: 'Tap "View Sectors" in the Research Options card. Select from Article, Essay, Dissertation, PowerPoint, Project, Literature Review, Case Study, Research Proposal, or Programming.' },
                  { num: '2', title: 'Upload Your Brief', desc: 'Attach your assignment brief (PDF/DOC) securely. This gives our writer all the details — deadline, word count, formatting style, and any special instructions.' },
                  { num: '3', title: 'Pick a Pricing Tier', desc: 'Open the Price Calculator. Choose your preferred tier (from ₦30/pw to ₦70/pw), enter your word count, and get an instant quote. Discounts apply for 10,000+ words.' },
                  { num: '4', title: 'Send Order via WhatsApp', desc: 'Tap "Send Order to WhatsApp" — your order details and brief link are automatically formatted. Cherish receives it instantly and confirms within minutes.' },
                  { num: '5', title: 'Join the Community', desc: 'Register or log in to access group chats (Art, Science, Entertainment, Friends Zone), the built-in document editor, and your personal dashboard to track orders.' },
                  { num: '6', title: 'Ask Cherish SI', desc: 'Stuck on a concept? Tap the "Ask Cherish SI" button (bottom-right) to chat with our AI research assistant. It explains topics, brainstorms ideas, and remembers your conversations.' }
                ].map((step) => (
                  <div key={step.num} style={{
                    background: isDark ? 'rgba(0, 242, 254, 0.04)' : 'rgba(0, 242, 254, 0.08)',
                    borderLeft: `4px solid ${accentColor}`,
                    borderRadius: '14px',
                    padding: '20px 18px',
                  }}>
                    <span style={{ background: accentColor, color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px' }}>
                      {step.num}
                    </span>
                    <h4 style={{ color: isDark ? '#fff' : '#0f172a', margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>{step.title}</h4>
                    <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: YOUR ACADEMIC ASSURANCE */}
          <div style={{ ...surfaceCardStyle, border: `1px solid ${accentColor}`, marginBottom: '30px' }} className="glass-card">
            <div style={{ padding: '30px 25px' }}>
              <h3 style={{ color: accentColor, margin: '0 0 16px 0', fontSize: '1.4rem', fontWeight: '800' }}>
                🛡️ Your Academic Assurance
              </h3>
              <p style={{ color: isDark ? '#f0f0f0' : '#0f172a', lineHeight: '1.8', fontSize: '1rem', margin: 0 }}>
                Every document we deliver is written from scratch by skilled academic writers. 
                We guarantee <strong style={{ color: '#25d366' }}>100% human-written content</strong> — no AI generation, no paraphrasing bots. 
                Each project includes a <strong>Turnitin plagiarism report</strong> as proof of originality. 
                Our strict <strong style={{ color: '#ffbf00' }}>60% upfront / 40% on delivery</strong> payment structure protects both you and the writer, 
                and you're entitled to <strong>free corrections</strong> within one week of submission. 
                If the work is plagiarised above the agreed limit or not delivered on time and no action was taken according to our Term Of Service, our money-back guarantee applies. 
                We're here to make your academic life easier with integrity, transparency, and genuine care.
              </p>
            </div>
          </div>

          {/* SECTION 3: WHO WE SERVE */}
          <div style={{ ...surfaceCardStyle, marginBottom: '30px' }} className="glass-card">
            <div style={{ padding: '30px 25px' }}>
              <h3 style={{ color: accentColor, margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '800' }}>
                👥 Who We Serve
              </h3>
              <div className="responsive-grid">
                <div style={{ background: isDark ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.1)', borderRadius: '14px', padding: '20px 18px', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <h4 style={{ color: '#ffbf00', margin: '0 0 8px 0', fontWeight: '800' }}>🎓 Undergraduates</h4>
                  <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                    From essays to final-year projects, we help you meet deadlines without compromising quality. Our writers understand university grading rubrics and deliver work that matches your level.
                  </p>
                </div>
                <div style={{ background: isDark ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.1)', borderRadius: '14px', padding: '20px 18px', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <h4 style={{ color: '#ffbf00', margin: '0 0 8px 0', fontWeight: '800' }}>📖 Postgraduates</h4>
                  <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                    Masters dissertations, PhD proposals, and advanced research papers are handled with the rigour they demand. We cite properly, structure logically, and polish every chapter.
                  </p>
                </div>
                <div style={{ background: isDark ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.1)', borderRadius: '14px', padding: '20px 18px', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <h4 style={{ color: '#ffbf00', margin: '0 0 8px 0', fontWeight: '800' }}>💼 Professionals</h4>
                  <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                    Business plans, white papers, reports, and presentations — we translate your expertise into polished, persuasive documents ready for clients, investors, or management.
                  </p>
                </div>
                <div style={{ background: isDark ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.1)', borderRadius: '14px', padding: '20px 18px', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <h4 style={{ color: '#ffbf00', margin: '0 0 8px 0', fontWeight: '800' }}>💻 Programmers & Developers</h4>
                  <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                    Programming assignments, code documentation, web development and technical reports. We cover Python, JavaScript, C++, and more — with clean, commented, and functional code.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: HOW WE ENSURE QUALITY JOBS; OUR PROCESS */}
          <div style={surfaceCardStyle} className="glass-card">
            <div style={{ padding: '30px 25px' }}>
              <h3 style={{ color: accentColor, margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '800' }}>
                📋 How We Ensure Quality Jobs; Our Process
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: '1.8', fontSize: '0.95rem' }}>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: accentColor }}>1. In-Depth Brief Analysis</strong><br />
                  Every order starts with a thorough review of your brief. If anything is unclear — deadline, word count, formatting style, or special instructions — we ask you before work begins. No assumptions, no guesswork.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: accentColor }}>2. Subject-Matched Writers</strong><br />
                  Your project is assigned to a writer with proven experience in your subject area. A law essay goes to a legal writer; a programming task goes to a developer. This ensures accuracy, depth, and proper terminology from the first draft.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: accentColor }}>3. Multi-Layer Plagiarism Checking</strong><br />
                  Every draft passes through Turnitin and additional internal checks before it reaches you. We provide the Turnitin report as proof. Our 100% human-written guarantee means zero AI generation — every sentence is crafted by a real person.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: accentColor }}>4. Free Corrections & Revisions</strong><br />
                  You receive the draft, and you have one week to request any changes. Corrections are free and unlimited within that window. We iterate until you're satisfied.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: accentColor }}>5. Secure Delivery & Full Handover</strong><br />
                  Once the balance is cleared, you receive the complete, editable document in your preferred format. We never reuse or resell your work — every project is confidential and yours alone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ SECTION ===== */}
        <section style={{ maxWidth: '1000px', margin: '50px auto 40px auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: accentColor, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', fontSize: '0.8rem' }}>
              HELP CENTER
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '6px 0 0 0', color: isDark ? '#fff' : '#0f172a' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'How long does delivery take?', a: 'Delivery time depends on word count and complexity. Short essays (under 2,000 words) typically take 24–48 hours. Dissertations and large projects (10,000+ words) can take 5–14 days. Always provide your exact deadline when placing an order.' },
              { q: 'Is the work 100% human-written?', a: 'Yes, absolutely. Every document is written from scratch by a qualified human writer with subject-area expertise. We do not use AI generation tools. A Turnitin plagiarism report is included as proof of originality with every order.' },
              { q: 'How does the 60/40 payment work?', a: 'You pay 60% of the quoted price upfront to begin the contract. When the work is completed, a preview is sent to you. You then pay the remaining 40% to receive the full, editable document.' },
              { q: 'What if I need corrections after delivery?', a: 'You are entitled to free corrections depending on your selected tier (4 corrections for ₦70pw, 3 for ₦60pw, 2 for ₦50pw, 1 for ₦40pw). Simply send your feedback via WhatsApp within one week of delivery.' },
              { q: 'When can I get a refund?', a: 'A refund applies in two specific cases: (1) the work is plagiarised above the agreed limit confirmed by Turnitin, or (2) the work was not delivered on time AND no corrective action was taken by us per our Terms of Service.' },
              { q: 'What formats do you deliver?', a: 'We deliver in Microsoft Word (.docx) by default, which is editable. We can also deliver in PDF, plain text, or PowerPoint (.pptx). For programming assignments, we deliver source code files in a ZIP archive with a README.' },
              { q: 'Is my information kept confidential?', a: 'Completely. Your brief, personal details, and completed work are never shared, resold, or reused. Files are stored in a secured private vault and shared only with your assigned writer.' },
              { q: 'Do you handle urgent orders?', a: 'Yes, but urgent and emergency orders (under 24 hours) are priced differently. Contact Cherish directly on WhatsApp to discuss emergency rates before placing an order.' }
            ].map((faq, index) => (
              <div key={index} style={surfaceCardStyle} className="glass-card">
                <div
                  onClick={() => toggleFaq(index)}
                  style={{
                    padding: '20px 24px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: '700',
                    fontSize: '1rem',
                    color: isDark ? '#fff' : '#0f172a',
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ color: accentColor, fontSize: '1.3rem', transition: 'transform 0.3s', transform: openFaq === index ? 'rotate(45deg)' : 'rotate(0)' }}>
                    +
                  </span>
                </div>
                {openFaq === index && (
                  <div style={{
                    padding: '0 24px 20px 24px',
                    fontSize: '0.9rem',
                    color: isDark ? '#94a3b8' : '#475569',
                    lineHeight: '1.7',
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== TAKING YOUR NEXT STEP WITH CONFIDENCE (AFTER FAQ, BEFORE READY TO GET STARTED) ===== */}
        <section style={{ maxWidth: '1000px', margin: '30px auto 20px auto', padding: '0 20px' }}>
          <div style={surfaceCardStyle} className="glass-card">
            <div style={{ padding: '32px 28px' }}>
              <h3 style={{ color: accentColor, margin: '0 0 16px 0', fontSize: '1.4rem', fontWeight: '800' }}>
                ✨ Taking Your Next Step With Confidence
              </h3>
              <div style={{ color: isDark ? '#f0f0f0' : '#0f172a', lineHeight: '1.8', fontSize: '0.98rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0 }}>
                  WritingChoice was built to remove the stress from academic writing. You have seen the services, explored the pricing tiers, and read the terms that protect both you and the writer. Now the only thing left is to take that first small action.
                </p>
                <p style={{ margin: 0 }}>
                  Choose your service from the Research Options card above. Attach your brief, pick a tier that fits your budget, and send the order directly to Cherish on WhatsApp. Within minutes you will have a confirmation and a clear timeline for delivery. It really is that straightforward.
                </p>
                <p style={{ margin: 0 }}>
                  If you are unsure about anything, the Cherish SI chatbot is always online. It can explain any service, help you calculate costs, and even brainstorm ideas for your project. Real human support is also just a message away via the Chat Now button. You are never alone in this process.
                </p>
                <p style={{ margin: 0 }}>
                  Every document we deliver reflects our commitment to quality, originality, and confidentiality. Your work is never reused or shared. Your deadline is respected. Your trust is earned with every completed order.
                </p>
                <p style={{ margin: 0, fontWeight: '700', color: accentColor }}>
                  Thousands of students and professionals have already taken this step. Join them today and experience how easy academic writing can be when you have the right partner by your side.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== YOUR NEXT STEP IS SIMPLE / READY TO GET STARTED? (UNDER FREQUENTLY ASKED QUESTIONS) ===== */}
        <section style={{ maxWidth: '1000px', margin: '20px auto 60px auto', padding: '0 20px' }}>
          <div style={{
            background: isDark ? 'rgba(0, 242, 254, 0.06)' : 'rgba(0, 242, 254, 0.1)',
            backdropFilter: 'blur(16px)',
            border: `2px solid ${accentColor}`,
            borderRadius: '24px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: `0 10px 30px ${accentColor}22`,
          }}>
            <h3 style={{ color: accentColor, margin: '0 0 14px 0', fontSize: '1.5rem', fontWeight: '800' }}>
              🚀 Ready to Get Started? Your Next Step is Simple
            </h3>
            <p style={{ color: isDark ? '#f0f0f0' : '#0f172a', lineHeight: '1.8', fontSize: '1rem', margin: '0 0 24px 0', maxWidth: '780px', marginLeft: 'auto', marginRight: 'auto' }}>
              Choose a service from the <strong style={{ color: accentColor }}>Research Options</strong> card above, 
              attach your brief, select a pricing tier, and send your order via WhatsApp — all in under two minutes. 
              If you have questions, tap the <strong style={{ color: '#25d366' }}>Chat Now</strong> button or ask <strong style={{ color: accentColor }}>Cherish SI</strong> for instant help. 
              Your first step toward stress-free academic writing starts right here.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                color: '#000',
                border: 'none',
                padding: '14px 36px',
                borderRadius: '40px',
                fontWeight: '900',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${accentColor}44`,
              }}
            >
              Jump to Research Options & Tiers ↓
            </button>
          </div>
        </section>

      </main>
      </div>

      {/* ===== BLOGGER PRICE CALCULATOR OVERLAY MODAL ===== */}
      {showCalculator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          zIndex: 20000,
          overflowY: 'auto',
          padding: '40px 16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          <div style={{
            maxWidth: '700px',
            width: '100%',
            background: isDark ? '#0a0d14' : '#ffffff',
            border: `2px solid ${accentColor}`,
            borderRadius: '24px',
            padding: '32px',
            position: 'relative',
            margin: '40px auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}>
            <button
              onClick={() => setShowCalculator(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '0.85rem',
              }}
            >
              ✕ CLOSE
            </button>

            <h2 style={{ color: accentColor, margin: '0 0 10px 0', fontSize: '1.6rem', fontWeight: '800' }}>
              📊 Smart Price Calculator
            </h2>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.88rem', margin: '0 0 20px 0' }}>
              Selected Tier: <strong style={{ color: accentColor }}>₦{selectedTierRate}pw — {selectedTierName} ({selectedTierCorrections})</strong>
            </p>

            {/* Select Tier Switcher */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '0.85rem' }}>
                Change Tier:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {bloggerTiers.map((t) => (
                  <button
                    key={t.rate}
                    onClick={() => selectBloggerTier(t)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      background: selectedTierRate === t.rate ? accentColor : 'transparent',
                      color: selectedTierRate === t.rate ? '#000' : isDark ? '#fff' : '#000',
                      border: `1px solid ${accentColor}`,
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    ₦{t.rate}pw
                  </button>
                ))}
              </div>
            </div>

            {/* Word Count Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '0.9rem' }}>
                Enter Word Count:
              </label>
              <input
                type="number"
                min="100"
                max="50000"
                step="100"
                value={wordCount}
                onChange={(e) => setWordCount(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: isDark ? '#000' : '#fff',
                  border: `1px solid ${accentColor}`,
                  color: accentColor,
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  outline: 'none',
                }}
                placeholder="Enter Word Count"
              />
              {wordCount >= 10000 && (
                <div style={{ color: '#ffbf00', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '6px' }}>
                  🎉 Bulk discount applied! ({selectedTierDiscount * 100}% off for 10,000+ words)
                </div>
              )}
            </div>

            {/* Calculated Price Display */}
            <div style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center',
              marginBottom: '20px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}>
              <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '700' }}>Calculated Quote Total</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffbf00', marginTop: '4px' }}>
                ₦{finalPrice.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
                60% Upfront Deposit: <strong style={{ color: accentColor }}>₦{Math.round(finalPrice * 0.6).toLocaleString()}</strong> • 40% Final Balance: <strong>₦{Math.round(finalPrice * 0.4).toLocaleString()}</strong>
              </div>
            </div>

            <button
              onClick={sendWhatsAppOrder}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '30px',
                background: '#25d366',
                color: '#fff',
                border: 'none',
                fontWeight: '800',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
              }}
            >
              💬 Send Order to WhatsApp →
            </button>
          </div>
        </div>
      )}

      {/* ===== BLOGGER EXACT TERMS OF SERVICE OVERLAY MODAL ===== */}
      {showTerms && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          zIndex: 20000,
          overflowY: 'auto',
          padding: '40px 16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          <div style={{
            maxWidth: '750px',
            width: '100%',
            background: isDark ? '#0a0d14' : '#ffffff',
            border: `2px solid ${accentColor}`,
            borderRadius: '24px',
            padding: '32px',
            position: 'relative',
            margin: '40px auto',
            color: isDark ? '#f0f0f0' : '#0f172a',
            lineHeight: '1.7',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}>
            <button
              onClick={() => setShowTerms(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '0.85rem',
              }}
            >
              ✕ CLOSE
            </button>

            <h2 style={{ color: accentColor, margin: '0 0 20px 0', fontSize: '1.6rem', fontWeight: '800', borderBottom: `1px solid ${accentColor}`, paddingBottom: '10px' }}>
              My Terms of Service
            </h2>

            <div style={{ fontSize: '0.92rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', borderLeft: `4px solid ${accentColor}` }}>
                <strong>1.</strong> I take a <b>60% non-negotiable upfront payment</b> before I begin any work, and the payment signifies we have a contract and that you have agreed to the offer, and my <b>terms of service.</b> And when I am done with the work, I'll send you a preview of the finished work and you are required to balance up to get the full document.
              </div>

              <div style={{ padding: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', borderLeft: `4px solid ${accentColor}` }}>
                <strong>2.</strong> Each writing job you bring is a different contract. Please understand that you cannot transfer the terms of one contract to another. Also note that terminating a contract that is in progress is unacceptable as it cannot lead to a refund.<br /><br />The basis of a refund applies when we did not meet our sides of the bargain according to your brief and materials (delivery, or it is plagiarized above the agreed limit).
              </div>

              <div style={{ padding: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', borderLeft: `4px solid ${accentColor}` }}>
                <strong>3.</strong> You are required to:
                <div style={{ marginLeft: '12px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>a. Provide the task brief of your work.</div>
                  <div>b. Provide a deadline. Please, unless otherwise stated, it is not acceptable to try to coerce the writer to submit the work half to the deadline.</div>
                  <div>c. Provide a word count. (<b>We do not work on a blind wordcount</b>).</div>
                  <div>d. We advise you provide a sample work from the archives of your school to guide us too.</div>
                  <div>e. Provide every other details of the work beforehand. <i>Sending requirements after a contract has begun is not acceptable.</i></div>
                </div>
              </div>

              <div style={{ padding: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', borderLeft: `4px solid ${accentColor}` }}>
                <strong>4.</strong> While I yearn to serve you better, I hope you try to work with me on my terms. Please note that you are required to give me feedback exactly within one week of my submitting your work to you. After one week, we will mark the contract has successfully done automatically, and feedbacks may become null and void to the contract.
              </div>

              <div style={{ padding: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', borderLeft: `4px solid ${accentColor}` }}>
                <strong>5.</strong> Please we prefer <b>WhatsApp chats only</b>. We do not accept calls where the call has to do with describing the job. Do type all the requirements for reference purposes.
              </div>

              <div style={{ padding: '14px', background: 'rgba(255,191,0,0.08)', borderRadius: '12px', borderLeft: '4px solid #ffbf00', color: '#ffbf00', fontWeight: 'bold' }}>
                ⚠️ Please note that an upfront payment signifies that you accept our terms of service and our contract has begun. We cannot begin your work without an upfront payment.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== BLOGGER REFUND & MONEY-BACK POLICY OVERLAY MODAL ===== */}
      {showRefundPolicy && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          zIndex: 20000,
          overflowY: 'auto',
          padding: '40px 16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          <div style={{
            maxWidth: '750px',
            width: '100%',
            background: isDark ? '#0a0d14' : '#ffffff',
            border: '2px solid #ffbf00',
            borderRadius: '24px',
            padding: '32px',
            position: 'relative',
            margin: '40px auto',
            color: isDark ? '#f0f0f0' : '#0f172a',
            lineHeight: '1.7',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}>
            <button
              onClick={() => setShowRefundPolicy(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '0.85rem',
              }}
            >
              ✕ CLOSE
            </button>

            <h2 style={{ color: '#ffbf00', margin: '0 0 16px 0', fontSize: '1.6rem', fontWeight: '800', borderBottom: '1px solid #ffbf00', paddingBottom: '10px' }}>
              Refund & Money-Back Policy
            </h2>
            <p style={{ marginBottom: '20px' }}>
              WritingChoice is committed to delivering quality work on time. This policy outlines exactly when a refund applies and how to request one.
            </p>

            <div style={{ padding: '18px', background: 'rgba(255,215,0,0.06)', borderRadius: '14px', borderLeft: '4px solid #ffbf00', marginBottom: '16px' }}>
              <h4 style={{ color: '#ffbf00', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Eligible Refund Grounds</h4>
              <p style={{ margin: '0 0 8px 0' }}><strong>1. Plagiarism above agreed limit:</strong> If the Turnitin report we provide shows a similarity score above the threshold agreed for your tier (e.g. above 10% for the ₦70/pw tier, above 20% for ₦60/pw, etc.), you are entitled to a full refund of your upfront deposit.</p>
              <p style={{ margin: 0 }}><strong>2. Non-delivery without corrective action:</strong> If the work is not delivered by the agreed deadline AND WritingChoice did not communicate or take corrective action per the Terms of Service, a refund will be processed.</p>
            </div>

            <div style={{ padding: '18px', background: 'rgba(239,68,68,0.06)', borderRadius: '14px', borderLeft: '4px solid #ef4444', marginBottom: '20px' }}>
              <h4 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Non-Eligible Situations</h4>
              <p style={{ margin: 0 }}>Refunds do NOT apply when: the contract is terminated mid-progress at the client's request; dissatisfaction is raised after the one-week correction window; requirements are changed after the contract began; or the brief provided was incomplete or inaccurate.</p>
            </div>

            <h4 style={{ color: accentColor, margin: '0 0 8px 0' }}>How to Request a Refund</h4>
            <p style={{ margin: 0 }}>
              Contact Cherish via WhatsApp at <strong>+2348138842719</strong> within the one-week feedback window. Provide your order reference, the Turnitin report (if applicable), and a clear description of the issue. All refunds are reviewed within 48 hours and processed within 5 business days if approved.
            </p>
          </div>
        </div>
      )}

      {/* ===== BLOGGER SIDEBAR DRAWER & OVERLAY ===== */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h3>⚡ Menu</h3>
          <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>

        {/* User Badge & Address Designation */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', marginBottom: '16px', border: `1px solid ${user.email === 'judecherish23@gmail.com' ? '#ef4444' : accentColor}` }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: user.email === 'judecherish23@gmail.com' ? '#ef4444' : accentColor, color: '#000', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              {user.email === 'judecherish23@gmail.com' ? '👑' : user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '0.9rem', color: isDark ? '#fff' : '#000' }}>{displayName}</div>
              <div style={{ fontSize: '0.72rem', color: user.email === 'judecherish23@gmail.com' ? '#ef4444' : '#ffbf00', fontWeight: '800' }}>
                {userRole === 'super_admin' ? 'Super Admin Authority' : userRole === 'moderator' ? 'Appointed Moderator' : 'Verified Member'}
              </div>
            </div>
          </div>
        ) : (
          <Link href="/auth/login" onClick={() => setIsSidebarOpen(false)}>
            <button className="sidebar-item" style={{ marginBottom: '16px', border: `1px solid ${accentColor}`, color: accentColor }}>
              <span>🔑</span> Login / Sign Up
            </button>
          </Link>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Link href="/" onClick={() => setIsSidebarOpen(false)}>
            <button className="sidebar-item">
              <span>🏠</span> Home Platform
            </button>
          </Link>

          <Link href="/about" onClick={() => setIsSidebarOpen(false)}>
            <button className="sidebar-item">
              <span>👤</span> About WritingChoice
            </button>
          </Link>

          {user && (
            <>
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)}>
                <button className="sidebar-item">
                  <span>📊</span> Member Dashboard
                </button>
              </Link>

              <button className="sidebar-item" onClick={() => setIsGroupSubmenuOpen(!isGroupSubmenuOpen)}>
                <span>👥</span> Groups <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>{isGroupSubmenuOpen ? '▲' : '▼'}</span>
              </button>

              {isGroupSubmenuOpen && (
                <div className="sidebar-submenu">
                  {[
                    { name: 'General', icon: '💬' },
                    { name: 'Art', icon: '🎨' },
                    { name: 'Science', icon: '🔬' },
                    { name: 'Entertainment', icon: '🎬' },
                    { name: 'Friends Zone', icon: '🤝' },
                  ].map((grp) => (
                    <Link key={grp.name} href="/chat" onClick={() => setIsSidebarOpen(false)}>
                      <button className="sidebar-subitem">
                        <span>{grp.icon}</span> {grp.name}
                      </button>
                    </Link>
                  ))}
                </div>
              )}

              {(userRole === 'super_admin' || userRole === 'moderator') && (
                <Link href="/admin" onClick={() => setIsSidebarOpen(false)}>
                  <button className="sidebar-item" style={{ color: userRole === 'super_admin' ? '#ef4444' : accentColor, fontWeight: '800' }}>
                    <span>🛡️</span> {userRole === 'super_admin' ? 'Super Admin Console' : 'Moderator Console'}
                  </button>
                </Link>
              )}

              {/* LOGOUT OPTION RIGHT UNDER ADMIN CONSOLE */}
              <button className="sidebar-item" onClick={handleLogout} style={{ color: '#ef4444', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '8px', paddingTop: '12px' }}>
                <span>🚪</span> Logout / Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{
        maxWidth: '1200px',
        margin: '60px auto 0 auto',
        padding: '24px 20px',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '0.85rem',
        color: isDark ? '#94a3b8' : '#64748b',
      }}>
        <div>© {new Date().getFullYear()} WritingChoice • Cherish Jude. All Rights Reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25d366' }} />
          <span>Supabase Sync: Operational</span>
        </div>
      </footer>

      {/* ===== CHAT WIDGET COMPONENT ===== */}
      <ChatWidget />
    </div>
  );
}