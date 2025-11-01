"use client";

import { useEffect, useState } from "react";
import type { ApplicationSource, ApplicationStatus } from "@/lib/applicationTypes";
import { SOURCE_OPTIONS, STATUS_OPTIONS } from "@/lib/applicationTypes";

export interface ApplicationFormValues {
  company: string;
  position: string;
  applied_at: string;
  status: ApplicationStatus;
  source: ApplicationSource;
  notes: string;
}

interface ApplicationFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues: ApplicationFormValues;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
}

export function ApplicationFormModal({
  open,
  mode,
  initialValues,
  loading,
  error,
  onClose,
  onSubmit,
}: ApplicationFormModalProps) {
  const [formValues, setFormValues] = useState<ApplicationFormValues>(initialValues);

  useEffect(() => {
    if (open) {
      setFormValues(initialValues);
    }
  }, [initialValues, open]);

  if (!open) {
    return null;
  }

  const handleChange = (
    field: keyof ApplicationFormValues,
    value: string
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-4 py-6">
      <div className="w-full max-w-2xl animate-[modal-pop_0.3s_ease-out] rounded-4xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/70 to-slate-950 p-6 shadow-[0_35px_80px_rgba(15,23,42,0.55)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-50">
              {mode === "create" ? "Tambah Lamaran" : "Edit Lamaran"}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Pastikan data sesuai agar progres kamu mudah dipantau.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10"
          >
            Tutup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-200">Perusahaan</label>
              <input
                value={formValues.company}
                onChange={(event) => handleChange("company", event.target.value)}
                placeholder="Contoh: PT Sukses Maju"
                className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-200">Posisi</label>
              <input
                value={formValues.position}
                onChange={(event) => handleChange("position", event.target.value)}
                placeholder="Contoh: Product Designer"
                className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-200">Tanggal Lamar</label>
              <input
                type="date"
                value={formValues.applied_at}
                onChange={(event) => handleChange("applied_at", event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-200">Status</label>
                <select
                  value={formValues.status}
                  onChange={(event) => handleChange("status", event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-200">Sumber</label>
                <select
                  value={formValues.source}
                  onChange={(event) => handleChange("source", event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-200">Catatan</label>
            <textarea
              value={formValues.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
              placeholder="Catat hal penting seperti deadline interview atau feedback HR."
              className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {error ? (
            <p className="rounded-3xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl border border-white/15 px-5 py-2 text-sm text-slate-100 transition hover:bg-white/10"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(14,165,233,0.35)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : mode === "create" ? "Simpan" : "Perbarui"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
