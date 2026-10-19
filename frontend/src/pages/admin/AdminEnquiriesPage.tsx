import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  MessageSquare, Download, Check, AlertCircle, 
  Search, Phone, Mail, Clock, Edit2 
} from 'lucide-react';
import { Enquiry } from '../../types';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const AdminEnquiriesPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/admin/enquiries?status=${statusFilter}` : '/admin/enquiries';
      const data = await apiRequest<Enquiry[]>(url);
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleOpenEdit = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setStatusUpdate(enq.status);
    setInternalNotes(enq.internal_notes || '');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    setUpdating(true);
    try {
      await apiRequest(`/admin/enquiries/${selectedEnquiry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: statusUpdate,
          internal_notes: internalNotes.trim() || undefined,
        }),
      });
      setSelectedEnquiry(null);
      setSuccessMsg('Enquiry status updated successfully.');
      fetchEnquiries();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update enquiry status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/v1/admin/enquiries/export', '_blank');
  };

  if (authLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Verifying admin authorization...
      </div>
    );
  }

  if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Customer Inquiries & Leads
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Customer Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track inquiries submitted through product detail cards, contact forms, and storefront quotes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New Inquiries</option>
            <option value="CONTACTED">Contacted</option>
            <option value="AWAITING_CUSTOMER">Awaiting Customer</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Enquiries Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Ref No / Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Query Message</th>
                <th className="py-3.5 px-4 text-center">Contact Via</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{enq.reference_no}</span>
                    <span className="text-[10px] text-slate-400">{new Date(enq.created_at).toLocaleString()}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{enq.name}</span>
                    <span className="text-slate-500 text-[11px] block">{enq.phone}</span>
                    {enq.email && <span className="text-slate-400 text-[10px] block">{enq.email}</span>}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {enq.category}
                    </span>
                    {enq.product_name && (
                      <span className="text-emerald-700 font-bold text-[10px] block mt-0.5">
                        Model: {enq.product_name}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-700 line-clamp-2">{enq.message}</p>
                    {enq.internal_notes && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded block mt-1">
                        Note: {enq.internal_notes}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-semibold text-slate-600">{enq.preferred_contact}</span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      enq.status === 'NEW' 
                        ? 'bg-blue-100 text-blue-800' 
                        : enq.status === 'CONTACTED' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {enq.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(enq)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                      title="Update Status"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Update Enquiry: {selectedEnquiry.reference_no}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Customer: {selectedEnquiry.name} ({selectedEnquiry.phone})
            </p>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="AWAITING_CUSTOMER">AWAITING_CUSTOMER</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes (Private)</label>
                <textarea
                  rows={3}
                  placeholder="Record customer preferences, showroom visit date, quoted price..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                >
                  {updating ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
