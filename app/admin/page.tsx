'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'super_admin' | 'moderator' | 'member'>('member');
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Broadcast state (Super Admin only)
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState('');

  const router = useRouter();

  // Theme States
  const [isDark, setIsDark] = useState(true);
  const [accentColor, setAccentColor] = useState('#00f2fe');

  const [dynamicTrends, setDynamicTrends] = useState<any[]>([]);

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

    // Fetch dynamic trends from API
    fetch('/api/trends/notify')
      .then(res => res.json())
      .then(data => {
        if (data.trends) setDynamicTrends(data.trends);
      })
      .catch(err => console.warn('Dynamic trends error:', err));
  }, []);

  const loadData = async () => {
    const { data: userData } = await supabase.from('members').select('*');
    const { data: msgData } = await supabase.from('group_messages').select('*').order('timestamp', { ascending: false });
    const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (userData) setUsers(userData);
    if (msgData) setMessages(msgData);
    if (orderData) setOrders(orderData);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setCurrentUser(user);

      // Super Admin check (judecherish23@gmail.com ONLY)
      if (user.email === 'judecherish23@gmail.com') {
        setUserRole('super_admin');
        await loadData();
        setLoading(false);
        return;
      }

      // Check if user is a Moderator
      const { data: member } = await supabase.from('members').select('role').eq('email', user.email).single();
      if (member && member.role === 'moderator') {
        setUserRole('moderator');
        await loadData();
        setLoading(false);
      } else {
        // Not authorized for admin console
        router.push('/dashboard');
      }
    };
    init();
  }, [router]);

  // Super Admin: Promote to Moderator or Demote to Member
  const toggleModeratorRole = async (email: string, currentRole: string) => {
    if (currentUser?.email !== 'judecherish23@gmail.com') {
      alert('Only Super Admin (judecherish23@gmail.com) can manage moderator roles!');
      return;
    }

    if (email === 'judecherish23@gmail.com') {
      alert('Super Admin role cannot be modified.');
      return;
    }

    const newRole = currentRole === 'moderator' ? 'member' : 'moderator';
    const { error } = await supabase.from('members').update({ role: newRole }).eq('email', email);
    if (error) {
      alert('Error updating role: ' + error.message);
    } else {
      await loadData();
    }
  };

  const deleteUser = async (email: string) => {
    if (currentUser?.email !== 'judecherish23@gmail.com') {
      alert('Only Super Admin can delete members.');
      return;
    }
    if (email === 'judecherish23@gmail.com') {
      alert('Super Admin account cannot be deleted!');
      return;
    }
    if (!confirm(`Delete user ${email}?`)) return;
    await supabase.from('members').delete().eq('email', email);
    await loadData();
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Delete message from group chat?')) return;
    await supabase.from('group_messages').delete().eq('id', id);
    await loadData();
  };

  const sendBroadcast = async () => {
    if (currentUser?.email !== 'judecherish23@gmail.com') {
      alert('Only Super Admin can send platform broadcasts.');
      return;
    }
    if (!broadcastSubject || !broadcastMessage) {
      alert('Please fill in both subject and message fields.');
      return;
    }
    setBroadcastStatus('Sending announcement...');
    try {
      let res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: broadcastSubject, message: broadcastMessage }),
      });

      if (!res.ok) {
        // Fallback to trends endpoint if needed
        res = await fetch('/api/trends/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: broadcastSubject, message: broadcastMessage, trendTopic: 'Broadcast Announcement' }),
        });
      }

      const data = await res.json();
      setBroadcastStatus(data.success ? `✅ Broadcast sent to ${data.count || data.recipientCount || 1} members!` : `❌ Error: ${data.error}`);
    } catch (err: any) {
      setBroadcastStatus('❌ Error sending broadcast update. Please try again.');
    }
  };

  const cardStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.06)',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: isDark ? '#0a0d14' : '#f8fafc', color: accentColor, fontWeight: '800' }}>
        🔐 Authenticating Admin Authority...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0a0d14' : '#f8fafc',
      color: isDark ? '#f0f0f0' : '#0f172a',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Link href="/dashboard">
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
              ← Back to Member Dashboard
            </button>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '6px 16px',
              borderRadius: '30px',
              fontSize: '0.8rem',
              fontWeight: '900',
              background: userRole === 'super_admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 242, 254, 0.15)',
              border: userRole === 'super_admin' ? '1px solid #ef4444' : `1px solid ${accentColor}`,
              color: userRole === 'super_admin' ? '#ef4444' : accentColor,
            }}>
              {userRole === 'super_admin' ? '👑 Super Admin Console' : '🛡️ Moderator Console'}
            </span>
          </div>
        </div>

        {/* Console Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 8px 0' }}>
            {userRole === 'super_admin' ? 'Super Admin Command Console' : 'Moderator Management Center'}
          </h1>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b', margin: 0, fontSize: '0.95rem' }}>
            Logged in as <strong style={{ color: accentColor }}>{currentUser?.email}</strong> • Superior Authority Level: <strong>{userRole === 'super_admin' ? 'Super Admin (Exclusive)' : 'Moderator'}</strong>
          </p>
        </div>

        {/* SENSITIVE METRICS & REVENUE CARDS (SUPER ADMIN EXCLUSIVE) */}
        {userRole === 'super_admin' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '0.8rem', color: accentColor, fontWeight: '800', textTransform: 'uppercase' }}>Total Registered Members</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', margin: '6px 0' }}>{users.length}</div>
              <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>Platform database accounts</div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '0.8rem', color: '#25d366', fontWeight: '800', textTransform: 'uppercase' }}>Active Moderators</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', margin: '6px 0', color: '#25d366' }}>
                {users.filter(u => u.role === 'moderator').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>Appointed moderation staff</div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '0.8rem', color: '#ffbf00', fontWeight: '800', textTransform: 'uppercase' }}>Total Orders Processed</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', margin: '6px 0', color: '#ffbf00' }}>
                {orders.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>Turnitin research contracts</div>
            </div>
          </div>
        )}

        {/* SECTION 1: MEMBER & MODERATOR MANAGEMENT (SUPER ADMIN EXCLUSIVE CONTROLS) */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: isDark ? '#fff' : '#0f172a' }}>
              👥 User Accounts & Moderator Roles
            </h2>
            {userRole === 'super_admin' && (
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '800' }}>
                🔒 Super Admin Authority
              </span>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, color: accentColor }}>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Joined Date</th>
                  {userRole === 'super_admin' && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u.email} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                    <td style={{ padding: '12px', fontWeight: '700' }}>
                      {u.email} {u.email === 'judecherish23@gmail.com' && <span style={{ color: '#ef4444' }}>(Super Admin)</span>}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        background: u.email === 'judecherish23@gmail.com'
                          ? 'rgba(239,68,68,0.2)'
                          : u.role === 'moderator'
                            ? 'rgba(37,211,102,0.2)'
                            : 'rgba(255,255,255,0.08)',
                        color: u.email === 'judecherish23@gmail.com'
                          ? '#ef4444'
                          : u.role === 'moderator'
                            ? '#25d366'
                            : isDark ? '#94a3b8' : '#64748b',
                      }}>
                        {u.email === 'judecherish23@gmail.com' ? 'Super Admin' : u.role === 'moderator' ? 'Moderator' : 'Member'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* SUPER ADMIN EXCLUSIVE ROLE PROMOTION / DEMOTION BUTTONS */}
                    {userRole === 'super_admin' && (
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {u.email !== 'judecherish23@gmail.com' && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => toggleModeratorRole(u.email, u.role)}
                              style={{
                                background: u.role === 'moderator' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 211, 102, 0.15)',
                                color: u.role === 'moderator' ? '#ef4444' : '#25d366',
                                border: u.role === 'moderator' ? '1px solid #ef4444' : '1px solid #25d366',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                              }}
                            >
                              {u.role === 'moderator' ? 'Demote to Member' : 'Make Moderator'}
                            </button>

                            <button
                              onClick={() => deleteUser(u.email)}
                              style={{
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: CHAT MODERATION (ACCESSIBLE TO SUPER ADMIN & MODERATORS) */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: isDark ? '#fff' : '#0f172a' }}>
              💬 Group Chat Moderation Feed
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#25d366', fontWeight: '800' }}>
              Moderator & Admin Tool
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                padding: '14px',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: accentColor, fontWeight: '800' }}>
                    {msg.sender_email} • <span style={{ color: '#ffbf00' }}>#{msg.group_name || 'General'}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', margin: '4px 0', color: isDark ? '#fff' : '#000' }}>{msg.content}</div>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>{new Date(msg.timestamp).toLocaleString()}</div>
                </div>

                <button
                  onClick={() => deleteMessage(msg.id)}
                  style={{
                    background: 'rgba(239,68,68,0.2)',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    padding: '6px 12px',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  Delete Message
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: EMAIL BROADCAST SYSTEM (SUPER ADMIN EXCLUSIVE) */}
        {userRole === 'super_admin' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: isDark ? '#fff' : '#0f172a' }}>
                📢 Platform Email Broadcast
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '800' }}>
                🔒 Super Admin Only
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                placeholder="Broadcast Subject Header..."
                style={{
                  padding: '12px',
                  background: isDark ? '#000' : '#fff',
                  border: `1px solid ${accentColor}`,
                  color: isDark ? '#fff' : '#000',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type platform announcement or system update..."
                rows={4}
                style={{
                  padding: '12px',
                  background: isDark ? '#000' : '#fff',
                  border: `1px solid ${accentColor}`,
                  color: isDark ? '#fff' : '#000',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
              <button
                onClick={sendBroadcast}
                style={{
                  padding: '12px 24px',
                  borderRadius: '30px',
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                  color: '#000',
                  border: 'none',
                  fontWeight: '900',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                Send Broadcast Announcement →
              </button>

              {broadcastStatus && (
                <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: '700' }}>{broadcastStatus}</div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: AUTOMATED ADAPTIVE TREND EMAIL PUSH SYSTEM */}
        {(userRole === 'super_admin' || userRole === 'moderator') && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: isDark ? '#fff' : '#0f172a' }}>
                🔥 Adaptive Real-Time Trend Email Push
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/trends/notify');
                    const data = await res.json();
                    if (data.trends) setDynamicTrends(data.trends);
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(0, 242, 254, 0.15)',
                    color: accentColor,
                    border: `1px solid ${accentColor}`,
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  🔄 Refresh Live Trends
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/trends/notify?action=generate');
                    const data = await res.json();
                    if (data.trend) {
                      setDynamicTrends(prev => [data.trend, ...prev]);
                      setBroadcastSubject(data.trend.subject);
                      setBroadcastMessage(data.trend.message);
                    }
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(37,211,102,0.15)',
                    color: '#25d366',
                    border: '1px solid #25d366',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Auto-Generate New Trend
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '16px' }}>
              Send automated trend email push notifications to all registered members. Live trends dynamically update based on current breaking global events (sports, academic deadlines, AI research updates).
            </p>

            {/* Dynamic Real-Time Trend Preset Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {dynamicTrends.length > 0 ? (
                dynamicTrends.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setBroadcastSubject(t.subject);
                      setBroadcastMessage(t.message);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      background: 'rgba(0, 242, 254, 0.12)',
                      color: accentColor,
                      border: `1px solid ${accentColor}`,
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    {t.topic}
                  </button>
                ))
              ) : (
                <>
                  <button
                    onClick={() => {
                      setBroadcastSubject('⚽ Live Global Sports & World Cup Alert!');
                      setBroadcastMessage('The World Cup Finals are happening live! Enjoy 20% off all essay and dissertation orders today so you can watch the game stress-free while Cherish Jude handles your academic writing.');
                    }}
                    style={{ padding: '8px 14px', borderRadius: '20px', background: 'rgba(37,211,102,0.15)', color: '#25d366', border: '1px solid #25d366', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    ⚽ World Cup Finals
                  </button>
                </>
              )}
            </div>

            <button
              onClick={async () => {
                if (!broadcastSubject || !broadcastMessage) {
                  alert('Please select a trend preset or fill in the subject and message above.');
                  return;
                }
                setBroadcastStatus('Pushing trend notification...');
                try {
                  const res = await fetch('/api/trends/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      subject: broadcastSubject,
                      message: broadcastMessage,
                      trendTopic: 'Global Trend Alert'
                    })
                  });
                  const data = await res.json();
                  setBroadcastStatus(data.success ? `✅ Push Sent: ${data.message} (${data.recipientCount} members notified!)` : `❌ ${data.error}`);
                } catch (err) {
                  setBroadcastStatus('❌ Error triggering trend push');
                }
              }}
              style={{
                padding: '12px 26px',
                borderRadius: '30px',
                background: '#25d366',
                color: '#fff',
                border: 'none',
                fontWeight: '900',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
              }}
            >
              🚀 Push Automatic Trend Email to All Members →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}