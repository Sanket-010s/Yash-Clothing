import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function VariantManager({ variants = [], onChange }) {
  const [variants_, setVariants] = useState([]);

  // Update local state when variants prop changes
  useEffect(() => {
    setVariants(variants.map(v => ({
      ...v,
      id: v.id || Date.now() + Math.random() // Ensure each variant has an ID
    })));
  }, [variants]);

  const handleAddVariant = () => {
    const newVariant = {
      id: Date.now() + Math.random(),
      size: '',
      color: '',
      color_hex: '#000000',
      stock: 0,
      price_override: null,
    };
    const updated = [...variants_, newVariant];
    setVariants(updated);
    onChange(updated);
  };

  const handleUpdateVariant = (id, field, value) => {
    const updated = variants_.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    );
    setVariants(updated);
    onChange(updated);
  };

  const handleRemoveVariant = (id) => {
    const updated = variants_.filter(v => v.id !== id);
    setVariants(updated);
    onChange(updated);
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Navy', 'Gray'];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleAddVariant}
        className="px-4 py-2 bg-primary-gold hover:bg-primary-gold-hover text-neutral-primary font-medium rounded-lg transition-colors"
      >
        + Add Variant
      </button>

      <div className="space-y-3">
        {variants_.map((variant) => (
          <div key={variant.id} className="bg-neutral-bg p-4 rounded-lg grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <select
              value={variant.size}
              onChange={(e) => handleUpdateVariant(variant.id, 'size', e.target.value)}
              className="px-3 py-2 border border-neutral-border rounded-lg text-sm"
            >
              <option value="">Size</option>
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={variant.color}
              onChange={(e) => handleUpdateVariant(variant.id, 'color', e.target.value)}
              className="px-3 py-2 border border-neutral-border rounded-lg text-sm"
            >
              <option value="">Color</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <input
              type="color"
              value={variant.color_hex}
              onChange={(e) => handleUpdateVariant(variant.id, 'color_hex', e.target.value)}
              className="h-10 rounded-lg border border-neutral-border cursor-pointer"
              title="Color Hex"
            />

            <input
              type="number"
              min="0"
              value={variant.stock}
              onChange={(e) => handleUpdateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
              placeholder="Stock"
              className="px-3 py-2 border border-neutral-border rounded-lg text-sm"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={variant.price_override || ''}
              onChange={(e) => handleUpdateVariant(variant.id, 'price_override', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="Price (optional)"
              className="px-3 py-2 border border-neutral-border rounded-lg text-sm"
            />

            <button
              type="button"
              onClick={() => handleRemoveVariant(variant.id)}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
