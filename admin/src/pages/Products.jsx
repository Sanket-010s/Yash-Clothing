import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../lib/utils';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/products');
      setProducts(response.data.items || response.data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(p => 
        filter === 'active' ? p.is_active : !p.is_active
      );
    }

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filter]);

  const handleDeleteClick = (id) => {
    setDeleteModal({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/admin/products/${deleteModal.id}`);
      setProducts(products.filter(p => p.id !== deleteModal.id));
      toast.success('Product deleted successfully');
      setDeleteModal({ open: false, id: null });
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete product';
      toast.error(message);
      setDeleteModal({ open: false, id: null });
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const response = await api.put(`/api/admin/products/${product.id}`, {
        is_active: !product.is_active
      });
      setProducts(products.map(p => p.id === product.id ? response.data : p));
      toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-neutral-primary">Products</h1>
        <Link
          to="/products/add"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-gold hover:bg-primary-gold-hover text-neutral-primary font-medium rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-neutral-border p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-neutral-text" size={20} />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'inactive'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-gold text-neutral-primary'
                  : 'bg-neutral-bg text-neutral-primary hover:bg-neutral-border'
              }`}
            >
              {f === 'all' ? 'All Products' : f === 'active' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-neutral-bg rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No products found"
          description={searchTerm ? 'Try adjusting your search' : 'Add your first product to get started'}
          action="Add Product"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-border">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-primary text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className={`border-t border-neutral-border ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-bg'
                  } hover:bg-yellow-50 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-neutral-primary">{product.name}</p>
                        <p className="text-xs text-neutral-text">{product.category || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-primary">
                    {formatCurrency(product.sale_price || product.base_price)}
                  </td>
                  <td className="px-4 py-3 text-neutral-primary">
                    {product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        product.is_active
                          ? 'bg-green-50 text-green-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="p-2 text-neutral-primary border border-neutral-border rounded-lg hover:bg-neutral-bg transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
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

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        isDangerous
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />
    </div>
  );
}
