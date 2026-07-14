"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import AnalyticsView from '@/components/AnalyticsView';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [viewMode, setViewMode] = useState<'USERS' | 'ANALYTICS'>('USERS');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'PROJECT_MANAGER' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchUsers(token);
    fetchAllTasks(token);
  }, [router]);

  const fetchAllTasks = async (token: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAllTasks(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async (token: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setNewUser({ name: '', email: '', password: '', role: 'PROJECT_MANAGER' });
        setIsModalOpen(false);
        fetchUsers(token!);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: number, field: 'role' | 'designation', value: string) => {
    const token = localStorage.getItem('token');
    try {
      const payload: any = {};
      payload[field] = value;
      
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchUsers(token!);
      } else {
        alert(`Failed to update ${field}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers(token!);
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="flex-center">Loading...</div>;

  return (
    <div className="app-layout">
      <Sidebar role={user.role} />
      
      <div className="main-content">
        <Header 
          user={user} 
          title="Organization Overview" 
          actionButton={
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="segmented-control">
                <div className={`segmented-item ${viewMode === 'USERS' ? 'active' : ''}`} onClick={() => setViewMode('USERS')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Users
                </div>
                <div className={`segmented-item ${viewMode === 'ANALYTICS' ? 'active' : ''}`} onClick={() => setViewMode('ANALYTICS')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  Performance Analytics
                </div>
              </div>
              {viewMode === 'USERS' && (
                <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '10px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add User
                </button>
              )}
            </div>
          }
        />
        
        <div className="page-content">
          {viewMode === 'USERS' ? (
            <div style={{ background: 'var(--bg-sidebar)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NAME</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>DESIGNATION</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--text-secondary)' }}>#{u.id}</td>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <select 
                            className="input-field" 
                            style={{ padding: '0.4rem', fontSize: '0.75rem', width: 'auto' }}
                            value={u.role}
                            onChange={(e) => handleUpdateUser(u.id, 'role', e.target.value)}
                          >
                            <option value="TEAM_MEMBER">Team Member</option>
                            <option value="TEAM_LEADER">Team Leader</option>
                            <option value="PROJECT_MANAGER">Project Manager</option>
                            <option value="PROJECT_SPONSOR">Project Sponsor</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td>
                          <select 
                            className="input-field" 
                            style={{ padding: '0.4rem', fontSize: '0.75rem', width: 'auto' }}
                            value={u.designation || ''}
                            onChange={(e) => handleUpdateUser(u.id, 'designation', e.target.value)}
                          >
                            <option value="">No Designation</option>
                            <option value="Front-end Engineer">Front-end Engineer</option>
                            <option value="Back-end Engineer">Back-end Engineer</option>
                            <option value="Fullstack Engineer">Fullstack Engineer</option>
                            <option value="QA Engineer">QA Engineer</option>
                            <option value="UX/UI Designer">UX/UI Designer</option>
                            <option value="Business Analyst (BA)">Business Analyst (BA)</option>
                            <option value="Tech Lead / Software Architect">Tech Lead / Software Architect</option>
                            <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
                            <option value="AI / ML Engineer">AI / ML Engineer</option>
                          </select>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              onClick={() => alert('Edit User feature coming soon!')}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-primary)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }}
                              title="Edit User"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--error)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }}
                              title="Delete User"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <AnalyticsView tasks={allTasks} users={users} />
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New User">
        <form onSubmit={handleCreateUser}>
          <div className="input-group">
            <label>Full Name</label>
            <input className="input-field" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" className="input-field" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input-field" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required minLength={6} />
          </div>
          <div className="input-group">
            <label>Role</label>
            <select className="input-field" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
              <option value="ADMIN">Admin</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="PROJECT_SPONSOR">Project Sponsor</option>
              <option value="TEAM_MEMBER">Team Member</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>Create User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
