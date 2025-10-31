import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="rounded-xl bg-white/10 p-10 text-center shadow-xl backdrop-blur">
        <h1 className="text-4xl font-bold">JobTrackr</h1>
        <p className="mt-4 max-w-lg text-lg text-white/80">
          Kelola dan lacak semua lamaran pekerjaan Anda dari satu dashboard yang rapi.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white shadow hover:bg-blue-600"
        >
          Buka Dashboard
        </Link>
      </div>
    </main>
  );
}
