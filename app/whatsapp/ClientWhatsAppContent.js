'use client'
import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'

function WhatsAppAccountCard() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [socket, setSocket] = useState(null)
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [loginHistory, setLoginHistory] = useState([])

  useEffect(() => {
    // Koneksi ke Socket.IO backend
    const socketIo = io('http://localhost:3001')
    setSocket(socketIo)

    socketIo.on('whatsapp-status', (data) => {
      setStatus(data)
    })

    fetchAccountInfo() // Untuk initial load

    return () => {
      socketIo.disconnect()
    }
  }, [])

  async function fetchAccountInfo() {
    setLoading(true)
    try {
      // Fetch status
      const statusRes = await fetch('http://localhost:3001/api/whatsapp/status')
      const statusData = await statusRes.json()
      setStatus(statusData)

      // Fetch device info jika terhubung
      if (statusData.connected) {
        const deviceRes = await fetch('http://localhost:3001/api/whatsapp/device-info')
        const deviceData = await deviceRes.json()
        setDeviceInfo(deviceData)
      }

      // Fetch login history
      const historyRes = await fetch('http://localhost:3001/api/whatsapp/login-history')
      const historyData = await historyRes.json()
      setLoginHistory(historyData.slice(0, 5)) // Ambil 5 terakhir
    } catch (error) {
      console.error('Error fetching account info:', error)
    }
    setLoading(false)
  }

  async function handleDisconnect() {
    await fetch('http://localhost:3001/api/whatsapp/disconnect', { method: 'POST' })
    fetchAccountInfo()
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || !status) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Status Akun */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Status Akun WhatsApp</h3>
            <div className="flex items-center mt-2">
              <span className={`w-3 h-3 rounded-full mr-2 ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-gray-700">{status.connected ? 'Terhubung' : 'Tidak Terhubung'}</span>
            </div>
          </div>
          {status.connected && (
            <button 
              onClick={handleDisconnect} 
              className="mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
              Putuskan Koneksi
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp Aktif
            </label>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 font-mono">
              {status.phone_number || '-'}
            </div>
          </div>

          {/* Status Terakhir */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terakhir Aktif
            </label>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
              {status.last_seen ? formatDate(status.last_seen) : '-'}
            </div>
          </div>
        </div>

        {/* Pesan untuk QR Code */}
        {!status.connected && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Belum Terhubung</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Untuk menghubungkan akun WhatsApp, silakan buka halaman <strong>Dashboard</strong> untuk scan QR code.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Device */}
      {status.connected && deviceInfo && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Informasi Device</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <p className="text-gray-900">{deviceInfo.platform || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Browser</label>
              <p className="text-gray-900">{deviceInfo.browser || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Versi WhatsApp</label>
              <p className="text-gray-900">{deviceInfo.wa_version || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
              <p className="text-gray-900 font-mono text-sm">{deviceInfo.device_id?.substring(0, 20) + '...' || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Login */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Riwayat Login Terakhir</h3>
        {loginHistory.length > 0 ? (
          <div className="space-y-3">
            {loginHistory.map((login, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${login.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {login.success ? 'Login Berhasil' : 'Login Gagal'}
                    </p>
                    <p className="text-xs text-gray-500">{login.ip_address}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(login.timestamp)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>Belum ada riwayat login</p>
          </div>
        )}
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
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Akun WhatsApp</h2>
              <p className="text-gray-600 mt-1">Kelola dan pantau status akun WhatsApp Anda</p>
            </div>
            <div className="max-w-4xl">
              <WhatsAppAccountCard />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}