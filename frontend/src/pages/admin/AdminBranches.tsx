import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { Plus, Loader2, Trash2, Building2 } from 'lucide-react';

export const AdminBranches: React.FC = () => {
  const { data, loading, refetch } = useApi<any[]>('/branches');
  const [showModal, setModal] = useState(false);
  const [name, setName]       = useState('');
  const [saving, setSaving]   = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/branches', { branch_name: name }); setModal(false); setName(''); refetch(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch?')) return;
    try { await api.delete(`/branches/${id}`); refetch(); }
    catch { alert('Failed to delete.'); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Branches / Library</h1>
          <div className="page-breadcrumb">Home / <span>Branches</span></div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />Add Branch</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(data || []).map((b: any) => (
            <div key={b._id} className="card p-5 flex items-center gap-4 group hover:border-purple-200 transition-colors">
              <div className="icon-box rounded-xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <Building2 size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{b.branch_name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>ID: {b._id.slice(-6)}</div>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-icon btn-sm transition-opacity"
                onClick={() => handleDelete(b._id)}
              >
                <Trash2 size={15} style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          ))}
          {(data || []).length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: 'var(--text-muted)' }}>No branches found.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Add Branch</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <label className="form-label">Branch Name</label>
                <input className="form-input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mechanical Engineering" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
