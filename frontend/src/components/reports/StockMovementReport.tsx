import { useState, useEffect } from 'react';
import { ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import api from '../../utils/api';

export default function StockMovementReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [productId, setProductId] = useState('ALL');
  const [movementType, setMovementType] = useState('ALL');
  
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch products for filter
    api.get('/products?limit=1000').then(res => {
      if (res.data.success) {
        setProducts(res.data.data.products);
      }
    }).catch(console.error);
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports/stock-movements', {
        params: {
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          productId: productId !== 'ALL' ? productId : undefined,
          movementType: movementType !== 'ALL' ? movementType : undefined
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
  }, [dateFrom, dateTo, productId, movementType]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total IN Quantity</p>
          <div className="flex items-center">
            <ArrowDownToLine className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900">{data.summary.totalInQuantity}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total OUT Quantity</p>
          <div className="flex items-center">
            <ArrowUpFromLine className="h-5 w-5 text-orange-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900">{data.summary.totalOutQuantity}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Number of Movements</p>
          <div className="flex items-center">
            <ArrowRightLeft className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900">{data.summary.totalMovements}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">From Date</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="block w-full border border-slate-300 rounded-md py-2 px-3 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">To Date</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="block w-full border border-slate-300 rounded-md py-2 px-3 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Movement Type</label>
          <select value={movementType} onChange={e => setMovementType(e.target.value)} className="block w-full border border-slate-300 rounded-md py-2 px-3 text-sm">
            <option value="ALL">All Types</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Product</label>
          <select value={productId} onChange={e => setProductId(e.target.value)} className="block w-full border border-slate-300 rounded-md py-2 px-3 text-sm max-w-xs">
            <option value="ALL">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.productName}</option>
            ))}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.data.map((m: any) => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(m.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{m.product.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{m.product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${m.movementType === 'IN' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {m.movementType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 text-right">{m.quantity}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={m.reason}>{m.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{m.createdBy.name}</td>
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
