import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: p } = await supabase.from('profiles').select('role').eq('id',user.id).single()
  return p?.role==='admin' ? supabase : null
}
export async function GET(req: NextRequest) {
  const supabase = await isAdmin()
  if (!supabase) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  const q = new URL(req.url).searchParams.get('q')||''
  let query = supabase.from('profiles').select('*').order('created_at',{ascending:false})
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
  const { data } = await query
  return NextResponse.json({ data })
}
export async function PATCH(req: NextRequest) {
  const supabase = await isAdmin()
  if (!supabase) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  const { userId, updates } = await req.json()
  const { data, error } = await supabase.from('profiles').update(updates).eq('id',userId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
