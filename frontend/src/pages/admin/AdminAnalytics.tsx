import React from 'react';
import { useApi } from '../../hooks/useApi';
import { Loader2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

const COLORS = ['#7c3aed', '#009ef7', '#50cd89', '#ffc700', '#f1416c', '#a78bfa', '#fb923c'];

export const AdminAnalytics: React.FC = () => {
  const { data, loading, error } = useApi<any[]>('/analysis/all');

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>;
  if (error) return <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>{error}</div>;
  if (!data?.length) return <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>No analytics data yet. Marks must be entered first.</div>;

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance Analytics</h1>
          <div className="page-breadcrumb">Home / <span>Analytics</span></div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card">
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Total Assignments</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.length}</div>
          </div>
          <div className="icon-box rounded-2xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: 52, height: 52 }}>📊</div>
        </div>
        <div className="stat-card">
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Total Students Graded</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.reduce((s, a) => s + a.total_students, 0)}</div>
          </div>
          <div className="icon-box rounded-2xl" style={{ background: 'var(--success-light)', color: 'var(--success)', width: 52, height: 52 }}>🎓</div>
        </div>
        <div className="stat-card">
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>System Average</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {(data.reduce((s, a) => s + a.average_total, 0) / data.length).toFixed(1)}
            </div>
          </div>
          <div className="icon-box rounded-2xl" style={{ background: 'var(--info-light)', color: 'var(--info)', width: 52, height: 52 }}>📈</div>
        </div>
      </div>

      {data.map((analysis: any, idx: number) => {
        const gradeData = Object.entries(analysis.grade_distribution || {})
          .filter(([, v]) => Number(v) > 0)
          .map(([name, value]) => ({ name, value: Number(value) }));

        const bucketData = [
          { name: 'Outstanding (>90%)', value: analysis.above_90 || 0, fill: '#50cd89' },
          { name: 'Passing (50-90%)',   value: analysis.between_50_90 || 0, fill: '#009ef7' },
          { name: 'Failed (<50%)',      value: analysis.failed || 0, fill: '#f1416c' },
        ].filter(d => d.value > 0);

        return (
          <div key={idx}>
            <div className="card p-5 mb-5 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{analysis.subject}</div>
                <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {analysis.batch} · Semester {analysis.semester} · Teacher: {analysis.teacher || '—'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Class Average</div>
                <div className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  {analysis.average_total?.toFixed(1)}<span className="text-base font-medium text-gray-400"> / 100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card p-6">
                <div className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Grade Distribution</div>
                {gradeData.length === 0 ? (
                  <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>No grade data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={gradeData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card p-6">
                <div className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Performance Buckets</div>
                {bucketData.length === 0 ? (
                  <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={bucketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48} name="Students">
                        {bucketData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
