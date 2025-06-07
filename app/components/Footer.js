export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-gray-500 text-sm text-center sm:text-left">
          © {new Date().getFullYear()} WhatsApp OTP Gateway. Hak Cipta Dilindungi.
        </p>
        <p className="text-gray-500 text-sm">
          Versi 2.1.4
        </p>
      </div>
    </footer>
  )
}