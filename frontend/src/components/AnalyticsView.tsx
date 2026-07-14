"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  assigneeId?: number;
  dependencies?: { id: number }[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  name: string;
  designation?: string;
}

interface AnalyticsViewProps {
  tasks: Task[];
  users: User[];
}

import dagre from 'dagre';
import { MarkerType } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 140 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    // Shift from center anchor (dagre) to top-left anchor (reactflow)
    node.position = {
      x: nodeWithPosition.x - 250 / 2,
      y: nodeWithPosition.y - 140 / 2,
    };
  });

  return { nodes, edges };
};

export default function AnalyticsView({ tasks, users }: AnalyticsViewProps) {
  // 1. Cumulative Flow Diagram Data Approximation
  const cfdData = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString();
      
      let todo = 0, inProgress = 0, done = 0;
      tasks.forEach(t => {
        const cDate = new Date(t.createdAt);
        const uDate = new Date(t.updatedAt);
        // Approximation logic
        if (cDate > d) return; 
        
        if (t.status === 'DONE' && uDate <= d) done++;
        else if (t.status === 'IN_PROGRESS' && uDate <= d) inProgress++;
        else todo++;
      });
      
      data.push({ name: dayStr, TODO: todo, IN_PROGRESS: inProgress, DONE: done });
    }
    return data;
  }, [tasks]);

  // 2. Heatmap Data
  const heatmapData = useMemo(() => {
    return users.map(user => {
      const userTasks = tasks.filter(t => t.assigneeId === user.id);
      return {
        user,
        todo: userTasks.filter(t => t.status === 'TODO').length,
        inProgress: userTasks.filter(t => t.status === 'IN_PROGRESS').length,
        done: userTasks.filter(t => t.status === 'DONE').length,
        total: userTasks.length
      };
    }).filter(u => u.total > 0);
  }, [tasks, users]);

  const performanceData = useMemo(() => {
    return users.map(user => {
      const userTasks = tasks.filter(t => t.assigneeId === user.id);
      const done = userTasks.filter(t => t.status === 'DONE').length;
      return {
        name: user.name,
        Assigned: userTasks.length,
        Completed: done,
      };
    }).filter(u => u.Assigned > 0);
  }, [tasks, users]);

  // 3. ReactFlow Nodes & Edges
  const { nodes, edges } = useMemo(() => {
    const nds = tasks.map((t, i) => ({
      id: t.id.toString(),
      position: { x: 0, y: 0 },
      data: { 
        label: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: t.status === 'DONE' ? '#10b981' : t.status === 'IN_PROGRESS' ? '#3b82f6' : '#8b5cf6' }}>{t.status.replace('_', ' ')}</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>{t.priority}</span>
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.3, wordWrap: 'break-word', color: '#fafafa', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              {t.title}
            </div>
            {t.assigneeId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #60a5fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 600, color: 'white' }}>
                  {(users.find(u => u.id === t.assigneeId)?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{users.find(u => u.id === t.assigneeId)?.name}</span>
              </div>
            )}
          </div>
        )
      },
      style: {
        background: 'linear-gradient(145deg, rgba(39, 39, 42, 0.9), rgba(24, 24, 27, 0.9))',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        border: t.status === 'DONE' ? '1px solid rgba(16, 185, 129, 0.4)' : t.status === 'IN_PROGRESS' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(139, 92, 246, 0.4)',
        borderLeft: t.status === 'DONE' ? '4px solid #10b981' : t.status === 'IN_PROGRESS' ? '4px solid #3b82f6' : '4px solid #8b5cf6',
        borderRadius: '12px',
        padding: '0.8rem',
        width: 250,
        height: 'auto',
        minHeight: 140,
        fontWeight: 500,
        boxShadow: t.status === 'IN_PROGRESS' ? '0 0 20px rgba(59, 130, 246, 0.15)' : '0 8px 16px rgba(0,0,0,0.4)',
      }
    }));
    
    const egs: any[] = [];
    tasks.forEach(t => {
      if (t.dependencies) {
        t.dependencies.forEach(d => {
          egs.push({
            id: `e${d.id}-${t.id}`,
            source: d.id.toString(),
            target: t.id.toString(),
            animated: t.status === 'IN_PROGRESS',
            type: 'smoothstep',
            style: { stroke: t.status === 'DONE' ? 'rgba(16, 185, 129, 0.6)' : t.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255, 255, 255, 0.2)', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: t.status === 'DONE' ? 'rgba(16, 185, 129, 0.6)' : t.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255, 255, 255, 0.2)',
            },
          });
        });
      }
    });
    
    // Apply layout
    const layouted = getLayoutedElements(nds, egs, 'LR');
    return { nodes: layouted.nodes, edges: layouted.edges };
  }, [tasks, users]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'slideUpFade 0.5s ease-out forwards' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* CFD */}
        <div style={{ background: 'rgba(24, 24, 27, 0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Cumulative Flow Diagram</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cfdData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTodo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize="0.75rem" />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize="0.75rem" />
                <RechartsTooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="DONE" stroke="#10b981" fillOpacity={1} fill="url(#colorDone)" stackId="1" />
                <Area type="monotone" dataKey="IN_PROGRESS" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProg)" stackId="1" />
                <Area type="monotone" dataKey="TODO" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTodo)" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap */}
        <div style={{ background: 'rgba(24, 24, 27, 0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Resource Workload</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <div>Team Member</div>
              <div style={{ textAlign: 'center' }}>To Do</div>
              <div style={{ textAlign: 'center' }}>In Progress</div>
              <div style={{ textAlign: 'center' }}>Done</div>
            </div>
            {heatmapData.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{row.user.name}</div>
                <div style={{ background: `rgba(139, 92, 246, ${row.todo === 0 ? 0 : Math.min(row.todo * 0.2 + 0.2, 1)})`, padding: '0.5rem', borderRadius: '6px', textAlign: 'center', fontWeight: 600, color: row.todo > 0 ? '#fff' : 'rgba(255,255,255,0.2)' }}>{row.todo}</div>
                <div style={{ background: `rgba(59, 130, 246, ${row.inProgress === 0 ? 0 : Math.min(row.inProgress * 0.3 + 0.2, 1)})`, padding: '0.5rem', borderRadius: '6px', textAlign: 'center', fontWeight: 600, color: row.inProgress > 0 ? '#fff' : 'rgba(255,255,255,0.2)' }}>{row.inProgress}</div>
                <div style={{ background: `rgba(16, 185, 129, ${row.done === 0 ? 0 : Math.min(row.done * 0.2 + 0.2, 1)})`, padding: '0.5rem', borderRadius: '6px', textAlign: 'center', fontWeight: 600, color: row.done > 0 ? '#fff' : 'rgba(255,255,255,0.2)' }}>{row.done}</div>
              </div>
            ))}
            {heatmapData.length === 0 && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No workloads to display.</div>}
          </div>
        </div>
      </div>

      {/* Team Performance Bar Chart */}
      <div style={{ background: 'rgba(24, 24, 27, 0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Team Performance & Output</h3>
        <div style={{ height: '350px' }}>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize="0.75rem" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize="0.75rem" tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                <Bar dataKey="Assigned" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No performance data available.</div>
          )}
        </div>
      </div>

      {/* Dependency Network Graph */}
      <div style={{ background: 'rgba(24, 24, 27, 0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', height: '500px' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Dependency Network</h3>
        <div style={{ width: '100%', height: 'calc(100% - 3rem)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          {nodes.length > 0 ? (
            <ReactFlow nodes={nodes} edges={edges} fitView colorMode="dark">
              <Background color="#52525b" gap={16} />
              <Controls />
            </ReactFlow>
          ) : (
             <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No tasks available for network graph.</div>
          )}
        </div>
      </div>
    </div>
  );
}
