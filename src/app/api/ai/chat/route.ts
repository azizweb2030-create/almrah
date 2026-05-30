import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في إدارة المواشي والأغنام لمنصة "المراح".
قواعد:
- أجب بالعربية فقط
- ردود مختصرة ومفيدة (3-5 جمل كحد أقصى إلا إذا طُلب تفصيل)
- استخدم المعطيات المُقدَّمة من القطيع عند الإجابة
- تخصصك: تربية الأغنام، التلقيح، الولادة، الأمراض، التغذية، الإدارة`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { message, messages } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 })

  // فحص الحد
  const { data: profile } = await supabase
    .from('profiles').select('ai_tokens_used,ai_tokens_limit,economy_mode')
    .eq('id', user.id).single()

  if ((profile?.ai_tokens_used || 0) >= (profile?.ai_tokens_limit || 5000)) {
    return NextResponse.json({ error: 'تجاوزت حد التوكنات المسموح به لخطتك' }, { status: 429 })
  }

  // جلب بيانات القطيع للـ context
  const { data: flock } = await supabase.from('flock_data').select('total_sheep').eq('user_id', user.id).single()
  const { count: birthsCount } = await supabase.from('birth_records').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: vetCount } = await supabase.from('vet_isolation').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('active', true)

  const flockContext = flock ? `\nبيانات المزرعة الحالية: القطيع ${flock.total_sheep || 0} رأس، ${birthsCount || 0} سجل ولادة، ${vetCount || 0} حالة بيطرية نشطة.` : ''

  // الاحتفاظ بآخر 6 رسائل فقط لتوفير التوكنات
  const recentMessages = (messages || []).slice(-6).map((m: any) => ({
    role: m.role,
    content: m.content
  }))

  const maxTokens = profile?.economy_mode ? 400 : 800

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT + flockContext,
      messages: [...recentMessages, { role: 'user', content: message }]
    })
  })

  if (!res.ok) return NextResponse.json({ error: 'فشل المساعد، حاول مرة أخرى' }, { status: 500 })

  const d = await res.json()
  const text = d.content?.[0]?.text || ''
  const tokens = (d.usage?.input_tokens || 0) + (d.usage?.output_tokens || 0)

  if (tokens > 0) {
    await supabase.from('profiles').update({
      ai_tokens_used: (profile?.ai_tokens_used || 0) + tokens
    }).eq('id', user.id)
  }

  return NextResponse.json({ response: text, tokens })
}
