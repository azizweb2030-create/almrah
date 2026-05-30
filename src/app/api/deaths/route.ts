import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyUser } from '@/lib/telegram/sender'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { data, error } = await supabase.from('deaths').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('deaths').insert({
    user_id: user.id,
    animal_id: body.animal_id,
    color: body.color || '',
    category: body.category || 'غير محدد',
    reason: body.reason || '',
    mom_id: body.mom_id || null,
    mom_color: body.mom_color || null,
    death_date: body.death_date || new Date().toISOString().split('T')[0],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // خصم من الإجمالي
  const { data: fd } = await supabase.from('flock_data').select('total_sheep').eq('user_id', user.id).single()
  if (fd) {
    await supabase.from('flock_data').upsert({
      user_id: user.id,
      total_sheep: Math.max(0, (fd.total_sheep || 0) - 1),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
  }

  // إشعار Telegram
  const msg = `📋 تسجيل نفوق\nالحيوان: ${body.animal_id} ${body.color ? `(${body.color})` : ''}\nالفئة: ${body.category}\n${body.reason ? `السبب: ${body.reason}` : ''}`
  await notifyUser(supabase, user.id, 'death', msg, 'نفوق')

  return NextResponse.json({ data }, { status: 201 })
}
