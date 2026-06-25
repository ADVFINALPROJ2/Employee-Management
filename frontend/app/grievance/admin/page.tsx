'use client';

import { useState, useEffect } from 'react';
import { grievanceApi } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Grievance {
  grievance_id: string;
  title: string;
  description: string;
  category: string;
  is_anonymous: boolean;
  status: string;
  created_at: string;
  employee?: { full_name: string } | null;
}

const STATUSES = ['Under Review', 'Resolved', 'Rejected'] as const;

const STATUS_BADGE: Record<string, string> = {
  'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Resolved: 'bg-green-100 text-green-800 border-green-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Workplace issue': 'bg-blue-50 text-blue-700 border-blue-200',
  Harassment: 'bg-red-50 text-red-700 border-red-200',
  Salary: 'bg-green-50 text-green-700 border-green-200',
  Other: 'bg-purple-50 text-purple-700 border-purple-200',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminGrievancePage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  async function fetchGrievances() {
    setLoading(true);
    setError('');
    try {
      const data = await grievanceApi.getAll();
      setGrievances(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load';
      setError(msg);
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGrievances();
  }, []);

  async function handleStatusUpdate(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      await grievanceApi.updateStatus(id, { status: newStatus });
      toast({ title: 'Status updated', description: `Grievance marked as "${newStatus}"`, variant: 'success' });
      fetchGrievances();
    } catch (e: unknown) {
      toast({ title: 'Update failed', description: e instanceof Error ? e.message : 'Something went wrong', variant: 'error' });
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = grievances.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.grievance_id.toLowerCase().includes(search.toLowerCase()) ||
      (g.employee?.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === 'All' || g.status === statusFilter;
    const matchCategory = categoryFilter === 'All' || g.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const categories = [...new Set(grievances.map((g) => g.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Grievance Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Review and manage all employee grievances</p>
            </div>
            <button
              onClick={fetchGrievances}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <svg className={classNames('w-4 h-4', loading && 'animate-spin')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total', value: grievances.length, color: 'text-blue-600 bg-blue-50' },
              { label: 'Under Review', value: grievances.filter((g) => g.status === 'Under Review').length, color: 'text-yellow-600 bg-yellow-50' },
              { label: 'Resolved', value: grievances.filter((g) => g.status === 'Resolved').length, color: 'text-green-600 bg-green-50' },
              { label: 'Rejected', value: grievances.filter((g) => g.status === 'Rejected').length, color: 'text-red-600 bg-red-50' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${card.color.split(' ')[0]}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="search" className="sr-only">Search</label>
                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, ID, or employee name..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="All">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-sm text-gray-400">
                {filtered.length} of {grievances.length}
              </p>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Submitted By</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && grievances.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading grievances...
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && !error && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-medium">No grievances found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
                {filtered.map((g) => (
                  <tr key={g.grievance_id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {g.grievance_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 max-w-[220px] truncate" title={g.description}>
                        {g.title}
                      </div>
                      <p className="text-xs text-gray-400 truncate max-w-[220px] mt-0.5">{g.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={classNames(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                        CATEGORY_COLORS[g.category] || 'bg-gray-100 text-gray-800 border-gray-200'
                      )}>
                        {g.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {g.is_anonymous ? (
                        <span className="flex items-center gap-1 text-gray-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                          Anonymous
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">
                            {g.employee?.full_name?.charAt(0) || '?'}
                          </span>
                          {g.employee?.full_name || 'Unknown'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(g.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={classNames(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                        STATUS_BADGE[g.status] || 'bg-gray-100 text-gray-800 border-gray-200'
                      )}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={g.status}
                        onChange={(e) => handleStatusUpdate(g.grievance_id, e.target.value)}
                        disabled={updatingId === g.grievance_id}
                        className="text-xs rounded-lg border border-gray-300 px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white cursor-pointer hover:border-gray-400 transition"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {grievances.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-xs text-gray-400">
              <span>Showing {filtered.length} of {grievances.length} grievances</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
