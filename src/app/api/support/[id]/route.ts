import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('user_id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    let query = supabase
      .from('support_tickets')
      .select('*, ticket_replies(id, message, is_admin, created_at, user_id)')
      .eq('id', params.id)

    if (!isAdmin) query = query.eq('user_id', user.id)

    const { data, error } = await query.single()
    if (error || !data) return NextResponse.json({ error: 'التذكرة غير موجودة' }, { status: 404 })

    return NextResponse.json({
      data: { ...data, replies: data.ticket_replies || [] }
    })
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
