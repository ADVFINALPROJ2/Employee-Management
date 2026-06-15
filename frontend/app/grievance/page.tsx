'use client';

import { useState, useEffect } from 'react';

// --- Types ---
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

const CATEGORIES = ['Workplace issue', 'Harassment', 'Salary', 'Other'] as const;
const STATUSES = ['Under Review', 'Resolved', 'Rejected'] as const;

const STATUS_BADGE: Record<string, string> = {
  'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Resolved: 'bg-green-100 text-green-800 border-green-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
};

// --- Helpers ---
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

export default function GrievancePage() {
  // --- Mock auth (real app uses JWT) ---
  const [role, setRole] = useState<'Employee' | 'Admin'>('Employee');
  const [employeeId] = useState('mock-user-id');

  // --- Form state ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- Data state ---
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Status update ---
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // --- Fetch grievances ---
  async function fetchGrievances() {
    setLoading(true);
    setError('');
    try {
      // For admin we fetch all; for employee we'd ideally have a /my endpoint,
      // but for now the mock guard returns all. In production the backend filters by role.
      const res = await fetch(`${API}/api/grievance`, {
        headers: {
          // Mock auth header – replaced by real JWT in production
          Authorization: `Bearer mock-token-${role}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGrievances(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load grievances';
      setError(msg);
      // If backend is unreachable, show empty
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGrievances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // --- Submit grievance ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setShowSuccess(false);
    try {
      const res = await fetch(`${API}/api/grievance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-token-${role}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          is_anonymous: isAnonymous,
          employee_id: employeeId,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      setIsAnonymous(false);
      setShowSuccess(true);
      fetchGrievances();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submission failed';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // --- Update status (Admin) ---
  async function handleStatusUpdate(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API}/api/grievance/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-token-Admin`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchGrievances();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  }

  // --- Filter for employee view ---
  const myGrievances = grievances.filter((g) => !g.is_anonymous);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Grievance Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {role === 'Admin'
                ? 'Review and manage all employee grievances'
                : 'Submit and track your grievances'}
            </p>
          </div>

          {/* Role switcher (temporary for demo — real auth handles this) */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">View as:</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setRole('Employee')}
                className={classNames(
                  'px-4 py-1.5 text-sm font-medium transition-colors',
                  role === 'Employee'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                Employee
              </button>
              <button
                onClick={() => setRole('Admin')}
                className={classNames(
                  'px-4 py-1.5 text-sm font-medium transition-colors',
                  role === 'Admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Employee: Submit Grievance Form */}
        {(role === 'Employee' || role === 'Admin') && (
          <section>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Submit a Grievance
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Your concerns are confidential. Choose anonymous if you prefer.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Success message */}
                {showSuccess && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Your grievance has been submitted successfully.</span>
                    <button
                      type="button"
                      onClick={() => setShowSuccess(false)}
                      className="ml-auto text-green-600 hover:text-green-800 font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    maxLength={150}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your concern"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <p className="mt-1 text-xs text-gray-400">{title.length}/150</p>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide as much detail as you can so we can understand and address your concern."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-y"
                  />
                </div>

                {/* Anonymous checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">
                      Submit anonymously
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Your name and identity will not be associated with this grievance.
                    </p>
                  </div>
                </label>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('');
                      setDescription('');
                      setCategory(CATEGORIES[0]);
                      setIsAnonymous(false);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    {submitting && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {submitting ? 'Submitting...' : 'Submit Grievance'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Grievances Table */}
        <section>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {role === 'Admin' ? 'All Grievances' : 'My Grievances'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {role === 'Admin'
                    ? `${grievances.length} grievance${grievances.length !== 1 ? 's' : ''} submitted`
                    : `${myGrievances.length} grievance${myGrievances.length !== 1 ? 's' : ''} on record`}
                </p>
              </div>
              <button
                onClick={fetchGrievances}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                title="Refresh"
              >
                <svg className={classNames('w-5 h-5', loading && 'animate-spin')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
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
                    {role === 'Admin' && <th className="px-6 py-3">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && grievances.length === 0 && (
                    <tr>
                      <td colSpan={role === 'Admin' ? 7 : 6} className="px-6 py-12 text-center text-gray-400">
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
                  {!loading && grievances.length === 0 && !error && (
                    <tr>
                      <td colSpan={role === 'Admin' ? 7 : 6} className="px-6 py-12 text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium">No grievances yet</p>
                        <p className="text-xs mt-1">Submit a grievance using the form above.</p>
                      </td>
                    </tr>
                  )}
                  {(role === 'Admin' ? grievances : myGrievances).map((g) => (
                    <tr
                      key={g.grievance_id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">
                        {g.grievance_id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                        {g.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
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
                          g.employee?.full_name || 'Unknown'
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatDate(g.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={classNames(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                            STATUS_BADGE[g.status] || 'bg-gray-100 text-gray-800 border-gray-200'
                          )}
                        >
                          {g.status}
                        </span>
                      </td>
                      {role === 'Admin' && (
                        <td className="px-6 py-4">
                          <select
                            value={g.status}
                            onChange={(e) => handleStatusUpdate(g.grievance_id, e.target.value)}
                            disabled={updatingId === g.grievance_id}
                            className="text-xs rounded-lg border border-gray-300 px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination info */}
            {grievances.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-400">
                Showing {role === 'Admin' ? grievances.length : myGrievances.length} of {grievances.length} total
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
