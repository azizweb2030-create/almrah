import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { data } = await supabase.from('subscriptions').select('*').eq('user_id',user.id).order('created_at',{ascending:false})
  return NextResponse.json({ data: data||[] })
}
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { plan } = await req.json()
  const expiresAt = plan==='monthly'?new Date(Date.now()+30*24*60*60*1000).toISOString():plan==='lifetime'?null:new Date(Date.now()+7*24*60*60*1000).toISOString()
  const { data, error } = await supabase.from('subscriptions').insert({
    user_id: user.id, plan, status:'pending',
    amount: plan==='monthly'?49:plan==='lifetime'?299:0,
    currency:'SAR', starts_at: new Date().toISOString(), expires_at: expiresAt
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
