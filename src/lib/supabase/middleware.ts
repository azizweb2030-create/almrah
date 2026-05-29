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
  const isAuth = path.startsWith('/auth')
  const isPublic = path === '/' || isAuth || path.startsWith('/api') || path === '/maintenance' || path === '/offline'
  if (!user && !isPublic) return NextResponse.redirect(new URL('/auth/login', request.url))
  if (user && isAuth) return NextResponse.redirect(new URL('/dashboard', request.url))
  if (path.startsWith('/admin')) {
    const { data: p } = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').single()
    if (p?.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return response
}
