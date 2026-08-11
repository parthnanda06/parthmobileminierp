import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PlaceholderPage from '../pages/PlaceholderPage';
import CustomersPage from '../pages/CustomersPage';
import CustomerDetailPage from '../pages/CustomerDetailPage';
import ProductsPage from '../pages/ProductsPage';
import InventoryPage from '../pages/InventoryPage';
import StockMovementsPage from '../pages/StockMovementsPage';
import ChallansPage from '../pages/ChallansPage';
import ChallanFormPage from '../pages/ChallanFormPage';
import ChallanDetailPage from '../pages/ChallanDetailPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Admin & Sales only routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
          </Route>
          
          {/* Admin & Warehouse only routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/stock-movements" element={<StockMovementsPage />} />
          </Route>
          {/* Challans are accessible by all, but internal permissions differ */}
          <Route path="/challans" element={<ChallansPage />} />
          <Route path="/challans/:id" element={<ChallanDetailPage />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
            <Route path="/challans/new" element={<ChallanFormPage />} />
            <Route path="/challans/:id/edit" element={<ChallanFormPage />} />
          </Route>

          <Route path="/reports" element={<PlaceholderPage title="Reports" description="View business reports." />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" description="Application settings." />} />
        </Route>
      </Route>
    </Routes>
  );
}
