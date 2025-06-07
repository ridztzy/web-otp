
"use client"
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/constants'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'

function LogOtpFilter({ filters, setFilters, onApply }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
        <div className="w-full md:w-64 mb-3 md:mb-0">
          <input
            type="text"
            placeholder="Cari nomor telepon..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.phone}
            onChange={e => setFilters(f => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className="w-full md:w-48 mb-3 md:mb-0">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">Semua Status</option>
            <option value="success">Berhasil</option>
            <option value="failed">Gagal</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-4 w-full md:w-auto">
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg mb-2 sm:mb-0 w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.from}
            onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
          />
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg mb-2 sm:mb-0 w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.to}
            onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={onApply}
            type="button"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  )
}

function LogOtpTable({ logs, loading }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Tujuan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Kirim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada data</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(log.time).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.status === 'success' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Berhasil</span>
                    ) : log.status === 'failed' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Gagal</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                    <button onClick={() => alert(log.message)}>Lihat</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LogOtpPagination({ pagination, onPage }) {
  if (!pagination) return null
  const { current_page, total_pages } = pagination
  const pages = []
  for (let i = 1; i <= total_pages; i++) pages.push(i)
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{(current_page - 1) * pagination.per_page + 1}</span>
            {' '}hingga <span className="font-medium">{Math.min(current_page * pagination.per_page, pagination.total_items)}</span>
            {' '}dari <span className="font-medium">{pagination.total_items}</span> data
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={current_page === 1}
              onClick={() => onPage(current_page - 1)}
            >
              Sebelumnya
            </button>
            {pages.map(page => (
              <button
                key={page}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${page === current_page ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                onClick={() => onPage(page)}
                disabled={page === current_page}
              >
                {page}
              </button>
            ))}
            <button
              className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={current_page === total_pages}
              onClick={() => onPage(current_page + 1)}
            >
              Selanjutnya
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default function LogOtpPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState({
    phone: '',
    status: '',
    from: '',
    to: '',
    page: 1,
    limit: 10,
  })
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.phone) params.append('phone', filters.phone)
    if (filters.status) params.append('status', filters.status)
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)
    params.append('page', filters.page)
    params.append('limit', filters.limit)
    const res = await fetch(`${API_BASE_URL}/api/logs?${params.toString()}`)
    const data = await res.json()
    setLogs(data.data)
    setPagination(data.pagination)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line
  }, [filters.page])

  const handleApply = () => {
    setFilters(f => ({ ...f, page: 1 }))
    fetchLogs()
  }

  const handlePage = (page) => {
    setFilters(f => ({ ...f, page }))
  }

  return (
    <div className="flex flex-col h-full">
      <Header setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="page-content p-6 active">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Log Pengiriman OTP</h2>
            <LogOtpFilter filters={filters} setFilters={setFilters} onApply={handleApply} />
            <LogOtpTable logs={logs} loading={loading} />
            <LogOtpPagination pagination={pagination} onPage={handlePage} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}