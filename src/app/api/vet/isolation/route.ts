import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyUser } from '@/lib/telegram/sender'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data, error } = await supabase
    .from('vet_isolation').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Map status → disease for frontend compatibility
  return NextResponse.json({ data: (data||[]).map(r => ({ ...r, disease: r.status, treatment: r.medicine })) })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('vet_isolation')
    .insert({
      user_id: user.id,
      animal_id: body.animal_id,
      status: body.disease || body.status || '',
      medicine: body.treatment || null,
      usage_notes: [body.disease_other, body.duration_text].filter(Boolean).join(' · ') || null,
      start_date: body.start_date || new Date().toISOString().split('T')[0],
      active: true,
      extended_log: [],
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // إشعار Telegram
  await notifyUser(supabase, user.id, 'vet_isolation',
    `🩺 تم عزل حيوان\nالرقم: ${body.animal_id}\nالحالة: ${body.disease || body.status}\n${body.treatment ? `العلاج: ${body.treatment}` : ''}`,
    'بيطرة'
  )

  return NextResponse.json({ data: { ...data, disease: data.status, treatment: data.medicine } }, { status: 201 })
}
