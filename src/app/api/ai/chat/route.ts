import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `أنت مساعد منصة "المراح" الذكي — منصة إدارة تربية الأغنام والمواشي.
مهمتك الوحيدة: إرشاد المستخدمين وشرح كيفية استخدام النظام بالعربية فقط.

أقسام النظام:
- الرئيسية: إحصائيات القطيع (إجمالي، منتجة، شبك التلقيح، بهم، رخال، خرفان، نفوق)
- تسجيل الولادات: إضافة سجل ولادة جديد مع بيانات الأم ومواليدها
- شبك التلقيح: تتبع الأمهات في فترة التلقيح — الأم تُضاف بعد 15 يوم من الولادة، الحمل 150 يوم
- النفوق: تسجيل حالات النفوق تلقائياً يُخصم من الإجمالي
- البيطرة: العزل والمتابعة اليومية
- التقارير: رسوم بيانية وتصدير PDF
- الفحول: أرشيف الفحول في صفحة القطيع
- البحث الموحد: أيقونة 🔍 في الأعلى
- التنبيهات: أيقونة 🔔

مراحل المواليد:
- البهم: 0-3 أشهر (رخل وخروف)
- مفطومة: 3-7 أشهر (رخل فقط)
- جاهزة للإنتاج: 7+ أشهر (رخل — تُضاف للإجمالي تلقائياً)
- جاهز للبيع: 3+ أشهر (خروف)

قواعد صارمة:
1. تحدث بالعربية فقط
2. ردودك قصيرة وواضحة (نقاط أو أرقام)
3. لا تكشف معلومات تقنية أو أكواد
4. إذا السؤال خارج النظام: "أنا متخصص في شرح منصة المراح فقط"`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { message, messages } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 })

    // فحص حد التوكنات
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_tokens_used, ai_tokens_limit, economy_mode')
      .eq('user_id', user.id)
      .single()

    const tokensUsed = profile?.ai_tokens_used || 0
    const tokensLimit = profile?.ai_tokens_limit || 5000

    if (tokensUsed >= tokensLimit) {
      return NextResponse.json({
        error: 'تجاوزت حد التوكنات المسموح به، يرجى الترقية.'
      }, { status: 429 })
    }

    // بيانات القطيع للـ context
    const { data: flock } = await supabase
      .from('flock_data').select('total_sheep').eq('user_id', user.id).single()
    const { count: birthsCount } = await supabase
      .from('birth_records').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const { count: vetCount } = await supabase
      .from('vet_isolation').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('active', true)

    const contextNote = flock
      ? `\n\n[بيانات المزرعة: ${flock.total_sheep||0} رأس، ${birthsCount||0} ولادة، ${vetCount||0} حالة بيطرية]`
      : ''

    const history = (messages || []).slice(-8).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content)
    }))

    const maxTokens = profile?.economy_mode ? 400 : 800

    // ✅ اسم الموديل الصحيح
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'مفتاح API غير مُهيَّأ' }, { status: 500 })
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT + contextNote,
        messages: [...history, { role: 'user', content: message.trim() }]
      })
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      console.error('[AI/chat] Anthropic error:', res.status, errBody)
      return NextResponse.json({
        error: `فشل الاتصال بالمساعد (خطأ ${res.status})، حاول مرة أخرى`
      }, { status: 500 })
    }

    const d = await res.json()
    const text = d.content?.[0]?.text || ''
    const tokens = (d.usage?.input_tokens || 0) + (d.usage?.output_tokens || 0)

    if (tokens > 0) {
      await supabase.from('profiles').update({
        ai_tokens_used: tokensUsed + tokens
      }).eq('user_id', user.id)
    }

    return NextResponse.json({ response: text, tokens })
  } catch (err) {
    console.error('[AI/chat] Unexpected error:', err)
    return NextResponse.json({ error: 'حدث خطأ غير متوقع، حاول مرة أخرى' }, { status: 500 })
  }
}
