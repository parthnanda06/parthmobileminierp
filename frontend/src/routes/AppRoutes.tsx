import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PlaceholderPage from '../pages/PlaceholderPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<PlaceholderPage title="Customers" description="Manage customer relationships, contact information, business details and follow-ups." />} />
          <Route path="/products" element={<PlaceholderPage title="Products" description="Manage product catalog." />} />
          <Route path="/inventory" element={<PlaceholderPage title="Inventory" description="Manage warehouse inventory." />} />
          <Route path="/stock-movements" element={<PlaceholderPage title="Stock Movements" description="Track inward and outward stock." />} />
          <Route path="/challans" element={<PlaceholderPage title="Sales Challans" description="Manage sales orders and challans." />} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route index element={<PlaceholderPage title="Users" description="Manage application users." />} />
          </Route>
          <Route path="/reports" element={<PlaceholderPage title="Reports" description="View business reports." />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" description="Application settings." />} />
        </Route>
      </Route>
    </Routes>
  );
}
