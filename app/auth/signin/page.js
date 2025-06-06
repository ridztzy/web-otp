// app/auth/signin/page.js
'use client'; // WAJIB: Ini adalah Client Component

import { signIn } from "next-auth/react"; // Cukup import signIn saja
import { useState } from 'react'; // Untuk state loading atau error message

// import Head from 'next/head'; // Head tidak lagi relevan di App Router untuk metadata

export default function SignInPage() {
  const [error, setError] = useState(null); // State untuk pesan error
  const [loading, setLoading] = useState(false); // State untuk loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Jangan redirect otomatis
      callbackUrl: "/dashboard" // URL tujuan setelah sukses login
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error); // Set pesan error dari NextAuth.js
    } else {
      // Jika berhasil, redirect manual
      window.location.href = result?.url || "/";
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      {/* Untuk metadata (judul halaman), gunakan file layout.js atau page.js di level yang lebih tinggi */}
      {/* Contoh: tambahkan export const metadata = { title: 'Login' }; di page.js ini atau layout.js */}
      <h1 style={{ marginBottom: '20px', color: '#333' }}>Masuk ke Akun Anda</h1>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '350px' }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>
              {error === "CredentialsSignin" ? "Email atau password salah." : error}
            </p>
          )}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={loading}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              disabled={loading}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1.1em',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}