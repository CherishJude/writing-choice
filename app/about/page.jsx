'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  const [isDark, setIsDark] = useState(true);
  const [accentColor, setAccentColor] = useState('#00f2fe');

  // Real-time clock & availability states
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('writingchoice_theme');
    setIsDark(savedTheme !== 'light');

    const savedAccent = localStorage.getItem('user_accent_color');
    const accentColors = {
      default: '#00f2fe', emerald: '#00ff9d', purple: '#b366ff',
      crimson: '#ff3366', orange: '#ff9900', amber: '#ffbf00',
      mint: '#98fb98', silver: '#c0c8d0',
    };
    setAccentColor(savedAccent && accentColors[savedAccent] ? accentColors[savedAccent] : '#00f2fe');

    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { timeZone: 'Africa/Lagos', weekday: 'short', month: 'short', day: 'numeric' }));
      const lagosHours = parseInt(now.toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour: '2-digit', hour12: false }));
      const lagosDay = now.getDay();
      setIsOpen(lagosDay !== 0 && lagosHours >= 8 && lagosHours < 22);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const cardStyle = {
    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)'}`,
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '28px',
    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.06)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0a0d14' : '#f8fafc',
      color: isDark ? '#f0f0f0' : '#0f172a',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Navigation Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
          <Link href="/">
            <button style={{
              background: 'transparent',
              border: `1px solid ${accentColor}`,
              color: accentColor,
              padding: '8px 20px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem',
            }}>
              ← Back to Platform
            </button>
          </Link>
          <button
            onClick={toggleTheme}
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
              color: isDark ? '#fff' : '#000',
              padding: '8px 18px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.85rem',
            }}
          >
            {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>

        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
            About WritingChoice
          </h1>
          
          {/* Real-time Availability & WAT Clock Indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 20px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '700',
            background: isOpen ? 'rgba(37, 211, 102, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: isOpen ? '1px solid #25d366' : '1px solid #ef4444',
            color: isOpen ? '#25d366' : '#ef4444',
            marginTop: '8px',
          }}>
            <span>⏰ Current Time (WAT): {date} {time}</span>
            <span>•</span>
            <span>{isOpen ? '🟢 Open: Mon–Sat, 8:00 AM – 10:00 PM' : '🔴 Closed'}</span>
          </div>
        </div>

        {/* FOUNDER HIGHLIGHT CARD */}
        <div style={{ ...cardStyle, border: `2px solid ${accentColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0, margin: '0 auto' }}>
              <img
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjpoEPNmguvPcY0wNVywL2902e0ZLvppnf0I09IX5hmv_sgyVfbR06RDLFLqx1Zywz0tQSYxrFXpM9FpGUfHeBNobbff6JEdZDpafl-XH9qz5pp0TibvIHAjK2Z4-lXUJbtGuoBR8Ou1-M68a9T3A0BpEleFTnBtJs4Jluv3qNOrJ9Sza0H62Vbxs0SzBk/s1125/1775159152004~2.png"
                alt="Cherish Jude - Founder of WritingChoice"
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  border: `4px solid ${accentColor}`,
                  objectFit: 'cover',
                  boxShadow: `0 0 30px ${accentColor}55`,
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: accentColor, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                FOUNDER & HEAD RESEARCH CONSULTANT
              </span>
              <h2 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: '900' }}>Cherish Jude</h2>
              <div style={{ fontSize: '0.88rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '12px', fontWeight: '600' }}>
                Founder & Admin • 2024
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.7', color: isDark ? '#f0f0f0' : '#0f172a' }}>
                Mission: To empower students, researchers, and writers with a seamless, intelligent platform for academic and professional writing.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: OUR STORY */}
        <div style={cardStyle}>
          <h2 style={{ color: accentColor, margin: '0 0 16px 0', fontSize: '1.6rem', fontWeight: '800' }}>
            📖 Our Story
          </h2>
          <div style={{ color: isDark ? '#f0f0f0' : '#0f172a', lineHeight: '1.8', fontSize: '0.98rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0 }}>
              WritingChoice was born from a simple yet powerful idea: that everyone deserves access to high-quality writing support, regardless of their background or budget. Founded by Cherish Jude, a passionate researcher and developer, the platform bridges the gap between complex academic demands and everyday users. Cherish witnessed firsthand the struggles of students juggling multiple assignments, the anxiety of meeting deadlines, and the frustration of finding reliable writing assistance. Determined to create a solution, Cherish combined cutting-edge technology with a deep understanding of academic standards to build a one-stop hub that simplifies the writing process from start to finish.
            </p>
            <p style={{ margin: 0 }}>
              What began as a small project has grown into a vibrant community of learners, scholars, and professionals who trust WritingChoice to deliver accurate, plagiarism/AI-free work, 100% human written. The platform is built on three core pillars: quality, affordability, and community. Every tool, from the AI-powered Cherish SI chatbot to the collaborative group chats, is designed to make your writing journey smoother and more enjoyable.
            </p>
          </div>
        </div>

        {/* SECTION 2: WHAT WE OFFER */}
        <div style={cardStyle}>
          <h2 style={{ color: accentColor, margin: '0 0 20px 0', fontSize: '1.6rem', fontWeight: '800' }}>
            🛠️ What We Offer
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '18px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <h4 style={{ color: accentColor, margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>📝 Professional Writing Services</h4>
              <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6', color: isDark ? '#94a3b8' : '#475569' }}>
                From essays and dissertations to programming assignments and research proposals, our team of expert writers delivers top-notch work tailored to your specific requirements. Choose from multiple pricing tiers, each with guaranteed plagiarism checks, Turnitin reports, and free corrections.
              </p>
            </div>

            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '18px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <h4 style={{ color: accentColor, margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>📊 Smart Price Calculator</h4>
              <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6', color: isDark ? '#94a3b8' : '#475569' }}>
                Not sure how much your project will cost? Our interactive calculator lets you select your service, word count, and desired quality level to get an instant quote. No hidden fees, no surprises, just transparent pricing that fits your budget.
              </p>
            </div>

            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '18px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <h4 style={{ color: accentColor, margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>📱 Social Group Chats</h4>
              <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6', color: isDark ? '#94a3b8' : '#475569' }}>
                Writing doesn't have to be a lonely experience. Join topic-based group chats (Art, Science, Entertainment, Friends Zone) to connect with fellow members, share ideas, ask questions, and react to messages. It's a safe, encrypted space to collaborate.
              </p>
            </div>

            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '18px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <h4 style={{ color: accentColor, margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>✍️ Built-in Document Editor</h4>
              <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6', color: isDark ? '#94a3b8' : '#475569' }}>
                Need to draft or polish your work before submission? The integrated document editor offers bold, italic, underline, font size, colour, alignment, and list tools, all accessible from your dashboard. Write directly in the browser, then download your document.
              </p>
            </div>

            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '18px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <h4 style={{ color: accentColor, margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>🤖 Cherish SI – AI Research Assistant</h4>
              <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6', color: isDark ? '#94a3b8' : '#475569' }}>
                Stuck on a tricky concept? Ask Cherish SI, our intelligent chatbot powered by advanced language models. It can explain complex topics, help brainstorm ideas, proofread your writing, and even remember your previous conversations to provide personalised assistance.
              </p>
            </div>

            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '18px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <h4 style={{ color: accentColor, margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>📁 Secure File Vault</h4>
              <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6', color: isDark ? '#94a3b8' : '#475569' }}>
                Upload briefs, drafts, and attachments securely. Your files are stored in a secured Vault on Google Drive and shared only with your assigned writer. Access them anytime from your dashboard.
              </p>
            </div>

            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '18px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <h4 style={{ color: accentColor, margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>👥 Member & Admin Dashboards</h4>
              <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6', color: isDark ? '#94a3b8' : '#475569' }}>
                Registered users get a personalised dashboard where they can update their profile picture, name, theme colour, and view their order history. Admins have a powerful panel to manage members, group messages, and send broadcast emails to all verified users.
              </p>
            </div>

            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '18px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <h4 style={{ color: accentColor, margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>🌙 Dark / Light Mode & Themes</h4>
              <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6', color: isDark ? '#94a3b8' : '#475569' }}>
                Choose between dark and light modes for comfortable reading, and switch between accent colours (cyan, crimson, emerald, purple, amber, mint, silver) to match your style. Your preferences are saved to your profile and synced across devices.
              </p>
            </div>

            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', padding: '18px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <h4 style={{ color: accentColor, margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '800' }}>🔒 Human Verification & Rate Limiting</h4>
              <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6', color: isDark ? '#94a3b8' : '#475569' }}>
                To keep our community safe, we use a custom word-matching challenge during registration. Our backend also limits the number of requests per minute to prevent spam and abuse.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: WHY CHOOSE WRITINGCHOICE */}
        <div style={cardStyle}>
          <h2 style={{ color: accentColor, margin: '0 0 16px 0', fontSize: '1.6rem', fontWeight: '800' }}>
            🌟 Why Choose WritingChoice?
          </h2>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', lineHeight: '1.7' }}>
            <li>Affordable rates starting at ₦30 per word – you only pay for what you need.</li>
            <li>Money-back guarantee if the work is plagiarised above the agreed limit or not delivered on time.</li>
            <li>60% upfront deposit to start, 40% on delivery – fair for both parties.</li>
            <li>Free corrections within one week of submission.</li>
            <li>24/7 WhatsApp support – reach Cherish directly at +2348138842719.</li>
            <li>PWA-ready – install the app on your phone or computer for offline access.</li>
          </ul>
        </div>

        {/* SECTION 4: MEET THE FOUNDER */}
        <div style={{ ...cardStyle, border: `1px solid ${accentColor}` }}>
          <h2 style={{ color: accentColor, margin: '0 0 16px 0', fontSize: '1.6rem', fontWeight: '800' }}>
            👤 Meet the Founder
          </h2>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: '800' }}>Cherish Jude</h3>
          <p style={{ color: isDark ? '#f0f0f0' : '#0f172a', lineHeight: '1.8', fontSize: '0.98rem', margin: 0 }}>
            Cherish Jude is a dedicated researcher, software developer, and academic consultant. With a background in both the humanities and computer science, Cherish brings a unique blend of creativity and technical expertise to every project. Cherish has personally written and reviewed thousands of academic papers, mentored students across multiple disciplines, and built the entire WritingChoice platform from scratch, from the line-by-line code to the user experience design. When not writing code or editing manuscripts, Cherish enjoys exploring new technologies, playing chess, and engaging with the WritingChoice community. Connect on WhatsApp at +2348138842719.
          </p>
        </div>

        {/* FOOTER SLOGAN */}
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
          <h3 style={{ color: accentColor, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.5px' }}>
            WritingChoice – Where Words Come to Life.
          </h3>
          <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '8px' }}>
            © {new Date().getFullYear()} WritingChoice. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  );
}