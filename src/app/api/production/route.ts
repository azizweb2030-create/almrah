import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const q = new URL(req.url).searchParams.get('q')?.trim() || ''

  const { data: records, error } = await supabase
    .from('birth_records').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (records||[]).map(r=>r.id)
  let babiesMap: Record<string,any[]> = {}
  if (ids.length > 0) {
    const { data: allBabies } = await supabase.from('babies').select('*').in('record_id', ids)
    ;(allBabies||[]).forEach(b=>{
      if (!babiesMap[b.record_id]) babiesMap[b.record_id]=[]
      babiesMap[b.record_id].push(b)
    })
  }

  const enriched = (records||[]).map(r => ({ ...r, babies: babiesMap[r.id]||[] }))

  // فلتر بالرقم إذا وجد
  const filtered = q ? enriched.filter(r => r.mom_id === q) : enriched

  // تجميع بالأم
  const momMap: Record<string, { mom_id:string, mom_color:string, recs:any[] }> = {}
  filtered.forEach(r => {
    const k = `${r.mom_id}_${r.mom_color}`
    if (!momMap[k]) momMap[k] = { mom_id: r.mom_id, mom_color: r.mom_color, recs: [] }
    momMap[k].recs.push(r)
  })

  const moms = Object.values(momMap).map(m => {
    const sorted = [...m.recs].sort((a,b) => new Date(b.birth_date).getTime() - new Date(a.birth_date).getTime())
    const lastRec = sorted[0]
    const totalAlive = m.recs.reduce((s,r) => s+(r.babies||[]).filter((b:any)=>b.health!=='نفوق').length, 0)
    const months = lastRec ? (Date.now()-new Date(lastRec.birth_date).getTime())/(1000*60*60*24*30.44) : 0
    return {
      ...m,
      totalBirths: m.recs.length,
      totalAlive,
      lastBirthDate: lastRec?.birth_date,
      lastInBreeding: lastRec?.in_breeding,
      status: months < 3 ? 'منتجة حالياً' : 'متاحة للتلقيح'
    }
  }).sort((a,b) => new Date(b.lastBirthDate||'').getTime() - new Date(a.lastBirthDate||'').getTime())

  return NextResponse.json({ data: moms })
}
