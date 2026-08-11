import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChallanReport from '../components/reports/ChallanReport';
import InventoryReport from '../components/reports/InventoryReport';
import StockMovementReport from '../components/reports/StockMovementReport';
import CustomerReport from '../components/reports/CustomerReport';

export default function ReportsPage() {
  const { user } = useAuth();
  
  const role = user?.role || 'SALES';
  
  const availableReports = [];
  
  if (['ADMIN', 'SALES', 'ACCOUNTS'].includes(role)) {
    availableReports.push({ id: 'challans', label: 'Sales Challans', component: <ChallanReport /> });
  }
  if (['ADMIN', 'WAREHOUSE'].includes(role)) {
    availableReports.push({ id: 'inventory', label: 'Inventory', component: <InventoryReport /> });
    availableReports.push({ id: 'stock-movements', label: 'Stock Movements', component: <StockMovementReport /> });
  }
  if (['ADMIN', 'SALES'].includes(role)) {
    availableReports.push({ id: 'customers', label: 'Customers', component: <CustomerReport /> });
  }

  const [activeTab, setActiveTab] = useState(availableReports.length > 0 ? availableReports[0].id : '');

  if (availableReports.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        You do not have permission to view any reports.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Operational insights across customers, inventory and sales challans.</p>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {availableReports.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveTab(report.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === report.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:border-slate-600'
                }
              `}
            >
              {report.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {availableReports.find(r => r.id === activeTab)?.component}
      </div>
    </div>
  );
}
