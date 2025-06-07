'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, SOCKET_URL } from '../config/constants';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import io from 'socket.io-client';

export default function ClientDashboardContent({ session }) {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [statistik, setStatistik] = useState(null);
  const [logs, setLogs] = useState([]);
  const [qrcode, setQrcode] = useState(null);
  const [loading, setLoading] = useState({
    status: false,
    qr: false,
    disconnect: false,
    refresh: false
  });
  const [timer, setTimer] = useState(20);
  const [socket, setSocket] = useState(null);
  const [errors, setErrors] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isOnline, setIsOnline] = useState(true); // default true

  // Refs for cleanup
  const timerRef = useRef(null);
  const socketRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper function untuk update loading state
  const updateLoading = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Helper function untuk error handling
  const handleError = useCallback((key, error) => {
    console.error(`Error ${key}:`, error);
    setErrors(prev => ({ 
      ...prev, 
      [key]: error.message || 'An error occurred' 
    }));
    
    // Auto clear error after 5 seconds
    setTimeout(() => {
      setErrors(prev => ({ ...prev, [key]: null }));
    }, 5000);
  }, []);

  // Fetch functions dengan improved error handling
  const fetchStatus = useCallback(async (showLoading = true) => {
    if (!isOnline) return;
    
    if (showLoading) updateLoading('status', true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_BASE_URL}/api/status`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      
      // Validate response data
      const validatedStatus = {
        whatsapp_connected: Boolean(data.whatsapp_connected),
        phone_number: data.phone_number || null,
        qr_available: Boolean(data.qr_available),
        ...data
      };
      
      setStatus(validatedStatus);
      setLastUpdate(new Date());
      setErrors(prev => ({ ...prev, status: null }));
      
      if (validatedStatus.qr_available && !validatedStatus.whatsapp_connected) {
        await fetchQr(false);
      } else {
        setQrcode(null);
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        handleError('status', error);
      }
    } finally {
      if (showLoading) updateLoading('status', false);
    }
  }, [isOnline, updateLoading, handleError]);

  const fetchQr = useCallback(async (showLoading = true) => {
    if (!isOnline) return;
    
    if (showLoading) updateLoading('qr', true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/qrcode`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      
      if (data.qrcode) {
        setQrcode(data.qrcode);
        setTimer(20); // Reset timer when new QR is received
        setErrors(prev => ({ ...prev, qr: null }));
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        handleError('qr', error);
      }
    } finally {
      if (showLoading) updateLoading('qr', false);
    }
  }, [isOnline, updateLoading, handleError]);

  const fetchStatistik = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_BASE_URL}/api/statistik`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      
      // Validate and set default values
      const validatedStats = {
        sent_today: data.sent_today || 0,
        failed_today: data.failed_today || 0,
        success_rate: data.success_rate || 0,
        ...data
      };
      
      setStatistik(validatedStats);
      setErrors(prev => ({ ...prev, statistik: null }));
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        handleError('statistik', error);
      }
    }
  }, [isOnline, handleError]);

  const fetchLogs = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_BASE_URL}/api/logs?limit=4`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      
      setLogs(Array.isArray(data.data) ? data.data : []);
      setErrors(prev => ({ ...prev, logs: null }));
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        handleError('logs', error);
      }
    }
  }, [isOnline, handleError]);

  // Action handlers
  const handleDisconnect = useCallback(async () => {
    updateLoading('disconnect', true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/disconnect`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      await fetchStatus(false);
      setQrcode(null);
      setErrors(prev => ({ ...prev, disconnect: null }));
      
    } catch (error) {
      handleError('disconnect', error);
    } finally {
      updateLoading('disconnect', false);
    }
  }, [fetchStatus, updateLoading, handleError]);

  const handleRefreshQr = useCallback(async () => {
    updateLoading('refresh', true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/refresh-qrcode`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      await fetchStatus(false);
      setErrors(prev => ({ ...prev, refresh: null }));
      
    } catch (error) {
      handleError('refresh', error);
    } finally {
      updateLoading('refresh', false);
    }
  }, [fetchStatus, updateLoading, handleError]);

  const handleDownloadQr = useCallback(() => {
    if (!qrcode) return;
    
    try {
      const link = document.createElement('a');
      link.href = qrcode;
      link.download = `whatsapp-qr-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      handleError('download', error);
    }
  }, [qrcode, handleError]);

  // Socket.io setup
  useEffect(() => {
    if (!isOnline) return;
    
    const socketIo = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5
    });
    
    socketRef.current = socketIo;
    setSocket(socketIo);

    socketIo.on('connect', () => {
      console.log('Socket connected');
      setErrors(prev => ({ ...prev, socket: null }));
    });

    socketIo.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketIo.on('connect_error', (error) => {
      handleError('socket', error);
    });

    socketIo.on('whatsapp-status', (data) => {
      if (data) {
        setStatus(prev => ({ ...prev, ...data }));
        if (data.qrcode) {
          setQrcode(data.qrcode);
          setTimer(20);
        }
        setLastUpdate(new Date());
      }
    });

    socketIo.on('otp-log', (logData) => {
      if (logData) {
        setLogs(prev => [logData, ...prev.slice(0, 3)]);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isOnline, handleError]);

  // QR Timer management
  useEffect(() => {
    if (status?.qr_available && !status?.whatsapp_connected && qrcode) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            fetchQr(false);
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status?.qr_available, status?.whatsapp_connected, qrcode, fetchQr]);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchStatus(),
        fetchStatistik(),
        fetchLogs()
      ]);
    };

    initializeData();

    // Auto refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      if (isOnline) {
        fetchStatistik();
        fetchLogs();
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [fetchStatus, fetchStatistik, fetchLogs, isOnline]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Error display component
  const ErrorAlert = ({ error, onRetry }) => {
    if (!error) return null;
    
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-800">{error}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        )}
      </div>
    );
  };

  // Offline indicator
  if (!isOnline) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v6m0 8v6m8-10h-6M4 12h6" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Koneksi Internet</h3>
          <p className="text-gray-500">Periksa koneksi internet Anda dan coba lagi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 sm:p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdate.toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Global Errors */}
            <ErrorAlert error={errors.socket} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status Koneksi WhatsApp Card */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Status WhatsApp
                  </h3>

                  <ErrorAlert error={errors.status} onRetry={() => fetchStatus()} />

                  {loading.status ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center mb-4">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          status?.whatsapp_connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">
                          {status?.whatsapp_connected ? 'Terhubung' : 'Tidak Terhubung'}
                        </span>
                      </div>
                      
                      {status?.phone_number && (
                        <p className="text-sm text-gray-600 mb-6">
                          Nomor: {status.phone_number}
                        </p>
                      )}

                      {/* QR Code Section */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Kode QR untuk Otentikasi
                        </label>
                        
                        <ErrorAlert error={errors.qr} onRetry={() => fetchQr()} />
                        
                        <div className="flex justify-center">
                          <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                            {status?.qr_available && qrcode && !status?.whatsapp_connected ? (
                              <div className="text-center">
                                <img 
                                  src={qrcode} 
                                  alt="QR Code" 
                                  className="w-48 h-48 mx-auto mb-3"
                                  loading="lazy"
                                />
                                <div className="text-xs text-gray-500 mb-3">
                                  Refresh otomatis dalam {timer} detik
                                </div>
                                <div className="flex gap-2 justify-center">
                                  <button 
                                    onClick={handleDownloadQr}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors"
                                  >
                                    Download
                                  </button>
                                  <button 
                                    onClick={handleRefreshQr}
                                    disabled={loading.refresh}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                  >
                                    {loading.refresh ? 'Loading...' : 'Refresh'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                  <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                  </svg>
                                  <p className="text-sm">
                                    {status?.whatsapp_connected ? 'Sudah Terhubung' : 'QR Tidak Tersedia'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button 
                          onClick={handleRefreshQr}
                          disabled={loading.refresh || loading.status}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading.refresh ? 'Loading...' : 'Scan QR'}
                        </button>
                        <button 
                          onClick={handleDisconnect}
                          disabled={loading.disconnect || loading.status || !status?.whatsapp_connected}
                          className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading.disconnect ? 'Loading...' : 'Putuskan'}
                        </button>
                      </div>

                      <ErrorAlert error={errors.disconnect || errors.refresh} />
                    </>
                  )}
                </div>
              </div>

              {/* Statistik Pengiriman Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Statistik OTP
                  </h3>

                  <ErrorAlert error={errors.statistik} onRetry={fetchStatistik} />

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-green-700 text-sm font-medium">Terkirim Hari Ini</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {statistik?.sent_today ?? '-'}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <p className="text-red-700 text-sm font-medium">Gagal</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {statistik?.failed_today ?? '-'}
                      </p>
                    </div>
                  </div>

                  {statistik && (
                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Tingkat Keberhasilan</span>
                        <span className="font-medium">{statistik.success_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" 
                          style={{width: `${Math.min(statistik.success_rate, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Log OTP Terbaru Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Log Terbaru
                  </h3>

                  <ErrorAlert error={errors.logs} onRetry={fetchLogs} />

                  <div className="space-y-3">
                    {logs.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">Belum ada log</p>
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={log.id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center min-w-0 flex-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                              log.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status === 'success' ? 'Berhasil' : 'Gagal'}
                            </span>
                            <span className="text-gray-900 truncate">{log.phone}</span>
                          </div>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {new Date(log.time).toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <button className="mt-4 w-full py-2 text-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                    Lihat Semua Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}