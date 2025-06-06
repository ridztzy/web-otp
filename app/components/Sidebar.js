'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOut } from "next-auth/react"

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname()

  // Determine active page
  const getActivePage = () => {
    if (pathname.includes('/dashboard')) return 'dashboard'
    if (pathname.includes('/whatsapp')) return 'whatsapp'
    if (pathname.includes('/logs')) return 'logs'
    if (pathname.includes('/pengaturan')) return 'pengaturan'
    return 'dashboard'
  }
  const activePage = getActivePage()

  return (
    <nav
      id="sidebar"
      className={`bg-white shadow-md w-64 md:block transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition duration-200 ease-in-out md:static fixed h-full z-50`}
    >
      {/* Tombol close di mobile */}
      <button
        className="md:hidden absolute top-4 right-4 text-gray-600"
        onClick={() => setSidebarOpen(false)}
        aria-label="Tutup sidebar"
      >
        ✕
      </button>
      <div className="p-4">
        <div className="flex items-center py-4">
          <div className="ml-4">
            <p className="text-lg font-medium text-gray-800">Admin Portal</p>
            <p className="text-sm text-gray-500">WhatsApp OTP Gateway</p>
          </div>
        </div>
      </div>
      <ul className="space-y-2 px-4 mt-6">
        <li>
          <Link
            href="/dashboard"
            className={`flex items-center p-3 rounded-lg ${
              activePage === 'dashboard'
                ? 'sidebar-active'
                : 'hover:bg-green-50 text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="ml-3">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            href="/whatsapp"
            className={`flex items-center p-3 rounded-lg ${
              activePage === 'whatsapp'
                ? 'sidebar-active'
                : 'hover:bg-green-50 text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="ml-3">Akun WhatsApp</span>
          </Link>
        </li>
        <li>
          <Link
            href="/logs"
            className={`flex items-center p-3 rounded-lg ${
              activePage === 'logs'
                ? 'sidebar-active'
                : 'hover:bg-green-50 text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="ml-3">Log OTP</span>
          </Link>
        </li>
        <li>
          <Link
            href="/pengaturan"
            className={`flex items-center p-3 rounded-lg ${
              activePage === 'pengaturan'
                ? 'sidebar-active'
                : 'hover:bg-green-50 text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="ml-3">Pengaturan</span>
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex items-center p-3 rounded-lg hover:bg-red-50 text-red-500 w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="ml-3">Keluar</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}