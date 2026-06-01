import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../lib/utils';

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/orders');
      setOrders(response.data.items || response.data);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(o => o.status === selectedStatus);
    }

    // Search by customer name or order ID
    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedStatus]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-900 bg-yellow-50',
      confirmed: 'text-gray-900 bg-gray-100',
      shipped: 'text-purple-900 bg-purple-50',
      delivered: 'text-green-900 bg-green-50',
      cancelled: 'text-red-900 bg-red-50',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-primary mb-4">Orders</h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-neutral-border p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-neutral-text" size={20} />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
          />
        </div>

        <div className="flex gap-2 flex-wrap overflow-x-auto">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedStatus === 'all'
                ? 'bg-primary-gold text-neutral-primary'
                : 'bg-neutral-bg text-neutral-primary hover:bg-neutral-border'
            }`}
          >
            All Orders
          </button>
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors capitalize ${
                selectedStatus === status
                  ? 'bg-primary-gold text-neutral-primary'
                  : 'bg-neutral-bg text-neutral-primary hover:bg-neutral-border'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-neutral-bg rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-text">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-border">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-primary text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`border-t border-neutral-border ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-bg'
                  } hover:bg-yellow-50 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <p className="font-mono text-sm text-neutral-primary">{order.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-neutral-primary">{order.customer?.name}</p>
                      <p className="text-xs text-neutral-text">{order.customer?.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-neutral-primary">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-text">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-2 px-3 py-2 text-primary-gold hover:bg-yellow-50 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
