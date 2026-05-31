import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('ai_tokens_used, ai_tokens_limit, economy_mode')
    .eq('id', user.id).single()

  return NextResponse.json({ data })
}
