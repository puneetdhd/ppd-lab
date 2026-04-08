import React from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { Loader2, BookOpen, Award, TrendingUp } from 'lucide-react';

const GRADE_COLORS: Record<string, string> = {
  O: 'badge-success', E: 'badge-info', A: 'badge-accent',
  B: 'badge-warning', C: 'badge-warning', D: 'badge-warning', F: 'badge-danger',
};

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: marks, loading, error } = useApi<any[]>('/marks/results');

  const list = marks || [];
  const avg  = list.length ? list.reduce((s, m) => s + (m.total || 0), 0) / list.length : 0;
  const failed  = list.filter(m => m.grade === 'F').length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <div className="page-breadcrumb">Home / <span>My Dashboard</span></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card">
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Subjects Enrolled</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{list.length}</div>
          </div>
          <div className="icon-box rounded-2xl" style={{ background: 'var(--info-light)', color: 'var(--info)', width: 52, height: 52 }}>
            <BookOpen size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Average Score</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{list.length ? avg.toFixed(1) : '—'}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>out of 100</div>
          </div>
          <div className="icon-box rounded-2xl" style={{ background: 'var(--success-light)', color: 'var(--success)', width: 52, height: 52 }}>
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Status</div>
            {failed > 0 ? (
              <div className="text-xl font-bold" style={{ color: 'var(--danger)' }}>{failed} Subject{failed > 1 ? 's' : ''} Failed</div>
            ) : list.length > 0 ? (
              <div className="text-xl font-bold" style={{ color: 'var(--success)' }}>All Passing ✓</div>
            ) : (
              <div className="text-xl font-bold" style={{ color: 'var(--text-muted)' }}>Pending</div>
            )}
          </div>
          <div className="icon-box rounded-2xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: 52, height: 52 }}>
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>My Academic Results</div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
          ) : error ? (
            <div className="p-6 text-sm" style={{ color: 'var(--danger)' }}>{error}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th><th>Teacher</th><th>Sem</th>
                  <th>Mid</th><th>Quiz</th><th>Assg</th><th>Attn</th>
                  <th>Total / Grade</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No results published yet.</td></tr>
                )}
                {list.map((m: any) => (
                  <tr key={m._id}>
                    <td><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.assignment_id?.subject_id?.subject_name || '—'}</span></td>
                    <td>{m.assignment_id?.teacher_id?.user_id?.name || '—'}</td>
                    <td><span className="badge badge-muted">Sem {m.assignment_id?.semester || '—'}</span></td>
                    <td>{m.mid}</td><td>{m.quiz}</td><td>{m.assignment}</td><td>{m.attendance}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{m.total}</span>
                        <span className={`badge ${GRADE_COLORS[m.grade] || 'badge-muted'}`}>{m.grade}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
