import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('id',user.id).single()
  if (p?.role!=='admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  const { data } = await supabase.from('support_tickets').select('*,profiles(full_name,email)').order('created_at',{ascending:false})
  return NextResponse.json({ data: data||[] })
}
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { ticketId, status, reply } = await req.json()
  await supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id',ticketId)
  if (reply) await supabase.from('ticket_replies').insert({ ticket_id:ticketId, user_id:user.id, is_admin:true, message:reply })
  return NextResponse.json({ success: true })
}
