import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, Download, Check, AlertCircle, 
  Store, Truck, Edit2, Eye, X 
} from 'lucide-react';
import { OrderRequest } from '../../types';
import { apiRequest } from '../../utils/api';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRequest | null>(null);
  const [detailOrder, setDetailOrder] = useState<OrderRequest | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/admin/order-requests?status=${statusFilter}` : '/admin/order-requests';
      const data = await apiRequest<OrderRequest[]>(url);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleOpenEdit = (ord: OrderRequest) => {
    setSelectedOrder(ord);
    setStatusUpdate(ord.status);
    setInternalNotes(ord.internal_notes || '');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      await apiRequest(`/admin/order-requests/${selectedOrder.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: statusUpdate,
          internal_notes: internalNotes.trim() || undefined,
        }),
      });
      setSelectedOrder(null);
      setSuccessMsg('Order request status updated.');
      fetchOrders();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/v1/admin/order-requests/export', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Customer Fulfillment Requests
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Order Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review bicycle reservations, verify stock in showroom, update status, and manage pickup or delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="">All Statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
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

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Ref ID / Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4">Estimated Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{ord.reference_no}</span>
                    <span className="text-[10px] text-slate-400">{new Date(ord.created_at).toLocaleString()}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{ord.customer_name}</span>
                    <span className="text-slate-500 text-[11px] block">{ord.customer_phone}</span>
                    {ord.customer_email && <span className="text-slate-400 text-[10px] block">{ord.customer_email}</span>}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      {ord.delivery_preference === 'PICKUP' ? (
                        <>
                          <Store className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Showroom Pickup</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Delivery ({ord.city || 'Bikaner'})</span>
                        </>
                      )}
                    </span>
                    {ord.items && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {ord.items.length} bicycle line items
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                    ₹{ord.total_amount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      ord.status === 'RECEIVED' 
                        ? 'bg-amber-100 text-amber-800' 
                        : ord.status === 'CONFIRMED' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'FULFILLED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ord.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setDetailOrder(ord)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(ord)}
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

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setDetailOrder(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Order Request Detail
            </h3>
            <span className="font-mono text-emerald-700 font-bold text-xs block mb-4">
              {detailOrder.reference_no}
            </span>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800 text-sm">{detailOrder.customer_name}</div>
                <div className="text-slate-600">Phone: {detailOrder.customer_phone}</div>
                {detailOrder.customer_email && <div className="text-slate-600">Email: {detailOrder.customer_email}</div>}
                <div className="text-slate-600">Preference: <strong>{detailOrder.delivery_preference}</strong></div>
                {detailOrder.address_line1 && (
                  <div className="text-slate-600">
                    Address: {detailOrder.address_line1}, {detailOrder.city}, {detailOrder.state} {detailOrder.postal_code}
                  </div>
                )}
                {detailOrder.notes && (
                  <div className="text-amber-800 bg-amber-50 p-2 rounded-lg mt-2">
                    Customer Notes: {detailOrder.notes}
                  </div>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-2">Requested Bicycles:</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {detailOrder.items?.map((it) => (
                    <div key={it.id} className="p-3 flex justify-between items-center bg-white">
                      <div>
                        <span className="font-bold text-slate-900 block">{it.product_name}</span>
                        <span className="text-[10px] text-slate-400">SKU: {it.product_sku} • Qty: {it.quantity}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">
                        ₹{it.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black pt-2">
                <span>Estimated Total:</span>
                <span className="text-lg">₹{detailOrder.total_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Update Order: {selectedOrder.reference_no}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Customer: {selectedOrder.customer_name} ({selectedOrder.customer_phone})
            </p>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="RECEIVED">RECEIVED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="FULFILLED">FULFILLED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes (Private)</label>
                <textarea
                  rows={3}
                  placeholder="Record fulfillment notes, delivery tracking, customer phone call notes..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
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
