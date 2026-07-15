"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import confetti from 'canvas-confetti';

export default function MemberDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{id: number, name: string, role: string} | null>(null);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'TEAM_MEMBER' && parsedUser.role !== 'ADMIN' && parsedUser.role !== 'PROJECT_MANAGER' && parsedUser.role !== 'TEAM_LEADER' && parsedUser.role !== 'PROJECT_SPONSOR') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const projRes = await fetch(`https://backend-xi-orcin-43.vercel.app/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const taskRes = await fetch(`https://backend-xi-orcin-43.vercel.app/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (projRes.ok) setProjects(await projRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://backend-xi-orcin-43.vercel.app/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (newStatus === 'DONE') {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#ffffff']
          });
        }
        fetchData(token!);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update task status');
        fetchData(token!); // Revert UI
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating status');
    }
  };

  if (!user) return <div className="flex-center">Loading...</div>;

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'var(--status-todo)' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'var(--status-progress)' },
    { id: 'DONE', title: 'Done', color: 'var(--status-done)' }
  ];

  return (
    <div className="app-layout">
      <Sidebar role={user.role} />
      
      <div className="main-content">
        <Header user={user} title={user.role === 'PROJECT_SPONSOR' ? "Assigned Tasks" : "My Tasks"} />
        
        <div className="page-content">
          <div className="kanban-board">
            {columns.map(col => (
              <div key={col.id} className="kanban-column">
                <div className="kanban-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                    {col.title}
                  </div>
                  <span className="badge" style={{ background: 'var(--bg-app)', color: 'var(--text-secondary)' }}>
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                
                <div className="kanban-cards">
                  {tasks.filter(t => t.status === col.id).map(t => (
                    <div key={t.id} className={`kanban-card status-${t.status.toLowerCase()}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span className="badge" style={{ 
                          background: t.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : t.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                          color: t.priority === 'HIGH' ? 'var(--priority-high)' : t.priority === 'MEDIUM' ? 'var(--priority-med)' : 'var(--priority-low)' 
                        }}>
                          {t.priority}
                        </span>
                      </div>
                      
                      <div className={`task-title ${t.status === 'DONE' ? 'done' : ''}`}>{t.title}</div>
                      
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        Project: {projects.find((p: any) => p.id === t.projectId)?.title || `ID #${t.projectId}`}
                      </div>
                      
                      {t.dueDate && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                          📅 {new Date(t.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                        {t.assigneeId === user.id ? (
                          <select 
                            className="input-field" 
                            style={{ padding: '0.4rem', width: '100%', fontSize: '0.75rem' }}
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        ) : (
                          <div style={{ padding: '0.4rem', width: '100%', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
                            {t.status.replace('_', ' ')} (Assigned to {t.assignee?.name || 'someone else'})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
