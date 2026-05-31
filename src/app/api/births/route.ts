import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyUser } from '@/lib/telegram/sender'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { data: records, error } = await supabase
      .from('birth_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const ids = (records || []).map(r => r.id)
    const babiesMap: Record<string, unknown[]> = {}

    if (ids.length > 0) {
      const { data: allBabies, error: babiesError } = await supabase
        .from('babies')
        .select('*')
        .in('record_id', ids)

      if (babiesError) return NextResponse.json({ error: babiesError.message }, { status: 500 })

      ;(allBabies || []).forEach(b => {
        if (!babiesMap[b.record_id]) babiesMap[b.record_id] = []
        babiesMap[b.record_id].push(b)
      })
    }

    return NextResponse.json({
      data: (records || []).map(r => ({ ...r, babies: babiesMap[r.id] || [] }))
    })
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await req.json()
    const { babies, in_breeding, breeding_date, ...rest } = body

    const { data: recData, error: recError } = await supabase
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
      .select()
      .single()

    if (recError) return NextResponse.json({ error: recError.message }, { status: 500 })

    let aliveCount = 0

    if (babies && babies.length > 0) {
      const { error: babiesError } = await supabase.from('babies').insert(
        babies.map((b: { baby_id?: string; color?: string; gender?: string; health?: string }) => ({
          record_id: recData.id,
          user_id: user.id,
          baby_id: b.baby_id || '',
          color: b.color || '',
          gender: b.gender || 'رخل',
          health: b.health || 'سليم',
          stage: 'بهم',
          stage_date: new Date().toISOString(),
        }))
      )

      // Rollback: حذف سجل الولادة إذا فشل إدراج المواليد
      if (babiesError) {
        await supabase.from('birth_records').delete().eq('id', recData.id)
        return NextResponse.json(
          { error: 'فشل حفظ المواليد: ' + babiesError.message },
          { status: 500 }
        )
      }

      aliveCount = babies.filter((b: { health?: string }) => b.health !== 'نفوق').length

      if (aliveCount > 0) {
        const { data: fd } = await supabase
          .from('flock_data')
          .select('total_sheep')
          .eq('user_id', user.id)
          .single()

        const { error: flockError } = await supabase
          .from('flock_data')
          .upsert(
            {
              user_id: user.id,
              total_sheep: (fd?.total_sheep || 0) + aliveCount,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )

        if (flockError) {
          console.error('[births/POST] flock update error:', flockError.message)
        }
      }
    }

    const breedingNote = in_breeding ? ' | شبك التلقيح مفعّل' : ''
    const msg = `ولادة جديدة! الام: ${rest.mom_id}${rest.mom_color ? ` (${rest.mom_color})` : ''} | مواليد أحياء: ${aliveCount} | التاريخ: ${rest.birth_date}${breedingNote}`

    await notifyUser(supabase, user.id, `birth_${recData.id}`, msg, 'ولادة').catch(
      (err: Error) => console.error('[births/POST] notify error:', err.message)
    )

    return NextResponse.json(
      { data: { ...recData, babies: babies || [] } },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
