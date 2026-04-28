import React, { useState, useRef, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle,
  Loader2, Download, Trash2
} from 'lucide-react';

interface CsvRow {
  regdNo: string;
  name: string;
  midsem: number;
  endsem: number;
  quiz: number;
  assignment: number;
}

interface ResultRow {
  regdNo: string;
  name: string;
  status: string;
}

export const AdminMarksUpload: React.FC = () => {
  const { data: assignments, loading: loadingAssignments } = useApi<any[]>('/assignments');

  // ── Cascading selectors ───────────────────────────────────────────────────
  const [selBranch,  setSelBranch]  = useState('');
  const [selBatch,   setSelBatch]   = useState('');   // batch _id
  const [selSubject, setSelSubject] = useState('');   // subject _id

  const branches = useMemo(() => {
    if (!assignments) return [];
    const seen = new Set<string>();
    const result: { name: string }[] = [];
    for (const a of assignments) {
      const name = a.batch_id?.branch_id?.branch_name;
      if (name && !seen.has(name)) { seen.add(name); result.push({ name }); }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [assignments]);

  const batches = useMemo(() => {
    if (!assignments || !selBranch) return [];
    const seen = new Set<string>();
    const result: { _id: string; label: string }[] = [];
    for (const a of assignments) {
      if (a.batch_id?.branch_id?.branch_name !== selBranch) continue;
      const id = a.batch_id?._id;
      if (id && !seen.has(id)) {
        seen.add(id);
        result.push({ _id: id, label: `${a.batch_id?.start_year}–${a.batch_id?.graduation_year}` });
      }
    }
    return result.sort((a, b) => a.label.localeCompare(b.label));
  }, [assignments, selBranch]);

  const subjects = useMemo(() => {
    if (!assignments || !selBranch || !selBatch) return [];
    const seen = new Set<string>();
    const result: { _id: string; name: string; assignment_id: string }[] = [];
    for (const a of assignments) {
      if (a.batch_id?._id !== selBatch) continue;
      const sid = a.subject_id?._id;
      if (sid && !seen.has(sid)) {
        seen.add(sid);
        result.push({ _id: sid, name: a.subject_id?.subject_name, assignment_id: a._id });
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [assignments, selBranch, selBatch]);

  // Derive assignment_id from selected subject
  const selectedAssignmentId = useMemo(() => {
    return subjects.find(s => s._id === selSubject)?.assignment_id || '';
  }, [subjects, selSubject]);

  const handleBranchChange = (v: string) => { setSelBranch(v); setSelBatch(''); setSelSubject(''); };
  const handleBatchChange  = (v: string) => { setSelBatch(v);  setSelSubject(''); };

  // ── File upload state ─────────────────────────────────────────────────────
  const [rows, setRows]       = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(''); setResults(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { setError('Please upload a .csv file'); return; }
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const first = lines[0]?.toLowerCase() || '';
      const startIdx = (first.includes('reg') || first.includes('name') || first.includes('mid')) ? 1 : 0;

      const parsed: CsvRow[] = [];
      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 5 && cols[0]) {
          parsed.push({
            regdNo:     cols[0],
            name:       cols[1] || '',
            midsem:     Math.min(parseFloat(cols[2]) || 0, 20),
            endsem:     Math.min(parseFloat(cols[3]) || 0, 60),
            quiz:       Math.min(parseFloat(cols[4]) || 0, 10),
            assignment: Math.min(parseFloat(cols[5]) || 0, 10),
          });
        }
      }

      if (parsed.length === 0) { setError('No valid rows found. Check the CSV format below.'); return; }
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!selectedAssignmentId) { setError('Please select Branch, Batch, and Subject first'); return; }
    if (rows.length === 0) { setError('No rows to upload'); return; }

    setUploading(true); setError('');
    try {
      const res = await api.post('/marks/bulk', {
        assignment_id: selectedAssignmentId,
        rows: rows.map(r => ({
          regdNo: r.regdNo, name: r.name,
          midsem: r.midsem, endsem: r.endsem,
          quiz: r.quiz, assignment: r.assignment,
        })),
      });
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setRows([]); setFileName(''); setResults(null); setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadSample = () => {
    const csv = [
      'Registration No,Student Name,Midsem (max 20),Endsem (max 60),Quiz (max 10),Assignment (max 10)',
      '2024UGCS001,Kartik Singh,18,52,8,9',
      '2024UGCS002,Priya Sharma,15,48,7,8',
      '2024UGCS003,Rahul Verma,12,40,6,7',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample_marks.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const createdCount = results?.filter(r => r.status === 'Created').length || 0;
  const updatedCount = results?.filter(r => r.status === 'Updated').length || 0;
  const skippedCount = results ? results.length - createdCount - updatedCount : 0;

  const selectionComplete = !!(selBranch && selBatch && selSubject);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Student Results</h1>
          <div className="page-breadcrumb">Home / <span>Upload Marks</span></div>
        </div>
        <button className="btn btn-outline" onClick={downloadSample}>
          <Download size={16} /> Download Sample CSV
        </button>
      </div>

      {/* ── Step 1: Select Branch / Batch / Subject ────────────────────────── */}
      <div className="card p-6">
        <div className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Step 1 — Select Class
        </div>

        {loadingAssignments ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Branch */}
            <div>
              <label className="form-label">Branch</label>
              <select className="form-input" value={selBranch} onChange={e => handleBranchChange(e.target.value)}>
                <option value="">— Select Branch —</option>
                {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>

            {/* Batch */}
            <div>
              <label className="form-label">Batch</label>
              <select className="form-input" value={selBatch} onChange={e => handleBatchChange(e.target.value)}
                disabled={!selBranch || batches.length === 0}>
                <option value="">— Select Batch —</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.label}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="form-label">Subject</label>
              <select className="form-input" value={selSubject} onChange={e => setSelSubject(e.target.value)}
                disabled={!selBatch || subjects.length === 0}>
                <option value="">— Select Subject —</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {selectionComplete && (
          <div className="mt-4 text-sm px-4 py-2 rounded-xl inline-flex items-center gap-2"
            style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle2 size={15} />
            Ready to upload marks for <strong>{selBranch}</strong> · <strong>
              {batches.find(b => b._id === selBatch)?.label}
            </strong> · <strong>{subjects.find(s => s._id === selSubject)?.name}</strong>
          </div>
        )}
      </div>

      {/* ── Step 2: Format Info ───────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Step 2 — CSV Format
        </div>
        <div className="flex items-start gap-4">
          <div className="icon-box rounded-xl shrink-0"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: 44, height: 44 }}>
            <FileSpreadsheet size={22} />
          </div>
          <div className="flex-1">
            <div className="overflow-x-auto">
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Col 1</th><th>Col 2</th><th>Col 3</th><th>Col 4</th><th>Col 5</th><th>Col 6</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Reg No</strong></td>
                    <td>Student Name</td>
                    <td>Midsem <span style={{ color: 'var(--text-muted)' }}>(max 20)</span></td>
                    <td>Endsem <span style={{ color: 'var(--text-muted)' }}>(max 60)</span></td>
                    <td>Quiz <span style={{ color: 'var(--text-muted)' }}>(max 10)</span></td>
                    <td>Assignment <span style={{ color: 'var(--text-muted)' }}>(max 10)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Total = Midsem + Endsem + Quiz + Assignment (Max 100). Existing records are updated automatically.
            </p>
          </div>
        </div>
      </div>

      {/* ── Step 3: Upload ─────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Step 3 — Upload CSV</div>

        {/* Drop Zone */}
        <label
          className="flex flex-col items-center justify-center gap-3 rounded-xl py-10 px-6 cursor-pointer transition-all"
          style={{
            border: '2px dashed var(--border)',
            background: rows.length > 0 ? 'var(--success-light)' : 'var(--bg)',
            color: rows.length > 0 ? 'var(--success)' : 'var(--text-muted)',
          }}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && fileRef.current) {
              const dt = new DataTransfer(); dt.items.add(file);
              fileRef.current.files = dt.files;
              fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }}
        >
          {rows.length > 0 ? <CheckCircle2 size={32} /> : <Upload size={32} />}
          <div className="text-sm font-medium">
            {rows.length > 0
              ? `${fileName} — ${rows.length} student${rows.length !== 1 ? 's' : ''} parsed`
              : 'Click to browse or drag & drop a CSV file'}
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
            style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Preview */}
        {rows.length > 0 && !results && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Preview ({rows.length} students)
              </div>
              <button className="btn btn-ghost btn-sm text-xs" onClick={handleReset} style={{ color: 'var(--danger)' }}>
                <Trash2 size={14} /> Clear
              </button>
            </div>
            <div className="overflow-x-auto" style={{ maxHeight: 320 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Reg No</th><th>Name</th>
                    <th>Midsem /20</th><th>Endsem /60</th><th>Quiz /10</th><th>Assg /10</th><th>Total /100</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((r, i) => {
                    const total = r.midsem + r.endsem + r.quiz + r.assignment;
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><code style={{ fontSize: 11 }}>{r.regdNo}</code></td>
                        <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name || '—'}</td>
                        <td>{r.midsem}</td><td>{r.endsem}</td><td>{r.quiz}</td><td>{r.assignment}</td>
                        <td><strong style={{ color: 'var(--accent)' }}>{total}</strong></td>
                      </tr>
                    );
                  })}
                  {rows.length > 50 && (
                    <tr><td colSpan={8} className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      … and {rows.length - 50} more
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action */}
        {rows.length > 0 && !results && (
          <div className="flex items-center gap-3 pt-2">
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !selectionComplete}>
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading…' : `Upload ${rows.length} Results`}
            </button>
            <button className="btn btn-outline" onClick={handleReset}>Cancel</button>
            {!selectionComplete && (
              <span className="text-xs" style={{ color: 'var(--danger)' }}>
                ⚠ Select Branch, Batch, and Subject first
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Upload Results</div>
            {createdCount > 0 && <span className="badge badge-success">{createdCount} Created</span>}
            {updatedCount > 0 && <span className="badge badge-info">{updatedCount} Updated</span>}
            {skippedCount > 0 && <span className="badge badge-warning">{skippedCount} Skipped/Failed</span>}
          </div>

          <div className="overflow-x-auto" style={{ maxHeight: 400 }}>
            <table className="data-table">
              <thead><tr><th>#</th><th>Reg No</th><th>Student Name</th><th>Status</th></tr></thead>
              <tbody>
                {results.map((r, i) => {
                  const isOk = r.status === 'Created' || r.status === 'Updated';
                  const badgeClass = r.status === 'Created' ? 'badge-success'
                    : r.status === 'Updated' ? 'badge-info' : 'badge-warning';
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><code style={{ fontSize: 12 }}>{r.regdNo || '—'}</code></td>
                      <td className={isOk ? 'font-medium' : ''}
                        style={{ color: isOk ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {r.name || '—'}
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: 11 }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary" onClick={handleReset}>
            <Upload size={16} /> Upload Another CSV
          </button>
        </div>
      )}
    </div>
  );
};
