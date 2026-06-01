import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate, formatCurrency } from '../lib/utils';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    min_order_value: 0,
    max_discount: 0,
    max_uses: 0,
    expires_at: '',
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/coupons');
      setCoupons(response.data.items || response.data);
    } catch (error) {
      toast.error('Failed to load coupons');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    let filtered = coupons;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCoupons(filtered);
  }, [coupons, searchTerm]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        min_order_value: parseFloat(formData.min_order_value),
        max_discount: parseFloat(formData.max_discount),
        max_uses: parseInt(formData.max_uses) || null,
      };

      await api.post('/api/admin/coupons', payload);
      toast.success('Coupon created successfully');
      setShowCreateModal(false);
      setFormData({
        code: '',
        type: 'percentage',
        value: 0,
        min_order_value: 0,
        max_discount: 0,
        max_uses: 0,
        expires_at: '',
      });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create coupon');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/admin/coupons/${deleteModal.id}`);
      setCoupons(coupons.filter(c => c.id !== deleteModal.id));
      toast.success('Coupon deleted successfully');
      setDeleteModal({ open: false, id: null });
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const response = await api.put(`/api/admin/coupons/${coupon.id}`, {
        is_active: !coupon.is_active
      });
      setCoupons(coupons.map(c => c.id === coupon.id ? response.data : c));
      toast.success(`Coupon ${!coupon.is_active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-neutral-primary">Coupons</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-gold hover:bg-primary-gold-hover text-neutral-primary font-medium rounded-lg transition-colors"
        >
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-neutral-border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-neutral-text" size={20} />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
          />
        </div>
      </div>

      {/* Coupons Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-neutral-bg rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-text">No coupons found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-border">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-primary text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Value</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Used / Max</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Expires</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon, index) => (
                <tr
                  key={coupon.id}
                  className={`border-t border-neutral-border ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-bg'
                  } hover:bg-yellow-50 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <p className="font-mono font-medium text-neutral-primary">
                      {coupon.code}
                    </p>
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-primary">
                    {coupon.type}
                  </td>
                  <td className="px-4 py-3 font-semibold text-neutral-primary">
                    {coupon.type === 'percentage'
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value)
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-text">
                    {coupon.used_count || 0} / {coupon.max_uses || '∞'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-text">
                    {coupon.expires_at ? formatDate(coupon.expires_at) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        coupon.is_active
                          ? 'bg-green-50 text-green-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteClick(coupon.id)}
                        className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-border p-6">
              <h2 className="text-lg font-semibold text-neutral-primary">Create New Coupon</h2>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-primary mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  required
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-primary mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-primary mb-2">
                    Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="10"
                    required
                    className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-primary mb-2">
                  Minimum Order Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_order_value}
                  onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-primary mb-2">
                  Maximum Discount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.max_discount}
                  onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                  placeholder="1000"
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-primary mb-2">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Leave blank for unlimited"
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-primary mb-2">
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-primary font-medium hover:bg-neutral-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-gold hover:bg-primary-gold-hover text-neutral-primary font-medium rounded-lg transition-colors"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        isDangerous
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />
    </div>
  );
}
