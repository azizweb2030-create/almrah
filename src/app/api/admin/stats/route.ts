import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('id',user.id).single()
  if (p?.role!=='admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  const [{ count: tu }, { count: au }, { count: ot }, { data: top }, { data: recent }] = await Promise.all([
    supabase.from('profiles').select('*',{count:'exact',head:true}),
    supabase.from('profiles').select('*',{count:'exact',head:true}).eq('subscription_status','active').neq('subscription_plan','trial'),
    supabase.from('support_tickets').select('*',{count:'exact',head:true}).eq('status','مفتوح'),
    supabase.from('profiles').select('full_name,email,ai_tokens_used').order('ai_tokens_used',{ascending:false}).limit(10),
    supabase.from('profiles').select('id,full_name,email,subscription_plan,subscription_status,created_at').order('created_at',{ascending:false}).limit(10),
  ])
  return NextResponse.json({ data: { totalUsers:tu||0, activeSubscriptions:au||0, openTickets:ot||0, totalTokensUsed:(top||[]).reduce((s:number,p:any)=>s+(p.ai_tokens_used||0),0), recentUsers:recent||[] } })
}
