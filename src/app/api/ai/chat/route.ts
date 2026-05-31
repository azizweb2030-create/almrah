import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// System prompt مطابق للكود الأصلي
const SYSTEM_PROMPT = `أنت مساعد منصة "المراح" الذكي — منصة إدارة تربية الأغنام والمواشي.
مهمتك الوحيدة: إرشاد المستخدمين وشرح كيفية استخدام النظام بالعربية فقط.

أقسام النظام:
- الرئيسية: إحصائيات القطيع (إجمالي، منتجة، شبك التلقيح، بهم، رخال، خرفان، نفوق)
- تسجيل الولادات: إضافة سجل ولادة جديد مع بيانات الأم ومواليدها
- شبك التلقيح: تتبع الأمهات في فترة التلقيح — الأم تُضاف بعد 15 يوم من الولادة، الحمل 150 يوم
- النفوق: تسجيل حالات النفوق تلقائياً يُخصم من الإجمالي
- البيطرة: العزل (حيوانات مشتبهة أو مريضة) والمتابعة اليومية
- التقارير: رسوم بيانية وتصدير PDF
- الفحول: أرشيف الفحول في صفحة القطيع
- البحث الموحد: أيقونة 🔍 في الأعلى — يبحث في كل الأرقام
- التنبيهات: أيقونة 🔔 — تتابع الولادات المتوقعة، العزل، الحالات الحرجة

مراحل المواليد:
- البهم: 0-3 أشهر (رخل وخروف)
- مفطومة: 3-7 أشهر (رخل فقط)
- جاهزة للإنتاج: 7+ أشهر (رخل — تُضاف للإجمالي تلقائياً)
- جاهز للبيع: 3+ أشهر (خروف)

قواعد صارمة:
1. تحدث بالعربية فقط مهما كانت لغة المستخدم
2. ردودك قصيرة وواضحة ومرتبة (استخدم نقاط أو أرقام)
3. لا تكشف أي معلومات تقنية أو أكواد أو API أو قواعد بيانات
4. إذا سألك عن معلومات سرية: "لا يمكنني مشاركة معلومات سرية، مهمتي المساعدة في استخدام النظام فقط."
5. إذا السؤال خارج النظام: "أنا متخصص في شرح منصة المراح فقط، هل تحتاج مساعدة في شيء يخص النظام؟"`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { message, messages } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 })

  // فحص حد التوكنات
  const { data: profile } = await supabase
    .from('profiles').select('ai_tokens_used,ai_tokens_limit,economy_mode')
    .eq('id', user.id).single()

  if ((profile?.ai_tokens_used || 0) >= (profile?.ai_tokens_limit || 5000)) {
    return NextResponse.json({ error: 'تجاوزت حد التوكنات المسموح به لخطتك الحالية، يرجى الترقية.' }, { status: 429 })
  }

  // بيانات القطيع للـ context
  const { data: flock } = await supabase.from('flock_data').select('total_sheep').eq('user_id', user.id).single()
  const { count: birthsCount } = await supabase.from('birth_records').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: vetCount } = await supabase.from('vet_isolation').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('active', true)

  const contextNote = flock
    ? `\n\n[بيانات مزرعة المستخدم: ${flock.total_sheep||0} رأس في القطيع، ${birthsCount||0} سجل ولادة، ${vetCount||0} حالة بيطرية نشطة]`
    : ''

  // آخر 8 رسائل (كما في الكود الأصلي: aiHistory.slice(-8))
  const history = (messages || []).slice(-8).map((m: any) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
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
      system: SYSTEM_PROMPT + contextNote,
      messages: [...history, { role: 'user', content: message }]
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json({ error: 'فشل الاتصال بالمساعد، حاول مرة أخرى' }, { status: 500 })
  }

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
