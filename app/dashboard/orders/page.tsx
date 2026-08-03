'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingOrderId, setUploadingOrderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, orderId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOrderId(orderId);
    
    // Upload to Supabase Storage 'orders' bucket
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('orders')
      .upload(fileName, file);

    if (uploadError) {
      alert('Upload failed. Please ensure the "orders" storage bucket exists in Supabase.');
      setUploadingOrderId(null);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('orders')
      .getPublicUrl(fileName);

    // Update order with file URL
    await supabase
      .from('orders')
      .update({ brief_file_url: publicUrl })
      .eq('id', orderId);

    // Refresh orders
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });
      if (data) setOrders(data);
    }
    
    setUploadingOrderId(null);
    alert('File uploaded successfully!');
  };

  if (loading) return <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>Loading Orders...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #0a0d14)',
      color: 'var(--text-primary, #f0f0f0)',
      padding: '40px 20px',
      fontFamily: '"Segoe UI", system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'transparent',
            border: '1px solid var(--accent-color, #00f2fe)',
            color: 'var(--accent-color, #00f2fe)',
            padding: '8px 18px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
            marginBottom: '20px',
          }}
        >
          ← Back to Home
        </button>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', color: 'var(--accent-color, #00f2fe)' }}>
          📦 My Orders
        </h1>
        <p style={{ color: 'var(--text-secondary, #94a3b8)', marginBottom: '30px' }}>
          Track your orders and upload necessary documents.
        </p>

        {orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
            <p>You have no active orders.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{
                background: 'var(--surface-card, rgba(255,255,255,0.04))',
                border: '1px solid var(--surface-border, rgba(255,255,255,0.08))',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: '800' }}>
                      {order.service} ({order.word_count} words)
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                      Tier: <strong style={{ color: '#fff' }}>{order.tier}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-color, #00f2fe)' }}>
                      ₦{order.price?.toLocaleString()}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: order.status === 'pending_verification' ? 'rgba(255, 191, 0, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                      color: order.status === 'pending_verification' ? '#ffbf00' : '#00f2fe',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      marginTop: '4px'
                    }}>
                      {order.status === 'pending_verification' ? 'Pending Payment' : order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '12px 0' }} />

                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem' }}>Instruction Documents / Rubrics</h4>
                  {order.brief_file_url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.brief_file_url.split(',').map((url: string, idx: number) => (
                        <a key={idx} href={url.trim()} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-block', padding: '8px 16px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600'
                        }}>
                          📄 View Uploaded Document {order.brief_file_url.split(',').length > 1 ? idx + 1 : ''}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="file" 
                        id={`file-${order.id}`} 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleFileUpload(e, order.id)}
                        disabled={uploadingOrderId === order.id}
                      />
                      <label htmlFor={`file-${order.id}`} style={{
                        display: 'inline-block', padding: '8px 16px', border: '1px dashed var(--accent-color, #00f2fe)', color: 'var(--accent-color, #00f2fe)', borderRadius: '8px', cursor: uploadingOrderId === order.id ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'background 0.2s'
                      }}>
                        {uploadingOrderId === order.id ? 'Uploading...' : '📁 Upload File (PDF/Word)'}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
