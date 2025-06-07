"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, Shield, Zap, Users, ArrowRight, Check, Star } from 'lucide-react';
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [floatingElements, setFloatingElements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Generate floating elements only on client
  useEffect(() => {
    const elements = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
      size: Math.random() > 0.5 ? 'w-1 h-1' : 'w-2 h-2'
    }));
    setFloatingElements(elements);
  }, []);

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "WhatsApp Integration",
      description: "Kirim OTP langsung melalui WhatsApp dengan delivery rate 99%"
    },
    {
      icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Keamanan Tinggi",
      description: "Enkripsi end-to-end dan sistem autentikasi berlapis"
    },
    {
      icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Super Cepat",
      description: "Pengiriman OTP dalam hitungan detik dengan response time <1s"
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime" },
    { number: "1M+", label: "OTP Terkirim" },
    { number: "<1s", label: "Response Time" },
    { number: "24/7", label: "Support" }
  ];

  // Handler functions
  const handleLoginClick = () => {
    router.push('/auth/signin');
  };

  const handleDocsClick = () => {
    router.push('/docs');
  };

  const handleDemoClick = () => {
    router.push('/demo');
  };

  const handleStartFreeClick = () => {
    router.push('/auth/signup');
  };

  const handleButtonClick = async (action) => {
    setIsLoading(true);
    try {
      await action();
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-40">
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

      {/* Header */}
      <header className="relative z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                OTP Gateway
              </h1>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={handleDocsClick}
                className="hidden sm:block text-white/80 hover:text-white transition-colors px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-white/10"
              >
                Dokumentasi
              </button>
              <button 
                onClick={handleLoginClick}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm sm:text-base rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Masuk
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-40 flex-grow">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 mb-6 sm:mb-8">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mr-2" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">Trusted by 1000+ developers</span>
            </div>
            
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent block">
                Admin Panel
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent block">
                OTP Gateway
              </span>
            </h2>
            
            <p className="text-base sm:text-xl text-white/70 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Sistem manajemen pengiriman OTP melalui WhatsApp yang powerful, aman, dan mudah diintegrasikan untuk aplikasi modern Anda
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4">
              <button 
                onClick={handleLoginClick}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl text-base sm:text-lg font-semibold flex items-center justify-center"
              >
                Login Admin
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleDocsClick}
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm text-base sm:text-lg font-semibold"
              >
                Dokumentasi API
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-20 px-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-green-500/50 transition-all group-hover:transform group-hover:scale-105">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/70 text-xs sm:text-sm font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20 px-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-6 sm:p-8 transition-all duration-500 ${
                  currentFeature === index 
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 transform scale-105' 
                    : 'bg-white/5 border border-white/10 hover:border-green-500/30'
                } backdrop-blur-md`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-emerald-600/0 group-hover:from-green-600/5 group-hover:to-emerald-600/5 transition-all duration-300"></div>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-white/10 backdrop-blur-md mx-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Siap untuk memulai?</h3>
            <p className="text-white/70 mb-6 sm:mb-8 text-base sm:text-lg max-w-2xl mx-auto">Integrasikan OTP Gateway ke aplikasi Anda dalam hitungan menit</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleStartFreeClick}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl font-semibold flex items-center justify-center"
              >
                Mulai Gratis
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleDemoClick}
                className="px-6 sm:px-8 py-3 sm:py-4 text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all font-semibold"
              >
                Lihat Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-40 border-t border-white/10 backdrop-blur-md bg-white/5">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 mb-4 sm:mb-0">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-white font-semibold text-sm sm:text-base">OTP Gateway</span>
              </Link>
            </div>
            <div className="text-white/60 text-xs sm:text-sm">
              © {new Date().getFullYear()} WhatsApp OTP Gateway. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}