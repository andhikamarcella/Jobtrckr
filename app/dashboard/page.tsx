'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { ApplicationForm, type ApplicationPayload } from './components/ApplicationForm';
import { ApplicationTable, type ApplicationRecord } from './components/ApplicationTable';
import { ExportToExcel } from './components/ExportToExcel';
import { StatusChart } from './components/StatusChart';
import { StatusFilter, type StatusFilterValue } from './components/StatusFilter';

const dummyApplications: ApplicationRecord[] = [
  {
    id: 'dummy-1',
    user_id: 'dummy-user',
    company: 'OpenAI',
    position: 'AI Researcher',
    applied_at: '2024-03-10',
    status: 'waiting',
    notes: 'Menunggu balasan HR melalui email.'
  },
  {
    id: 'dummy-2',
    user_id: 'dummy-user',
    company: 'Google',
    position: 'Software Engineer',
    applied_at: '2024-02-22',
    status: 'interview',
    notes: 'Sudah melakukan interview tahap 1, menunggu jadwal onsite.'
  },
  {
    id: 'dummy-3',
    user_id: 'dummy-user',
    company: 'Startup Lokal',
    position: 'Frontend Developer',
    applied_at: '2024-01-15',
    status: 'rejected',
    notes: 'Ditolak karena kurang pengalaman pada React Native.'
  },
  {
    id: 'dummy-4',
    user_id: 'dummy-user',
    company: 'Remote Corp',
    position: 'Product Manager',
    applied_at: '2023-12-01',
    status: 'hired',
    notes: 'Telah menandatangani kontrak per Februari 2024.'
  }
];

// Contoh query Supabase untuk filtering berdasarkan status dan user aktif.
async function fetchApplicationsByStatus(userId: string, status: string) {
  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status);

  return data as ApplicationRecord[] | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async (user: User) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .order('applied_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          setApplications(dummyApplications);
          setIsUsingDummyData(true);
        } else {
          setApplications(data as ApplicationRecord[]);
          setIsUsingDummyData(false);
        }
      } catch (error) {
        console.error(error);
        setFeedbackMessage('Gagal memuat data dari Supabase, menampilkan data contoh.');
        setApplications(dummyApplications);
        setIsUsingDummyData(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const initialize = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(sessionError);
        setFeedbackMessage('Tidak dapat memeriksa sesi login saat ini.');
        setApplications(dummyApplications);
        setIsUsingDummyData(true);
        setIsLoading(false);
        return;
      }

      const session = sessionData.session;
      if (!session) {
        router.replace('/');
        return;
      }

      if (!isMounted) {
        return;
      }

      setCurrentUser(session.user);
      await loadApplications(session.user);
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        router.replace('/');
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
      return;
    }

    setFilteredApplications(applications.filter((application) => application.status === statusFilter));
  }, [applications, statusFilter]);

  const summary = useMemo(() => {
    const total = applications.length;
    const interview = applications.filter((application) => application.status === 'interview').length;
    const rejected = applications.filter((application) => application.status === 'rejected').length;
    const hired = applications.filter((application) => application.status === 'hired').length;

    return {
      total,
      interview,
      rejected,
      hired
    };
  }, [applications]);

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedApplication(null);
    setIsFormOpen(true);
  };

  const openEditForm = (application: ApplicationRecord) => {
    setFormMode('edit');
    setSelectedApplication(application);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedApplication(null);
  };

  const handleFilterChange = (status: StatusFilterValue) => {
    setStatusFilter(status);
  };

  const upsertLocalApplication = (application: ApplicationRecord) => {
    setApplications((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === application.id);
      if (existingIndex >= 0) {
        const clone = [...prev];
        clone[existingIndex] = application;
        return clone;
      }
      return [application, ...prev];
    });
  };

  const createApplication = async (payload: ApplicationPayload) => {
    if (!currentUser) {
      setFeedbackMessage('Session tidak ditemukan. Silakan login ulang.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: currentUser.id,
          company: payload.company,
          position: payload.position,
          applied_at: payload.applied_at,
          status: payload.status,
          notes: payload.notes
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newRecord = data as ApplicationRecord;
      setApplications((prev) => {
        const base = isUsingDummyData ? [] : prev;
        return [newRecord, ...base];
      });
      setIsUsingDummyData(false);
      setFeedbackMessage('Lamaran berhasil ditambahkan.');
      closeForm();
    } catch (error) {
      console.error(error);
      setFeedbackMessage('Terjadi kesalahan saat menyimpan data.');
    }
  };

  const updateApplication = async (payload: ApplicationPayload) => {
    if (!payload.id) return;

    if (isUsingDummyData) {
      upsertLocalApplication(payload as ApplicationRecord);
      setFeedbackMessage('Perubahan tersimpan pada data contoh.');
      closeForm();
      return;
    }

    if (!currentUser) {
      setFeedbackMessage('Session tidak ditemukan. Silakan login ulang.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .update({
          company: payload.company,
          position: payload.position,
          applied_at: payload.applied_at,
          status: payload.status,
          notes: payload.notes
        })
        .eq('id', payload.id)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      upsertLocalApplication(data as ApplicationRecord);
      setFeedbackMessage('Lamaran berhasil diperbarui.');
      closeForm();
    } catch (error) {
      console.error(error);
      setFeedbackMessage('Terjadi kesalahan saat memperbarui data.');
    }
  };

  const handleSubmit = async (payload: ApplicationPayload) => {
    if (formMode === 'create') {
      await createApplication(payload);
    } else {
      await updateApplication(payload);
    }
  };

  const deleteApplication = async (application: ApplicationRecord) => {
    const confirmed = window.confirm(`Hapus lamaran untuk ${application.company}?`);
    if (!confirmed) return;

    if (isUsingDummyData) {
      setApplications((prev) => prev.filter((item) => item.id !== application.id));
      setFeedbackMessage('Data contoh telah dihapus secara lokal.');
      return;
    }

    if (!currentUser) {
      setFeedbackMessage('Session tidak ditemukan. Silakan login ulang.');
      return;
    }

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', application.id)
        .eq('user_id', currentUser.id);

      if (error) {
        throw error;
      }

      setApplications((prev) => prev.filter((item) => item.id !== application.id));
      setFeedbackMessage('Lamaran berhasil dihapus.');
    } catch (error) {
      console.error(error);
      setFeedbackMessage('Gagal menghapus data.');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.replace('/');
    } catch (error) {
      console.error(error);
      setFeedbackMessage('Gagal logout. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {currentUser ? `Hi, ${currentUser.email ?? 'there'}` : 'JobTrackr Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pantau status lamaran kerja Anda dan kelola semuanya dalam satu tempat.
            </p>
            {feedbackMessage && (
              <p className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {feedbackMessage}
              </p>
            )}
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ExportToExcel applications={filteredApplications} />
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-blue-700"
            >
              Add Application
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Total Applications" value={summary.total} accent="bg-blue-500" />
          <SummaryCard title="Total Interview" value={summary.interview} accent="bg-amber-500" />
          <SummaryCard title="Total Rejected" value={summary.rejected} accent="bg-red-500" />
          <SummaryCard title="Total Hired" value={summary.hired} accent="bg-emerald-500" />
        </section>

        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-xl font-semibold text-slate-700">Filter Status</h2>
            <StatusFilter activeStatus={statusFilter} onChange={handleFilterChange} />
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div>
            {isLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow">
                Memuat data lamaran...
              </div>
            ) : (
              <ApplicationTable
                applications={filteredApplications}
                onEdit={openEditForm}
                onDelete={deleteApplication}
              />
            )}
          </div>
          <div>
            <StatusChart applications={applications} />
          </div>
        </section>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">
                {formMode === 'create' ? 'Add New Application' : 'Edit Application'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            <ApplicationForm
              mode={formMode}
              initialData={selectedApplication ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  accent: string;
}

function SummaryCard({ title, value, accent }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-3xl font-bold text-slate-800">{value}</span>
        <span className={`h-2 w-12 rounded-full ${accent}`}></span>
      </div>
    </div>
  );
}
