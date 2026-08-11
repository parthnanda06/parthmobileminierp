import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../utils/api';
import { z } from 'zod';

const mobileRegex = /^[6-9]\d{9}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const customerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  mobile: z.string().regex(mobileRegex, 'Invalid Indian mobile number (e.g., 9876543210)'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  businessName: z.string().min(1, 'Business name is required'),
  gstNumber: z.string().regex(gstRegex, 'Invalid GST number').optional().or(z.literal('')),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(1, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']),
  followUpDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

interface CustomerModalProps {
  isOpen: boolean;
  onClose: (wasSaved?: boolean) => void;
  customer?: any;
}

export default function CustomerModal({ isOpen, onClose, customer }: CustomerModalProps) {
  const isEdit = !!customer;

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'WHOLESALE',
    address: '',
    status: 'ACTIVE',
    followUpDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        customerName: customer.customerName || '',
        mobile: customer.mobile || '',
        email: customer.email || '',
        businessName: customer.businessName || '',
        gstNumber: customer.gstNumber || '',
        customerType: customer.customerType || 'WHOLESALE',
        address: customer.address || '',
        status: customer.status || 'ACTIVE',
        followUpDate: customer.followUpDate ? customer.followUpDate.split('T')[0] : '',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    try {
      customerSchema.parse(formData);
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
        await api.put(`/customers/${customer.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      onClose(true); // Tell parent it was saved
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
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => onClose(false)}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                {isEdit ? 'Edit Customer' : 'Add Customer'}
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
                <div>
                  <label className="block text-sm font-medium text-slate-700">Customer Name *</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Business Name *</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Mobile Number *</label>
                  <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="e.g. 9876543210" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">GST Number</label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.gstNumber && <p className="mt-1 text-xs text-red-500">{errors.gstNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Customer Type *</label>
                  <select name="customerType" value={formData.customerType} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white">
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Address *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Status *</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white">
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Follow-up Date</label>
                  <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Notes</label>
                  <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"></textarea>
                </div>
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
              {loading ? 'Saving...' : 'Save Customer'}
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
