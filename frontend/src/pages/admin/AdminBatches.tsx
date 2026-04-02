import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { Plus, Trash2, Loader2, Calendar } from 'lucide-react';

export const AdminBatches: React.FC = () => {
  const { data, loading, refetch } = useApi<any[]>('/batches');
  const { data: branches }         = useApi<any[]>('/branches');
  const [showModal, setModal] = useState(false);
  const [form, setForm] = useState({ branch_id: '', start_year: new Date().getFullYear(), graduation_year: new Date().getFullYear() + 4 });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/batches', form); setModal(false); refetch(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this batch?')) return;
    try { await api.delete(`/batches/${id}`); refetch(); }
    catch { alert('Failed to delete.'); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Batches</h1>
          <div className="page-breadcrumb">Home / <span>Batches</span></div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />Add Batch</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(data || []).map((b: any) => (
            <div key={b._id} className="card p-5 flex items-center gap-4 group hover:border-purple-200 transition-colors">
              <div className="icon-box rounded-xl" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                <Calendar size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {b.branch_id?.branch_name || '—'}
                </div>
                <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {b.start_year} – {b.graduation_year}
                </div>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-icon btn-sm"
                onClick={() => handleDelete(b._id)}
              >
                <Trash2 size={15} style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          ))}
          {(data || []).length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: 'var(--text-muted)' }}>No batches found.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Add Batch</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">
                <div><label className="form-label">Branch</label>
                  <select className="form-input" required value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })}>
                    <option value="">Select branch</option>
                    {branches?.map((b: any) => <option key={b._id} value={b._id}>{b.branch_name}</option>)}
                  </select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="form-label">Start Year</label>
                    <input type="number" className="form-input" required value={form.start_year} onChange={e => setForm({ ...form, start_year: Number(e.target.value) })} /></div>
                  <div><label className="form-label">Graduation Year</label>
                    <input type="number" className="form-input" required value={form.graduation_year} onChange={e => setForm({ ...form, graduation_year: Number(e.target.value) })} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
