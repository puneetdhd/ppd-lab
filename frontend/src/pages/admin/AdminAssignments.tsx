import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { Plus, Loader2, ClipboardList } from 'lucide-react';

export const AdminAssignments: React.FC = () => {
  const { data, loading, refetch } = useApi<any[]>('/assignments');
  const { data: teachers }         = useApi<any[]>('/teachers');
  const { data: subjects }         = useApi<any[]>('/subjects');
  const { data: batches }          = useApi<any[]>('/batches');
  const [showModal, setModal] = useState(false);
  const [form, setForm] = useState({ teacher_id: '', subject_id: '', batch_id: '', semester: 1 });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/assignments', form); setModal(false); refetch(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teaching Assignments</h1>
          <div className="page-breadcrumb">Home / <span>Assignments</span></div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />Assign Teacher</button>
      </div>

      <div className="card">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>All Assignments</div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Teacher</th><th>Subject</th><th>Branch / Batch</th><th>Semester</th></tr></thead>
              <tbody>
                {(data || []).map((a: any) => (
                  <tr key={a._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="avatar avatar-sm text-xs">{a.teacher_id?.user_id?.name?.charAt(0) || 'T'}</div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.teacher_id?.user_id?.name || '—'}</span>
                      </div>
                    </td>
                    <td>{a.subject_id?.subject_name || '—'}</td>
                    <td>
                      <span className="badge badge-info">{a.batch_id?.branch_id?.branch_name || '—'} ({a.batch_id?.start_year}–{a.batch_id?.graduation_year})</span>
                    </td>
                    <td><span className="badge badge-accent">Sem {a.semester}</span></td>
                  </tr>
                ))}
                {!(data || []).length && (
                  <tr><td colSpan={4} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No assignments yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-box rounded-xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: 40, height: 40 }}><ClipboardList size={20} /></div>
                <div><div className="font-bold" style={{ color: 'var(--text-primary)' }}>Assign Teacher</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Create a new teaching assignment</div></div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">
                <div><label className="form-label">Teacher</label>
                  <select className="form-input" required value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}>
                    <option value="">Select teacher</option>
                    {teachers?.map((t: any) => <option key={t._id} value={t._id}>{t.user_id?.name}</option>)}
                  </select></div>
                <div><label className="form-label">Subject</label>
                  <select className="form-input" required value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                    <option value="">Select subject</option>
                    {subjects?.map((s: any) => <option key={s._id} value={s._id}>{s.subject_name}</option>)}
                  </select></div>
                <div><label className="form-label">Batch</label>
                  <select className="form-input" required value={form.batch_id} onChange={e => setForm({ ...form, batch_id: e.target.value })}>
                    <option value="">Select batch</option>
                    {batches?.map((b: any) => <option key={b._id} value={b._id}>{b.branch_id?.branch_name} ({b.start_year}–{b.graduation_year})</option>)}
                  </select></div>
                <div><label className="form-label">Semester</label>
                  <input type="number" min={1} max={8} className="form-input" required value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
