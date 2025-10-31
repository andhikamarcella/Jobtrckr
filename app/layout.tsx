import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JobTrackr Dashboard',
  description: 'Dashboard untuk melacak lamaran kerja menggunakan Supabase dan Next.js'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
