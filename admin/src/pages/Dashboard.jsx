import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, ShoppingCart, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats && isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-neutral-bg rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-20 lg:pb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={ShoppingCart}
          title="Orders Today"
          value={stats?.orders_today || 0}
          isLoading={isLoading}
        />
        <StatsCard
          icon={TrendingUp}
          title="Revenue Today"
          value={formatCurrency(stats?.revenue_today || 0)}
          isLoading={isLoading}
        />
        <StatsCard
          icon={BarChart3}
          title="Revenue This Month"
          value={formatCurrency(stats?.revenue_this_month || 0)}
          isLoading={isLoading}
        />
        <StatsCard
          icon={AlertCircle}
          title="Pending Orders"
          value={stats?.pending_orders || 0}
          className="lg:col-span-1 col-span-2 lg:col-span-1"
          isLoading={isLoading}
        />
      </div>

      {/* Low Stock Alert */}
      {stats?.low_stock_variants && stats.low_stock_variants.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-primary mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            Low Stock Alert
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.low_stock_variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium text-neutral-primary">
                    {variant.product_name}
                  </p>
                  <p className="text-sm text-neutral-text">
                    {variant.size} • {variant.color}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{variant.stock}</p>
                  <p className="text-xs text-neutral-text">In stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-neutral-border p-6">
        <h3 className="text-lg font-semibold text-neutral-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href="/products/add"
            className="p-4 bg-primary-gold hover:bg-primary-gold-hover text-neutral-primary font-medium rounded-lg transition-colors text-center"
          >
            Add Product
          </a>
          <a
            href="/orders"
            className="p-4 border border-primary-gold text-primary-gold hover:bg-yellow-50 font-medium rounded-lg transition-colors text-center"
          >
            View Orders
          </a>
          <a
            href="/coupons"
            className="p-4 border border-primary-gold text-primary-gold hover:bg-yellow-50 font-medium rounded-lg transition-colors text-center"
          >
            Manage Coupons
          </a>
          <button
            onClick={fetchStats}
            className="p-4 border border-neutral-border text-neutral-primary hover:bg-neutral-bg font-medium rounded-lg transition-colors"
          >
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  );
}
