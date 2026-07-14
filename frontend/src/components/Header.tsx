"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import ThemeToggle from './ThemeToggle';

export default function Header({ user, title, actionButton }: { user: any, title: string, actionButton?: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div className="header-title-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <button 
          className="mobile-menu-btn" 
          onClick={toggleSidebar}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem', display: 'none' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {title}
        </h2>
      </div>
      
      {mounted && time && (
        <div className="header-time" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
            {formatTime(time)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginTop: '0.2rem' }}>
            {formatDate(time)}
          </div>
        </div>
      )}
      {!mounted && <div style={{ flex: 1 }}></div>}
      
      <div className="header-actions-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2rem' }}>
        {actionButton}
        
        <div className="header-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '2rem', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="user-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)', border: '2px solid rgba(255,255,255,0.1)' }}>
            {getInitials(user?.name)}
          </div>
          
          <div className="header-user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div data-testid="header-user-name" style={{ fontSize: '0.9rem', fontWeight: 600, maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }} title={user?.name}>
              {user?.name || 'Loading...'}
            </div>
            <div data-testid="header-user-role" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: '0.1rem' }}>
              {user?.role?.replace('_', ' ') || 'GUEST'}
            </div>
          </div>
          
          <ThemeToggle />
          
          <button data-testid="header-logout" onClick={handleLogout} className="btn-secondary logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'transparent', height: '36px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
