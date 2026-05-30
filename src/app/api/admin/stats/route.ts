import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (p?.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const [{ count: totalUsers }, { count: openTickets }, { data: recentUsers }, { data: topTokens }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'مفتوح'),
    supabase.from('profiles').select('id,full_name,email,role,subscription_plan,subscription_status,created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('full_name,email,ai_tokens_used').order('ai_tokens_used', { ascending: false }).limit(10),
  ])

  const { count: activeSubscriptions } = await supabase.from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')
    .neq('subscription_plan', 'trial')

  return NextResponse.json({
    data: {
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      openTickets: openTickets || 0,
      totalTokensUsed: (topTokens || []).reduce((s: number, p: any) => s + (p.ai_tokens_used || 0), 0),
      recentUsers: recentUsers || [],
    }
  })
}
