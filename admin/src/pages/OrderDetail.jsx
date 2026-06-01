import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../lib/utils';

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/api/admin/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true);
      await api.put(`/api/admin/orders/${id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (order?.invoice?.pdf_url) {
      window.open(order.invoice.pdf_url, '_blank');
    } else {
      toast.error('Invoice not available');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-text">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-neutral-bg rounded-lg transition-colors"
        >
          <ChevronLeft size={24} className="text-neutral-primary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-primary">Order {order.id.slice(0, 8)}</h1>
          <p className="text-sm text-neutral-text">Created on {formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status and Actions */}
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-text mb-2">Current Status</p>
              <StatusBadge status={order.status} className="text-base px-4 py-2" />
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-text mb-2">Update Status</p>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={isUpdating}
                className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold disabled:opacity-50"
              >
                {statuses.map(status => (
                  <option key={status} value={status} className="capitalize">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {order.invoice?.pdf_url && (
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-primary-gold hover:bg-primary-gold-hover text-neutral-primary font-medium rounded-lg transition-colors"
              >
                <Download size={18} />
                Download Invoice
              </button>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-primary mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-text font-medium">Name</p>
                <p className="text-neutral-primary font-medium">{order.customer?.name}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-text font-medium">Email</p>
                <p className="text-neutral-primary font-medium">{order.customer?.email}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-text font-medium">Phone</p>
                <p className="text-neutral-primary font-medium">{order.customer?.phone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-primary mb-4">Delivery Address</h3>
            <div className="space-y-2 text-neutral-primary">
              <p className="font-medium">{order.address?.line1}</p>
              {order.address?.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address?.city}, {order.address?.state} {order.address?.pincode}
              </p>
              <p>{order.address?.country}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <h3 className="text-lg font-semibold text-neutral-primary mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-start border-b border-neutral-border pb-3 last:border-b-0">
                <div>
                  <p className="font-medium text-neutral-primary">{item.product_name}</p>
                  <p className="text-sm text-neutral-text">
                    {item.size} • {item.color} • Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-neutral-primary">
                  {formatCurrency(item.unit_price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <h3 className="text-lg font-semibold text-neutral-primary mb-4">Pricing Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-neutral-primary">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-primary">
              <span>GST (18%)</span>
              <span>{formatCurrency(order.gst_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            {order.delivery_charge > 0 && (
              <div className="flex justify-between text-neutral-primary">
                <span>Delivery Charge</span>
                <span>{formatCurrency(order.delivery_charge)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-primary-gold border-t border-neutral-border pt-2">
              <span>Total Amount</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg border border-neutral-border p-6">
          <h3 className="text-lg font-semibold text-neutral-primary mb-4">Payment Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-neutral-primary">
              <span>Payment Method</span>
              <span className="font-medium capitalize">{order.payment?.method}</span>
            </div>
            <div className="flex justify-between text-neutral-primary">
              <span>Payment Status</span>
              <span className={`font-medium capitalize ${
                order.payment?.status === 'success' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.payment?.status}
              </span>
            </div>
            {order.payment?.razorpay_payment_id && (
              <div className="flex justify-between text-neutral-primary">
                <span>Transaction ID</span>
                <span className="font-mono text-sm">{order.payment.razorpay_payment_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice */}
        {order.invoice && (
          <div className="bg-white rounded-lg border border-neutral-border p-6">
            <h3 className="text-lg font-semibold text-neutral-primary mb-4">Invoice</h3>
            <div className="space-y-2 text-neutral-primary">
              <div className="flex justify-between">
                <span>Invoice Number</span>
                <span className="font-mono">{order.invoice.invoice_number}</span>
              </div>
              {order.invoice.pdf_url && (
                <div>
                  <a
                    href={order.invoice.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-gold hover:text-primary-gold-hover font-medium"
                  >
                    View PDF →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
