import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../utils/api';
import { z } from 'zod';

const productSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().min(0, 'Current stock cannot be negative').optional(),
  minimumStock: z.number().int().min(0, 'Minimum stock cannot be negative'),
  warehouseLocation: z.string().min(1, 'Warehouse location is required'),
});

interface ProductModalProps {
  isOpen: boolean;
  onClose: (wasSaved?: boolean) => void;
  product?: any;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: 'Smartphones',
    unitPrice: '',
    currentStock: '0',
    minimumStock: '5',
    warehouseLocation: 'WH-01',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || '',
        sku: product.sku || '',
        category: product.category || 'Smartphones',
        unitPrice: String(product.unitPrice || ''),
        currentStock: String(product.currentStock || 0),
        minimumStock: String(product.minimumStock || 5),
        warehouseLocation: product.warehouseLocation || 'WH-01',
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    const parsedData = {
      ...formData,
      unitPrice: Number(formData.unitPrice),
      minimumStock: Number(formData.minimumStock),
      currentStock: isEdit ? undefined : Number(formData.currentStock), // only used on create
    };

    try {
      productSchema.parse(parsedData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${product.id}`, parsedData);
      } else {
        await api.post('/products', parsedData);
      }
      onClose(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'An error occurred while saving.');
      if (err.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        err.response.data.errors.forEach((e: any) => {
          if (e.path[0]) apiErrors[e.path[0]] = e.message;
        });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900/500 bg-opacity-75 transition-opacity" onClick={() => onClose(false)}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-100" id="modal-title">
                {isEdit ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => onClose(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            {submitError && (
              <div className="mb-4 bg-red-50 p-3 rounded text-sm text-red-600 border border-red-200">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Product Name *</label>
                  <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">SKU *</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white dark:bg-slate-800">
                    <option value="Smartphones">Smartphones</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Tablets">Tablets</option>
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Unit Price *</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 sm:text-sm">₹</span>
                    </div>
                    <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="pl-7 block w-full rounded-md border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  </div>
                  {errors.unitPrice && <p className="mt-1 text-xs text-red-500">{errors.unitPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Minimum Stock *</label>
                  <input type="number" name="minimumStock" value={formData.minimumStock} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.minimumStock && <p className="mt-1 text-xs text-red-500">{errors.minimumStock}</p>}
                </div>

                {!isEdit ? (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Initial Stock</label>
                    <input type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                    <p className="mt-1 text-xs text-slate-500">Recorded as an initial Stock IN movement.</p>
                    {errors.currentStock && <p className="mt-1 text-xs text-red-500">{errors.currentStock}</p>}
                  </div>
                ) : (
                  <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Stock: {product.currentStock}</p>
                    <p className="text-xs text-slate-500 mt-1">Stock changes are managed through Inventory.</p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Warehouse Location *</label>
                  <input type="text" name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.warehouseLocation && <p className="mt-1 text-xs text-red-500">{errors.warehouseLocation}</p>}
                </div>
              </div>
            </form>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
