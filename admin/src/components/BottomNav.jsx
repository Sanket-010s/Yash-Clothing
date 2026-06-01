import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, Tag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export default function BottomNav({ pendingCount = 0 }) {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Orders', href: '/orders', icon: ShoppingCart, badge: pendingCount },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Coupons', href: '/coupons', icon: Tag },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-sidebar-bg text-sidebar-text border-t border-gray-700 lg:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs font-medium transition-colors relative',
                isActive ? 'text-primary-gold' : 'text-gray-400'
              )}
            >
              <Icon size={20} />
              <span className="text-xs">{item.label.split(' ')[0]}</span>
              {item.badge > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
