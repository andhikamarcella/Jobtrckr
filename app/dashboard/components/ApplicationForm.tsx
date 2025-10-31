'use client';

import { useEffect, useState } from 'react';
import { STATUS_OPTIONS, type StatusFilterValue } from './StatusFilter';

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.filter((status) => status !== 'all');

type ApplicationStatus = Exclude<StatusFilterValue, 'all'>;

export interface ApplicationPayload {
  id?: string;
  company: string;
  position: string;
  applied_at: string;
  status: ApplicationStatus;
  notes?: string | null;
}

interface ApplicationFormProps {
  mode: 'create' | 'edit';
  initialData?: ApplicationPayload | null;
  onSubmit: (payload: ApplicationPayload) => Promise<void> | void;
  onCancel: () => void;
}

const defaultFormState: ApplicationPayload = {
  company: '',
  position: '',
  applied_at: new Date().toISOString().slice(0, 10),
  status: 'waiting',
  notes: ''
};

export function ApplicationForm({ mode, initialData, onSubmit, onCancel }: ApplicationFormProps) {
  const [formState, setFormState] = useState<ApplicationPayload>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (initialData) {
      setFormState({
        ...defaultFormState,
        ...initialData,
        applied_at: initialData.applied_at.slice(0, 10)
      });
    } else {
      setFormState(defaultFormState);
    }
  }, [initialData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formState);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="company" className="mb-1 block text-sm font-medium text-slate-700">
          Company<span className="text-red-500">*</span>
        </label>
        <input
          id="company"
          name="company"
          value={formState.company}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label htmlFor="position" className="mb-1 block text-sm font-medium text-slate-700">
          Position<span className="text-red-500">*</span>
        </label>
        <input
          id="position"
          name="position"
          value={formState.position}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label htmlFor="applied_at" className="mb-1 block text-sm font-medium text-slate-700">
          Applied At<span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="applied_at"
          name="applied_at"
          value={formState.applied_at}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
          Status<span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={formState.status}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {STATUS_SELECT_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formState.notes ?? ''}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEditMode ? 'Update Application' : 'Create Application'}
        </button>
      </div>
    </form>
  );
}
