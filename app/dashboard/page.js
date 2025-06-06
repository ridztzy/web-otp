// app/dashboard/page.js
// TIDAK ADA "use client" di sini! Ini adalah Server Component secara default.

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers'; // Ini hanya boleh di Server Component

// Import komponen Client yang baru kita buat
import ClientDashboardContent from './ClientDashboardContent';

export default async function DashboardPage() {
  // Panggil getServerSession di dalam fungsi async ini
  const session = await getServerSession({
    req: { headers: headers(), cookies: cookies() },
    res: { getHeader: (name) => headers().get(name), setHeader: () => {}, appendHeader: () => {} },
    ...authOptions
  });

  // Jika tidak ada sesi, redirect ke halaman login
  if (!session) {
    redirect('/auth/signin');
  }

  // Passing data sesi ke Client Component
  // ClientDashboardContent akan menjadi 'child' dari server component ini
  return (
    <ClientDashboardContent session={session} />
  );
}