import { Users, Package, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const kpiData = [
  { title: 'Total Customers', value: '250', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { title: 'Total Products', value: '85', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { title: 'Low Stock Items', value: '8', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  { title: 'Total Challans', value: '430', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' }
];

const recentChallans = [
  { id: 'CH-2024-001', customer: 'ABC Mobile Store', date: '2024-05-15', amount: '₹1,25,000', status: 'Delivered' },
  { id: 'CH-2024-002', customer: 'Shree Telecom', date: '2024-05-16', amount: '₹45,500', status: 'Pending' },
  { id: 'CH-2024-003', customer: 'Raj Mobiles', date: '2024-05-17', amount: '₹3,10,000', status: 'Processing' },
  { id: 'CH-2024-004', customer: 'Digital World', date: '2024-05-18', amount: '₹85,000', status: 'Delivered' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
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
                        <div className="text-lg font-bold text-slate-900">{item.value}</div>
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
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Challan ID</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Customer</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Amount</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentChallans.map((challan) => (
                  <tr key={challan.id}>
                    <td className="py-3 text-sm font-medium text-slate-900">{challan.id}</td>
                    <td className="py-3 text-sm text-slate-500">{challan.customer}</td>
                    <td className="py-3 text-sm text-slate-900 font-medium">{challan.amount}</td>
                    <td className="py-3 text-sm">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        challan.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                        challan.status === 'Pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 
                        'bg-blue-50 text-blue-700 ring-blue-600/20'
                      }`}>
                        {challan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <ul className="divide-y divide-slate-100">
              {[
                { name: 'iPhone 15 128GB Black', stock: 2, min: 5 },
                { name: 'Samsung Galaxy S24 Ultra', stock: 1, min: 3 },
                { name: 'OnePlus 12 256GB Green', stock: 0, min: 5 },
                { name: 'Vivo V30 Pro', stock: 3, min: 10 },
              ].map((product) => (
                <li key={product.name} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center mr-3">
                      <Package className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">Min. required: {product.min}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${product.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {product.stock} left
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
