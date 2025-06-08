import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validasi input
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Kirim ke backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nama: body.name,
        email: body.email,
        password: body.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Gagal mendaftar" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { 
        message: "Registrasi berhasil",
        user: data.user 
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}