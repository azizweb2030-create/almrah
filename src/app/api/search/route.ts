import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const q = new URL(req.url).searchParams.get('q')?.trim() || ''
  if (q.length < 2) return NextResponse.json({ data: { births:[], babies:[], rams:[], deaths:[], vet:[] } })

  const [a, b, c, d, e] = await Promise.all([
    supabase.from('birth_records').select('id,mom_id,mom_color,birth_date').eq('user_id',user.id).ilike('mom_id',`%${q}%`).limit(5),
    supabase.from('babies').select('id,baby_id,color,gender,health,stage').eq('user_id',user.id).ilike('baby_id',`%${q}%`).limit(5),
    supabase.from('rams').select('id,ram_id,name,color,dead').eq('user_id',user.id).ilike('ram_id',`%${q}%`).limit(5),
    supabase.from('deaths').select('id,animal_id,color,category,death_date').eq('user_id',user.id).ilike('animal_id',`%${q}%`).limit(5),
    supabase.from('vet_isolation').select('id,animal_id,status,active').eq('user_id',user.id).ilike('animal_id',`%${q}%`).limit(5),
  ])
  return NextResponse.json({ data: { births:a.data||[], babies:b.data||[], rams:c.data||[], deaths:d.data||[], vet:(e.data||[]).map((v:any)=>({...v,disease:v.status})) } })
}
