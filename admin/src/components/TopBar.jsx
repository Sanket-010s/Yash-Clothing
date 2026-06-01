import { useLocation } from 'react-router-dom';
import { Menu, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function TopBar({ onMenuClick, onRefresh, isLoading = false }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.includes('/products')) {
      if (path.includes('/add')) return 'Add Product';
      if (path.includes('/edit')) return 'Edit Product';
      return 'Products';
    }
    if (path.includes('/orders')) {
      if (path.includes('/orders/')) return 'Order Details';
      return 'Orders';
    }
    if (path.includes('/invoices')) return 'Invoices';
    if (path.includes('/coupons')) return 'Coupons';
    return 'Admin Panel';
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="bg-white border-b border-neutral-border sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 lg:pl-72">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-neutral-bg rounded-lg transition-colors"
          >
            <Menu size={24} className="text-neutral-primary" />
          </button>
          <h1 className="text-2xl font-bold text-neutral-primary">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-neutral-bg rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw 
                size={20} 
                className={`text-neutral-primary ${isLoading ? 'animate-spin' : ''}`} 
              />
            </button>
          )}
          
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-bg transition-colors">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-primary">{user?.name || 'Admin'}</p>
              <p className="text-xs text-neutral-text">{user?.email || 'admin@yash.com'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-neutral-primary"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
