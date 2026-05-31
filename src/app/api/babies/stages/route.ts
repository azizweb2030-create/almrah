import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  // تحديث المراحل
  await supabase.rpc('update_baby_stages')
  // تحقق من تلقيح الرخال
  await supabase.rpc('check_breed_ask_notifications')

  return NextResponse.json({ success: true })
}
