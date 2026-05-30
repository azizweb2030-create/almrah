import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { plan } = await req.json()
  // subscriptions schema: id, user_id, status, amount, duration_months, payment_ref, created_at, activated_at, expires_at
  const durationMonths = plan === 'lifetime' ? null : plan === 'monthly' ? 1 : 0
  const expiresAt = plan === 'lifetime' ? null : plan === 'monthly'
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const amount = plan === 'monthly' ? 49 : plan === 'lifetime' ? 299 : 0

  const { data, error } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    status: 'pending',
    amount,
    duration_months: durationMonths,
    expires_at: expiresAt,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // إضافة plan كـ metadata في response بدون حفظ في DB
  return NextResponse.json({ data: { ...data, plan } }, { status: 201 })
}
