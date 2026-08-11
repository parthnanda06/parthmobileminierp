import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Edit, Check } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ChallanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canConfirm = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [challan, setChallan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [confirmError, setConfirmError] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchChallan = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/challans/${id}`);
      if (response.data.success) {
        setChallan(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    setActionLoading(true);
    setConfirmError(null);
    setSuccess('');
    try {
      await api.post(`/challans/${id}/confirm`);
      setSuccess('Challan confirmed successfully. Stock has been deducted.');
      setShowConfirmDialog(false);
      fetchChallan(); // refresh
    } catch (err: any) {
      setShowConfirmDialog(false);
      if (err.response?.data?.message === 'Insufficient stock') {
        setConfirmError(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to confirm challan');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this draft?')) return;
    setActionLoading(true);
    try {
      await api.post(`/challans/${id}/cancel`);
      fetchChallan();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel challan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!challan) return null;

  const grandTotal = challan.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/challans')} className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {challan.challanNumber}
          </h1>
          <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full 
            ${challan.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
              challan.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
              'bg-red-100 text-red-800'}`}>
            {challan.status}
          </span>
        </div>
        
        {challan.status === 'DRAFT' && canConfirm && (
          <div className="flex space-x-3">
            <Link
              to={`/challans/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit Draft
            </Link>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4 mr-2" /> Cancel
            </button>
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Confirm Challan
            </button>
          </div>
        )}
      </div>

      {success && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-700 font-medium">
          {success}
        </div>
      )}

      {confirmError && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <h3 className="text-red-800 font-medium text-lg">Unable to confirm challan.</h3>
          <p className="text-red-700 mt-1">Insufficient stock for the following items:</p>
          <ul className="mt-3 space-y-2">
            {confirmError.map((err: any, idx: number) => (
              <li key={idx} className="text-sm text-red-600 bg-white p-2 rounded border border-red-100">
                <span className="font-bold">{err.productName}</span> — Available: {err.available}, Requested: {err.requested}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-red-700">Please edit the draft to reduce quantities.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Customer Details</h3>
            <p className="text-lg font-semibold text-slate-900">{challan.customer?.businessName}</p>
            <p className="text-slate-600">{challan.customer?.address}</p>
            <p className="text-slate-600">Mobile: {challan.customer?.mobile}</p>
            {challan.customer?.gstNumber && <p className="text-slate-600">GST: {challan.customer?.gstNumber}</p>}
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Order Information</h3>
            <p className="text-slate-600"><span className="font-medium text-slate-700">Created:</span> {new Date(challan.createdAt).toLocaleString()}</p>
            <p className="text-slate-600"><span className="font-medium text-slate-700">Created By:</span> {challan.createdBy?.name} ({challan.createdBy?.role})</p>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {challan.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-medium">
                    ₹{(item.quantity * item.unitPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-12">
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Quantity</p>
            <p className="text-2xl font-bold text-slate-900">{challan.totalQuantity}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Grand Total</p>
            <p className="text-2xl font-bold text-slate-900">₹{grandTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={() => setShowConfirmDialog(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Check className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Confirm Sales Challan?</h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        This will deduct the selected quantities from current inventory. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm Challan
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
