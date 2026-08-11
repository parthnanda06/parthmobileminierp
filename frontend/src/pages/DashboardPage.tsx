import { useState, useEffect } from 'react';
import { Users, Package, AlertTriangle, FileText, Activity, TrendingUp, TrendingDown, Inbox } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;
  }

  const role = data.role;
  const metrics = data.metrics;

  const renderAdminDashboard = () => {
    const kpis = [
      { title: 'Total Customers', value: metrics.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
      { title: 'Total Products', value: metrics.totalProducts, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
      { title: 'Total Stock Units', value: metrics.totalStockUnits, icon: Inbox, color: 'text-purple-600', bg: 'bg-purple-100' },
      { title: 'Low Stock Alerts', value: metrics.lowStockProducts, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
      { title: 'Total Challans', value: metrics.totalChallans, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
      { title: 'Confirmed Challans', value: metrics.confirmedChallans, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
      { title: 'Draft Challans', value: metrics.draftChallans, icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    ];

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item) => {
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
    );
  };

  const renderSalesDashboard = () => {
    const kpis = [
      { title: 'My Total Challans', value: metrics.myChallans, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
      { title: 'My Confirmed', value: metrics.myConfirmedChallans, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
      { title: 'My Drafts', value: metrics.myDraftChallans, icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      { title: 'Customer Follow-ups', value: metrics.customerFollowUps, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item) => {
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
    );
  };

  const renderWarehouseDashboard = () => {
    const kpis = [
      { title: 'Total Products', value: metrics.totalProducts, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
      { title: 'Total Stock Units', value: metrics.totalStockUnits, icon: Inbox, color: 'text-purple-600', bg: 'bg-purple-100' },
      { title: 'Low Stock Alerts', value: metrics.lowStockProducts, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
      { title: 'Stock In Today', value: metrics.stockInToday, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
      { title: 'Stock Out Today', value: metrics.stockOutToday, icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((item) => {
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
    );
  };

  const renderAccountsDashboard = () => {
    const kpis = [
      { title: 'Total Challans', value: metrics.totalChallans, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
      { title: 'Confirmed', value: metrics.confirmedChallans, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
      { title: 'Drafts', value: metrics.draftChallans, icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      { title: 'Cancelled', value: metrics.cancelledChallans, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    ];

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item) => {
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
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Here is your {role.toLowerCase()} overview.</p>
      </div>

      {role === 'ADMIN' && renderAdminDashboard()}
      {role === 'SALES' && renderSalesDashboard()}
      {role === 'WAREHOUSE' && renderWarehouseDashboard()}
      {role === 'ACCOUNTS' && renderAccountsDashboard()}

    </div>
  );
}
