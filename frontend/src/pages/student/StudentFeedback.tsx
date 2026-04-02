import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';

export const StudentFeedback: React.FC = () => {
  const { data: assignmentsData, loading: assignmentsLoading } = useApi<any[]>('/assignments');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) {
      setMessage({ type: 'error', text: 'Please select a subject' });
      return;
    }

    // Find the assignment from the list
    const assignment = assignmentsData?.find(a => a._id === selectedAssignment);
    if (!assignment) return;

    setSubmitting(true);
    setMessage(null);

    try {
      await api.post('/feedback', {
        teacher_id: assignment.teacher_id._id,
        subject_id: assignment.subject_id._id,
        rating: Number(rating),
        comment
      });
      setMessage({ type: 'success', text: 'Feedback submitted successfully!' });
      setComment('');
      setRating('5');
      setSelectedAssignment('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Submit Course Feedback</CardTitle>
          <p className="text-sm text-slate-500">Your feedback helps us improve the teaching quality.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {message && (
              <div className={`p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject / Teacher</label>
              <select 
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                disabled={assignmentsLoading}
              >
                <option value="">Select a subject...</option>
                {assignmentsData?.map((a: any) => (
                  <option key={a._id} value={a._id}>
                    {a.subject_id?.subject_name} — Taught by {a.teacher_id?.user_id?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating (1-5)</label>
              <div className="flex space-x-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num} className="flex flex-col items-center cursor-pointer group">
                    <input 
                      type="radio" 
                      name="rating" 
                      value={num} 
                      checked={rating === String(num)}
                      onChange={(e) => setRating(e.target.value)}
                      className="peer sr-only" 
                    />
                    <div className="w-12 h-12 rounded-full flex justify-center items-center font-bold text-lg border-2 border-slate-200 bg-white text-slate-500 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary transition-all group-hover:border-primary/50">
                      {num}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Detailed Comments</label>
              <textarea 
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What went well? What could be improved?"
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-primary hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Submit Feedback
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
