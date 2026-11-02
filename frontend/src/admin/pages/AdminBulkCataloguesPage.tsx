import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, FileText, FileSpreadsheet, Download, 
  Trash2, Plus, CheckCircle2, AlertTriangle, RefreshCw, 
  Search, Eye, Tag, Calendar, ExternalLink, X, Check 
} from 'lucide-react';
import { CatalogueBatch } from '../../types';
import { apiRequest } from '../../utils/api';

export const AdminBulkCataloguesPage: React.FC = () => {
  const [batches, setBatches] = useState<CatalogueBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'csv' | 'xlsx' | 'pdf'>('all');

  // Upload Form State
  const [title, setTitle] = useState('');
  const [categoryTag, setCategoryTag] = useState('Wholesale Price List');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionBatchId, setActionBatchId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewBatch, setPreviewBatch] = useState<any | null>(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<CatalogueBatch[]>('/admin/catalogue-imports');
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load catalogue batches:', err);
      const raw = localStorage.getItem('bajaj_catalogue_batches');
      if (raw) setBatches(JSON.parse(raw));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a CSV, Excel (.xlsx), or PDF file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please provide a name/title for this bulk catalogue batch.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('category_tag', categoryTag);

    try {
      const res = await apiRequest('/admin/catalogue-imports/upload', {
        method: 'POST',
        body: formData,
      });

      // If it is a spreadsheet, trigger auto-validation
      if (res && res.import_id && res.file_type !== 'pdf') {
        try {
          await apiRequest(`/admin/catalogue-imports/${res.import_id}/validate`, {
            method: 'POST',
          });
        } catch {}
      }

      setSuccessMsg(`Catalogue batch "${title}" uploaded successfully!`);
      setUploadModalOpen(false);
      setTitle('');
      setFile(null);
      fetchBatches();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload bulk catalogue.');
    } finally {
      setUploading(false);
    }
  };

  const handleCommitBatch = async (batchId: number) => {
    setActionBatchId(batchId);
    try {
      await apiRequest(`/admin/catalogue-imports/${batchId}/commit`, {
        method: 'POST',
      });
      setSuccessMsg('Bulk catalogue products committed into live store catalog!');
      fetchBatches();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to commit catalogue batch.');
    } finally {
      setActionBatchId(null);
    }
  };

  const handleDeleteBatch = async (batchId: number) => {
    if (!window.confirm('Are you sure you want to delete this catalogue batch?')) return;
    setActionBatchId(batchId);
    try {
      await apiRequest(`/admin/catalogue-imports/${batchId}`, {
        method: 'DELETE',
      });
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
      setSuccessMsg('Catalogue batch removed.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete catalogue batch.');
    } finally {
      setActionBatchId(null);
    }
  };

  const handleOpenPreview = async (batch: CatalogueBatch) => {
    try {
      const detail = await apiRequest(`/admin/catalogue-imports/${batch.id}`);
      setPreviewBatch(detail);
      setPreviewModalOpen(true);
    } catch {
      setPreviewBatch(batch);
      setPreviewModalOpen(true);
    }
  };

  // Filtered list
  const filtered = batches.filter((b) => {
    if (formatFilter !== 'all' && b.file_type?.toLowerCase() !== formatFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (b.title || '').toLowerCase().includes(q);
      const matchTag = (b.category_tag || '').toLowerCase().includes(q);
      const matchFile = (b.filename || '').toLowerCase().includes(q);
      if (!matchTitle && !matchTag && !matchFile) return false;
    }
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Multi-Format Ingestion Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Bulk Catalogues & Files (थोक कैटलॉग)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage manufacturer price lists, AVON/Hercules specification PDFs, and bulk CSV inventory uploads with custom names and tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Upload New Catalogue / PDF</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Saved Batches</span>
          <div className="text-3xl font-black text-slate-900 pt-1">{batches.length}</div>
          <span className="text-[11px] text-slate-400 block">CSV, Excel & PDF archives</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">PDF Catalogues Stored</span>
          <div className="text-3xl font-black text-rose-600 pt-1">
            {batches.filter((b) => b.file_type?.toLowerCase() === 'pdf').length}
          </div>
          <span className="text-[11px] text-slate-400 block">Direct downloadable specifications</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Spreadsheet Batches</span>
          <div className="text-3xl font-black text-emerald-600 pt-1">
            {batches.filter((b) => b.file_type?.toLowerCase() !== 'pdf').length}
          </div>
          <span className="text-[11px] text-slate-400 block">Bulk inventory data</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Max Import Capacity</span>
          <div className="text-3xl font-black text-slate-900 pt-1">10,000</div>
          <span className="text-[11px] text-emerald-600 font-semibold block">Rows per spreadsheet batch</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by batch name, tag, or file..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {(['all', 'csv', 'xlsx', 'pdf'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormatFilter(fmt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition whitespace-nowrap ${
                formatFilter === fmt
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {fmt === 'all' ? 'All Formats' : fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Table / List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
          Loading bulk catalogues...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No bulk catalogues found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload manufacturer specification PDFs, wholesale price spreadsheets, or seasonal inventory files using the button above.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Catalogue Batch Name & Tag</th>
                  <th className="py-3.5 px-4">Format</th>
                  <th className="py-3.5 px-4">File Details</th>
                  <th className="py-3.5 px-4">Rows / Items</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((batch) => {
                  const isPdf = batch.file_type?.toLowerCase() === 'pdf';
                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                      {/* Name & Tag */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-xs">{batch.title || batch.filename}</h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px]">
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            <span>{batch.category_tag || 'General'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Format Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            isPdf
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isPdf ? <FileText className="w-3.5 h-3.5" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                          <span className="uppercase">{batch.file_type}</span>
                        </span>
                      </td>

                      {/* File Details */}
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        <span className="block truncate max-w-[180px] font-sans font-medium text-slate-700">
                          {batch.filename}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {formatFileSize(batch.file_size_bytes)} • {new Date(batch.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>

                      {/* Rows / Items */}
                      <td className="py-4 px-4">
                        {isPdf ? (
                          <span className="text-slate-400 italic">Full Document</span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800">{batch.total_rows} rows</span>
                            {batch.valid_rows > 0 && (
                              <span className="text-[10px] text-emerald-600 block">
                                {batch.valid_rows} valid
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            batch.status === 'COMMITTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : batch.status === 'VALIDATED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View / Download */}
                          {batch.file_url ? (
                            <a
                              href={batch.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              title="View / Download file"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : null}

                          {/* Preview Spreadsheet */}
                          {!isPdf && (
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(batch)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              title="Preview rows"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Commit Live */}
                          {!isPdf && batch.status !== 'COMMITTED' && (
                            <button
                              type="button"
                              disabled={actionBatchId === batch.id}
                              onClick={() => handleCommitBatch(batch.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow"
                              title="Commit rows into live bicycle catalogue"
                            >
                              Commit
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={actionBatchId === batch.id}
                            onClick={() => handleDeleteBatch(batch.id)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Delete batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload New Bulk Catalogue Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">Upload Bulk Catalogue / File</h3>
                  <p className="text-xs text-slate-400">Attach CSV, Excel, or PDF catalogues with custom name</p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Batch Title */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Catalogue Batch Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AVON 2026 Wholesale Price List or Hercules Roadeo Specs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              {/* Category Tag */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Catalogue Classification / Tag
                </label>
                <select
                  value={categoryTag}
                  onChange={(e) => setCategoryTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition"
                >
                  <option value="Wholesale Price List">Wholesale Price List</option>
                  <option value="Bicycle Catalog PDF">Bicycle Catalog PDF</option>
                  <option value="Specifications Sheet">Specifications Sheet</option>
                  <option value="Seasonal / Festive Range">Seasonal / Festive Range</option>
                  <option value="Spare Parts & Accessories">Spare Parts & Accessories</option>
                </select>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Attach File (.csv, .xlsx, or .pdf up to 25MB) *
                </label>
                <label className="p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 transition group text-center">
                  <UploadCloud className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold text-white block">
                    {file ? file.name : 'Click to select Catalogue File'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports CSV, Excel (.xlsx), and PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        if (!title) {
                          setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
                        }
                      }
                    }}
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading & Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Upload Catalogue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spreadsheet Preview Modal */}
      {previewModalOpen && previewBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">{previewBatch.title || previewBatch.filename}</h3>
                <p className="text-xs text-slate-400">Total Rows: {previewBatch.total_rows} • Status: {previewBatch.status}</p>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              {Array.isArray(previewBatch.preview_data_json) && previewBatch.preview_data_json.length > 0 ? (
                <div className="border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-800 text-slate-300 text-[10px] uppercase">
                      <tr>
                        {Object.keys(previewBatch.preview_data_json[0] || {}).map((k) => (
                          <th key={k} className="p-2.5 border-b border-slate-700 whitespace-nowrap">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {previewBatch.preview_data_json.slice(0, 15).map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          {Object.values(row).map((val: any, cidx: number) => (
                            <td key={cidx} className="p-2.5 whitespace-nowrap">{String(val || '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No tabular preview data available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

