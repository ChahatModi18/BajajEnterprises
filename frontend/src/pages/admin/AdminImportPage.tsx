import React, { useState } from 'react';
import { 
  UploadCloud, FileSpreadsheet, CheckCircle2, 
  AlertTriangle, ArrowRight, RefreshCw, FileText 
} from 'lucide-react';
import { apiRequest } from '../../utils/api';

export const AdminImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importId, setImportId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid_rows: number;
    error_rows: number;
    errors: any[];
  } | null>(null);

  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    setValidationResult(null);
    setCommitResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiRequest('/admin/catalogue-imports/upload', {
        method: 'POST',
        body: formData,
      });
      setImportId(res.import_id);
      setPreviewData(res.preview_data || []);
      
      // Auto-trigger validation
      const valRes = await apiRequest(`/admin/catalogue-imports/${res.import_id}/validate`, {
        method: 'POST',
      });
      setValidationResult(valRes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload catalogue spreadsheet.');
    } finally {
      setUploading(false);
    }
  };

  const handleCommit = async () => {
    if (!importId) return;
    setCommitting(true);
    setErrorMsg(null);

    try {
      const res = await apiRequest(`/admin/catalogue-imports/${importId}/commit`, {
        method: 'POST',
      });
      setCommitResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to commit catalogue to live store.');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Catalogue Ingestion Pipeline
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Bulk Catalogue Import (CSV / Excel)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload spreadsheets from distributors or manufacturers. The system validates SKUs, prices, brands, categories, and dynamic columns before writing to the live catalogue.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      {!commitResult && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleUpload} className="space-y-4">
            <label className="block p-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl text-center cursor-pointer bg-slate-50 transition">
              <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <span className="text-sm font-bold text-slate-800 block">
                {file ? file.name : 'Select CSV or Excel (.xlsx) file to import'}
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                Expected columns: Name, SKU, Brand, Category, Selling Price, MRP, Wheel Size, Gear Count, Colour...
              </span>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!file || uploading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{uploading ? 'Processing File...' : 'Upload & Validate Spreadsheet'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Validation & Preview Summary */}
      {validationResult && !commitResult && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base">Validation Inspection Results</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                Valid: {validationResult.valid_rows} rows
              </span>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold rounded-full">
                Errors: {validationResult.error_rows} rows
              </span>
            </div>
          </div>

          {/* Error Details */}
          {validationResult.errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-900">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Row-Level Errors Detected (Invalid rows will be skipped):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] max-h-36 overflow-y-auto pr-1">
                {validationResult.errors.map((err, i) => (
                  <li key={i}>
                    <strong>Row {err.row_number} (SKU: {err.sku || 'N/A'}):</strong> {err.errors.join('; ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {previewData.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">First 10 Rows Preview:</span>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                    <tr>
                      {Object.keys(previewData[0]).map((k) => (
                        <th key={k} className="p-2 border-r border-slate-200">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {Object.values(row).map((val: any, cidx) => (
                          <td key={cidx} className="p-2 border-r border-slate-100 whitespace-nowrap">
                            {String(val || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Commit Action Button */}
          <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Ready to write <strong>{validationResult.valid_rows} verified bicycle models</strong> to live store catalogue.
            </div>
            <button
              onClick={handleCommit}
              disabled={committing || validationResult.valid_rows === 0}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
            >
              <span>{committing ? 'Importing Products...' : 'Commit Products to Store'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Commit Banner */}
      {commitResult && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Import Successfully Committed!</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Successfully imported <strong>{commitResult.imported_products_count}</strong> new bicycles into Bajaj Enterprises catalogue.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setFile(null);
                setImportId(null);
                setValidationResult(null);
                setCommitResult(null);
              }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Upload Another Catalogue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
