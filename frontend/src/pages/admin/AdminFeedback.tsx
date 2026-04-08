import React from 'react';
import { useApi } from '../../hooks/useApi';
import { Loader2, Star } from 'lucide-react';

export const AdminFeedback: React.FC = () => {
  const { data, loading } = useApi<any[]>('/feedback');

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Feedback</h1>
          <div className="page-breadcrumb">Home / <span>Feedback</span></div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Student Feedback</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{data?.length || 0} total</div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th><th>Teacher</th><th>Subject</th><th>Rating</th><th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No feedback submitted yet.</td></tr>
                )}
                {(data || []).map((f: any) => (
                  <tr key={f._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="avatar avatar-sm text-xs">{f.student_id?.user_id?.name?.charAt(0) || 'S'}</div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{f.student_id?.user_id?.name || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="avatar avatar-sm text-xs">{f.teacher_id?.user_id?.name?.charAt(0) || 'T'}</div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{f.teacher_id?.user_id?.name || '—'}</span>
                      </div>
                    </td>
                    <td>{f.subject_id?.subject_name || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={14} fill={n <= f.rating ? '#ffc700' : 'transparent'} stroke={n <= f.rating ? '#ffc700' : 'var(--text-muted)'} />
                        ))}
                        <span className="text-xs ml-1 font-bold" style={{ color: 'var(--text-primary)' }}>{f.rating}/5</span>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-[200px] truncate text-sm" style={{ color: 'var(--text-secondary)' }}>{f.comment || '—'}</div>
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
