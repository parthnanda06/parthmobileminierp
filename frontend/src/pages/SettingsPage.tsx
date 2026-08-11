import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Lock, Server } from 'lucide-react';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile, security, and view system information.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Lock className="flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'system' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Server className="flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              System Information
            </button>
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && <ProfileTab user={user} login={login} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'system' && <SystemTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user, login }: { user: any, login: any }) {
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put('/settings/profile', { name });
      if (res.data.success) {
        setMessage(res.data.message);
        const token = localStorage.getItem('token');
        if (token) {
          login(token, res.data.data);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg border border-slate-200">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-slate-900">Profile</h3>
        <div className="mt-2 max-w-xl text-sm text-slate-500">
          <p>Update your personal information.</p>
        </div>
        
        {message && <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">{message}</div>}
        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">{error}</div>}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="mt-1 block w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-md py-2 px-3 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <input 
              type="text" 
              value={user?.role || ''} 
              disabled 
              className="mt-1 block w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-md py-2 px-3 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <input 
              type="text" 
              value="ACTIVE"
              disabled 
              className="mt-1 block w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-md py-2 px-3 text-sm" 
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put('/settings/password', { currentPassword, newPassword });
      if (res.data.success) {
        setMessage(res.data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg border border-slate-200">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-slate-900">Change Password</h3>
        <div className="mt-2 max-w-xl text-sm text-slate-500">
          <p>Ensure your account is using a long, random password to stay secure.</p>
        </div>
        
        {message && <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">{message}</div>}
        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">{error}</div>}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Current Password *</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
              className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">New Password *</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500" 
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm New Password *</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500" 
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SystemTab() {
  return (
    <div className="bg-white shadow rounded-lg border border-slate-200">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-slate-900">System Information</h3>
        <div className="mt-2 max-w-xl text-sm text-slate-500 mb-6">
          <p>Current application and environment status.</p>
        </div>
        
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-slate-500">Application</dt>
            <dd className="mt-1 text-sm text-slate-900 font-semibold">Parth Mobile Distribution</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-slate-500">Version</dt>
            <dd className="mt-1 text-sm text-slate-900 font-mono">1.0.0</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-slate-500">Environment</dt>
            <dd className="mt-1 text-sm text-slate-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {import.meta.env.MODE === 'development' ? 'Development' : 'Production'}
              </span>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-slate-500">Backend Status</dt>
            <dd className="mt-1 text-sm text-slate-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-slate-500">Database</dt>
            <dd className="mt-1 text-sm text-slate-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
