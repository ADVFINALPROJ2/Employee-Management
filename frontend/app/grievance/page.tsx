'use client';

import { useState } from 'react';
import { grievanceApi } from '@/lib/api';
import { toast } from '@/lib/toast';

const CATEGORIES = ['Workplace issue', 'Harassment', 'Salary', 'Other'] as const;

export default function EmployeeGrievancePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setShowSuccess(false);
    try {
      await grievanceApi.create({
        title,
        description,
        category,
        is_anonymous: isAnonymous,
      });
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      setIsAnonymous(false);
      setShowSuccess(true);
      toast({ title: 'Grievance submitted', description: 'Your grievance has been submitted successfully.', variant: 'success' });
    } catch (e: unknown) {
      toast({ title: 'Submission failed', description: e instanceof Error ? e.message : 'Something went wrong', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Submit a Grievance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your concerns are confidential. Choose anonymous if you prefer.
          </p>
        </div>
      </header>

      <main className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
              <p className="mt-1 text-sm text-gray-400">{title.length}/150</p>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

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
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {submitting ? 'Submitting...' : 'Submit Grievance'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
