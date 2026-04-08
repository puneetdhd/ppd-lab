import React from 'react';
import { useApi } from '../../hooks/useApi';
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const DUMMY_ENROLL = [
  { m: 'Jan', n: 320 }, { m: 'Feb', n: 280 }, { m: 'Mar', n: 450 },
  { m: 'Apr', n: 390 }, { m: 'May', n: 520 }, { m: 'Jun', n: 610 },
  { m: 'Jul', n: 580 }, { m: 'Aug', n: 690 }, { m: 'Sep', n: 720 },
  { m: 'Oct', n: 750 }, { m: 'Nov', n: 810 }, { m: 'Dec', n: 870 },
];
const DUMMY_ACTIVITY = [
  { d: 'Mon', v: 40 }, { d: 'Tue', v: 55 }, { d: 'Wed', v: 48 },
  { d: 'Thu', v: 70 }, { d: 'Fri', v: 62 }, { d: 'Sat', v: 30 }, { d: 'Sun', v: 20 },
];

interface StatCard {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export const AdminDashboard: React.FC = () => {
  const { data: students } = useApi<any[]>('/students');
  const { data: teachers }  = useApi<any[]>('/teachers');
  const { data: assignments } = useApi<any[]>('/assignments');

  const stats: StatCard[] = [
    {
      label: 'Total Students', value: students?.length?.toString() ?? '—',
      delta: '+12%', up: true, icon: GraduationCap, color: '#009ef7', bg: '#f1faff',
    },
    {
      label: 'Total Teachers', value: teachers?.length?.toString() ?? '—',
      delta: '+3.4%', up: true, icon: Users, color: '#7c3aed', bg: '#f4f0ff',
    },
    {
      label: 'Assignments', value: assignments?.length?.toString() ?? '—',
      delta: '+8', up: true, icon: ClipboardList, color: '#50cd89', bg: '#e8fff3',
    },
    {
      label: 'Month Avg Grade', value: '78%',
      delta: '-2.1%', up: false, icon: BookOpen, color: '#ffc700', bg: '#fff8dd',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <div className="page-breadcrumb">Home / <span>Dashboard</span></div>
        </div>
        <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          Spring Semester 2026
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div>
                <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="flex items-center gap-1 text-xs font-semibold">
                  {s.up ? <TrendingUp size={12} style={{ color: 'var(--success)' }} /> : <TrendingDown size={12} style={{ color: 'var(--danger)' }} />}
                  <span style={{ color: s.up ? 'var(--success)' : 'var(--danger)' }}>{s.delta}</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs last month</span>
                </div>
              </div>
              <div className="icon-box rounded-2xl" style={{ background: s.bg, color: s.color, width: 52, height: 52 }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Enrollment Bar */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Student Enrollment</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Monthly trend this year</div>
            </div>
            <select className="form-input" style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}>
              <option>2026</option><option>2025</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DUMMY_ENROLL} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip cursor={{ fill: 'var(--accent-light)' }} />
              <Bar dataKey="n" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={28} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Area */}
        <div className="card p-6">
          <div className="mb-6">
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Activity</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Login sessions this week</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={DUMMY_ACTIVITY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip />
              <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2.5} fill="url(#actGrad)" name="Sessions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Teaching Assignments</div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Teacher</th><th>Subject</th><th>Batch</th><th>Semester</th>
              </tr>
            </thead>
            <tbody>
              {assignments?.slice(0, 6).map((a: any) => (
                <tr key={a._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="avatar avatar-sm text-xs">{a.teacher_id?.user_id?.name?.charAt(0) || 'T'}</div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {a.teacher_id?.user_id?.name || '—'}
                      </span>
                    </div>
                  </td>
                  <td>{a.subject_id?.subject_name || '—'}</td>
                  <td>{a.batch_id?.branch_id?.branch_name || '—'}</td>
                  <td><span className="badge badge-accent">Sem {a.semester}</span></td>
                </tr>
              ))}
              {!assignments?.length && (
                <tr><td colSpan={4} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No assignments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
