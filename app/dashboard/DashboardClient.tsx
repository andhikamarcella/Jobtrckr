"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import {
  STATUS_OPTIONS,
  SOURCE_OPTIONS,
  type ApplicationRecord,
  type ApplicationStatus,
  type ApplicationSource,
  normalizeSource,
  normalizeStatus,
} from "@/lib/applicationTypes";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { SourceGrid } from "@/components/dashboard/SourceGrid";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { ApplicationTable } from "@/components/dashboard/ApplicationTable";
import { ApplicationFormModal, type ApplicationFormValues } from "@/components/dashboard/ApplicationFormModal";
import { LoadingState } from "@/components/dashboard/LoadingState";

const defaultFormValues: ApplicationFormValues = {
  company: "",
  position: "",
  applied_at: new Date().toISOString().slice(0, 10),
  status: "waiting",
  source: "linkedin",
  notes: "",
};

function formatOwner(email: string | null | undefined): string {
  if (!email) return "Pencari Kerja";
  const namePart = email.split("@")[0] ?? "user";
  return namePart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
    .trim();
}

export default function DashboardClient() {
  const supabase = createClient();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<ApplicationFormValues>(defaultFormValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState("");
  const [mutationLoading, setMutationLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (dateRange.startDate) params.set("start", dateRange.startDate);
    if (dateRange.endDate) params.set("end", dateRange.endDate);
    return `/api/applications${params.toString() ? `?${params.toString()}` : ""}`;
  }, [statusFilter, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      setAccessToken(data.session?.access_token ?? null);
      setOwnerEmail(data.session?.user?.email ?? null);
      setUserId(data.session?.user?.id ?? null);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
      setOwnerEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
    });

    void syncSession();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchApplications = useCallback(async () => {
    if (!accessToken) {
      setFetching(false);
      return;
    }
    setFetching(true);
    setFetchError(null);
    try {
      const response = await fetch(queryString, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Gagal memuat data");
      }
      const result = await response.json();
      const normalized = (result.applications ?? []).map((item: ApplicationRecord) => ({
        ...item,
        status: normalizeStatus(item.status),
        source: normalizeSource(item.source),
      }));
      setApplications(normalized);
      setOwnerEmail(result.user?.email ?? ownerEmail ?? null);
      setUserId(result.user?.id ?? userId ?? null);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setFetching(false);
    }
  }, [accessToken, queryString, ownerEmail, userId]);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (!userId || !accessToken) return;
    const channel = supabase
      .channel(`applications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void fetchApplications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, userId, accessToken, fetchApplications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === "all") return applications;
    return applications.filter((application) => application.status === statusFilter);
  }, [applications, statusFilter]);

  const countsByStatus = useMemo(() => {
    return STATUS_OPTIONS.reduce((acc, option) => {
      acc[option.value] = applications.filter((app) => app.status === option.value).length;
      return acc;
    }, {} as Record<ApplicationStatus, number>);
  }, [applications]);

  const countsBySource = useMemo(() => {
    return SOURCE_OPTIONS.reduce((acc, option) => {
      acc[option.value] = applications.filter((app) => app.source === option.value).length;
      return acc;
    }, {} as Record<ApplicationSource, number>);
  }, [applications]);

  const totalApplications = applications.length;
  const hiredCount = countsByStatus.hired ?? 0;

  const openCreateModal = () => {
    setFormValues({ ...defaultFormValues, applied_at: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setModalMode("create");
    setMutationError("");
    setModalOpen(true);
  };

  const openEditModal = (application: ApplicationRecord) => {
    setFormValues({
      company: application.company,
      position: application.position,
      applied_at: application.applied_at,
      status: application.status,
      source: application.source,
      notes: application.notes ?? "",
    });
    setEditingId(application.id);
    setModalMode("edit");
    setMutationError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setMutationError("");
  };

  const submitApplication = useCallback(
    async (values: ApplicationFormValues) => {
      if (!accessToken) {
        setMutationError("Sesi berakhir. Silakan login ulang.");
        return;
      }
      setMutationError("");
      setMutationLoading(true);
      try {
        const endpoint = editingId ? `/api/applications/${editingId}` : "/api/applications";
        const method = editingId ? "PUT" : "POST";
        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "Gagal menyimpan data");
        }

        await fetchApplications();
        setModalOpen(false);
      } catch (err) {
        setMutationError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setMutationLoading(false);
      }
    },
    [accessToken, editingId, fetchApplications]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!accessToken) return;
      const confirmed = window.confirm("Hapus lamaran ini?");
      if (!confirmed) return;
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        alert(body.error || "Gagal menghapus data");
        return;
      }
      await fetchApplications();
    },
    [accessToken, fetchApplications]
  );

  const ownerName = useMemo(() => formatOwner(ownerEmail), [ownerEmail]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    window.location.href = `${siteUrl}`;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-14">
      <header className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-300">Selamat datang kembali,</p>
          <h1 className="text-3xl font-semibold text-slate-50">{ownerName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          <ExportButton applications={filteredApplications} />
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(99,102,241,0.4)] transition hover:scale-[1.01] hover:brightness-110"
          >
            New Application
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </header>

      {fetchError ? (
        <p className="rounded-3xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {fetchError}
        </p>
      ) : null}

      {!accessToken || fetching ? (
        <LoadingState />
      ) : (
        <>
          <MetricsGrid counts={countsByStatus} total={totalApplications} hired={hiredCount} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <SourceGrid counts={countsBySource} />
              <StatusChart applications={applications} />
            </div>
            <InsightsPanel applications={applications} />
          </div>

          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />

          <FilterBar value={statusFilter} onChange={setStatusFilter} />

          <ApplicationTable applications={filteredApplications} onEdit={openEditModal} onDelete={handleDelete} />
        </>
      )}

      <ApplicationFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={formValues}
        loading={mutationLoading}
        error={mutationError}
        onClose={closeModal}
        onSubmit={submitApplication}
      />
    </div>
  );
}
