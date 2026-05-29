import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'المراح - إدارة المواشي',
  description: 'منصة احترافية لإدارة وتربية المواشي',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1e5a10" />
      </head>
      <body className="font-tajawal bg-beige-primary text-gray-900">
        {children}
        <Toaster position="top-center" toastOptions={{
          style: { fontFamily: 'Tajawal', direction: 'rtl', borderRadius: '12px' },
          success: { style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } },
          error:   { style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' } },
        }} />
      </body>
    </html>
  )
}
