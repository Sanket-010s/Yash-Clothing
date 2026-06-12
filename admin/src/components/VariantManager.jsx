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
  const colors = [
    { name: 'Black',  hex: '#000000' },
    { name: 'White',  hex: '#ffffff' },
    { name: 'Red',    hex: '#ef4444' },
    { name: 'Blue',   hex: '#3b82f6' },
    { name: 'Green',  hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Navy',   hex: '#1e3a5f' },
    { name: 'Gray',   hex: '#6b7280' },
  ];

  const handleColorNameChange = (id, value) => {
    const isHex = /^#([0-9a-f]{3}){1,2}$/i.test(value);
    const match = colors.find(c => c.name.toLowerCase() === value.toLowerCase());
    const updated = variants_.map(v =>
      v.id === id ? {
        ...v,
        color: value,
        color_hex: isHex ? value : match ? match.hex : v.color_hex,
      } : v
    );
    setVariants(updated);
    onChange(updated);
  };

  const handleColorHexChange = (id, hex) => {
    const match = colors.find(c => c.hex.toLowerCase() === hex.toLowerCase());
    const updated = variants_.map(v =>
      v.id === id ? { ...v, color_hex: hex, ...(match ? { color: match.name } : {}) } : v
    );
    setVariants(updated);
    onChange(updated);
  };

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
          <div key={variant.id} className="bg-neutral-bg p-4 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <select
              value={variant.size}
              onChange={(e) => handleUpdateVariant(variant.id, 'size', e.target.value)}
              className="px-3 py-2 border border-neutral-border rounded-lg text-sm"
            >
              <option value="">Size</option>
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="flex items-center gap-1 col-span-1 md:col-span-2">
              <input
                type="text"
                list={`color-list-${variant.id}`}
                value={variant.color}
                onChange={(e) => handleColorNameChange(variant.id, e.target.value)}
                placeholder="Color name"
                className="flex-1 px-3 py-2 border border-neutral-border rounded-lg text-sm"
              />
              <datalist id={`color-list-${variant.id}`}>
                {colors.map(c => <option key={c.name} value={c.name} />)}
              </datalist>
              <input
                type="color"
                value={variant.color_hex || '#000000'}
                onChange={(e) => handleColorHexChange(variant.id, e.target.value)}
                className="h-10 w-10 rounded-lg border border-neutral-border cursor-pointer p-0.5 shrink-0"
                title="Pick color"
              />
            </div>

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
