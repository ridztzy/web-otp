"use client"

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'

function PengaturanForm() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true)
      const res = await fetch('http://localhost:3001/api/settings')
      const data = await res.json()
      setWebhookUrl(data.webhook_url || '')
      setApiKey(data.api_key || '')
      setLoading(false)
    }
    fetchSettings()
  }, [])

  async function handleGenerateApiKey() {
    setLoading(true)
    const res = await fetch('http://localhost:3001/api/settings/generate-apikey', { method: 'POST' })
    const data = await res.json()
    setApiKey(data.api_key)
    setLoading(false)
    setMessage('API Key berhasil digenerate!')
    setTimeout(() => setMessage(null), 2000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await fetch('http://localhost:3001/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook_url: webhookUrl, api_key: apiKey }),
    })
    setSaving(false)
    setMessage('Pengaturan berhasil disimpan!')
    setTimeout(() => setMessage(null), 2000)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Webhook URL
          </label>
          <input
            type="url"
            id="webhookUrl"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/notification"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            disabled={loading}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            URL untuk menerima notifikasi status pengiriman OTP
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={handleGenerateApiKey}
              disabled={loading}
            >
              Generate Baru
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              id="apiKey"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              value={apiKey}
              readOnly
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800"
              onClick={() => {
                navigator.clipboard.writeText(apiKey)
                setMessage('API Key disalin!')
                setTimeout(() => setMessage(null), 1500)
              }}
              tabIndex={-1}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Kunci API untuk integrasi dengan aplikasi travel
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endpoint API OTP Gateway
          </label>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm break-all">
            <span className="font-semibold">POST</span> <span className="text-blue-700">/api/send-otp</span>
            <br />
            <span className="text-gray-500">Contoh request body:</span>
            <pre className="bg-gray-100 rounded p-2 mt-2 text-xs overflow-x-auto">
{`{
  "phone": "+6281234567890",
  "otp": "123456"
}`}
            </pre>
            <span className="text-gray-500">
              Gunakan <b>API Key</b> pada header <code>x-api-key</code>
            </span>
          </div>
        </div>

        {message && (
          <div className="mb-4 text-green-600 text-sm">{message}</div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition mr-3"
            onClick={() => {
              // Reset ke data awal
              setLoading(true)
              fetch('/api/settings')
                .then(res => res.json())
                .then(data => {
                  setWebhookUrl(data.webhook_url || '')
                  setApiKey(data.api_key || '')
                  setLoading(false)
                })
            }}
            disabled={loading || saving}
          >
            Batalkan
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            disabled={loading || saving}
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function PengaturanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex flex-col h-full">
      <Header setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="page-content p-6 active">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Pengaturan</h2>
            <PengaturanForm />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}