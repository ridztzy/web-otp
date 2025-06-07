"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Generate floating elements only on client side
  useEffect(() => {
    const elements = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
      size: Math.random() > 0.5 ? 'w-1 h-1' : 'w-2 h-2'
    }));
    setFloatingElements(elements);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res.error) {
        setError(res.error === "CredentialsSignin" ? "Email atau password salah." : res.error);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-x-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-10 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className={`absolute ${element.size} bg-white/10 rounded-full animate-pulse pointer-events-none`}
            style={{
              left: element.left,
              top: element.top,
              animationDelay: element.animationDelay,
              animationDuration: element.animationDuration
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-50 w-full max-w-md pt-30">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent mb-2">
            Masuk ke Admin Panel
          </h1>
          <p className="text-white/70 text-sm sm:text-base">Kelola OTP Gateway Anda dengan aman</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">
                  {error === "CredentialsSignin" ? "Email atau password salah." : error}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-white/90 font-medium text-sm sm:text-base">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-white/90 font-medium text-sm sm:text-base">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/70 focus:outline-none disabled:opacity-50 z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center space-x-2 text-white/70 cursor-pointer">
                <input 
                  type="checkbox" 
                  disabled={loading}
                  className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 bg-white/10 border-white/20 rounded focus:ring-green-500/50 focus:ring-2 disabled:opacity-50"
                />
                <span>Ingat saya</span>
              </label>
              <button
                type="button"
                disabled={loading}
                className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
              >
                Lupa password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="group w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base font-medium"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </div>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-white/50 text-xs sm:text-sm">atau</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Alternative Actions */}
          <div className="space-y-3">
            <button 
              type="button"
              disabled={loading}
              className="w-full py-3 px-4 border border-white/20 text-white/80 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm text-sm sm:text-base disabled:opacity-50"
            >
              Login dengan Google
            </button>
            <div className="text-center text-white/60 text-xs sm:text-sm">
              Belum punya akun? 
              <button 
                type="button"
                disabled={loading}
                className="text-green-400 hover:text-green-300 ml-1 transition-colors disabled:opacity-50"
              >
                Daftar sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 sm:mt-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-white/60 text-xs sm:text-sm">Koneksi aman dan terenkripsi</span>
          </div>
        </div>
      </div>
    </div>
  );
}