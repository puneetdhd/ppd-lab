import React, { useState, useRef, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle,
  Loader2, Download, Trash2
} from 'lucide-react';

interface CsvRow {
  name: string;
  regdNo: string;
}

interface ResultRow {
  name: string;
  email: string;
  status: string;
}

export const AdminStudentsAdd: React.FC = () => {
  const { data: batches, loading: loadingBatches } = useApi<any[]>('/batches');

  const [selBranch, setSelBranch] = useState('');
  const [batchId,   setBatchId]   = useState('');
  const [rows,      setRows]      = useState<CsvRow[]>([]);
  const [fileName,  setFileName]  = useState('');
  const [results,   setResults]   = useState<ResultRow[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Derived options ───────────────────────────────────────────────────────
  const branches = useMemo(() => {
    if (!batches) return [];
    return [...new Set(batches.map((b: any) => b.branch_id?.branch_name).filter(Boolean))].sort() as string[];
  }, [batches]);

  const filteredBatches = useMemo(() => {
    if (!batches || !selBranch) return [];
    return batches.filter((b: any) => b.branch_id?.branch_name === selBranch);
  }, [batches, selBranch]);

  const selectedBatch = filteredBatches.find((b: any) => b._id === batchId);

  const handleBranchChange = (v: string) => {
    setSelBranch(v); setBatchId(''); setError(''); setResults(null);
  };

  // ── File parsing ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(''); setResults(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { setError('Please upload a .csv file'); return; }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text   = ev.target?.result as string;
      const lines  = text.split(/\r?\n/).filter(l => l.trim());
      const first  = lines[0]?.toLowerCase() || '';
      const start  = (first.includes('name') || first.includes('reg')) ? 1 : 0;
      const parsed: CsvRow[] = [];

      for (let i = start; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2 && cols[0] && cols[1]) {
          parsed.push({ name: cols[0], regdNo: cols[1] });
        }
      }

      if (parsed.length === 0) {
        setError('No valid rows found. CSV needs Name (col 1) and Registration No (col 2).');
        return;
      }
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selBranch) { setError('Please select a branch'); return; }
    if (!batchId)   { setError('Please select a batch');  return; }
    if (rows.length === 0) { setError('No rows to upload'); return; }

    setUploading(true); setError('');
    try {
      const res = await api.post('/students/bulk', { batch_id: batchId, rows });
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setRows([]); setFileName(''); setResults(null); setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadSample = () => {
    const csv = 'Name,Registration No\nKartik Kumar Singh,2024UGCS001\nPriya Sharma,2024UGCS002\nRahul Verma,2024UGCS003';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'sample_students.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const createdCount = results?.filter(r => r.status === 'Created').length || 0;
  const skippedCount = results ? results.length - createdCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Students (CSV Upload)</h1>
          <div className="page-breadcrumb">Home / Students / <span>Add Students</span></div>
        </div>
        <button className="btn btn-outline" onClick={downloadSample}>
          <Download size={16} /> Download Sample CSV
        </button>
      </div>

      {/* Format info */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="icon-box rounded-xl shrink-0"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: 44, height: 44 }}>
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>CSV Format</div>
            <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Upload a <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>.csv</code> file
              with two columns: <strong style={{ color: 'var(--text-primary)' }}>Name</strong> (col 1)
              and <strong style={{ color: 'var(--text-primary)' }}>Registration Number</strong> (col 2).
            </div>
            <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              <strong>Email</strong> is auto-generated → <em>2024UGCS001@edu.ppd</em> &nbsp;|&nbsp;
              <strong>Password</strong> → Registration No (e.g., <em>2024UGCS001</em>)
            </div>
          </div>
        </div>
      </div>

      {/* ── Step 1: Branch + Batch ─────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Step 1 — Select Branch &amp; Batch
        </div>

        {loadingBatches ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Branch */}
            <div>
              <label className="form-label">Branch</label>
              <select className="form-input" value={selBranch} onChange={e => handleBranchChange(e.target.value)}>
                <option value="">— Select Branch —</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Batch — filtered by branch */}
            <div>
              <label className="form-label">Batch</label>
              <select
                className="form-input"
                value={batchId}
                onChange={e => { setBatchId(e.target.value); setError(''); }}
                disabled={!selBranch || filteredBatches.length === 0}
              >
                <option value="">— Select Batch —</option>
                {filteredBatches.map((b: any) => (
                  <option key={b._id} value={b._id}>
                    {b.start_year}–{b.graduation_year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {selBranch && batchId && selectedBatch && (
          <div className="mt-4 text-sm px-3 py-2 rounded-xl inline-flex items-center gap-2"
            style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle2 size={14} />
            Students will be enrolled in <strong>{selBranch}</strong> · <strong>
              {selectedBatch.start_year}–{selectedBatch.graduation_year}
            </strong>
          </div>
        )}
      </div>

      {/* ── Step 2: Upload CSV ─────────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Step 2 — Upload CSV File</div>

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

        {/* Preview Table */}
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
                    <th>#</th><th>Name</th><th>Regd No (Password)</th><th>Generated Email</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                      <td><code style={{ fontSize: 12 }}>{r.regdNo}</code></td>
                      <td style={{ color: 'var(--text-muted)' }}>{r.regdNo}@edu.ppd</td>
                    </tr>
                  ))}
                  {rows.length > 50 && (
                    <tr>
                      <td colSpan={4} className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        … and {rows.length - 50} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {rows.length > 0 && !results && (
          <div className="flex items-center gap-3 pt-2">
            <button className="btn btn-primary" onClick={handleUpload}
              disabled={uploading || !batchId || !selBranch}>
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Creating students…' : `Upload ${rows.length} Students`}
            </button>
            <button className="btn btn-outline" onClick={handleReset}>Cancel</button>
            {(!selBranch || !batchId) && (
              <span className="text-xs" style={{ color: 'var(--danger)' }}>
                ⚠ Select Branch and Batch first
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
            <span className="badge badge-success">{createdCount} Created</span>
            {skippedCount > 0 && <span className="badge badge-warning">{skippedCount} Skipped/Failed</span>}
          </div>
          <div className="overflow-x-auto" style={{ maxHeight: 400 }}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Status</th></tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.email}</td>
                    <td>
                      <span className={`badge ${r.status === 'Created' ? 'badge-success' : 'badge-warning'}`}
                        style={{ fontSize: 11 }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary" onClick={handleReset}>
            <Upload size={16} /> Upload Another Batch
          </button>
        </div>
      )}
    </div>
  );
};
