import { useState, useEffect } from 'react';
import { Plus, Package, AlertCircle, ArrowDownToLine } from 'lucide-react';
import api from '../utils/api';
import AddStockModal from '../components/AddStockModal';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      // For inventory view, we want all products to show in list.
      // Usually pagination applies, but we simplify here.
      const response = await api.get('/products', {
        params: { limit: 100 } // Get all for modal selection and table view
      });
      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleModalClose = (wasSaved?: boolean) => {
    setIsModalOpen(false);
    if (wasSaved) {
      fetchInventory();
    }
  };

  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.currentStock, 0);
  const lowStockItems = products.filter(p => p.currentStock <= p.minimumStock).length;
  // Simplification for Stock In Today metric
  const stockInToday = 'Check movements';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor warehouse stock levels and movements.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Products</dt>
                  <dd className="flex items-baseline"><div className="text-2xl font-semibold text-slate-900">{totalProducts}</div></dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <BoxesIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Units</dt>
                  <dd className="flex items-baseline"><div className="text-2xl font-semibold text-slate-900">{totalUnits}</div></dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Low Stock Items</dt>
                  <dd className="flex items-baseline"><div className="text-2xl font-semibold text-slate-900">{lowStockItems}</div></dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <ArrowDownToLine className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Stock In Today</dt>
                  <dd className="flex items-baseline"><div className="text-sm font-semibold text-slate-900 mt-1">{stockInToday}</div></dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200">
        {error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
            <button onClick={fetchInventory} className="mt-2 text-blue-600 hover:underline">Retry</button>
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-slate-500">Loading inventory...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No inventory found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Stock</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Minimum Stock</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Warehouse</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {products.map((product) => {
                  const isLowStock = product.currentStock <= product.minimumStock;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{product.sku}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>{product.currentStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{product.minimumStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {isLowStock ? 'LOW STOCK' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{product.warehouseLocation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddStockModal isOpen={isModalOpen} onClose={handleModalClose} products={products} />
    </div>
  );
}

function BoxesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/>
      <path d="m7 16.5-4.74-2.85"/>
      <path d="m7 16.5 5-3"/>
      <path d="M7 16.5v5.17"/>
      <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/>
      <path d="m17 16.5-5-3"/>
      <path d="m17 16.5 4.74-2.85"/>
      <path d="M17 16.5v5.17"/>
      <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/>
      <path d="M12 8 7.26 5.15"/>
      <path d="m12 8 4.74-2.85"/>
      <path d="M12 13.5V8"/>
    </svg>
  );
}
