import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMatingDate, getExpectedBirthDate } from '@/lib/utils/dates'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { data: records } = await supabase.from('birth_records').select('*').eq('user_id', user.id).order('birth_date', { ascending: false })
  const ids = (records||[]).map(r => r.id)
  const { data: babies } = ids.length ? await supabase.from('babies').select('*').in('record_id', ids) : { data: [] }
  const map: Record<string, any[]> = {}
  ;(babies||[]).forEach(b => { if (!map[b.record_id]) map[b.record_id] = []; map[b.record_id].push(b) })
  return NextResponse.json({ data: (records||[]).map(r => ({ ...r, babies: map[r.id]||[] })) })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const body = await req.json()
  const { babies, ...rd } = body
  const matingDate = getMatingDate(rd.birth_date)
  const expectedBirth = getExpectedBirthDate(matingDate)
  const { data: record, error } = await supabase.from('birth_records').insert({
    user_id: user.id, mom_id: rd.mom_id, birth_date: rd.birth_date,
    birth_type: rd.birth_type, birth_count: babies?.length||1, notes: rd.notes||null,
    mating_date: matingDate.toISOString().split('T')[0],
    expected_birth: expectedBirth.toISOString().split('T')[0],
    in_breeding: false,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (babies?.length) {
    await supabase.from('babies').insert(babies.map((b: any) => ({
      record_id: record.id, user_id: user.id, animal_id: b.animal_id,
      gender: b.gender, health: b.health||'سليم', stage: 'بهم',
      birth_date: rd.birth_date, status: 'حي', added_to_total: false,
      stage_updated_at: new Date().toISOString(),
    })))
    const alive = babies.filter((b: any) => b.health !== 'نفوق').length
    if (alive > 0) await supabase.rpc('update_flock_on_birth', { uid: user.id, alive_count: alive, birth_date: rd.birth_date }).catch(() => {})
  }
  return NextResponse.json({ data: record }, { status: 201 })
}
