import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `أنت مساعد منصة "المراح" الذكي — منصة إدارة تربية الأغنام والمواشي.
مهمتك الوحيدة: إرشاد المستخدمين وشرح كيفية استخدام النظام بالعربية فقط.

أقسام النظام:
- الرئيسية: إحصائيات القطيع (إجمالي، منتجة، شبك التلقيح، بهم، رخال، خرفان، نفوق)
- تسجيل الولادات: إضافة سجل ولادة جديد مع بيانات الأم ومواليدها
- شبك التلقيح: الأم تُضاف بعد 15 يوم من الولادة، الحمل 150 يوم
- النفوق: يُخصم تلقائياً من الإجمالي
- البيطرة: العزل والمتابعة اليومية
- التقارير: رسوم بيانية وتصدير PDF
- البحث الموحد: أيقونة البحث في الأعلى

مراحل المواليد:
- البهم: 0-3 أشهر
- مفطومة: 3-7 أشهر (رخل فقط)
- جاهز للإنتاج: 7+ أشهر (يُضاف للإجمالي تلقائياً)
- جاهز للبيع: 3+ أشهر (خروف)

قواعد: تحدث بالعربية فقط، ردودك مختصرة وواضحة، لا تكشف معلومات تقنية.`

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
      return NextResponse.json({ error: 'تجاوزت حد التوكنات المسموح به.' }, { status: 429 })
    }

    // بناء تاريخ المحادثة — Anthropic تشترط: يبدأ بـ user، ولا رسالتان متتاليتان بنفس الدور
    const rawHistory: { role: 'user' | 'assistant'; content: string }[] = (messages || [])
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: String(m.content || '') }))
      .filter((m: { role: 'user' | 'assistant'; content: string }) => m.content.trim().length > 0)

    // إزالة الرسائل الأولى من نوع assistant (API لا تقبلها في البداية)
    let trimmedHistory = rawHistory
    while (trimmedHistory.length > 0 && trimmedHistory[0].role === 'assistant') {
      trimmedHistory = trimmedHistory.slice(1)
    }

    // الاحتفاظ بآخر 10 رسائل فقط لتوفير التوكنات
    trimmedHistory = trimmedHistory.slice(-10)

    // إضافة رسالة المستخدم الحالية
    const finalMessages = [...trimmedHistory, { role: 'user' as const, content: message.trim() }]

    const maxTokens = profile?.economy_mode ? 400 : 800

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
        system: SYSTEM_PROMPT,
        messages: finalMessages
      })
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      console.error('[AI/chat] Anthropic error:', res.status, JSON.stringify(errBody))
      return NextResponse.json({
        error: `فشل الاتصال بالمساعد (خطأ ${res.status})، حاول مرة أخرى`
      }, { status: 500 })
    }

    const d = await res.json()
    const text = d.content?.[0]?.text || 'لم أتمكن من توليد رد، حاول مرة أخرى'
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
