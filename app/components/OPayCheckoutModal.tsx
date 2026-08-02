import { useState } from 'react';

interface OPayCheckoutModalProps {
  finalPrice: number;
  wordCount: number;
  tierName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function OPayCheckoutModal({ finalPrice, wordCount, tierName, onClose, onConfirm }: OPayCheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    onConfirm();
    setIsSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-primary, #0a0d14)',
        border: '1px solid var(--accent-color, #00f2fe)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '450px',
        padding: '32px',
        color: '#fff',
        boxShadow: '0 12px 40px rgba(0,242,254,0.15)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(0,242,254,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '2rem'
        }}>
          💳
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Secure Checkout</h2>
        <p style={{ color: 'var(--text-secondary, #94a3b8)', marginBottom: '24px', fontSize: '0.95rem' }}>
          You are ordering <strong>{wordCount.toLocaleString()} words</strong> ({tierName}). 
        </p>

        <div style={{
          background: 'var(--surface-card, rgba(255,255,255,0.05))',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px dashed var(--accent-color, #00f2fe)'
        }}>
          <div style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '4px' }}>Amount to Transfer:</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-color, #00f2fe)', marginBottom: '16px' }}>
            ₦{finalPrice.toLocaleString()}
          </div>
          
          <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Bank:</span>
              <span style={{ fontWeight: '700' }}>OPay</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Account Name:</span>
              <span style={{ fontWeight: '700' }}>Cherish Jude Uzoma</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Account Number:</span>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#fff' }}>[PENDING]</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '16px',
            background: isSubmitting ? 'var(--accent-color-muted, #00f2fe88)' : 'var(--accent-color, #00f2fe)',
            color: '#000',
            fontWeight: '800',
            fontSize: '1.05rem',
            border: 'none',
            borderRadius: '14px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
            transition: 'transform 0.2s, background 0.2s',
          }}
        >
          {isSubmitting ? 'Processing...' : 'I Have Transferred ₦' + finalPrice.toLocaleString()}
        </button>

        <button
          onClick={onClose}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: 'var(--text-secondary, #94a3b8)',
            fontWeight: '600',
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Cancel Order
        </button>
      </div>
    </div>
  );
}
