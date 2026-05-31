import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { message } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 })

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('user_id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    const { data: ticket } = await supabase
      .from('support_tickets').select('id, status').eq('id', params.id).single()

    if (!ticket) return NextResponse.json({ error: 'التذكرة غير موجودة' }, { status: 404 })
    if (ticket.status === 'مغلق') return NextResponse.json({ error: 'التذكرة مغلقة' }, { status: 400 })

    const { data, error } = await supabase
      .from('ticket_replies')
      .insert({
        ticket_id: params.id,
        user_id: user.id,
        message: message.trim(),
        is_admin: isAdmin,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
