import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { AlertCircle, CheckCircle2, Loader2, Send, Star } from 'lucide-react';

export const StudentFeedback: React.FC = () => {
  const { data: assignmentsData, loading: assignmentsLoading } = useApi<any[]>('/assignments/student/my-subjects');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) {
      setMessage({ type: 'error', text: 'Please select a subject' });
      return;
    }

    const assignment = assignmentsData?.find(a => a._id === selectedAssignment);
    if (!assignment) return;

    setSubmitting(true);
    setMessage(null);

    try {
      await api.post('/feedback', {
        teacher_id: assignment.teacher_id._id || assignment.teacher_id,
        subject_id: assignment.subject_id._id || assignment.subject_id,
        rating,
        comment
      });
      setMessage({ type: 'success', text: 'Feedback submitted successfully!' });
      setComment('');
      setRating(5);
      setSelectedAssignment('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit Feedback</h1>
          <div className="page-breadcrumb">Home / Student / <span>Feedback</span></div>
        </div>
      </div>

      <div className="card max-w-2xl">
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Course Feedback</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Your feedback helps improve teaching quality</div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {message && (
            <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
              message.type === 'success' ? '' : ''
            }`} style={{
              background: message.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            }}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <div>
            <label className="form-label">Subject / Teacher</label>
            {assignmentsLoading ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}><Loader2 size={14} className="animate-spin" /> Loading subjects…</div>
            ) : (
              <select
                className="form-input"
                value={selectedAssignment}
                onChange={e => setSelectedAssignment(e.target.value)}
              >
                <option value="">Select a subject…</option>
                {(assignmentsData || []).map((a: any) => (
                  <option key={a._id} value={a._id}>
                    {a.subject_id?.subject_name || 'Unknown'} — {a.teacher_id?.user_id?.name || 'Unknown'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="form-label">Rating</label>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    fill={n <= rating ? '#ffc700' : 'transparent'}
                    stroke={n <= rating ? '#ffc700' : 'var(--text-muted)'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
              <span className="text-sm font-bold ml-2" style={{ color: 'var(--text-primary)' }}>{rating}/5</span>
            </div>
          </div>

          <div>
            <label className="form-label">Comments (Optional)</label>
            <textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What went well? What could be improved?"
              className="form-input"
              style={{ resize: 'none' }}
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={16} /> Submit Feedback</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
