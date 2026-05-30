import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data, error } = await supabase
    .from('notifications')
    .select('id,key,msg,type,dismissed,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data || [] })
}

// تعليم الكل كمقروء
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  
  if (body.id) {
    // تعليم واحد
    await supabase.from('notifications').update({ dismissed: true }).eq('id', body.id).eq('user_id', user.id)
  } else {
    // تعليم الكل
    await supabase.from('notifications').update({ dismissed: true }).eq('user_id', user.id).eq('dismissed', false)
  }

  return NextResponse.json({ success: true })
}
