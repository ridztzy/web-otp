"use client"

import { useEffect, useState } from "react"

function JamSekarang() {
  const [waktu, setWaktu] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const now = new Date()
      setWaktu(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Jakarta"
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <span className="text-gray-700 font-medium">{waktu}</span>
  )
}

export default JamSekarang