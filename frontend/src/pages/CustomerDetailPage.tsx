import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import api from '../utils/api';
import FollowUpModal from '../components/FollowUpModal';

interface FollowUp {
  id: string;
  note: string;
  followUpDate: string;
  createdAt: string;
  createdBy: {
    name: string;
    role: string;
  };
}

interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email: string | null;
  businessName: string;
  gstNumber: string | null;
  customerType: string;
  address: string;
  status: string;
  notes: string | null;
  followUps: FollowUp[];
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  const fetchCustomer = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/customers/${id}`);
      if (response.data.success) {
        setCustomer(response.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Customer not found.');
      } else {
        setError(err.response?.data?.message || 'Failed to load customer details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading customer details...</div>;
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Customer not found.'}</p>
        <Link to="/customers" className="text-blue-600 hover:underline">
          &larr; Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link to="/customers" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Customers
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
              <span>{customer.businessName}</span>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full 
                ${customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                  customer.status === 'LEAD' ? 'bg-blue-100 text-blue-800' : 
                  'bg-slate-100 text-slate-800'}`}>
                {customer.status}
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {customer.customerName} &bull; {customer.customerType}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Contact Information</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500 font-medium">Name</dt>
              <dd className="text-slate-900 mt-1">{customer.customerName}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Mobile</dt>
              <dd className="text-slate-900 mt-1">{customer.mobile}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Email</dt>
              <dd className="text-slate-900 mt-1">{customer.email || '-'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Business Information</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500 font-medium">GST Number</dt>
              <dd className="text-slate-900 mt-1">{customer.gstNumber || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Type</dt>
              <dd className="text-slate-900 mt-1 capitalize">{customer.customerType.toLowerCase()}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Internal Notes</dt>
              <dd className="text-slate-900 mt-1">{customer.notes || '-'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Address</h2>
          <p className="text-sm text-slate-900 whitespace-pre-wrap">{customer.address}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">Follow-up History</h2>
          <button
            onClick={() => setIsFollowUpModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-1 h-4 w-4" />
            Add Follow-up
          </button>
        </div>
        <div className="p-6">
          {customer.followUps.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No follow-ups recorded yet.</p>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {customer.followUps.map((followUp, followUpIdx) => (
                  <li key={followUp.id}>
                    <div className="relative pb-8">
                      {followUpIdx !== customer.followUps.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-xs font-medium">{followUp.createdBy.name.charAt(0)}</span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-slate-900 whitespace-pre-wrap">{followUp.note}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Created by: <span className="font-medium text-slate-900">{followUp.createdBy.name}</span> &mdash; {followUp.createdBy.role}
                            </p>
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-slate-500">
                            <time dateTime={followUp.followUpDate}>
                              {new Date(followUp.followUpDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {isFollowUpModalOpen && (
        <FollowUpModal 
          isOpen={isFollowUpModalOpen}
          onClose={(wasSaved) => {
            setIsFollowUpModalOpen(false);
            if (wasSaved) fetchCustomer();
          }}
          customerId={customer.id}
        />
      )}
    </div>
  );
}
