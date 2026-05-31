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
  const category: string = body.category || 'غير محدد'

  // حفظ سجل النفوق
  const { data, error } = await supabase.from('deaths').insert({
    user_id: user.id,
    animal_id: body.animal_id,
    color: body.color || '',
    category,
    reason: body.reason || '',
    mom_id: body.mom_id || null,
    mom_color: body.mom_color || null,
    death_date: body.death_date || new Date().toISOString().split('T')[0],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: fd } = await supabase.from('flock_data').select('total_sheep').eq('user_id', user.id).single()

  if (category === 'فحل') {
    // الفحول خارج إجمالي القطيع — فقط تحديث حالة الفحل
    await supabase.from('rams').update({ dead: true })
      .eq('user_id', user.id).eq('ram_id', body.animal_id)

  } else if (category === 'أم') {
    // عند نفوق الأم: إخفاء من الرئيسية + إلغاء الشبك + خصم من الإجمالي
    if (body.animal_id) {
      await supabase.from('birth_records').update({ hidden_from_home: true, in_breeding: false })
        .eq('user_id', user.id).eq('mom_id', body.animal_id)
    }
    if (fd) {
      await supabase.from('flock_data').upsert({
        user_id: user.id,
        total_sheep: Math.max(0, (fd.total_sheep || 0) - 1),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
    }

  } else {
    // بهم / رخل / خروف — تحديث حالة المولود + خصم من الإجمالي
    const { data: matchBaby } = await supabase.from('babies')
      .select('id').eq('user_id', user.id).eq('baby_id', body.animal_id).neq('health', 'نفوق').limit(1).single()

    if (matchBaby) {
      await supabase.from('babies').update({ health: 'نفوق' }).eq('id', matchBaby.id)
    }

    if (fd) {
      await supabase.from('flock_data').upsert({
        user_id: user.id,
        total_sheep: Math.max(0, (fd.total_sheep || 0) - 1),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
    }
  }

  // إشعار Telegram
  await notifyUser(supabase, user.id,
    `death_${data.id}`,
    `📋 تسجيل نفوق\nالحيوان: ${body.animal_id} ${body.color?`(${body.color})`:''}\nالفئة: ${category}${body.reason?`\nالسبب: ${body.reason}`:''}`,
    'نفوق'
  )

  return NextResponse.json({ data }, { status: 201 })
}
