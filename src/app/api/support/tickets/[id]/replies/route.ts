import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data, error } = await supabase
    .from('ticket_replies').select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { message } = await req.json()
  const { data, error } = await supabase.from('ticket_replies').insert({
    ticket_id: id, user_id: user.id, is_admin: false, message
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  // تحديث updated_at للتذكرة
  await supabase.from('support_tickets').update({ updated_at: new Date().toISOString() }).eq('id', id)
  
  return NextResponse.json({ data }, { status: 201 })
}
