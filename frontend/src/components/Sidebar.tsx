"use client";

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar({ role }: { role: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  const handleNavigation = (path: string) => {
    router.push(path);
    closeSidebar();
  };

  const isActive = (path: string) => pathname === path ? 'active' : '';

  return (
    <>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))' }}>
          <defs>
            <linearGradient id="taskflow-logo-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="taskflow-logo-bg-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          <rect x="2" y="3" width="14" height="14" rx="4" fill="url(#taskflow-logo-bg-sidebar)" stroke="url(#taskflow-logo-sidebar)" strokeWidth="2"/>
          <rect x="8" y="8" width="14" height="14" rx="4" fill="url(#taskflow-logo-sidebar)" stroke="none"/>
          <path d="M12 15l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="logo-text" style={{ fontSize: '1.4rem', letterSpacing: '-0.03em' }}>TaskFlow</span>
      </div>
      
      <div className="sidebar-nav">
        {role === 'ADMIN' && (
          <div data-testid="nav-admin" className={`sidebar-item ${isActive('/dashboard/admin')}`} onClick={() => handleNavigation('/dashboard/admin')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Users
          </div>
        )}
        
        <div data-testid="nav-pm" className={`sidebar-item ${isActive('/dashboard/pm')}`} onClick={() => handleNavigation('/dashboard/pm')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
          Project Dashboard
        </div>

        {(role === 'ADMIN' || role === 'PROJECT_SPONSOR') && (
          <div data-testid="nav-sponsor" className={`sidebar-item ${isActive('/dashboard/sponsor')}`} onClick={() => handleNavigation('/dashboard/sponsor')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
            Overview
          </div>
        )}
        
        <div data-testid="nav-member" className={`sidebar-item ${isActive('/dashboard/member')}`} onClick={() => handleNavigation('/dashboard/member')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          {role === 'PROJECT_SPONSOR' ? 'Assigned Tasks' : 'My Tasks'}
        </div>
      </div>
      </div>
    </>
  );
}
