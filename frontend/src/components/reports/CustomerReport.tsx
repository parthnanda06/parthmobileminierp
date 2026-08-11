import { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus, UserX } from 'lucide-react';
import api from '../../utils/api';

export default function CustomerReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [customerType, setCustomerType] = useState('ALL');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports/customers', {
        params: {
          search: search || undefined,
          status: status !== 'ALL' ? status : undefined,
          customerType: customerType !== 'ALL' ? customerType : undefined
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
    const timer = setTimeout(() => {
      fetchReport();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, customerType]);

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Customers</p>
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900">{data.summary.totalCustomers}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Active</p>
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900">{data.summary.activeCustomers}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Leads</p>
          <div className="flex items-center">
            <UserPlus className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900">{data.summary.leadCustomers}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Inactive</p>
          <div className="flex items-center">
            <UserX className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900">{data.summary.inactiveCustomers}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-6 text-sm text-slate-500">
        <span>Retail: <strong className="text-slate-700">{data.summary.retailCount}</strong></span>
        <span>Wholesale: <strong className="text-slate-700">{data.summary.wholesaleCount}</strong></span>
        <span>Distributor: <strong className="text-slate-700">{data.summary.distributorCount}</strong></span>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-700 mb-1">Search</label>
          <input 
            type="text" 
            placeholder="Search by name, business or mobile..."
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="block w-full border border-slate-300 rounded-md py-2 px-3 text-sm" 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="block w-full border border-slate-300 rounded-md py-2 px-3 text-sm">
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LEAD">Lead</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Customer Type</label>
          <select value={customerType} onChange={e => setCustomerType(e.target.value)} className="block w-full border border-slate-300 rounded-md py-2 px-3 text-sm">
            <option value="ALL">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {data.data.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No records found for the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Follow-up Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.data.map((c: any) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{c.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.businessName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.customerType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          c.status === 'LEAD' ? 'bg-amber-100 text-amber-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : 'None'}
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
