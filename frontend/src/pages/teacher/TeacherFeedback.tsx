import React from 'react';
import { useApi } from '../../hooks/useApi';
import { Loader2, Star } from 'lucide-react';

export const TeacherFeedback: React.FC = () => {
  const { data, loading, error } = useApi<any>('/feedback/received');

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>;
  if (error) return <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>{error}</div>;

  const feedbacks = data?.feedbacks || [];
  const avgRating = data?.average_rating || 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Feedback</h1>
          <div className="page-breadcrumb">Home / Teacher / <span>Feedback</span></div>
        </div>
      </div>

      {/* Average Rating Card */}
      <div className="card p-6 flex items-center gap-6">
        <div>
          <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Average Rating</div>
          <div className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {avgRating.toFixed(1)} <span className="text-base font-medium text-gray-400">/ 5</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} size={20} fill={n <= Math.round(avgRating) ? '#ffc700' : 'transparent'} stroke={n <= Math.round(avgRating) ? '#ffc700' : 'var(--text-muted)'} />
            ))}
          </div>
        </div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Based on {feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Feedback List */}
      <div className="card">
        <div className="px-6 py-4 font-semibold" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          Student Reviews
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {feedbacks.length === 0 && (
            <div className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>No feedback received yet.</div>
          )}
          {feedbacks.map((f: any) => (
            <div key={f._id} className="px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-sm text-xs">{f.student_id?.user_id?.name?.charAt(0) || 'S'}</div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{f.student_id?.user_id?.name || 'Anonymous'}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.subject_id?.subject_name || ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={14} fill={n <= f.rating ? '#ffc700' : 'transparent'} stroke={n <= f.rating ? '#ffc700' : 'var(--text-muted)'} />
                  ))}
                </div>
              </div>
              {f.comment && (
                <p className="text-sm ml-11" style={{ color: 'var(--text-secondary)' }}>"{f.comment}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
