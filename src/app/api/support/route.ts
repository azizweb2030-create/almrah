import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, ticket_replies(id, message, is_admin, created_at, user_id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      data: (data || []).map(t => ({ ...t, replies: t.ticket_replies || [] }))
    })
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { title, body, category, priority } = await req.json()

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'العنوان والرسالة مطلوبان' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        title: title.trim(),
        body: body.trim(),
        category: category || 'استفسار',
        priority: priority || 'عادية',
        status: 'مفتوح',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: { ...data, replies: [] } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
