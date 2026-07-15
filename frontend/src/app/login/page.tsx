"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setAlreadyLoggedIn(true);
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        // invalid user data
      }
    }
  }, []);

  const handleGoToDashboard = () => {
    if (!currentUser) return;
    if (currentUser.role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else if (currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'TEAM_LEADER') {
      router.push('/dashboard/pm');
    } else if (currentUser.role === 'PROJECT_SPONSOR') {
      router.push('/dashboard/sponsor');
    } else {
      router.push('/dashboard/member');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAlreadyLoggedIn(false);
    setCurrentUser(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and redirect based on role
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (data.user.role === 'PROJECT_MANAGER' || data.user.role === 'TEAM_LEADER') {
        router.push('/dashboard/pm');
      } else if (data.user.role === 'PROJECT_SPONSOR') {
        router.push('/dashboard/sponsor');
      } else {
        router.push('/dashboard/member');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (alreadyLoggedIn) {
    return (
      <div className="flex-center">
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h1 className="title">CyphLab</h1>
          <div style={{ margin: '2rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            You are already logged in as <strong style={{ color: 'var(--accent-primary)' }}>{currentUser?.name || 'User'}</strong>.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button data-testid="login-go-to-dashboard" onClick={handleGoToDashboard} className="btn-primary w-full" style={{ padding: '0.75rem', borderRadius: '10px' }}>
              Go to Dashboard
            </button>
            <button data-testid="login-logout" onClick={handleLogout} className="btn-secondary w-full" style={{ padding: '0.75rem', borderRadius: '10px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center">
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center">
          <h1 className="title">CyphLab</h1>
          <p className="subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              data-testid="login-email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Password</label>
              <a href="/forgot-password" data-testid="login-forgot-password" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                data-testid="login-password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                data-testid="login-show-password"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.2rem'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" data-testid="login-submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
          Don't have an account? <a href="/register" data-testid="login-register" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>Register</a>
        </div>
      </div>
    </div>
  );
}
