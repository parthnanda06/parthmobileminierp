import { useState, useEffect } from 'react';
import { Package, Inbox, AlertTriangle, XCircle } from 'lucide-react';
import api from '../../utils/api';

export default function InventoryReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [category, setCategory] = useState('ALL');
  const [stockStatus, setStockStatus] = useState('ALL');
  const [warehouse, setWarehouse] = useState('ALL');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports/inventory', {
        params: {
          category: category !== 'ALL' ? category : undefined,
          stockStatus: stockStatus !== 'ALL' ? stockStatus : undefined,
          warehouse: warehouse !== 'ALL' ? warehouse : undefined
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
  }, [category, stockStatus, warehouse]);

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

  // Extract unique categories and warehouses from full data to build simple filter options if desired, 
  // but better to just use some hardcoded ones or let it be free text. We'll use simple hardcoded or empty input for now,
  // since we don't have a distinct endpoint for categories.

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Products</p>
          <div className="flex items-center">
            <Package className="h-5 w-5 text-indigo-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary.totalProducts}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Stock Units</p>
          <div className="flex items-center">
            <Inbox className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary.totalStockUnits}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Low Stock Products</p>
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary.lowStockProducts}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Out of Stock</p>
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary.outOfStockProducts}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <input 
            type="text" 
            placeholder="E.g. Smartphones"
            value={category === 'ALL' ? '' : category} 
            onChange={e => setCategory(e.target.value || 'ALL')} 
            className="block w-full border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm" 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Status</label>
          <select value={stockStatus} onChange={e => setStockStatus(e.target.value)} className="block w-full border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm">
            <option value="ALL">All Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Warehouse</label>
          <input 
            type="text" 
            placeholder="E.g. WH-01"
            value={warehouse === 'ALL' ? '' : warehouse} 
            onChange={e => setWarehouse(e.target.value || 'ALL')} 
            className="block w-full border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm" 
          />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Minimum Stock</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Warehouse</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {data.data.map((p: any) => {
                  let statusLabel = 'In Stock';
                  let statusClass = 'bg-green-100 text-green-800';
                  
                  if (p.currentStock === 0) {
                    statusLabel = 'Out of Stock';
                    statusClass = 'bg-red-100 text-red-800';
                  } else if (p.currentStock <= p.minimumStock) {
                    statusLabel = 'Low Stock';
                    statusClass = 'bg-amber-100 text-amber-800';
                  }

                  return (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{p.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">{p.currentStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{p.minimumStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.warehouseLocation}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
