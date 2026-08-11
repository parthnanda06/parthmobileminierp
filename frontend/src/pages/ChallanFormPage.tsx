import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import api from '../utils/api';

export default function ChallanFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<{ productId: string, quantity: number, productDetails?: any }[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Temporary selection state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('1');

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers', { params: { limit: 100 } }),
          api.get('/products', { params: { limit: 100 } })
        ]);
        setCustomers(custRes.data.data.customers || []);
        setProducts(prodRes.data.data.products || []);

        if (isEdit) {
          const challanRes = await api.get(`/challans/${id}`);
          const challan = challanRes.data.data;
          
          if (challan.status !== 'DRAFT') {
            alert('Only DRAFT challans can be edited.');
            navigate('/challans');
            return;
          }

          setCustomerId(challan.customerId);
          setItems(challan.items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            productDetails: {
              productName: i.productName,
              sku: i.sku,
              unitPrice: i.unitPrice,
              currentStock: prodRes.data.data.products?.find((p: any) => p.id === i.productId)?.currentStock || 0
            }
          })));
        }
      } catch (err: any) {
        setError('Failed to load initial data');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [id, isEdit, navigate]);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const qty = parseInt(selectedQuantity);
    if (qty <= 0 || isNaN(qty)) return;

    if (items.some(i => i.productId === selectedProductId)) {
      alert('This product is already in the list. Please remove it first or adjust its quantity.');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (product) {
      setItems([...items, { 
        productId: selectedProductId, 
        quantity: qty, 
        productDetails: product 
      }]);
      setSelectedProductId('');
      setSelectedQuantity('1');
    }
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleSaveDraft = async () => {
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one product.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        customerId,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      };

      let response;
      if (isEdit) {
        response = await api.put(`/challans/${id}`, payload);
      } else {
        response = await api.post('/challans', payload);
      }

      setSuccess(`Challan saved as draft successfully. (Number: ${response.data.data.challanNumber || 'updated'})`);
      setTimeout(() => {
        navigate('/challans');
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save challan');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center text-slate-500">Loading form data...</div>;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = items.reduce((sum, item) => sum + (item.quantity * (item.productDetails?.unitPrice || 0)), 0);

  const currentlySelectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 dark:text-slate-300">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {isEdit ? 'Edit Sales Challan (Draft)' : 'Create Sales Challan'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-700 font-medium">
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer *</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white dark:bg-slate-800"
            >
              <option value="">[ Select Customer ]</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.businessName} ({c.mobile})</option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">Add Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white dark:bg-slate-800"
                >
                  <option value="">[ Select Product ]</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.productName} - {p.sku}</option>
                  ))}
                </select>
                {currentlySelectedProduct && (
                  <p className="mt-1 text-xs font-medium text-blue-600">
                    Available Stock: {currentlySelectedProduct.currentStock} | Price: ₹{currentlySelectedProduct.unitPrice.toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(e.target.value)}
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProductId}
                  className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">Challan Items</h3>
            {items.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-500">
                No products added yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-md">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Avail. Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {items.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{item.productDetails?.productName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{item.productDetails?.sku}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 text-right">{item.productDetails?.currentStock}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 text-right">₹{item.productDetails?.unitPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 text-right font-medium">
                          ₹{(item.quantity * item.productDetails?.unitPrice).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                          <button onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-700 flex justify-end space-x-12">
            <div className="text-right">
              <p className="text-sm text-slate-500">Total Quantity</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalQuantity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Grand Total</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">₹{grandTotal.toLocaleString()}</p>
            </div>
          </div>
          
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button
            onClick={() => navigate('/challans')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:bg-slate-900/50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={loading || items.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}
