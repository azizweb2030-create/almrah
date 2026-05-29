import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { message, messages } = await req.json()
  const { data: profile } = await supabase.from('profiles').select('ai_tokens_used,ai_tokens_limit').eq('id',user.id).single()
  if ((profile?.ai_tokens_used||0) >= (profile?.ai_tokens_limit||5000)) return NextResponse.json({ error: 'تجاوزت حد التوكنات' }, { status: 429 })
  const context = [...(messages||[]).slice(-8), { role:'user', content: message }]
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY!,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:800, system:'أنت مساعد منصة المراح لإدارة المواشي. أجب بالعربية فقط. ردودك مختصرة ومفيدة.', messages:context })
  })
  if (!res.ok) return NextResponse.json({ error: 'خطأ في المساعد' }, { status: 500 })
  const d = await res.json()
  const text = d.content?.[0]?.text||''
  const tokens = (d.usage?.input_tokens||0)+(d.usage?.output_tokens||0)
  if (tokens > 0) await supabase.from('profiles').update({ ai_tokens_used: (profile?.ai_tokens_used||0)+tokens }).eq('id',user.id)
  return NextResponse.json({ response: text, tokens })
}
