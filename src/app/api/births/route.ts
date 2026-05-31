import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyUser } from '@/lib/telegram/sender'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data: records, error } = await supabase
    .from('birth_records').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (records || []).map(r => r.id)
  let babiesMap: Record<string, any[]> = {}
  if (ids.length > 0) {
    const { data: allBabies } = await supabase.from('babies').select('*').in('record_id', ids)
    ;(allBabies || []).forEach(b => {
      if (!babiesMap[b.record_id]) babiesMap[b.record_id] = []
      babiesMap[b.record_id].push(b)
    })
  }
  return NextResponse.json({ data: (records || []).map(r => ({ ...r, babies: babiesMap[r.id] || [] })) })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { babies, in_breeding, breeding_date, ...rest } = body

  const { data: recData, error } = await supabase
    .from('birth_records')
    .insert({
      user_id: user.id,
      mom_id: rest.mom_id,
      mom_color: rest.mom_color || '',
      meds: rest.meds || [],
      birth_date: rest.birth_date,
      original_birth_date: rest.birth_date,
      in_breeding: in_breeding || false,
      breeding_date: breeding_date || null,
      hidden_from_home: false,
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let aliveCount = 0
  if (babies && babies.length > 0) {
    await supabase.from('babies').insert(
      babies.map((b: any) => ({
        record_id: recData.id, user_id: user.id,
        baby_id: b.baby_id || '', color: b.color || '',
        gender: b.gender || 'رخل', health: b.health || 'سليم',
        stage: 'بهم', stage_date: new Date().toISOString()
      }))
    )
    aliveCount = babies.filter((b: any) => b.health !== 'نفوق').length
    if (aliveCount > 0) {
      const { data: fd } = await supabase.from('flock_data').select('total_sheep').eq('user_id', user.id).single()
      await supabase.from('flock_data').upsert({
        user_id: user.id, total_sheep: (fd?.total_sheep || 0) + aliveCount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
    }
  }

  // إشعار Telegram
  const msg = `🐑 ولادة جديدة!
الأم: ${rest.mom_id} ${rest.mom_color ? `(${rest.mom_color})` : ''}
المواليد الأحياء: ${aliveCount}
التاريخ: ${rest.birth_date}${in_breeding ? '
⏰ شبك التلقيح مُفعَّل' : ''}`
  await notifyUser(supabase, user.id, 'birth', msg, 'ولادة')

  return NextResponse.json({ data: { ...recData, babies: babies || [] } }, { status: 201 })
}