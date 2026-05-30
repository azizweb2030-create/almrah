import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Public paths - no auth needed
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/maintenance', '/offline']
  const isPublic = publicPaths.includes(path) || path.startsWith('/api') || path.startsWith('/_next')

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
