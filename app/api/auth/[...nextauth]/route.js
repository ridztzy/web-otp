import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();
          
          // Log untuk debugging
          console.log('Response status:', response.status);
          console.log('Response data:', data);

          // Jika login gagal, return null (rekomendasi NextAuth)
          if (!response.ok) {
            console.log('Login failed:', data.error || data.message);
            return null;
          }

          // Pastikan data user ada
          if (!data.user) {
            console.log('No user data in response');
            return null;
          }

          // Return data untuk session
          return {
            id: data.user.id,
            name: data.user.nama,
            email: data.user.email,
            token: data.token
          };

        } catch (error) {
          console.error('Auth error:', error);
          return null; // Return null daripada throw error
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Menyimpan data tambahan ke token
        token.id = user.id;
        token.accessToken = user.token; // jika menggunakan token dari backend
      }
      return token;
    },
    async session({ session, token }) {
      // Menyimpan data dari token ke session
      session.user.id = token.id;
      session.accessToken = token.accessToken; // jika menggunakan token dari backend
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };