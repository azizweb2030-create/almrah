import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyUser } from '@/lib/telegram/sender'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data: record, error } = await supabase
    .from('birth_records').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error || !record) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })

  const { data: babies } = await supabase.from('babies').select('*').eq('record_id', id)
  return NextResponse.json({ data: { ...record, babies: babies || [] } })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('birth_records')
    .update(body)
    .eq('id', id).eq('user_id', user.id)
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // إشعار عند تفعيل شبك التلقيح
  if (body.in_breeding === true && body.breeding_date) {
    await notifyUser(
      supabase, user.id,
      `mom_breeding_${data.mom_id}_${body.breeding_date}`,
      `🔗 الأم رقم ${data.mom_id} ${data.mom_color?`(${data.mom_color})`:''} انتقلت إلى شبك التلقيح · ${body.breeding_date}`,
      'شبك'
    )
  }

  return NextResponse.json({ data })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  await supabase.from('birth_records').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
