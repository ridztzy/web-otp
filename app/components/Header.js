import { useEffect, useState, useCallback, useRef } from "react";
import { API_BASE_URL } from "../config/constants";
import JamSekarang from "./jam";

export default function Header({ setSidebarOpen }) {
  const [health, setHealth] = useState({
    whatsapp_connected: false,
    phone_number: null,
    status: "LOADING"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartMessage, setRestartMessage] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fungsi untuk fetch health status dengan timeout dan error handling
  const fetchHealthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      
      // Timeout untuk request (10 detik)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validasi data response
      const validatedData = {
        whatsapp_connected: Boolean(data.whatsapp.connected),
        phone_number: data.phone_number || null,
        status: data.status || "UNKNOWN"
      };
      
      setHealth(validatedData);
      setLastUpdate(new Date());
      setConnectionError(null);
      
    } catch (error) {
      console.error('Error fetching health status:', error);
      
      let errorMessage = "Connection failed";
      if (error.name === 'AbortError') {
        errorMessage = "Request timeout";
      } else if (error.message.includes('fetch')) {
        errorMessage = "Network error";
      }
      
      setConnectionError(errorMessage);
      setHealth(prev => ({ 
        ...prev, 
        status: "ERROR",
        whatsapp_connected: false 
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup interval dan cleanup
  useEffect(() => {
    // Fetch pertama kali
    fetchHealthStatus();
    
    // Setup interval untuk auto-refresh setiap 3 detik
    intervalRef.current = setInterval(fetchHealthStatus, 3000);
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchHealthStatus]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchHealthStatus();
  };

  // Fungsi untuk restart server
  const handleRestartServer = async () => {
    setIsRestarting(true);
    setRestartMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY // gunakan env public di frontend
        }
      });
      const data = await res.json();
      setRestartMessage(data.message || 'Restarting...');
    } catch (err) {
      setRestartMessage('Gagal restart server');
    } finally {
      setIsRestarting(false);
    }
  };

  // Status indicator component untuk reusability
  const StatusIndicator = ({ isConnected, label, showPhone = false }) => (
    <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
      <div className="relative">
        <span 
          className={`inline-block w-3 h-3 rounded-full transition-all duration-300 ${
            isConnected ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'
          } ${isLoading ? 'animate-pulse' : 'shadow-lg'}`}
        />
        {isConnected && (
          <span className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${
          isConnected ? 'text-green-700' : 'text-red-700'
        }`}>
          {label}
        </span>
        {showPhone && health.phone_number && (
          <span className="text-xs text-gray-500">{health.phone_number}</span>
        )}
      </div>
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left Section - Title & Menu */}
          <div className="flex items-center min-w-0 flex-1">
            <button
              className="md:hidden text-gray-600 hover:text-gray-900 mr-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                OTP Gateway Admin
              </h1>
              {lastUpdate && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Last update: {lastUpdate.toLocaleTimeString('id-ID')}
                </p>
              )}
            </div>
          </div>

          {/* Middle Section - Status Indicators */}
          <div className="hidden sm:flex items-center space-x-3 mx-4">
            <StatusIndicator 
              isConnected={health.status !== "ERROR" && health.status !== "LOADING"} 
              label={health.status === "LOADING" ? "Connecting..." : health.status !== "ERROR" ? "Server Online" : "Server Offline"} 
            />
            <StatusIndicator 
              isConnected={health.whatsapp_connected} 
              label={health.whatsapp_connected ? "WhatsApp Connected" : "WhatsApp Disconnected"}
              showPhone={true}
            />
            
            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh status"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleRestartServer}
              disabled={isRestarting}
              className="p-2 ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Restart server"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${isRestarting ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V1L8 5l4 4V6a6 6 0 11-6 6H4a8 8 0 108-8z"/>
              </svg>
            </button>
          </div>

          {/* Right Section - Clock */}
          <div className="flex items-center">
            <JamSekarang />
          </div>
        </div>

        {/* Mobile Status Indicators */}
        <div className="sm:hidden mt-3 flex flex-wrap gap-2">
          <StatusIndicator 
            isConnected={health.status !== "ERROR" && health.status !== "LOADING"} 
            label={health.status === "LOADING" ? "Connecting..." : health.status !== "ERROR" ? "Server Online" : "Server Offline"} 
          />
          <StatusIndicator 
            isConnected={health.whatsapp_connected} 
            label={health.whatsapp_connected ? "WhatsApp Connected" : "WhatsApp Disconnected"}
            showPhone={true}
          />
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <button
            onClick={handleRestartServer}
            disabled={isRestarting}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
            title="Restart server"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 ${isRestarting ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V1L8 5l4 4V6a6 6 0 11-6 6H4a8 8 0 108-8z"/>
            </svg>
            <span>Restart</span>
          </button>
        </div>

        {/* Error Message */}
        {connectionError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">
              ⚠️ {connectionError} - Trying to reconnect...
            </p>
          </div>
        )}

        {/* Pesan restart */}
        {restartMessage && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">{restartMessage}</p>
          </div>
        )}
      </div>
    </header>
  );
}