"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function SponsorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{id: number, name: string, role: string} | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'PROJECT_SPONSOR' && parsedUser.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const projRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (projRes.ok) {
        setProjects(await projRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  if (!user) return <div className="flex-center">Loading...</div>;

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
  const completedTasks = projects.reduce((acc, p) => acc + (p.tasks?.filter((t: any) => t.status === 'DONE').length || 0), 0);
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="app-layout">
      <Sidebar role={user.role} />
      
      <div className="main-content">
        <Header user={user} title="Sponsor Overview" />
        
        <div className="page-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="kanban-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Allocated Budget</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                ${totalBudget.toLocaleString()}
              </div>
            </div>
            <div className="kanban-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active Projects</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {projects.length}
              </div>
            </div>
            <div className="kanban-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Overall Task Progress</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                {overallProgress}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {completedTasks} of {totalTasks} tasks completed
              </div>
            </div>
          </div>

          <h3 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Project Portfolio</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projects.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No projects available.</div>}
            {projects.map(p => {
              const pTotalTasks = p.tasks?.length || 0;
              const pCompletedTasks = p.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
              const pProgress = pTotalTasks === 0 ? 0 : Math.round((pCompletedTasks / pTotalTasks) * 100);

              return (
                <div key={p.id} className="kanban-card" style={{ cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{p.title}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manager: {p.manager?.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {p.budget ? `$${p.budget.toLocaleString()}` : 'Budget Not Set'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem', background: 'var(--bg-app)', padding: '1rem', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>SCOPE</div>
                      <div style={{ fontSize: '0.875rem' }}>{p.scope || 'No scope defined'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>GOALS</div>
                      <div style={{ fontSize: '0.875rem' }}>{p.goals || 'No goals defined'}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      <span>Project Completion</span>
                      <span>{pProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pProgress}%`, height: '100%', background: 'var(--success)', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
