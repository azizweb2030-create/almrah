import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('app_settings').select('value').eq('key','maintenance_mode').single()
  return NextResponse.json({ enabled: data?.value==='true' })
}
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('id',user.id).single()
  if (p?.role!=='admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  const { enabled, message } = await req.json()
  await supabase.from('app_settings').upsert([{key:'maintenance_mode',value:String(enabled)},{key:'maintenance_message',value:message||''}],{onConflict:'key'})
  return NextResponse.json({ success: true })
}
