import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'المراح - إدارة المواشي',
  description: 'منصة احترافية لإدارة وتربية المواشي',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'المراح',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1e5a10',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-tajawal bg-beige-primary text-gray-900">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontFamily: 'Tajawal', direction: 'rtl', borderRadius: '12px' },
            success: { style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } },
            error: { style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' } },
          }}
        />
      </body>
    </html>
  )
}
