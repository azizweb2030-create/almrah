import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Cache maintenance mode - يُحدَّث كل 60 ثانية لتفادي استعلام DB في كل طلب
let maintenanceCache = { value: false, ts: 0 }

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (c) => {
          c.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          c.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const path = request.nextUrl.pathname
  const isPublic = ['/', '/login', '/register', '/forgot-password', '/maintenance', '/offline'].includes(path)
    || path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/favicon')

  // فحص وضع الصيانة مع cache (باستثناء /admin و /api)
  if (!path.startsWith('/admin') && !path.startsWith('/api') && path !== '/maintenance') {
    const now = Date.now()
    if (now - maintenanceCache.ts > 60_000) {
      const { data: maint } = await supabase.from('app_settings')
        .select('value').eq('key', 'maintenance_mode').single()
      maintenanceCache = { value: maint?.value === 'true', ts: now }
    }
    if (maintenanceCache.value) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (path.startsWith('/admin')) {
    const { data: p } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').single()
    if (!p || p.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
