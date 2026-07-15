"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to request password reset');
      }

      setSuccess(true);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-center">
        <div className="glass-card" style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--status-done)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h1 className="title">Check your email</h1>
          <p className="subtitle" style={{ marginBottom: '2rem' }}>
            If an account exists with that email address, we've sent a password reset link. Please check your inbox and spam folder.
          </p>
          
          {resetToken && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '2rem', wordBreak: 'break-all', textAlign: 'left' }}>
              <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>⚠️ DEVELOPMENT MODE FALLBACK:</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Email could not be sent because EMAIL_USER and EMAIL_PASS are not configured in the backend .env file. Use this link instead:</p>
              <a href={`/reset-password?token=${resetToken}`} style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                {`http://localhost:3000/reset-password?token=${resetToken}`}
              </a>
            </div>
          )}

          <button data-testid="forgot-back-to-login" onClick={() => router.push('/login')} className="btn-secondary w-full">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center">
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center">
          <h1 className="title">CyphLab</h1>
          <p className="subtitle">Reset your password</p>
        </div>

        {error && (
          <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleForgotPassword}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              data-testid="forgot-email"
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" data-testid="forgot-submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <a href="/login" data-testid="forgot-login-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
