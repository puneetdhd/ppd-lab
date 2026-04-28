import React, { useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Users, GraduationCap, BookOpen, TrendingUp, TrendingDown, Filter, Loader2, Layers, Download } from 'lucide-react';
import { downloadAdminReport } from '../../utils/pdfReports';
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

interface Aggregated {
  grade_distribution: Record<string, number>;
  above_90: number;
  between_50_90: number;
  failed: number;
  total_students: number;
  average_total: number;
  record_count: number;
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
  // Fetch only the count — limit=1 returns total from the paginated response
  const { total: studentTotal } = useApi<any[]>('/students?limit=1&page=1');
  const { total: teacherTotal } = useApi<any[]>('/teachers?limit=1&page=1');
  const { data: allAnalysis, loading: loadingAnalysis } = useApi<AnalysisRecord[]>('/analysis/all');

  // ── Filter state ─────────────────────────────────────────────────────────
  const [selBranch,  setSelBranch]  = useState('');
  const [selYear,    setSelYear]    = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [selTeacher, setSelTeacher] = useState('');

  // ── Cascading dropdown options ────────────────────────────────────────────
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

  // ── Cascading resets ──────────────────────────────────────────────────────
  const handleBranchChange  = (v: string) => { setSelBranch(v);  setSelYear(''); setSelSubject(''); setSelTeacher(''); };
  const handleYearChange    = (v: string) => { setSelYear(v);    setSelSubject(''); setSelTeacher(''); };
  const handleSubjectChange = (v: string) => { setSelSubject(v); setSelTeacher(''); };

  // ── Filter records — returns ALL matching (used for aggregation) ──────────
  const filteredRecords = useMemo<AnalysisRecord[]>(() => {
    if (!allAnalysis || !selBranch) return [];
    let base = allAnalysis.filter(a => a.branch_name === selBranch);
    if (selYear)    base = base.filter(a => String(a.start_year) === selYear);
    if (selSubject) base = base.filter(a => a.subject === selSubject);
    if (selTeacher) base = base.filter(a => a.teacher === selTeacher);
    return base;
  }, [allAnalysis, selBranch, selYear, selSubject, selTeacher]);

  // ── Aggregate across all filtered records ─────────────────────────────────
  const aggregated = useMemo<Aggregated | null>(() => {
    if (filteredRecords.length === 0) return null;
    const gd: Record<string, number> = { O: 0, E: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    let above_90 = 0, between_50_90 = 0, failed = 0, totalStudents = 0, weightedAvg = 0;
    for (const r of filteredRecords) {
      above_90      += r.above_90 || 0;
      between_50_90 += r.between_50_90 || 0;
      failed        += r.failed || 0;
      totalStudents += r.total_students || 0;
      weightedAvg   += (r.average_total || 0) * (r.total_students || 0);
      for (const [k, v] of Object.entries(r.grade_distribution || {})) {
        gd[k] = (gd[k] || 0) + Number(v);
      }
    }
    return {
      grade_distribution: gd,
      above_90, between_50_90, failed,
      total_students: totalStudents,
      average_total: totalStudents > 0 ? weightedAvg / totalStudents : 0,
      record_count: filteredRecords.length,
    };
  }, [filteredRecords]);

  // ── Context label for the chart header ────────────────────────────────────
  const contextLabel = useMemo(() => {
    const parts = [selBranch];
    if (selYear) parts.push(`Batch ${selYear}`);
    if (selSubject) parts.push(selSubject);
    if (selTeacher) parts.push(selTeacher);
    return parts.join(' · ');
  }, [selBranch, selYear, selSubject, selTeacher]);

  const isAggregate = (aggregated?.record_count ?? 0) > 1;

  // ── Chart data ────────────────────────────────────────────────────────────
  const gradeData = aggregated
    ? Object.entries(aggregated.grade_distribution)
        .filter(([, v]) => Number(v) > 0)
        .map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  const bucketData = aggregated
    ? [
        { name: 'Outstanding (>90%)', value: aggregated.above_90,        fill: '#50cd89' },
        { name: 'Passing (50–90%)',   value: aggregated.between_50_90,   fill: '#009ef7' },
        { name: 'Failed (<50%)',      value: aggregated.failed,           fill: '#f1416c' },
      ].filter(d => d.value > 0)
    : [];

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const stats: StatCard[] = [
    { label: 'Total Students',  value: studentTotal?.toString() ?? '—', delta: '+12%',  up: true,  icon: GraduationCap, color: '#009ef7', bg: '#f1faff' },
    { label: 'Total Teachers',  value: teacherTotal?.toString() ?? '—', delta: '+3.4%', up: true,  icon: Users,         color: '#7c3aed', bg: '#f4f0ff' },
    { label: 'Month Avg Grade', value: '78%',                               delta: '-2.1%', up: false, icon: BookOpen,       color: '#ffc700', bg: '#fff8dd' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-breadcrumb">Home / <span>Dashboard</span></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Spring Semester 2026
          </div>
          {filteredRecords.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={() => downloadAdminReport(filteredRecords, {
                branch:  selBranch  || undefined,
                year:    selYear    || undefined,
                subject: selSubject || undefined,
              })}
            >
              <Download size={16} /> Download Report
            </button>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

      {/* ── Analytics Filter Section ──────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Filter size={18} style={{ color: 'var(--accent)' }} />
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Performance Explorer</span>
          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
            — Select branch to start. Add filters to drill down further.
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
              <select className="form-input" value={selBranch} onChange={e => handleBranchChange(e.target.value)}>
                <option value="">All Branches</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Start Year (Batch) */}
            <div>
              <label className="form-label">Batch (Start Year)</label>
              <select className="form-input" value={selYear} onChange={e => handleYearChange(e.target.value)} disabled={!selBranch || years.length === 0}>
                <option value="">All Batches</option>
                {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="form-label">Subject</label>
              <select className="form-input" value={selSubject} onChange={e => handleSubjectChange(e.target.value)} disabled={!selBranch || subjects.length === 0}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Teacher */}
            <div>
              <label className="form-label">Teacher</label>
              <select className="form-input" value={selTeacher} onChange={e => setSelTeacher(e.target.value)} disabled={!selBranch || teacherOptions.length === 0}>
                <option value="">All Teachers</option>
                {teacherOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      {selBranch && (
        <>
          {aggregated ? (
            <>
              {/* Context banner */}
              <div className="card p-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {isAggregate && (
                      <span className="badge badge-accent flex items-center gap-1">
                        <Layers size={11} /> Aggregated · {aggregated.record_count} subject{aggregated.record_count !== 1 ? 's' : ''}
                      </span>
                    )}
                    <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                      {contextLabel}
                    </div>
                  </div>
                  <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {aggregated.total_students} student record{aggregated.total_students !== 1 ? 's' : ''}
                    {isAggregate ? ' across all selected subjects' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {isAggregate ? 'Weighted Avg' : 'Class Average'}
                  </div>
                  <div className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {aggregated.average_total.toFixed(1)}
                    <span className="text-base font-medium text-gray-400"> / 100</span>
                  </div>
                </div>
              </div>

              {/* Chart pair */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Pie — Grade Distribution */}
                <div className="card p-6">
                  <div className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Grade Distribution {isAggregate ? '(Combined)' : ''}
                  </div>
                  {gradeData.length === 0 ? (
                    <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>No grade data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={gradeData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value"
                          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
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
                    Performance Buckets {isAggregate ? '(Combined)' : ''}
                  </div>
                  {bucketData.length === 0 ? (
                    <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={bucketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
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
              No analytics data matches the selected filters. Marks must be entered first.
            </div>
          )}
        </>
      )}

      {!selBranch && !loadingAnalysis && (
        <div className="card p-10 text-center" style={{ color: 'var(--text-muted)', borderStyle: 'dashed' }}>
          <Filter size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a <strong>Branch</strong> above to explore performance charts.</p>
          <p className="text-xs mt-1 opacity-60">Narrow down with Batch, Subject, or Teacher for more specific results.</p>
        </div>
      )}
    </div>
  );
};
