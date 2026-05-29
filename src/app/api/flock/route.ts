import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { data } = await supabase.from('flock_data').select('*').eq('user_id', user.id).single()
  return NextResponse.json({ data })
}
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase.from('flock_data').upsert({ user_id: user.id, ...body, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
