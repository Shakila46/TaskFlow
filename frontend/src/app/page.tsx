import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      
      {/* Navigation */}
      <nav className="landing-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 2rem', border: '1px solid var(--border-color)', background: 'var(--bg-sidebar)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '1200px', borderRadius: '100px', zIndex: 100, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}>
        {/* Left: Logo */}
        <div style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em', flex: 1 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))' }}>
            <defs>
              <linearGradient id="taskflow-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="taskflow-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
            <rect x="2" y="3" width="14" height="14" rx="4" fill="url(#taskflow-logo-bg)" stroke="url(#taskflow-logo)" strokeWidth="2"/>
            <rect x="8" y="8" width="14" height="14" rx="4" fill="url(#taskflow-logo)" stroke="none"/>
            <path d="M12 15l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          TaskFlow
        </div>
        
        {/* Middle: Links */}
        <div className="landing-nav-links" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <a href="#features" className="nav-link" style={{ fontSize: '0.95rem' }}>Features</a>
          <a href="#" className="nav-link" style={{ fontSize: '0.95rem' }}>Solutions</a>
          <a href="#" className="nav-link" style={{ fontSize: '0.95rem' }}>Pricing</a>
        </div>

        {/* Right: Auth */}
        <div className="landing-auth-container" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <ThemeToggle />
          <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.95rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Log in</Link>
          <Link href="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>Sign up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ 
        padding: '10rem 5% 6rem', 
        textAlign: 'center', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '80%', background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '2rem', letterSpacing: '0.05em' }}>
          🚀 THE FUTURE OF PROJECT MANAGEMENT
        </div>

        <h1 style={{ fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 1.5rem', lineHeight: 1.1, maxWidth: '900px' }}>
          Manage Projects with <br/> 
          <span className="text-gradient-shimmer">Absolute Clarity.</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
          TaskFlow is the enterprise-grade project management platform that brings Gantt charts, Kanban boards, and deep role-based access control into one breathtaking workspace.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link href="/register" className="btn-primary pulse-btn" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '14px', fontWeight: 600 }}>Get Started for Free</Link>
          <a href="#features" className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Explore Features</a>
        </div>
      </header>

      {/* High-Fidelity Mock UI Showcase */}
      <section style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div className="floating-mockup" style={{ 
          width: '100%', 
          maxWidth: '1200px', 
          background: 'rgba(10, 10, 15, 0.7)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '24px', 
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), 0 0 40px rgba(59, 130, 246, 0.15)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '600px'
        }}>
          {/* Mock Mac Header */}
          <div style={{ height: '50px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
            <div style={{ flex: 1 }}></div>
            <div style={{ height: '24px', width: '250px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
            <div style={{ flex: 1 }}></div>
          </div>
          
          {/* Mock Body */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{ width: '240px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '2rem 1rem', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
                 <div style={{ width: '24px', height: '24px', background: 'var(--accent-primary)', borderRadius: '6px', boxShadow: '0 0 10px var(--accent-glow)' }}></div>
                 <div style={{ height: '16px', width: '100px', background: 'rgba(255,255,255,0.8)', borderRadius: '4px' }}></div>
              </div>
              <div style={{ height: '36px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid var(--accent-primary)' }}></div>
              <div style={{ height: '36px', background: 'transparent', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
              <div style={{ height: '36px', background: 'transparent', borderRadius: '8px', marginBottom: '2rem' }}></div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', paddingLeft: '0.5rem', fontWeight: 700 }}>Projects</div>
              <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.75rem', marginLeft: '0.5rem', width: '80%' }}></div>
              <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.75rem', marginLeft: '0.5rem', width: '70%' }}></div>
            </div>
            
            {/* Main Area */}
            <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Header Stats */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1, height: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                   <div style={{ width: '40%', height: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
                   <div style={{ width: '60%', height: '24px', background: 'rgba(255,255,255,0.9)', borderRadius: '4px' }}></div>
                </div>
                <div style={{ flex: 1, height: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                   <div style={{ width: '40%', height: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
                   <div style={{ width: '80%', height: '24px', background: 'linear-gradient(90deg, #10b981 0%, transparent 100%)', borderRadius: '4px' }}></div>
                </div>
                <div style={{ flex: 1, height: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                   <div style={{ width: '40%', height: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
                   <div style={{ width: '50%', height: '24px', background: 'linear-gradient(90deg, #8b5cf6 0%, transparent 100%)', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              {/* Kanban Mock */}
              <div style={{ flex: 1, display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ height: '20px', width: '40%', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', marginBottom: '1.5rem' }}></div>
                  <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1rem', borderLeft: '3px solid #f43f5e' }}></div>
                  <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1rem', borderLeft: '3px solid #3b82f6' }}></div>
                </div>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ height: '20px', width: '50%', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', marginBottom: '1.5rem' }}></div>
                  <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1rem', borderLeft: '3px solid #f59e0b' }}></div>
                </div>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ height: '20px', width: '30%', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', marginBottom: '1.5rem' }}></div>
                  <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1rem', borderLeft: '3px solid #10b981' }}></div>
                  <div style={{ height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1rem', borderLeft: '3px solid #10b981' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section (Bento Grid) */}
      <section id="features" style={{ padding: '6rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 1rem' }}>Built for High-Performing Teams</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Everything you need to deliver projects on time and within budget, beautifully integrated.</p>
        </div>
        
        <div className="bento-grid">
          
          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em' }}>Interactive Kanban Boards</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem', maxWidth: '80%' }}>Visualize your entire workflow with highly interactive, drag-and-drop Kanban boards. Real-time updates keep everyone in sync, ensuring nothing falls through the cracks.</p>
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <div style={{ height: '4px', width: '40px', background: 'var(--accent-primary)', borderRadius: '2px' }}></div>
            </div>
          </div>

          <div className="bento-card">
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em' }}>Gantt Timeline</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>Map out complex projects with automatic timeline visualizations. Spot bottlenecks before they happen.</p>
          </div>

          <div className="bento-card">
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em' }}>Role-Based Access</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>Secure your data with strict roles for Admins, Project Managers, Team Members, and Sponsors.</p>
          </div>

          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em' }}>Real-time Analytics</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem', maxWidth: '80%' }}>Get instant insights into project health, team velocity, and budget consumption with our beautiful, automatically generated dashboard metrics.</p>
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <div style={{ height: '4px', width: '40px', background: '#8b5cf6', borderRadius: '2px' }}></div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '8rem 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', zIndex: -1 }}></div>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: 'rgba(24, 24, 27, 0.6)', padding: '4rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 1.5rem' }}>Ready to transform how you work?</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: '0 auto 3rem', maxWidth: '500px' }}>Join thousands of teams already using TaskFlow to deliver their best work.</p>
          <Link href="/register" className="btn-primary pulse-btn" style={{ padding: '1rem 3rem', fontSize: '1.2rem', textDecoration: 'none', borderRadius: '16px', fontWeight: 600 }}>Get Started Now</Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 5% 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', marginBottom: '4rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))' }}>
                <rect x="2" y="3" width="14" height="14" rx="4" fill="url(#taskflow-logo-bg)" stroke="url(#taskflow-logo)" strokeWidth="2"/>
                <rect x="8" y="8" width="14" height="14" rx="4" fill="url(#taskflow-logo)" stroke="none"/>
                <path d="M12 15l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              TaskFlow
            </div>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>Enterprise-grade project management designed for modern, high-performing teams.</p>
          </div>
          <div style={{ display: 'flex', gap: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <strong style={{ color: '#fff' }}>Product</strong>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Security</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <strong style={{ color: '#fff' }}>Company</strong>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About Us</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Careers</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p>© 2026 TaskFlow Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
