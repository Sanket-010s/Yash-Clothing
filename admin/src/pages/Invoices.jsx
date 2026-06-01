import { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatDate, formatCurrency } from '../lib/utils';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/invoices');
      setInvoices(response.data.items || response.data);
    } catch (error) {
      toast.error('Failed to load invoices');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm]);

  const handleViewPDF = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast.error('PDF not available');
    }
  };

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-primary mb-4">Invoices</h1>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-neutral-border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-neutral-text" size={20} />
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
          />
        </div>
      </div>

      {/* Invoices Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-neutral-bg rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto mb-4 text-neutral-text opacity-50" />
          <p className="text-neutral-text">No invoices found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-border">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-primary text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">Invoice No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice, index) => (
                <tr
                  key={invoice.id}
                  className={`border-t border-neutral-border ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-bg'
                  } hover:bg-yellow-50 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <p className="font-mono font-medium text-neutral-primary">
                      {invoice.invoice_number}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-neutral-primary">
                    {invoice.customer_name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-text">
                    {invoice.order_id?.slice(0, 8) || 'N/A'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-neutral-primary">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-text">
                    {formatDate(invoice.created_at || invoice.date)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewPDF(invoice.pdf_url)}
                      className="px-3 py-1 bg-primary-gold hover:bg-primary-gold-hover text-neutral-primary text-sm font-medium rounded transition-colors"
                    >
                      View PDF
                    </button>
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
