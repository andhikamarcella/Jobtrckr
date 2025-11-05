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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 py-8 backdrop-blur-xl">
      <div className="y2k-card w-full max-w-2xl animate-modal-pop">
        <div className="relative z-10">
          <header className="flex flex-col gap-3 border-b border-white/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="y2k-section-title text-slate-400">Form Lamaran</p>
              <h2 className="text-xl font-semibold text-slate-900">
                {mode === "create" ? "Tambah Lamaran Baru" : "Perbarui Detail Lamaran"}
              </h2>
              <p className="text-sm text-slate-600">
                Lengkapi data penting supaya progresmu tercatat rapi dan bisa dipantau dari mana saja.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:bg-white"
            >
              Tutup
            </button>
          </header>

          <form onSubmit={handleSubmit} className="flex max-h-[72vh] flex-col overflow-hidden">
            <div className="grid gap-6 overflow-y-auto px-6 pt-6 pb-4 md:grid-cols-2 md:pr-4">
              <Field label="Perusahaan" helper="Isi nama perusahaan yang kamu lamar." htmlFor="company">
                <input
                  id="company"
                  value={formValues.company}
                  onChange={(event) => handleChange("company", event.target.value)}
                  placeholder="Contoh: PT Sukses Maju"
                  className="w-full rounded-3xl border border-white/80 bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-[0_10px_24px_rgba(148,163,184,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                />
              </Field>

              <Field label="Posisi" helper="Tuliskan jabatan atau role yang kamu incar." htmlFor="position">
                <input
                  id="position"
                  value={formValues.position}
                  onChange={(event) => handleChange("position", event.target.value)}
                  placeholder="Contoh: Product Designer"
                  className="w-full rounded-3xl border border-white/80 bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-[0_10px_24px_rgba(148,163,184,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                />
              </Field>

              <Field label="Tanggal Lamar" helper="Pilih tanggal saat lamaran dikirim." htmlFor="applied_at">
                <input
                  id="applied_at"
                  type="date"
                  value={formValues.applied_at}
                  onChange={(event) => handleChange("applied_at", event.target.value)}
                  className="w-full rounded-3xl border border-white/80 bg-white/95 px-4 py-3 text-sm text-slate-900 shadow-[0_10px_24px_rgba(148,163,184,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                />
              </Field>

              <Field label="Status" helper="Pilih tahapan terbaru dalam proses rekrutmen." htmlFor="status">
                <select
                  id="status"
                  value={formValues.status}
                  onChange={(event) => handleChange("status", event.target.value)}
                  className="w-full appearance-none rounded-3xl border border-white/80 bg-white/95 px-4 py-3 text-sm text-slate-900 shadow-[0_10px_24px_rgba(148,163,184,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white text-slate-900">
                      {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-400">Pilih tahapan terbaru proses rekrutmen kamu.</p>
          </Field>

              <Field label="Sumber" helper="Dari mana kamu menemukan lowongan ini." htmlFor="source">
                <select
                  id="source"
                  value={formValues.source}
                  onChange={(event) => handleChange("source", event.target.value)}
                  className="w-full appearance-none rounded-3xl border border-white/80 bg-white/95 px-4 py-3 text-sm text-slate-900 shadow-[0_10px_24px_rgba(148,163,184,0.15)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white text-slate-900">
                      {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-400">Dari mana kamu menemukan lowongan ini.</p>
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
                  className="min-h-[120px] w-full rounded-3xl border border-white/80 bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-[0_10px_24px_rgba(148,163,184,0.15)] focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </Field>

              {error ? (
                <div className="md:col-span-2">
                  <p className="rounded-3xl border border-rose-400/40 bg-rose-100/60 px-4 py-3 text-sm text-rose-600">{error}</p>
                </div>
              ) : null}

            </div>
            <div className="flex flex-col gap-3 border-t border-white/70 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-3xl border border-slate-200 bg-white/95 px-5 py-2 text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950 shadow-[0_20px_45px_rgba(14,165,233,0.38)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : mode === "create" ? "Simpan" : "Perbarui"}
              </button>
            </div>
          </form>
        </div>
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
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
        {label}
      </label>
      {children}
      <p className="text-xs text-slate-500">{helper}</p>
    </div>
  );
}
