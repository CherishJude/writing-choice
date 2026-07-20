'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "👋 Hello! I'm Cherish SI, your AI research assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Click outside listener for chatbot & share modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowShareModal(false);
      }
    };

    if (isOpen || showShareModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, showShareModal]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userEmail: user?.email || 'guest'
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openWhatsAppChat = () => {
    window.open('https://wa.me/2348138842719?text=Hello%20Cherish,%20I%20need%20assistance%20with%20my%20academic%20research%20project.', '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'WritingChoice — Academic & Professional Writing Portal',
        text: 'Get 100% human-crafted research, dissertations, essays, and programming projects with Turnitin reports.',
        url: window.location.origin,
      }).catch(() => {});
    } else {
      setShowShareModal(!showShareModal);
    }
  };

  const copyPlatformLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const glassButtonStyle: React.CSSProperties = {
    background: 'rgba(10, 13, 20, 0.85)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    color: '#ffffff',
    borderRadius: '50px',
    padding: '10px 20px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.85rem',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.25s ease',
    width: 'fit-content',
  };

  return (
    <div ref={widgetRef} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9997 }}>
      
      {/* FLOATING ACTION BAR: STACKED IN A STRAIGHT VERTICAL COLUMN DIRECTLY UNDER CHERISH SI */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        
        {/* 1. ASK CHERISH SI AI BOT TOGGLE BUTTON (TOP OF STACK) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'linear-gradient(135deg, #075E54, #128C7E)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 22px',
            fontWeight: '800',
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          Ask Cherish SI
        </button>

        {/* 2. CHAT NOW (WHATSAPP DIRECT CHAT) BUTTON (MIDDLE OF STACK DIRECTLY UNDER CHERISH SI) */}
        <button
          onClick={openWhatsAppChat}
          style={{
            ...glassButtonStyle,
            background: 'rgba(37, 211, 102, 0.22)',
            border: '1px solid #25d366',
            color: '#25d366',
          }}
          title="Chat Now on WhatsApp"
        >
          <span style={{ fontSize: '1rem' }}>💬</span>
          Chat Now
        </button>

        {/* 3. SHARE PLATFORM BUTTON (BOTTOM OF STACK DIRECTLY UNDER CHAT NOW) */}
        <button
          onClick={handleNativeShare}
          style={glassButtonStyle}
          title="Share WritingChoice"
        >
          <span style={{ color: '#00f2fe' }}>🔗</span>
          Share
        </button>

      </div>

      {/* GLASSY SHARE MODAL */}
      {showShareModal && (
        <div style={{
          position: 'absolute',
          bottom: '160px',
          right: '0',
          width: '280px',
          background: 'rgba(10, 13, 20, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '16px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
          zIndex: 9999,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: '#00f2fe', fontWeight: '800', fontSize: '0.88rem' }}>
            <span>🔗 Share WritingChoice</span>
            <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Check out WritingChoice for 100% human academic research & dissertations: ' + window.location.origin)}`, '_blank')}
              style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(37,211,102,0.15)', color: '#25d366', border: '1px solid #25d366', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left' }}
            >
              💬 Share via WhatsApp
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out WritingChoice for academic research: ' + window.location.origin)}`, '_blank')}
              style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(0,242,254,0.15)', color: '#00f2fe', border: '1px solid #00f2fe', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left' }}
            >
              🐦 Share on Twitter / X
            </button>
            <button
              onClick={copyPlatformLink}
              style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left' }}
            >
              📋 {copied ? '✓ Link Copied!' : 'Copy Platform Link'}
            </button>
          </div>
        </div>
      )}

      {/* CHERISH SI AI CHATBOT OVERLAY WINDOW */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '160px',
          right: '0',
          width: '340px',
          maxWidth: '92vw',
          height: '480px',
          maxHeight: '80vh',
          background: 'rgba(10, 13, 20, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
          {/* WhatsApp Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #075E54, #128C7E)',
            color: '#ffffff',
            fontWeight: '800',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#25d366', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#000', fontWeight: '900', fontSize: '0.85rem' }}>
                SI
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.2' }}>Ask Cherish SI</div>
                <div style={{ fontSize: '0.7rem', color: '#98fb98', fontWeight: 'normal' }}>Online • AI Assistant</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '4px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Feed */}
          <div style={{
            flex: 1,
            padding: '14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'rgba(0,0,0,0.2)',
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user'
                    ? '#005c4b'
                    : 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user'
                    ? '14px 14px 0 14px'
                    : '14px 14px 14px 0',
                  maxWidth: '86%',
                  wordBreak: 'break-word',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ fontSize: '0.7rem', color: '#00f2fe', fontWeight: 'bold', marginBottom: '3px' }}>Cherish SI</div>
                )}
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.06)',
                color: '#00f2fe',
                padding: '10px 14px',
                borderRadius: '14px 14px 14px 0',
                maxWidth: '86%',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                ⏳ Generating response...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(10, 13, 20, 0.95)',
            display: 'flex',
            gap: '8px',
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Cherish SI a question..."
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
                borderRadius: '30px',
                outline: 'none',
                fontSize: '0.88rem',
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: '#00a884',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: (loading || !input.trim()) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ➤
            </button>
          </div>

          {/* Rate limit notice */}
          <div style={{
            padding: '4px 12px',
            textAlign: 'center',
            fontSize: '0.68rem',
            color: '#94a3b8',
            background: 'rgba(0,0,0,0.5)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            Limited to 10 messages per minute
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}