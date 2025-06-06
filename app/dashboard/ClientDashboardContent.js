// app/dashboard/ClientDashboardContent.js
'use client'; // WAJIB ada ini untuk menjadikannya Client Component

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import io from 'socket.io-client'; // Tambahkan jika pakai socket.io-client

export default function ClientDashboardContent({ session }) {
  // Semua state dan useEffect Anda pindah ke sini
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [statistik, setStatistik] = useState(null);
  const [logs, setLogs] = useState([]);
  const [qrcode, setQrcode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(20);
  const [socket, setSocket] = useState(null);

  // Fetch data awal
  useEffect(() => {
    fetchStatus();
    fetchStatistik();
    fetchLogs();

    // Socket.io untuk real-time status
    // Pastikan URL Socket.IO server Anda benar
    const socketIo = io('http://localhost:3001'); // Sesuaikan dengan URL Socket.IO Anda
    setSocket(socketIo);

    socketIo.on('whatsapp-status', (data) => {
      setStatus(data);
      if (data.qrcode) setQrcode(data.qrcode);
      setTimer(20);
    });

    return () => {
      socketIo.disconnect(); // Pastikan socket disconnect saat komponen unmount
    };
  }, []); // [] agar hanya berjalan sekali saat mount

  // Timer QR refresh
  useEffect(() => {
    if (!status?.qr_available) return;

    setTimer(20); // Reset timer saat QR baru tersedia
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 20 : prev - 1));
    }, 1000);

    // Saat timer habis, fetch QR lagi jika status.qr_available masih true
    if (timer === 1 && status.qr_available) {
      fetchQr();
    }

    return () => clearInterval(interval); // Cleanup interval
  }, [status?.qr_available, qrcode, timer]); // tambahkan timer sebagai dependency

  // Fetch functions
  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/status');
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
      if (data.qr_available) fetchQr();
      else setQrcode(null);
    } catch (error) {
      console.error("Error fetching status:", error);
      // Handle error display to user if needed
    } finally {
      setLoading(false);
    }
  }

  async function fetchQr() {
    try {
      const res = await fetch('http://localhost:3001/api/whatsapp/qrcode');
      if (!res.ok) throw new Error('Failed to fetch QR code');
      const data = await res.json();
      setQrcode(data.qrcode);
    } catch (error) {
      console.error("Error fetching QR:", error);
    }
  }

  async function fetchStatistik() {
    try {
      const res = await fetch('http://localhost:3001/api/statistik');
      if (!res.ok) throw new Error('Failed to fetch statistik');
      const data = await res.json();
      setStatistik(data);
    } catch (error) {
      console.error("Error fetching statistik:", error);
    }
  }

  async function fetchLogs() {
    try {
      const res = await fetch('http://localhost:3001/api/logs?limit=4');
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    try {
      await fetch('http://localhost:3001/api/whatsapp/disconnect', { method: 'POST' });
      await fetchStatus(); // Refresh status setelah disconnect
    } catch (error) {
      console.error("Error disconnecting:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshQr() {
    setLoading(true);
    try {
      await fetch('http://localhost:3001/api/whatsapp/refresh-qrcode', { method: 'POST' });
      await fetchStatus(); // Refresh status setelah refresh QR
    } catch (error) {
      console.error("Error refreshing QR:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadQr() {
    if (!qrcode) return;
    const link = document.createElement('a');
    link.href = qrcode;
    link.download = 'whatsapp-qr.png';
    document.body.appendChild(link); // Penting: tambahkan ke DOM sebelum click
    link.click();
    document.body.removeChild(link); // Bersihkan setelah click
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header, Sidebar, Footer adalah Client Components atau komponen yang tidak memerlukan getServerSession */}
      <Header setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="page-content p-6 active">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Koneksi WhatsApp Card */}
              <div className="dashboard-card bg-white p-6 rounded-xl shadow transition duration-300">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Status Koneksi WhatsApp
                </h3>
                {loading ? (
                  <p className="text-gray-500">Memuat status...</p>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <span className={`status-indicator ${status?.whatsapp_connected ? 'online' : 'offline'}`}></span>
                      <span className="text-gray-700">{status?.whatsapp_connected ? 'Terhubung' : 'Tidak Terhubung'}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6">Nomor: {status?.phone_number || '-'}</p>
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Kode QR untuk Otentikasi
                      </label>
                      <div className="flex justify-center"> {/* Gunakan justify-center untuk menengahkan QR */}
                        <div className="qr-code bg-white p-4 rounded-lg shadow-lg">
                          {status?.qr_available && qrcode ? (
                            <>
                              <img src={qrcode} alt="QR Code" className="w-48 h-48" />
                              <div className="text-xs text-gray-500 text-center mt-2">
                                Refresh otomatis dalam {timer} detik
                              </div>
                              <div className="flex mt-2 space-x-2 justify-center"> {/* Tenngahkan tombol juga */}
                                <button onClick={handleDownloadQr} className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">Download</button>
                                <button onClick={handleRefreshQr} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Refresh QR</button>
                              </div>
                            </>
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center text-gray-400">
                              {!status?.whatsapp_connected ? 'QR belum tersedia' : 'Sudah terhubung'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={handleRefreshQr} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition" disabled={loading}>
                        {loading ? 'Memuat...' : 'Scan QR'}
                      </button>
                      <button onClick={handleDisconnect} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition" disabled={loading}>
                        {loading ? 'Memutuskan...' : 'Putuskan'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Statistik Pengiriman Card */}
              <div className="dashboard-card bg-white p-6 rounded-xl shadow transition duration-300">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Statistik Pengiriman OTP
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">OTP Terkirim Hari Ini</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{statistik?.sent_today ?? '-'}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">OTP Gagal</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{statistik?.failed_today ?? '-'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Rasio keberhasilan</span>
                    <span>{statistik?.success_rate ?? '-'}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: `${statistik?.success_rate ?? 0}%`}}></div>
                  </div>
                </div>
              </div>

              {/* Log OTP Terbaru Card */}
              <div className="dashboard-card bg-white p-6 rounded-xl shadow transition duration-300">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Log OTP Terbaru
                </h3>
                <div className="space-y-3">
                  {logs.length === 0 ? (
                    <div className="text-gray-400 text-center">Belum ada log</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={log.id || index} className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                        <div className="flex items-center">
                          <span className={`${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full px-2 py-1 text-xs mr-3`}>
                            {log.status === 'success' ? 'Berhasil' : 'Gagal'}
                          </span>
                          <span>{log.phone}</span>
                        </div>
                        <span className="text-gray-500">{new Date(log.time).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
                <button className="mt-4 w-full py-2 text-center text-sm font-medium text-blue-600 hover:text-blue-800">
                  Lihat Semua Log
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}