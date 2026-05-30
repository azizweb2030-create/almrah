import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// helper: استنتاج plan من duration_months
function getPlan(duration_months: number | null, amount: number): string {
  if (!duration_months) return amount > 0 ? 'lifetime' : 'trial'
  if (duration_months === 1) return 'monthly'
  return 'trial'
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // أضف plan field مستنتجاً
  const enriched = (data||[]).map(s => ({
    ...s,
    plan: getPlan(s.duration_months, s.amount)
  }))
  return NextResponse.json({ data: enriched })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { plan } = await req.json()
  const isLifetime = plan === 'lifetime'
  const durationMonths = isLifetime ? null : 1
  const amount = isLifetime ? 299 : plan === 'monthly' ? 49 : 0
  const expiresAt = isLifetime ? null
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      status: 'pending',
      amount,
      duration_months: durationMonths,
      expires_at: expiresAt,
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: { ...data, plan } }, { status: 201 })
}
