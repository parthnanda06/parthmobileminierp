import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

export default function ChallanReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('ALL');
  const [customerId, setCustomerId] = useState('ALL');
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch customers for filter dropdown
    api.get('/customers?limit=1000').then(res => {
      if (res.data.success) {
        setCustomers(res.data.data.customers);
      }
    }).catch(console.error);
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports/challans', {
        params: {
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          status: status !== 'ALL' ? status : undefined,
          customerId: customerId !== 'ALL' ? customerId : undefined
        }
      });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateFrom, dateTo, status, customerId]);

  if (loading && !data) {
    return <div className="p-8 text-center text-slate-500">Loading report...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchReport} className="text-blue-600 hover:underline">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Challans</p>
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary.totalChallans}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Confirmed</p>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary.confirmedCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Draft</p>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary.draftCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Cancelled</p>
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary.cancelledCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Quantity</p>
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-purple-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary.totalQuantity}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">From Date</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="block w-full border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">To Date</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="block w-full border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="block w-full border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm">
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Customer</label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="block w-full border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm max-w-xs">
            <option value="ALL">All Customers</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.businessName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {data.data.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No records found for the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Challan No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Quantity</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {data.data.map((c: any) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{c.challanNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.customer.businessName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 font-semibold text-right">{c.totalQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${c.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
                          c.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.createdBy.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/challans/${c.id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
