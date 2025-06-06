import ClientSessionProvider from './components/ClientSessionProvider';
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

export const metadata = {
  title: 'Admin OTP Gateway',
  description: 'WhatsApp OTP Gateway Admin Panel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${poppins.className} flex flex-col h-full bg-gray-50 theme-dark`}>
        <ClientSessionProvider>
        {children}
        </ClientSessionProvider>
      </body>
    </html>
  )
}