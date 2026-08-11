import { useState, useEffect } from 'react';
import { Users, Package, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    lowStock: 0,
    challans: 0,
    recentChallans: [] as any[],
    lowStockItems: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [custRes, prodRes, challanRes] = await Promise.all([
          api.get('/customers', { params: { limit: 1 } }), // just need total
          api.get('/products', { params: { limit: 100 } }),
          api.get('/challans', { params: { limit: 4 } })
        ]);

        const products = prodRes.data.data.products || [];
        const lowStockProducts = products.filter((p: any) => p.currentStock <= p.minimumStock);

        setStats({
          customers: custRes.data.data.pagination.total || 0,
          products: prodRes.data.data.pagination.total || 0,
          lowStock: lowStockProducts.length,
          challans: challanRes.data.data.pagination.total || 0,
          recentChallans: challanRes.data.data.challans || [],
          lowStockItems: lowStockProducts.slice(0, 4)
        });
      } catch (err) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const kpiData = [
    { title: 'Total Customers', value: stats.customers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Products', value: stats.products, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Total Challans', value: stats.challans, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your business operations.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`rounded-md p-3 ${item.bg}`}>
                      <Icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-slate-500">{item.title}</dt>
                      <dd>
                        <div className="text-lg font-bold text-slate-900">{loading ? '...' : item.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Recent Challans</h3>
            <Link to="/challans" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : stats.recentChallans.length === 0 ? (
              <p className="text-sm text-slate-500">No recent challans.</p>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Challan No</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Customer</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentChallans.map((challan) => (
                    <tr key={challan.id}>
                      <td className="py-3 text-sm font-bold text-slate-900">
                        <Link to={`/challans/${challan.id}`} className="hover:underline">{challan.challanNumber}</Link>
                      </td>
                      <td className="py-3 text-sm text-slate-500">{challan.customer?.businessName}</td>
                      <td className="py-3 text-sm">
                        <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 ${getStatusBadgeClass(challan.status)}`}>
                          {challan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Low Stock Alerts</h3>
            <Link to="/inventory" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
              View inventory <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : stats.lowStockItems.length === 0 ? (
              <p className="text-sm text-slate-500">No low stock items.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.lowStockItems.map((product) => (
                  <li key={product.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center mr-3">
                        <Package className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{product.productName}</p>
                        <p className="text-xs text-slate-500">Min. required: {product.minimumStock}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${product.currentStock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {product.currentStock} left
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
