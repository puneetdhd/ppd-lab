import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { Loader2, Building2, BookOpen, Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { downloadAdminReport } from '../../utils/pdfReports';

const GRADE_COLORS = ['#50cd89','#009ef7','#a78bfa','#ffc700','#fb923c','#f1416c','#6b7280'];
const GRADES = ['O','E','A','B','C','D','F'];

export const AdminPerformanceSubject: React.FC = () => {
  const { data: batches,  loading: lBatches  } = useApi<any[]>('/batches');
  const { data: analysis, loading: lAnalysis } = useApi<any[]>('/analysis/all');

  const [selBranch, setSelBranch] = useState('');
  const [selBatch,  setSelBatch]  = useState('');

  /* ── Derive unique branches ──────────────────────────────── */
  const branches = useMemo(() => {
    if (!batches) return [];
    return [...new Set(batches.map((b: any) => b.branch_id?.branch_name).filter(Boolean))].sort() as string[];
  }, [batches]);

  const filteredBatches = useMemo(() => {
    if (!batches || !selBranch) return [];
    return batches.filter((b: any) => b.branch_id?.branch_name === selBranch);
  }, [batches, selBranch]);

  /* ── Filter analysis records for selected batch ──────────── */
  const records = useMemo(() => {
    if (!analysis || !selBatch) return [];
    return analysis.filter((a: any) => {
      // Match by start_year or raw batch label comparison
      const batchObj = filteredBatches.find((b: any) => String(b._id) === selBatch);
      if (!batchObj) return false;
      return (
        a.branch_name === selBranch &&
        a.start_year  === batchObj.start_year &&
        a.graduation_year === batchObj.graduation_year
      );
    });
  }, [analysis, selBatch, selBranch, filteredBatches]);

  /* ── Group by subject ────────────────────────────────────── */
  const subjectData = useMemo(() => {
    const map = new Map<string, any>();
    for (const r of records) {
      const key = r.subject || 'Unknown';
      if (!map.has(key)) {
        map.set(key, {
          subject: key,
          total_students: 0,
          above_90: 0,
          between_50_90: 0,
          failed: 0,
          weightedAvg: 0,
          grade_distribution: { O:0, E:0, A:0, B:0, C:0, D:0, F:0 },
          records: [],
        });
      }
      const entry = map.get(key)!;
      entry.total_students  += r.total_students || 0;
      entry.above_90        += r.above_90 || 0;
      entry.between_50_90   += r.between_50_90 || 0;
      entry.failed          += r.failed || 0;
      entry.weightedAvg     += (r.average_total || 0) * (r.total_students || 0);
      for (const g of GRADES) {
        entry.grade_distribution[g] = (entry.grade_distribution[g] || 0) + (r.grade_distribution?.[g] || 0);
      }
      entry.records.push(r);
    }
    // compute average
    return Array.from(map.values()).map(e => ({
      ...e,
      average_total: e.total_students > 0 ? e.weightedAvg / e.total_students : 0,
    }));
  }, [records]);

  /* ── Chart data ──────────────────────────────────────────── */
  const barData = subjectData.map(s => ({
    name: s.subject.length > 12 ? s.subject.slice(0, 12) + '…' : s.subject,
    fullName: s.subject,
    Outstanding: s.above_90,
    Passing: s.between_50_90,
    Failed: s.failed,
    Avg: parseFloat(s.average_total.toFixed(1)),
  }));

  const selectedBatchObj = filteredBatches.find((b: any) => String(b._id) === selBatch);

  const isReady = selBranch && selBatch && !lAnalysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance by Subject</h1>
          <div className="page-breadcrumb">Home / Performance / <span>By Subject</span></div>
        </div>
        {subjectData.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={() => downloadAdminReport(records, {
              branch:  selBranch || undefined,
              year:    selectedBatchObj ? String(selectedBatchObj.start_year) : undefined,
              subject: undefined,
            })}
          >
            <Download size={16} /> Download Report
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Branch */}
          <div>
            <label className="form-label flex items-center gap-2">
              <Building2 size={15} style={{ color: 'var(--accent)' }} /> Branch
            </label>
            {lBatches ? (
              <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Loader2 size={16} className="animate-spin" /> Loading…
              </div>
            ) : (
              <select className="form-input" value={selBranch}
                onChange={e => { setSelBranch(e.target.value); setSelBatch(''); }}>
                <option value="">— Select Branch —</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
          </div>

          {/* Batch */}
          <div>
            <label className="form-label flex items-center gap-2">
              <BookOpen size={15} style={{ color: 'var(--accent)' }} /> Batch
            </label>
            <select className="form-input" value={selBatch}
              onChange={e => setSelBatch(e.target.value)}
              disabled={!selBranch || filteredBatches.length === 0}>
              <option value="">— Select Batch —</option>
              {filteredBatches.map((b: any) => (
                <option key={b._id} value={b._id}>
                  {b.start_year}–{b.graduation_year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty / loading states */}
      {!selBranch && (
        <div className="card flex items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
          <div className="text-center">
            <Building2 size={40} style={{ opacity: .2, margin: '0 auto 12px' }} />
            <div className="font-medium">Select a Branch and Batch to view subject-wise performance</div>
          </div>
        </div>
      )}

      {selBranch && !selBatch && (
        <div className="card flex items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-center text-sm">Select a batch to continue</div>
        </div>
      )}

      {isReady && lAnalysis && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      )}

      {isReady && !lAnalysis && subjectData.length === 0 && (
        <div className="card flex items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
          <div className="text-sm">No data found for this branch/batch combination.</div>
        </div>
      )}

      {/* Results */}
      {subjectData.length > 0 && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Subjects',       value: subjectData.length },
              { label: 'Total Students', value: subjectData.reduce((s, x) => s + x.total_students, 0) },
              { label: 'Outstanding',    value: subjectData.reduce((s, x) => s + x.above_90, 0) },
              { label: 'Failed',         value: subjectData.reduce((s, x) => s + x.failed, 0) },
            ].map((st, i) => (
              <div key={st.label} className="stat-card">
                <div>
                  <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{st.label}</div>
                  <div className="text-3xl font-bold" style={{
                    color: i === 3 && st.value > 0 ? 'var(--danger)' : i === 2 ? 'var(--success)' : 'var(--accent)'
                  }}>{st.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stacked bar chart */}
          <div className="card p-6">
            <div className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
              Student Distribution by Subject
              <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
                {selBranch} · {selectedBatchObj?.start_year}–{selectedBatchObj?.graduation_year}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={8} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any, name: string, props: any) => [val, name]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 16 }} />
                <Bar dataKey="Outstanding" fill="#50cd89" radius={[4,4,0,0]} maxBarSize={40} stackId="a" />
                <Bar dataKey="Passing"     fill="#009ef7" radius={[0,0,0,0]} maxBarSize={40} stackId="a" />
                <Bar dataKey="Failed"      fill="#f1416c" radius={[0,0,0,0]} maxBarSize={40} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-subject cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {subjectData.map((s, idx) => {
              const gradeData = GRADES
                .filter(g => (s.grade_distribution[g] || 0) > 0)
                .map((g, i) => ({ name: g, value: s.grade_distribution[g], fill: GRADE_COLORS[i] }));
              const passRate = s.total_students > 0
                ? (((s.total_students - s.failed) / s.total_students) * 100).toFixed(1)
                : '—';

              return (
                <div key={idx} className="card p-5">
                  {/* Subject header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {s.subject}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {s.total_students} students · {s.records.length} section{s.records.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>
                        {s.average_total.toFixed(1)}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>avg / 100</div>
                    </div>
                  </div>

                  {/* Metric pills */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="badge badge-success" style={{ fontSize: 11 }}>
                      ✦ {s.above_90} Outstanding
                    </span>
                    <span className="badge badge-info" style={{ fontSize: 11 }}>
                      {s.between_50_90} Passing
                    </span>
                    <span className={`badge ${s.failed > 0 ? 'badge-danger' : 'badge-muted'}`} style={{ fontSize: 11 }}>
                      {s.failed} Failed
                    </span>
                    <span className="badge badge-accent" style={{ fontSize: 11 }}>
                      {passRate}% Pass Rate
                    </span>
                  </div>

                  {/* Mini pie */}
                  {gradeData.length > 0 && (
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={gradeData} cx="50%" cy="50%"
                          innerRadius={40} outerRadius={65}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          labelLine={false}>
                          {gradeData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
