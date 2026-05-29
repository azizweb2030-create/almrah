import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { data } = await supabase.from('deaths').select('*').eq('user_id', user.id).order('death_date', { ascending: false })
  return NextResponse.json({ data: data||[] })
}
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase.from('deaths').insert({ user_id: user.id, ...body }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.rpc('update_flock_on_death', { uid: user.id }).catch(() => {})
  return NextResponse.json({ data }, { status: 201 })
}
