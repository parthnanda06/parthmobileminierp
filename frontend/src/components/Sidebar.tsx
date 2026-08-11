import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Boxes, 
  ArrowRightLeft, 
  FileText, 
  Settings,
  PieChart
} from 'lucide-react';

// Mock role for now
const CURRENT_ROLE = 'ADMIN'; 

const navigationByRole = {
  ADMIN: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Inventory', path: '/inventory', icon: Boxes },
    { name: 'Stock Movements', path: '/stock-movements', icon: ArrowRightLeft },
    { name: 'Sales Challans', path: '/challans', icon: FileText },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ],
  SALES: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Sales Challans', path: '/challans', icon: FileText },
    { name: 'Reports', path: '/reports', icon: PieChart },
  ],
  WAREHOUSE: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Inventory', path: '/inventory', icon: Boxes },
    { name: 'Stock Movements', path: '/stock-movements', icon: ArrowRightLeft },
    { name: 'Reports', path: '/reports', icon: PieChart },
  ],
  ACCOUNTS: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Sales Challans', path: '/challans', icon: FileText },
    { name: 'Reports', path: '/reports', icon: PieChart },
  ]
};

export default function Sidebar() {
  const location = useLocation();
  const navItems = navigationByRole[CURRENT_ROLE as keyof typeof navigationByRole] || [];

  return (
    <div className="flex flex-col w-64 bg-[#0f172a] text-white">
      <div className="flex items-center justify-center h-16 border-b border-slate-700">
        <span className="text-xl font-bold tracking-wider">PARTH MOBILE</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
