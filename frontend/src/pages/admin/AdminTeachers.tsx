import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaginatedApi } from '../../hooks/usePaginatedApi';
import api from '../../api/axios';
import {
  Plus, Search, Trash2, Users, Loader2, Upload,
  X, BookOpen, Building2, Mail, Hash, ChevronLeft, ChevronRight
} from 'lucide-react';

const PAGE_SIZE = 20;


interface TeacherDetailModalProps {
  teacher: any;
  onClose: () => void;
}

const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({ teacher, onClose }) => {
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.get('/assignments')
      .then(res => {
        const all = res.data.data || [];
        setAssignments(all.filter((a: any) => a.teacher_id?._id === teacher._id));
      })
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, [teacher._id]);

  const branches  = [...new Set(assignments.map((a: any) => a.batch_id?.branch_id?.branch_name).filter(Boolean))];
  const subjectNames = [...new Set(assignments.map((a: any) => a.subject_id?.subject_name).filter(Boolean))];
  const batches   = [...new Set(assignments.map((a: any) =>
    `${a.batch_id?.start_year}–${a.batch_id?.graduation_year}`).filter(Boolean))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-4">
            <div className="avatar" style={{ width: 52, height: 52, fontSize: 22 }}>
              {teacher.user_id?.name?.charAt(0) || 'T'}
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {teacher.user_id?.name}
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Mail size={11} /> {teacher.user_id?.email}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <>
              {/* KPI strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Branches', value: branches.length, icon: Building2, color: '#009ef7', bg: '#f1faff' },
                  { label: 'Subjects', value: subjectNames.length, icon: BookOpen,   color: '#7c3aed', bg: '#f4f0ff' },
                  { label: 'Batches',  value: batches.length,  icon: Hash,       color: '#50cd89', bg: '#f6fff9' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-xl p-4 flex items-center gap-3"
                      style={{ background: stat.bg, border: '1px solid var(--border)' }}>
                      <div className="icon-box rounded-lg shrink-0"
                        style={{ background: `${stat.color}20`, color: stat.color, width: 36, height: 36 }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subjects taught */}
              {subjectNames.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    Subjects Taught
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjectNames.map(s => (
                      <span key={s} className="badge badge-accent">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Branches */}
              {branches.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    Branches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {branches.map(b => (
                      <span key={b} className="badge badge-info">{b}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignments table */}
              {assignments.length > 0 ? (
                <div>
                  <div className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    Teaching Assignments ({assignments.length})
                  </div>
                  <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
                    <table className="data-table" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th>Subject</th><th>Branch</th><th>Batch</th><th>Sem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((a: any) => (
                          <tr key={a._id}>
                            <td className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {a.subject_id?.subject_name}
                            </td>
                            <td>{a.batch_id?.branch_id?.branch_name}</td>
                            <td>{a.batch_id?.start_year}–{a.batch_id?.graduation_year}</td>
                            <td><span className="badge badge-accent" style={{ fontSize: 10 }}>Sem {a.semester}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No teaching assignments found for this teacher.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminTeachers: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: teachers, total, page, totalPages,
    loading, setPage, setSearch, refetch,
  } = usePaginatedApi<any>('/teachers', PAGE_SIZE);

  const [showModal, setModal] = useState(false);
  const [form, setForm]       = useState({ name: '', regdNo: '' });
  const [saving, setSaving]   = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/teachers', form);
      setModal(false); setForm({ name: '', regdNo: '' }); refetch();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this teacher?')) return;
    try { await api.delete(`/teachers/${id}`); refetch(); }
    catch { alert('Failed to delete.'); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teachers</h1>
          <div className="page-breadcrumb">Home / <span>Teachers</span></div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline" onClick={() => navigate('/admin/teachers/new')}>
            <Upload size={16} /> Add via CSV
          </button>
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />Add Teacher</button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Faculty Members
            <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
              ({total} total · click a row to view details)
            </span>
          </div>
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input className="form-input" style={{ paddingLeft: 34, width: 220 }} placeholder="Search teachers..."
              onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Action</th></tr>
              </thead>
              <tbody>
                {teachers.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No teachers found.</td></tr>
                )}
                {teachers.map((t: any) => (
                  <tr key={t._id}
                    onClick={() => setSelected(t)}
                    style={{ cursor: 'pointer' }}
                    className="hover:bg-accent-light transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-sm text-xs">{t.user_id?.name?.charAt(0) || 'T'}</div>
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t.user_id?.name}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to view profile</div>
                        </div>
                      </div>
                    </td>
                    <td>{t.user_id?.email}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-icon btn-sm"
                          onClick={e => handleDelete(t._id, e)}>
                          <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </div>
          <div className="flex items-center gap-1">
            <button className="page-btn" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              return start + i;
            }).map(n => (
              <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            {totalPages > 5 && page < totalPages - 2 && <span style={{ color: 'var(--text-muted)' }}>···</span>}
            {totalPages > 5 && page < totalPages - 2 && (
              <button className={`page-btn ${page === totalPages ? 'active' : ''}`} onClick={() => setPage(totalPages)}>
                {totalPages}
              </button>
            )}
            <button className="page-btn" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail popup */}
      {selected && <TeacherDetailModal teacher={selected} onClose={() => setSelected(null)} />}

      {/* Add Teacher modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-box rounded-xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: 40, height: 40 }}>
                  <Users size={20} />
                </div>
                <div>
                  <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Add Teacher</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Create a new teacher account</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">
                <div><label className="form-label">Full Name</label>
                  <input className="form-input" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Smith" /></div>
                <div><label className="form-label">Teacher ID / Regd No</label>
                  <input className="form-input" required value={form.regdNo}
                    onChange={e => setForm({ ...form, regdNo: e.target.value })} placeholder="TCH2024001" /></div>
                {form.regdNo && (
                  <div className="text-xs p-3 rounded-xl" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Auto-generated:</strong>{' '}
                    Email: <code>{form.regdNo}@edu.ppd</code> · Password: <code>{form.regdNo}</code>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
