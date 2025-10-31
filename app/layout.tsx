import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JobTrackr",
  description: "Dashboard pelacak lamaran kerja",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
