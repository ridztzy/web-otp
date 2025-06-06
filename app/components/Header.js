// ...existing imports...
import { useEffect, useState } from "react";
import JamSekarang from "./jam";

export default function Header({ setSidebarOpen }) {
  const [health, setHealth] = useState({
    whatsapp_connected: false,
    phone_number: null,
    status: "LOADING"
  });

  useEffect(() => {
    let interval = setInterval(() => {
      fetch("http://localhost:3001/health")
        .then(res => res.json())
        .then(data => setHealth(data))
        .catch(() => setHealth(h => ({ ...h, status: false })));
    }, 5000); // cek setiap 5 detik

    // Fetch pertama kali saat mount
    fetch("http://localhost:3001/health")
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => setHealth(h => ({ ...h, status: false })));

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button
          id="sidebarToggle"
          className="md:hidden text-gray-600 mr-4 focus:outline-none"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800">OTP Gateway Admin</h1>
      </div>
        <div id="connectionStatus" className="ml-6 flex items-center justify-left">
          <span className={`status-indicator ${health.status ? "online" : "offline"}`}></span>
          <span className="text-sm text-gray-600">
            {health.status ? "Server Online" : "Server Backend Offline"}
          </span>
        </div>
        <div id="connectionStatus" className="ml-6 flex items-center justify-left">
          <span className={`status-indicator ${health.whatsapp_connected ? "online" : "offline"}`}></span>
          <span className="text-sm text-gray-600">
            {health.whatsapp_connected ? "Whatsapp Online" : "Whatsapp Offline"}
          </span>
        </div>
      <JamSekarang />
    </header>
  );
}