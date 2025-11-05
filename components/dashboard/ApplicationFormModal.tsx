"use client";

import { useEffect, useState, type ReactNode } from "react";
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

  const handleChange = (field: keyof ApplicationFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-lg">
      <div className="w-full max-w-3xl overflow-hidden rounded-4xl border border-slate-200/60 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.32)] transition-colors duration-500 dark:border-white/15 dark:bg-slate-950/90 dark:shadow-[0_34px_96px_rgba(15,23,42,0.68)]">
        <header className="flex flex-col gap-4 border-b border-slate-200/70 px-6 py-6 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-emerald-400 text-lg font-semibold text-white shadow-[0_15px_45px_rgba(59,130,246,0.45)]">
              +
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Form Lamaran</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {mode === "create" ? "Tambah Lamaran Baru" : "Perbarui Detail Lamaran"}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Lengkapi data penting supaya progresmu tercatat rapi dan bisa dipantau dari mana saja.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-end rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 dark:border-white/20 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Tutup
          </button>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-6 px-6 py-6 md:grid-cols-2">
          <Field
            label="Perusahaan"
            helper="Isi nama perusahaan yang kamu lamar."
            htmlFor="company"
          >
            <input
              id="company"
              value={formValues.company}
              onChange={(event) => handleChange("company", event.target.value)}
              placeholder="Contoh: PT Sukses Maju"
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/15 dark:bg-slate-900/75 dark:text-slate-50 dark:placeholder:text-slate-400"
              required
            />
          </Field>

          <Field
            label="Posisi"
            helper="Tuliskan jabatan atau role yang kamu incar."
            htmlFor="position"
          >
            <input
              id="position"
              value={formValues.position}
              onChange={(event) => handleChange("position", event.target.value)}
              placeholder="Contoh: Product Designer"
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/15 dark:bg-slate-900/75 dark:text-slate-50 dark:placeholder:text-slate-400"
              required
            />
          </Field>

          <Field
            label="Tanggal Lamar"
            helper="Pilih tanggal saat lamaran dikirim."
            htmlFor="applied_at"
          >
            <input
              id="applied_at"
              type="date"
              value={formValues.applied_at}
              onChange={(event) => handleChange("applied_at", event.target.value)}
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/15 dark:bg-slate-900/75 dark:text-slate-50"
              required
            />
          </Field>

          <Field
            label="Status"
            helper="Pilih tahapan terbaru dalam proses rekrutmen."
            htmlFor="status"
          >
            <select
              id="status"
              value={formValues.status}
              onChange={(event) => handleChange("status", event.target.value)}
              className="w-full appearance-none rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-50"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Sumber"
            helper="Dari mana kamu menemukan lowongan ini."
            htmlFor="source"
          >
            <select
              id="source"
              value={formValues.source}
              onChange={(event) => handleChange("source", event.target.value)}
              className="w-full appearance-none rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-50"
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Catatan"
            helper="Opsional: catat deadline, feedback HR, atau pengingat lain."
            htmlFor="notes"
            className="md:col-span-2"
          >
            <textarea
              id="notes"
              value={formValues.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
              placeholder="Contoh: follow up HR pada 15 Mei, siapkan portofolio tambahan."
              className="min-h-[120px] w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/15 dark:bg-slate-900/75 dark:text-slate-50 dark:placeholder:text-slate-400"
            />
          </Field>

          {error ? (
            <div className="md:col-span-2">
              <p className="rounded-3xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:border-rose-400/50 dark:bg-rose-500/20 dark:text-rose-200">
                {error}
              </p>
            </div>
          ) : null}

          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 dark:border-white/15 dark:text-slate-100 dark:hover:bg-white/10"
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

interface FieldProps {
  label: string;
  helper: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}

function Field({ label, helper, htmlFor, children, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-200">
        {label}
      </label>
      {children}
      <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}
