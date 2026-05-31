import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `أنت مساعد منصة "المراح" الذكي لإدارة تربية الأغنام والمواشي.
مهمتك: إرشاد المستخدمين بالعربية فقط وشرح كيفية استخدام النظام.

أقسام النظام: الرئيسية، الولادات، شبك التلقيح (15 يوم بعد الولادة، حمل 150 يوم)،
النفوق (خصم تلقائي)، البيطرة (عزل ومتابعة)، التقارير (PDF)، البحث الموحد.

مراحل المواليد: بهم (0-3 شهر)، مفطوم (3-7 شهر للرخل)، جاهز للإنتاج (7+ شهر يُضاف للإجمالي)، جاهز للبيع (3+ شهر للخروف).

قواعد: عربية فقط، ردود مختصرة، لا معلومات تقنية.`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { message, messages } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 })

    // فحص التوكنات
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_tokens_used, ai_tokens_limit')
      .eq('user_id', user.id)
      .single()

    const tokensUsed = profile?.ai_tokens_used || 0
    const tokensLimit = profile?.ai_tokens_limit || 5000

    if (tokensUsed >= tokensLimit) {
      return NextResponse.json({ error: 'تجاوزت حد التوكنات المسموح به.' }, { status: 429 })
    }

    // بناء المحادثة — Anthropic تشترط أن تبدأ بـ user
    let history = ((messages || []) as { role: string; content: string }[])
      .filter(m => (m.role === 'user' || m.role === 'assistant') && String(m.content || '').trim())
      .map(m => ({ role: m.role as 'user' | 'assistant', content: String(m.content) }))

    // حذف الرسائل الأولى من نوع assistant
    while (history.length > 0 && history[0].role === 'assistant') {
      history = history.slice(1)
    }

    // آخر 10 رسائل فقط
    history = history.slice(-10)

    const finalMessages = [...history, { role: 'user' as const, content: message.trim() }]

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'مفتاح API غير موجود' }, { status: 500 })

    // ✅ موديل مضمون الصحة
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: finalMessages
      })
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      console.error('[AI] Error:', res.status, JSON.stringify(errBody))
      return NextResponse.json({
        error: `خطأ ${res.status}: ${(errBody as any)?.error?.message || 'حاول مرة أخرى'}`
      }, { status: 500 })
    }

    const d = await res.json()
    const text = d.content?.[0]?.text || 'لم أتمكن من توليد رد'
    const tokens = (d.usage?.input_tokens || 0) + (d.usage?.output_tokens || 0)

    if (tokens > 0 && profile) {
      await supabase.from('profiles')
        .update({ ai_tokens_used: tokensUsed + tokens })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ response: text, tokens })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ غير معروف'
    console.error('[AI] Catch:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
