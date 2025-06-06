// app/components/ClientSessionProvider.js
'use client'; // WAJIB: Menandakan ini sebagai Client Component

import { SessionProvider } from 'next-auth/react';

export default function ClientSessionProvider({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}