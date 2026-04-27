import React, { useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Users, GraduationCap, BookOpen, TrendingUp, TrendingDown, Filter, Loader2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#7c3aed', '#009ef7', '#50cd89', '#ffc700', '#f1416c', '#a78bfa', '#fb923c'];

interface AnalysisRecord {
  assignment_id: string;
  subject: string;
  teacher: string;
  batch: string;
  branch_name: string;
  start_year: number | null;
  graduation_year: number | null;
  semester: number;
  total_students: number;
  above_90: number;
  between_50_90: number;
  failed: number;
  grade_distribution: Record<string, number>;
  average_total: number;
}

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
  const { data: teachers } = useApi<any[]>('/teachers');
  const { data: allAnalysis, loading: loadingAnalysis } = useApi<AnalysisRecord[]>('/analysis/all');

  // ── Filter state ─────────────────────────────────────────────────────────
  const [selBranch, setSelBranch]   = useState('');
  const [selYear,   setSelYear]     = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [selTeacher, setSelTeacher] = useState('');

  // ── Derive unique options with cascading logic ───────────────────────────
  const branches = useMemo(() => {
    if (!allAnalysis) return [];
    return [...new Set(allAnalysis.map(a => a.branch_name).filter(Boolean))].sort();
  }, [allAnalysis]);

  const years = useMemo(() => {
    if (!allAnalysis) return [];
    const base = selBranch ? allAnalysis.filter(a => a.branch_name === selBranch) : allAnalysis;
    return [...new Set(base.map(a => a.start_year).filter(Boolean))].sort() as number[];
  }, [allAnalysis, selBranch]);

  const subjects = useMemo(() => {
    if (!allAnalysis) return [];
    let base = allAnalysis;
    if (selBranch) base = base.filter(a => a.branch_name === selBranch);
    if (selYear)   base = base.filter(a => String(a.start_year) === selYear);
    return [...new Set(base.map(a => a.subject).filter(Boolean))].sort();
  }, [allAnalysis, selBranch, selYear]);

  const teacherOptions = useMemo(() => {
    if (!allAnalysis) return [];
    let base = allAnalysis;
    if (selBranch)  base = base.filter(a => a.branch_name === selBranch);
    if (selYear)    base = base.filter(a => String(a.start_year) === selYear);
    if (selSubject) base = base.filter(a => a.subject === selSubject);
    return [...new Set(base.map(a => a.teacher).filter(Boolean))].sort();
  }, [allAnalysis, selBranch, selYear, selSubject]);

  // ── Filtered result ───────────────────────────────────────────────────────
  const filtered = useMemo<AnalysisRecord | null>(() => {
    if (!allAnalysis) return null;
    let base = allAnalysis;
    if (selBranch)  base = base.filter(a => a.branch_name === selBranch);
    if (selYear)    base = base.filter(a => String(a.start_year) === selYear);
    if (selSubject) base = base.filter(a => a.subject === selSubject);
    if (selTeacher) base = base.filter(a => a.teacher === selTeacher);
    if (base.length === 0) return null;
    // If multiple matches, take the first (most specific with teacher selected)
    return base[0];
  }, [allAnalysis, selBranch, selYear, selSubject, selTeacher]);

  const anyFilterActive = selBranch || selYear || selSubject || selTeacher;

  // ── Handle cascading resets ────────────────────────────────────────────────
  const handleBranchChange = (v: string) => {
    setSelBranch(v); setSelYear(''); setSelSubject(''); setSelTeacher('');
  };
  const handleYearChange = (v: string) => {
    setSelYear(v); setSelSubject(''); setSelTeacher('');
  };
  const handleSubjectChange = (v: string) => {
    setSelSubject(v); setSelTeacher('');
  };

  // ── KPI cards ─────────────────────────────────────────────────────────────
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
      label: 'Month Avg Grade', value: '78%',
      delta: '-2.1%', up: false, icon: BookOpen, color: '#ffc700', bg: '#fff8dd',
    },
  ];

  // ── Chart data from filtered result ───────────────────────────────────────
  const gradeData = filtered
    ? Object.entries(filtered.grade_distribution || {})
        .filter(([, v]) => Number(v) > 0)
        .map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  const bucketData = filtered
    ? [
        { name: 'Outstanding (>90%)', value: filtered.above_90 || 0,        fill: '#50cd89' },
        { name: 'Passing (50–90%)',   value: filtered.between_50_90 || 0,   fill: '#009ef7' },
        { name: 'Failed (<50%)',      value: filtered.failed || 0,           fill: '#f1416c' },
      ].filter(d => d.value > 0)
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-breadcrumb">Home / <span>Dashboard</span></div>
        </div>
        <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          Spring Semester 2026
        </div>
      </div>

      {/* KPI Row — 3 equal-width cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div>
                <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="flex items-center gap-1 text-xs font-semibold">
                  {s.up
                    ? <TrendingUp  size={12} style={{ color: 'var(--success)' }} />
                    : <TrendingDown size={12} style={{ color: 'var(--danger)'  }} />}
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

      {/* ── Analytics Filter Section ─────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Filter size={18} style={{ color: 'var(--accent)' }} />
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Performance Explorer</span>
          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
            — Select filters to drill into analytics
          </span>
        </div>

        {loadingAnalysis ? (
          <div className="flex items-center gap-3 py-4" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
            Loading analytics data…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Branch */}
            <div>
              <label className="form-label">Branch</label>
              <select
                className="form-input"
                value={selBranch}
                onChange={e => handleBranchChange(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="form-label">Start Year</label>
              <select
                className="form-input"
                value={selYear}
                onChange={e => handleYearChange(e.target.value)}
                disabled={years.length === 0}
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="form-label">Subject</label>
              <select
                className="form-input"
                value={selSubject}
                onChange={e => handleSubjectChange(e.target.value)}
                disabled={subjects.length === 0}
              >
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Teacher */}
            <div>
              <label className="form-label">Teacher</label>
              <select
                className="form-input"
                value={selTeacher}
                onChange={e => setSelTeacher(e.target.value)}
                disabled={teacherOptions.length === 0}
              >
                <option value="">All Teachers</option>
                {teacherOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      {anyFilterActive && (
        <>
          {filtered ? (
            <>
              {/* Context card */}
              <div className="card p-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                    {filtered.subject}
                  </div>
                  <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {filtered.batch} · Semester {filtered.semester} · Teacher: {filtered.teacher || '—'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Class Average</div>
                  <div className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {filtered.average_total?.toFixed(1)}
                    <span className="text-base font-medium text-gray-400"> / 100</span>
                  </div>
                </div>
              </div>

              {/* Chart pair */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Pie — Grade Distribution */}
                <div className="card p-6">
                  <div className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Grade Distribution
                  </div>
                  {gradeData.length === 0 ? (
                    <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
                      No grade data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={gradeData}
                          cx="50%" cy="50%"
                          innerRadius={65} outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Bar — Performance Buckets */}
                <div className="card p-6">
                  <div className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Performance Buckets
                  </div>
                  {bucketData.length === 0 ? (
                    <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
                      No data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={bucketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                          dataKey="name"
                          axisLine={false} tickLine={false}
                          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                        />
                        <YAxis
                          axisLine={false} tickLine={false}
                          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56} name="Students">
                          {bucketData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card p-10 text-center" style={{ color: 'var(--text-muted)' }}>
              No analytics data matches the selected filters. Try a different combination.
            </div>
          )}
        </>
      )}

      {!anyFilterActive && !loadingAnalysis && (
        <div className="card p-10 text-center" style={{ color: 'var(--text-muted)', borderStyle: 'dashed' }}>
          <Filter size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select at least one filter above to explore performance charts.</p>
        </div>
      )}
    </div>
  );
};
