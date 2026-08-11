import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../utils/api';
import { z } from 'zod';

const addStockSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  reason: z.string().min(1, 'Reason is required'),
});

interface AddStockModalProps {
  isOpen: boolean;
  onClose: (wasSaved?: boolean) => void;
  products: any[];
}

export default function AddStockModal({ isOpen, onClose, products }: AddStockModalProps) {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '10',
    reason: 'Purchase from supplier',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const selectedProduct = products.find(p => p.id === formData.productId);
  const currentStock = selectedProduct ? selectedProduct.currentStock : 0;
  const newStock = currentStock + (Number(formData.quantity) || 0);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        productId: '',
        quantity: '10',
        reason: 'Purchase from supplier',
      });
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen]);

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
      quantity: Number(formData.quantity),
    };

    try {
      addStockSchema.parse(parsedData);
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
      await api.post(`/products/${parsedData.productId}/stock-in`, {
        quantity: parsedData.quantity,
        reason: parsedData.reason
      });
      onClose(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'An error occurred while adding stock.');
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
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={() => onClose(false)}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                Add Stock
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
              <div className="grid grid-cols-1 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Product *</label>
                  <select name="productId" value={formData.productId} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white">
                    <option value="">[ Select Product ]</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.productName} ({p.sku})</option>
                    ))}
                  </select>
                  {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId}</p>}
                </div>

                {selectedProduct && (
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <p className="text-sm font-medium text-slate-700">Current Stock: {currentStock}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700">Quantity to Add *</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Reason *</label>
                  <input type="text" name="reason" value={formData.reason} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}
                </div>

                {selectedProduct && (
                  <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-2">
                    <p className="text-sm font-medium text-green-800">New Stock (Preview): {newStock}</p>
                  </div>
                )}

              </div>
            </form>
          </div>
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Adding...' : 'Add Stock'}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
