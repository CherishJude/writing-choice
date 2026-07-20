'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('General');
  const [reactions, setReactions] = useState<any[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const groups = [
    { name: 'General', icon: '💬', desc: 'Platform wide discussions & announcements' },
    { name: 'Art', icon: '🎨', desc: 'Humanities, design, writing & literature' },
    { name: 'Science', icon: '🔬', desc: 'STEM, research, statistics & analysis' },
    { name: 'Entertainment', icon: '🎬', desc: 'Pop culture, sports, games & trends' },
    { name: 'Friends Zone', icon: '🤝', desc: 'Casual chats, lounge & networking' }
  ];

  const emojis = ['👍', '❤️', '🔥', '😂', '😮', '👏', '💯', '🤝', '🎉', '🚀'];

  // Theme States
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const { data: msgData } = await supabase
          .from('group_messages')
          .select('*')
          .eq('group_name', group)
          .order('timestamp', { ascending: true });

        if (msgData) setMessages(msgData);

        const { data: reactData } = await supabase
          .from('chat_reactions')
          .select('*');

        if (reactData) setReactions(reactData);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();

    const msgChannel = supabase
      .channel(`group_messages_${group}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_name=eq.${group}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    const reactChannel = supabase
      .channel('chat_reactions_all')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_reactions'
      }, (payload) => {
        setReactions(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(reactChannel);
    };
  }, [user, group]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      setAttachmentUrl(URL.createObjectURL(file));
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachmentName) || !user) return;

    let finalMsg = newMessage.trim();
    if (attachmentName) {
      finalMsg += `\n📎 Attachment: ${attachmentName}`;
    }

    const { error } = await supabase.from('group_messages').insert([{
      group_name: group,
      user_name: user.email,
      message: finalMsg
    }]);

    if (!error) {
      setNewMessage('');
      setAttachmentName('');
      setAttachmentUrl('');
    }
  };

  const addReaction = async (messageId: number, reaction: string) => {
    if (!user) return;

    const { error } = await supabase.from('chat_reactions').insert([{
      message_id: messageId,
      user_name: user.email,
      reaction: reaction
    }]);

    if (!error) setShowReactionPicker(null);
  };

  const getReactionsForMessage = (messageId: number) => {
    const msgReactions = reactions.filter(r => r.message_id === messageId);
    const counts: { [key: string]: number } = {};
    msgReactions.forEach(r => {
      counts[r.reaction] = (counts[r.reaction] || 0) + 1;
    });
    return counts;
  };

  const filteredMessages = messages.filter(m =>
    m.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentGroupInfo = groups.find(g => g.name === group) || groups[0];

  const cardBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark ? '#0a0d14' : '#f8fafc',
        color: accentColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Segoe UI", sans-serif',
        fontWeight: '800'
      }}>
        ⚡ Loading 2026 Group Chat Channels...
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      background: isDark ? '#0a0d14' : '#f8fafc',
      color: isDark ? '#f8fafc' : '#0f172a',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      
      {/* 2026 MODERN TOP NAVIGATION HEADER */}
      <header style={{
        background: isDark ? 'rgba(10, 13, 20, 0.85)' : 'rgba(248, 250, 252, 0.85)',
        backdropFilter: 'blur(20px)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${borderColor}`,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              border: `1px solid ${accentColor}`,
              color: accentColor,
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '30px',
            }}
          >
            ← Home
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>{currentGroupInfo.icon}</span>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1rem', color: isDark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {currentGroupInfo.icon} {currentGroupInfo.name}
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25d366' }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>{currentGroupInfo.desc}</div>
            </div>
          </div>
        </div>

        {/* Real-time Search Messages Input */}
        <div style={{ position: 'relative', maxWidth: '220px', width: '100%' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search channel..."
            style={{
              width: '100%',
              padding: '6px 12px',
              background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${borderColor}`,
              color: isDark ? '#fff' : '#000',
              borderRadius: '20px',
              fontSize: '0.78rem',
              outline: 'none',
            }}
          />
        </div>
      </header>

      {/* MOBILE HORIZONTAL GROUP SELECTION CHANNEL STRIP */}
      <div className="mobile-channel-strip" style={{
        display: 'flex',
        gap: '8px',
        padding: '10px 16px',
        background: cardBg,
        borderBottom: `1px solid ${borderColor}`,
        overflowX: 'auto',
      }}>
        {groups.map((g) => (
          <button
            key={g.name}
            onClick={() => setGroup(g.name)}
            style={{
              background: group === g.name ? accentColor : 'transparent',
              color: group === g.name ? '#000' : isDark ? '#fff' : '#000',
              border: group === g.name ? 'none' : `1px solid ${borderColor}`,
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: group === g.name ? `0 4px 15px ${accentColor}44` : 'none',
            }}
          >
            <span>{g.icon}</span> {g.name}
          </button>
        ))}
      </div>

      {/* MAIN CHAT WORKSPACE */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* DESKTOP SIDEBAR CHANNEL LIST */}
        <div className="desktop-chat-sidebar" style={{
          width: '260px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderRight: `1px solid ${borderColor}`,
          padding: '16px',
          overflowY: 'auto',
          background: cardBg,
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: accentColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            👥 Group Channels
          </div>
          {groups.map((g) => (
            <button
              key={g.name}
              onClick={() => setGroup(g.name)}
              style={{
                background: group === g.name ? accentColor : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                color: group === g.name ? '#000' : isDark ? '#f8fafc' : '#0f172a',
                border: group === g.name ? `2px solid ${accentColor}` : `1px solid ${borderColor}`,
                padding: '12px 14px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: '800',
                textAlign: 'left',
                fontSize: '0.88rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{g.icon}</span>
              <div style={{ flex: 1 }}>
                <div>{g.name}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.75, fontWeight: 'normal' }}>{g.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* MESSAGES FEED & INPUT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)' }}>
          
          {/* MESSAGES STREAM */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b', margin: 'auto 0', fontSize: '0.9rem' }}>
                💬 Welcome to <strong>#{group}</strong>! Be the first to start the conversation.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isOwn = msg.user_name === user?.email;
                const isSuperAdmin = msg.user_name === 'judecherish23@gmail.com';
                const reactionCounts = getReactionsForMessage(msg.id);
                const senderName = isSuperAdmin ? 'Admin (Cherish Jude)' : (msg.user_name?.split('@')[0] || 'User');
                const initial = isSuperAdmin ? '👑' : senderName.charAt(0).toUpperCase();

                return (
                  <div key={msg.id} style={{
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                    gap: '4px',
                  }}>
                    
                    {/* Message Bubble Container */}
                    <div style={{ display: 'flex', gap: '10px', flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                      
                      {/* User Avatar */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isSuperAdmin ? '#ef4444' : isOwn ? accentColor : 'rgba(255,255,255,0.1)',
                        color: isOwn || isSuperAdmin ? '#000' : '#fff',
                        fontWeight: '900',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: `1px solid ${isSuperAdmin ? '#ef4444' : accentColor}`,
                      }}>
                        {initial}
                      </div>

                      {/* Content Box */}
                      <div style={{
                        background: isOwn
                          ? `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`
                          : isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                        color: isOwn ? '#000' : isDark ? '#fff' : '#0f172a',
                        padding: '12px 16px',
                        borderRadius: '20px',
                        borderBottomRightRadius: isOwn ? '4px' : '20px',
                        borderBottomLeftRadius: isOwn ? '20px' : '4px',
                        border: isOwn ? 'none' : `1px solid ${borderColor}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        position: 'relative',
                      }}>
                        {!isOwn && (
                          <div style={{ color: isSuperAdmin ? '#ef4444' : accentColor, fontSize: '0.75rem', fontWeight: '800', marginBottom: '4px' }}>
                            {senderName}
                          </div>
                        )}

                        <div style={{ fontSize: '0.92rem', lineHeight: '1.5', wordBreak: 'break-word', fontWeight: isOwn ? '600' : 'normal' }}>
                          {msg.message}
                        </div>

                        {/* Timestamp & Reaction Launcher */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '12px' }}>
                          <span style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 'bold' }}>
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                          
                          <button
                            onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8 }}
                            title="Add Reaction"
                          >
                            +😀
                          </button>
                        </div>

                        {/* Reaction Picker Popup */}
                        {showReactionPicker === msg.id && (
                          <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            right: isOwn ? 0 : 'auto',
                            left: isOwn ? 'auto' : 0,
                            background: isDark ? 'rgba(10,13,20,0.95)' : '#fff',
                            border: `1px solid ${accentColor}`,
                            borderRadius: '30px',
                            padding: '6px 10px',
                            display: 'flex',
                            gap: '6px',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                            zIndex: 100,
                          }}>
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(msg.id, emoji)}
                                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', transition: 'transform 0.15s' }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Displayed Emoji Reactions Badge Bar */}
                    {Object.keys(reactionCounts).length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px', marginLeft: isOwn ? 0 : '42px' }}>
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <span key={emoji} style={{
                            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                          }}>
                            {emoji} {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ATTACHMENT PREVIEW BADGE */}
          {attachmentName && (
            <div style={{ padding: '8px 16px', background: 'rgba(37,211,102,0.15)', borderTop: '1px solid #25d366', color: '#25d366', fontWeight: '800', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📎 Ready to Attach: {attachmentName}</span>
              <button onClick={() => setAttachmentName('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '900' }}>✕</button>
            </div>
          )}

          {/* 2026 MODERN GLASS INPUT CONTROL BAR */}
          <div style={{
            padding: '14px 18px',
            background: isDark ? 'rgba(10, 13, 20, 0.95)' : 'rgba(248, 250, 252, 0.95)',
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            
            {/* File Attachment Button */}
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                onChange={handleFileUpload}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <button style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${borderColor}`,
                color: isDark ? '#fff' : '#000',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}>
                📎
              </button>
            </div>

            {/* Text Input */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Message #${group}...`}
              style={{
                flex: 1,
                padding: '12px 18px',
                background: isDark ? 'rgba(0,0,0,0.4)' : '#ffffff',
                border: `1px solid ${borderColor}`,
                color: isDark ? '#ffffff' : '#0f172a',
                borderRadius: '30px',
                outline: 'none',
                fontSize: '0.92rem',
              }}
            />

            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() && !attachmentName}
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                color: '#000',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                fontWeight: '900',
                fontSize: '1.1rem',
                cursor: (!newMessage.trim() && !attachmentName) ? 'not-allowed' : 'pointer',
                opacity: (!newMessage.trim() && !attachmentName) ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 15px ${accentColor}44`,
              }}
            >
              ➤
            </button>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-chat-sidebar { display: none !important; }
          .mobile-channel-strip { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-channel-strip { display: none !important; }
        }
      `}</style>

    </div>
  );
}