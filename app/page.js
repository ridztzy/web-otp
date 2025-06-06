import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">OTP Gateway</h1>
          <nav>
            <Link href="/auth/signin" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Admin Panel OTP Gateway</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Sistem manajemen pengiriman OTP melalui WhatsApp untuk aplikasi Anda
        </p>
        <div className="flex gap-4">
          <Link href="/auth/signin" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg">
            Login Admin
          </Link>
          <Link href="/docs" className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition text-lg">
            Dokumentasi API
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} WhatsApp OTP Gateway. All rights reserved.
        </div>
      </footer>
    </div>
  )
}