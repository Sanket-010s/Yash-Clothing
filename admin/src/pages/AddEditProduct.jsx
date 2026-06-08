import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../services/api';
import ImageUploader from '../components/ImageUploader';
import VariantManager from '../components/VariantManager';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  base_price: z.number().min(0, 'Price must be positive'),
  sale_price: z.number().min(0, 'Sale price must be positive').optional(),
  category: z.string().min(1, 'Category is required'),
  is_active: z.boolean().default(true),
});

const categories = ['T-Shirt', 'Hoodie', 'Sweatshirt', 'Cap', 'Jacket', 'Other'];

export default function AddEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/admin/products/${id}`);
      const product = response.data;
      reset({
        name: product.name,
        description: product.description,
        base_price: product.base_price,
        sale_price: product.sale_price,
        category: product.category,
        is_active: product.is_active,
      });
      setImages(product.images || []);
      setVariants(product.variants || []);
      setProduct(product); // Store the full product data
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      const validImages = images.filter(img => typeof img === 'string' && img.trim() !== '');
      
      if (validImages.length === 0) {
        toast.error('Please add at least one valid product image');
        setIsSaving(false);
        return;
      }

      const payload = {
        ...data,
        images: validImages,
      };

      if (isEdit) {
        await api.put(`/api/admin/products/${id}`, payload);
        
        // Update variants for existing products
        const existingVariants = product?.variants || [];
        
        // Handle variant updates/additions
        for (const variant of variants) {
          if (variant.size && variant.color && variant.stock >= 0) {
            const existingVariant = existingVariants.find(v => 
              v.id === variant.id || (v.size === variant.size && v.color === variant.color)
            );
            
            if (existingVariant && variant.id) {
              // Update existing variant
              await api.put(`/api/admin/variants/${variant.id}`, {
                size: variant.size,
                color: variant.color,
                color_hex: variant.color_hex,
                stock: variant.stock,
                price_override: variant.price_override,
              });
            } else if (!existingVariant) {
              // Add new variant
              await api.post(`/api/admin/products/${id}/variants`, {
                size: variant.size,
                color: variant.color,
                color_hex: variant.color_hex,
                stock: variant.stock,
                price_override: variant.price_override,
              });
            }
          }
        }
        
        toast.success('Product updated successfully');
      } else {
        const response = await api.post('/api/admin/products', payload);
        const productId = response.data.id;
        
        // Add variants if any
        for (const variant of variants) {
          if (variant.size && variant.color && variant.stock >= 0) {
            await api.post(`/api/admin/products/${productId}/variants`, {
              size: variant.size,
              color: variant.color,
              color_hex: variant.color_hex,
              stock: variant.stock,
              price_override: variant.price_override,
            });
          }
        }
        
        toast.success('Product created successfully');
      }
      navigate('/products', { state: { from: 'edit' } });
    } catch (error) {
      let errorMessage = 'Failed to save product';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        errorMessage = Array.isArray(detail) ? detail[0].msg : detail;
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-primary">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
        {isEdit && (
          <button
            type="button"
            onClick={fetchProduct}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-neutral-border p-6 space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-primary mb-2">
            Product Name *
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="e.g., Oversized T-Shirt"
            className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-primary mb-2">
            Description *
          </label>
          <textarea
            {...register('description')}
            placeholder="Describe your product..."
            rows="4"
            className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
          />
          {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-primary mb-2">
              Base Price (MRP) *
            </label>
            <input
              {...register('base_price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="999.00"
              className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
            />
            {errors.base_price && <p className="text-red-600 text-xs mt-1">{errors.base_price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-primary mb-2">
              Sale Price (Optional)
            </label>
            <input
              {...register('sale_price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="799.00"
              className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
            />
            {errors.sale_price && <p className="text-red-600 text-xs mt-1">{errors.sale_price.message}</p>}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-neutral-primary mb-2">
            Category *
          </label>
          <select
            {...register('category')}
            className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-neutral-primary mb-2">
            Product Images
          </label>
          <ImageUploader value={images} onChange={setImages} />
        </div>

        {/* Variants */}
        <div>
          <label className="block text-sm font-medium text-neutral-primary mb-2">
            Product Variants (Size, Color, Stock)
          </label>
          <VariantManager variants={variants} onChange={setVariants} />
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 p-4 bg-neutral-bg rounded-lg">
          <input
            {...register('is_active')}
            type="checkbox"
            id="is_active"
            className="w-4 h-4 rounded cursor-pointer"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-neutral-primary cursor-pointer">
            Active (Available for customers to purchase)
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-neutral-border">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 border border-neutral-border rounded-lg text-neutral-primary font-medium hover:bg-neutral-bg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary-gold hover:bg-primary-gold-hover disabled:opacity-50 text-neutral-primary font-medium rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
}
