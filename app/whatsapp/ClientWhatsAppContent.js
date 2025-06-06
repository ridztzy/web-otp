'use client'
import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'

function WhatsAppAccountCard() {
  const [status, setStatus] = useState(null)
  const [qrcode, setQrcode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(20)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Koneksi ke Socket.IO backend
    const socketIo = io('http://localhost:3001')
    setSocket(socketIo)

    socketIo.on('whatsapp-status', (data) => {
      setStatus(data)
      if (data.qrcode) setQrcode(data.qrcode)
      setTimer(20) // Reset timer setiap ada QR baru
    })

    fetchStatus() // Untuk initial load

    return () => {
      socketIo.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!status?.qr_available) return
    setTimer(20)
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 20 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [status?.qr_available, qrcode])

  async function fetchStatus() {
    setLoading(true)
    const res = await fetch('http://localhost:3001/api/whatsapp/status')
    const data = await res.json()
    setStatus(data)
    setLoading(false)
    if (data.qr_available) fetchQr()
    else setQrcode(null)
  }

  async function fetchQr() {
    const res = await fetch('http://localhost:3001/api/whatsapp/qrcode')
    const data = await res.json()
    setQrcode(data.qrcode)
  }

  async function handleDisconnect() {
    await fetch('http://localhost:3001/api/whatsapp/disconnect', { method: 'POST' })
    fetchStatus()
  }

  async function handleRefreshQr() {
    await fetch('http://localhost:3001/api/whatsapp/refresh-qrcode', { method: 'POST' })
    fetchStatus()
  }

  function handleDownloadQr() {
    if (!qrcode) return
    const a = document.createElement('a')
    a.href = qrcode
    a.download = 'whatsapp-qr.png'
    a.click()
  }

  if (loading || !status) return <div>Loading...</div>

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Status Akun Utama</h3>
          <div className="flex items-center mt-2">
            <span className={`status-indicator ${status.connected ? 'online' : 'offline'}`}></span>
            <span className="text-gray-700">{status.connected ? 'Terhubung' : 'Tidak Terhubung'}</span>
          </div>
        </div>
        <button onClick={handleDisconnect} className="mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
          Putuskan Koneksi
        </button>
      </div>
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor WhatsApp Terhubung
          </label>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
            {status.phone_number || '-'}
          </div>
        </div>
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Kode QR untuk Otentikasi
          </label>
          <div className="flex justify">
            <div className="qr-code bg-white p-4 rounded-lg shadow-lg">
              {status.qr_available && qrcode ? (
                <>
                  <img src={qrcode} alt="QR Code" className="w-48 h-48" />
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Refresh otomatis dalam {timer} detik
                  </div>
                </>
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center text-gray-400">
                  {!status.connected ? 'QR belum tersedia' : 'Sudah terhubung'}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-4">
          <button onClick={handleRefreshQr} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-2 sm:mb-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh QR Code
          </button>
          <button onClick={handleDownloadQr} disabled={!qrcode} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download QR
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientWhatsAppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex flex-col h-full">
      <Header setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="page-content p-6 active">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Akun WhatsApp</h2>
            <div className="grid grid-cols-1 mx-auto">
              <WhatsAppAccountCard />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}