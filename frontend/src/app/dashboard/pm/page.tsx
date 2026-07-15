"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import AnalyticsView from '@/components/AnalyticsView';

export default function PMDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{id: number, name: string, role: string} | null>(null);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'BOARD' | 'TIMELINE' | 'ANALYTICS'>('BOARD');
  
  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  
  // Forms state
  const [newProject, setNewProject] = useState({ title: '', description: '', startDate: '', endDate: '', budget: '', scope: '', goals: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', projectId: '', assigneeId: '', dueDate: '', priority: 'MEDIUM', dependencyIds: [] as string[] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!['PROJECT_MANAGER', 'ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROJECT_SPONSOR'].includes(parsedUser.role)) {
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
      const taskRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data);
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id.toString());
          setNewTask(prev => ({ ...prev, projectId: data[0].id.toString() }));
        }
      }
      if (taskRes.ok) setTasks(await taskRes.json());
      if (userRes.ok) setUsersList(await userRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const payload = {
        title: newProject.title,
        description: newProject.description,
        startDate: newProject.startDate ? new Date(newProject.startDate).toISOString() : undefined,
        endDate: newProject.endDate ? new Date(newProject.endDate).toISOString() : undefined,
        budget: newProject.budget ? parseFloat(newProject.budget) : undefined,
        scope: newProject.scope || undefined,
        goals: newProject.goals || undefined
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewProject({ title: '', description: '', startDate: '', endDate: '', budget: '', scope: '', goals: '' });
        setIsProjectModalOpen(false);
        fetchData(token!);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditTaskModal = (task: any) => {
    setEditingTaskId(task.id);
    setNewTask({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId.toString(),
      assigneeId: task.assigneeId ? task.assigneeId.toString() : '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority,
      dependencyIds: task.dependencies ? task.dependencies.map((d: any) => d.id.toString()) : []
    });
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const payload = {
        title: newTask.title,
        description: newTask.description,
        projectId: parseInt(newTask.projectId || selectedProjectId),
        assigneeId: newTask.assigneeId ? parseInt(newTask.assigneeId) : undefined,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        priority: newTask.priority,
        dependencyIds: newTask.dependencyIds
      };
      
      const url = editingTaskId ? `${process.env.NEXT_PUBLIC_API_URL}/tasks/${editingTaskId}` : `${process.env.NEXT_PUBLIC_API_URL}/tasks`;
      const method = editingTaskId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewTask({ title: '', description: '', projectId: selectedProjectId, assigneeId: '', dueDate: '', priority: 'MEDIUM', dependencyIds: [] });
        setIsTaskModalOpen(false);
        setEditingTaskId(null);
        fetchData(token!);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTask = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setTasks(prev => prev.filter(task => task.id !== id));
      fetchData(token!);
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to delete task');
    }
  };

  if (!user) return <div className="flex-center">Loading...</div>;

  // Filter tasks for the selected project
  const boardTasks = tasks.filter(t => t.projectId.toString() === selectedProjectId);
  const selectedProjectData = projects.find(p => p.id.toString() === selectedProjectId);
  
  const columns = [
    { id: 'TODO', title: 'To Do', color: 'var(--status-todo)' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'var(--status-progress)' },
    { id: 'DONE', title: 'Done', color: 'var(--status-done)' }
  ];

  return (
    <div className="app-layout">
      <Sidebar role={user.role} />
      
      <div className="main-content">
        <Header 
          user={user} 
          title="Project Workspace" 
        />
        
        <div className="page-content">
          <div className="glass-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '250px' }}>
              <select 
                className="input-field" 
                style={{ maxWidth: '350px', padding: '0.7rem 1.2rem', fontSize: '0.95rem', borderRadius: '12px', background: 'rgba(9, 9, 11, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em', paddingRight: '2.5rem', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)' }}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={projects.length === 0}
              >
                {projects.length === 0 ? (
                  <option value="">No Projects Assigned</option>
                ) : (
                  projects.map(p => (
                    <option key={p.id} value={p.id.toString()}>{p.title}</option>
                  ))
                )}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="segmented-control">
                <div className={`segmented-item ${viewMode === 'BOARD' ? 'active' : ''}`} onClick={() => setViewMode('BOARD')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                  Board
                </div>
                <div className={`segmented-item ${viewMode === 'TIMELINE' ? 'active' : ''}`} onClick={() => setViewMode('TIMELINE')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Timeline
                </div>
                <div className={`segmented-item ${viewMode === 'ANALYTICS' ? 'active' : ''}`} onClick={() => setViewMode('ANALYTICS')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  Analytics
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {(user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') && (
                  <button 
                    onClick={() => setIsProjectModalOpen(true)}
                    className="btn-secondary"
                    title="New Project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                    <span>Project</span>
                  </button>
                )}

                {(user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') && (
                  <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="btn-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Task</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {selectedProjectData && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="pm-project-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', flex: 1 }}>
                <div className="widget-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="widget-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-done)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <span className="widget-label">Budget</span>
                  </div>
                  <div className="widget-value">${selectedProjectData.budget?.toLocaleString() || '0'}</div>
                </div>
                
                <div className="widget-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="widget-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    </div>
                    <span className="widget-label">Scope</span>
                  </div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{selectedProjectData.scope || 'Not set'}</div>
                </div>

                <div className="widget-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="widget-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--priority-med)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                    </div>
                    <span className="widget-label">Goals</span>
                  </div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{selectedProjectData.goals || 'Not set'}</div>
                </div>
              </div>
              
              {/* Progress Tracking Widget */}
              <div className="widget-card" style={{ minWidth: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="widget-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <span className="widget-label">Project Progress</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.25rem' }}>
                    {boardTasks.length > 0 ? Math.round((boardTasks.filter(t => t.status === 'DONE').length / boardTasks.length) * 100) : 0}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)', marginTop: '0.5rem' }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--accent-primary) 0%, #60a5fa 100%)', 
                    width: `${boardTasks.length > 0 ? Math.round((boardTasks.filter(t => t.status === 'DONE').length / boardTasks.length) * 100) : 0}%`,
                    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)'
                  }}></div>
                </div>
              </div>
            </div>
          )}

          {projects.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', background: 'rgba(24, 24, 27, 0.3)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Welcome to TaskFlow</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, marginBottom: '2rem' }}>You don't have any projects assigned yet. Create your first project to start organizing tasks and collaborating with your team.</p>
              
              {(user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') && (
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="btn-primary"
                  style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #3b82f6 100%)' }}
                >
                  Create New Project
                </button>
              )}
            </div>
          ) : viewMode === 'BOARD' ? (
            <div className="kanban-board">
            {columns.map(col => (
              <div key={col.id} className="kanban-column">
                <div className="kanban-header" style={{ padding: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color, boxShadow: `0 0 10px ${col.color}` }} />
                    <span style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{col.title}</span>
                  </div>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {boardTasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                
                <div className="kanban-cards">
                  {boardTasks.filter(t => t.status === col.id).map(t => (
                    <div key={t.id} className={`kanban-card status-${t.status.toLowerCase()}`} style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span className="badge" style={{ 
                          background: t.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : t.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)', 
                          color: t.priority === 'HIGH' ? '#f87171' : t.priority === 'MEDIUM' ? '#fbbf24' : '#60a5fa',
                          border: `1px solid ${t.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.3)' : t.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                          fontWeight: 700, letterSpacing: '0.05em'
                        }}>
                          {t.priority}
                        </span>
                        {(user.role === 'ADMIN' || (user.role === 'PROJECT_MANAGER' && selectedProjectData?.managerId === user.id)) && (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditTaskModal(t); }} 
                              className="card-action-btn edit"
                              title="Edit Task"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteTask(t.id); }} 
                              className="card-action-btn delete"
                              title="Delete Task"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className={`task-title ${t.status === 'DONE' ? 'done' : ''}`} style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>{t.title}</div>
                      
                      {t.dueDate && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '6px', width: 'fit-content' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          {new Date(t.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                        {t.assigneeId ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              {usersList.find(u => u.id === t.assigneeId)?.designation || ''}
                            </div>
                            <div 
                              title={usersList.find(u => u.id === t.assigneeId)?.name || `User ${t.assigneeId}`}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #60a5fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'white', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)' }}
                            >
                              {(usersList.find(u => u.id === t.assigneeId)?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Unassigned</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            </div>
          ) : viewMode === 'TIMELINE' ? (
            /* Gantt Chart (Timeline View) */
            <div style={{ background: 'rgba(24, 24, 27, 0.4)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto', padding: '1.5rem', minHeight: '400px' }}>
              {boardTasks.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No tasks to display in timeline.</div>
              ) : (
                <div style={{ display: 'table', width: '100%', minWidth: '800px' }}>
                  <div style={{ display: 'table-row', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'table-cell', padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', width: '250px', borderBottom: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Task Details</div>
                    <div style={{ display: 'table-cell', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative', verticalAlign: 'bottom' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span>Start: {selectedProjectData?.startDate ? new Date(selectedProjectData.startDate).toLocaleDateString() : 'Not Set'}</span>
                        <span>End: {selectedProjectData?.endDate ? new Date(selectedProjectData.endDate).toLocaleDateString() : 'Not Set'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {boardTasks.map((t, idx) => {
                    const hasDueDate = !!t.dueDate;
                    const isDone = t.status === 'DONE';
                    const isProg = t.status === 'IN_PROGRESS';
                    
                    const barBg = isDone ? 'rgba(16, 185, 129, 0.15)' : isProg ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)';
                    const barBorder = isDone ? 'rgba(16, 185, 129, 0.3)' : isProg ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)';
                    const barAccent = isDone ? '#10b981' : isProg ? '#3b82f6' : '#8b5cf6';
                    
                    // Real Gantt Math
                    const pStart = selectedProjectData?.startDate ? new Date(selectedProjectData.startDate).getTime() : new Date(t.createdAt).getTime() - 2*24*60*60*1000;
                    const pEnd = selectedProjectData?.endDate ? new Date(selectedProjectData.endDate).getTime() : new Date().getTime() + 14*24*60*60*1000;
                    const projectDuration = Math.max(1, pEnd - pStart);
                    
                    const tStart = new Date(t.createdAt).getTime();
                    const tEnd = hasDueDate ? new Date(t.dueDate).getTime() : new Date().getTime() + 7*24*60*60*1000;
                    
                    let leftPercent = Math.max(0, ((tStart - pStart) / projectDuration) * 100);
                    let widthPercent = Math.min(100 - leftPercent, ((tEnd - tStart) / projectDuration) * 100);
                    if (widthPercent < 2) widthPercent = 2; // minimum visual width
                    if (leftPercent > 98) leftPercent = 98;
                    
                    return (
                      <div key={t.id} style={{ display: 'table-row', animation: `slideUpFade 0.4s ease-out forwards`, animationDelay: `${idx * 0.05}s`, opacity: 0 }}>
                        <div style={{ display: 'table-cell', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 500, fontSize: '0.95rem', color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{t.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                            {t.assigneeId ? (
                              <>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #60a5fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600, color: 'white' }}>
                                  {(usersList.find(u => u.id === t.assigneeId)?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{usersList.find(u => u.id === t.assigneeId)?.name}</span>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unassigned</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'table-cell', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle', position: 'relative' }}>
                          {/* Background Grid Lines */}
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.05)' }}></div>
                          <div style={{ position: 'absolute', right: '75%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.05)' }}></div>
                          <div style={{ position: 'absolute', right: '50%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.05)' }}></div>
                          <div style={{ position: 'absolute', right: '25%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.05)' }}></div>
                          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.05)' }}></div>
                          
                          {/* Gantt Bar */}
                          <div style={{ 
                            position: 'relative', 
                            height: '24px', 
                            background: barBg, 
                            borderRadius: '4px',
                            border: `1px solid ${barBorder}`,
                            borderLeft: `4px solid ${barAccent}`,
                            width: `${widthPercent}%`,
                            marginLeft: `${leftPercent}%`,
                            boxShadow: isProg ? `0 0 10px ${barBg}` : 'none',
                            zIndex: 2,
                            transition: 'all 0.3s ease'
                          }}>
                            {/* Text outside the bar for a clean look */}
                            <div style={{
                              position: 'absolute',
                              left: '100%',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              paddingLeft: '0.6rem',
                              whiteSpace: 'nowrap',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              fontWeight: 500
                            }}>
                              <span style={{ color: barAccent, fontWeight: 600 }}>{t.status.replace('_', ' ')}</span>
                              {hasDueDate && <span style={{ opacity: 0.8 }}> • Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : viewMode === 'ANALYTICS' ? (
            <AnalyticsView tasks={boardTasks} users={usersList} />
          ) : null}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject}>
          <div className="input-group">
            <label>Project Title</label>
            <input className="input-field" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea className="input-field" rows={3} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Start Date</label>
              <input type="date" className="input-field" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input type="date" className="input-field" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Budget ($)</label>
              <input type="number" className="input-field" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Scope</label>
              <input className="input-field" value={newProject.scope} onChange={e => setNewProject({...newProject, scope: e.target.value})} placeholder="e.g. Website revamp only" />
            </div>
          </div>
          <div className="input-group">
            <label>Goals</label>
            <input className="input-field" value={newProject.goals} onChange={e => setNewProject({...newProject, goals: e.target.value})} placeholder="e.g. Increase conversion by 20%" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsProjectModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>Create Project</button>
          </div>
        </form>
      </Modal>

      {/* Create/Edit Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => { setIsTaskModalOpen(false); setEditingTaskId(null); setNewTask({ title: '', description: '', projectId: selectedProjectId, assigneeId: '', dueDate: '', priority: 'MEDIUM', dependencyIds: [] }); }} title={editingTaskId ? "Edit Task" : "Create New Task"}>
        <form onSubmit={handleCreateTask}>
          <div className="input-group">
            <label>Task Title</label>
            <input className="input-field" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea className="input-field" rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Priority</label>
              <select className="input-field" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="input-group">
              <label>Assignee (Optional)</label>
              <select className="input-field" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                <option value="">Unassigned</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.designation ? `${u.designation} - ` : ''}{u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="input-group">
            <label>Due Date</label>
            <input type="date" className="input-field" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label>Dependencies (Optional)</label>
            <select 
              multiple
              className="input-field" 
              style={{ minHeight: '80px', padding: '0.5rem' }}
              value={newTask.dependencyIds} 
              onChange={e => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setNewTask({...newTask, dependencyIds: selected});
              }}
            >
              {boardTasks.map(t => (
                <option key={t.id} value={t.id.toString()}>{t.title}</option>
              ))}
            </select>
            <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>Hold Ctrl/Cmd to select multiple dependencies</small>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setIsTaskModalOpen(false); setEditingTaskId(null); setNewTask({ title: '', description: '', projectId: selectedProjectId, assigneeId: '', dueDate: '', priority: 'MEDIUM', dependencyIds: [] }); }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{editingTaskId ? "Save Changes" : "Create Task"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
