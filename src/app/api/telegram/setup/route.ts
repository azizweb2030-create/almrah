import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// هذا الـ endpoint يُرسل رسالة تجريبية للمستخدم
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { chat_id } = await req.json()
  if (!chat_id) return NextResponse.json({ error: 'chat_id مطلوب' }, { status: 400 })

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  if (!BOT_TOKEN) return NextResponse.json({ error: 'Bot غير مكوّن — أضف TELEGRAM_BOT_TOKEN' }, { status: 503 })

  // إرسال رسالة تجريبية
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: '✅ <b>المراح</b>\n\nتم ربط حسابك بنجاح!\nستصلك إشعارات الولادات والنفوق والبيطرة هنا.',
        parse_mode: 'HTML'
      })
    })
    const data = await res.json() as { ok: boolean; description?: string }
    if (!data.ok) return NextResponse.json({ error: `Telegram: ${data.description}` }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'فشل الاتصال بـ Telegram' }, { status: 500 })
  }

  // حفظ chat_id في profile
  await supabase.from('profiles').update({ telegram_chat_id: chat_id }).eq('id', user.id)

  return NextResponse.json({ success: true })
}

// GET: استرجاع Bot username لعرضه في الـ settings
export async function GET() {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  if (!BOT_TOKEN) return NextResponse.json({ configured: false })

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
    const data = await res.json() as { ok: boolean; result?: { username: string; first_name: string } }
    if (data.ok && data.result) {
      return NextResponse.json({
        configured: true,
        username: data.result.username,
        name: data.result.first_name
      })
    }
  } catch {}
  return NextResponse.json({ configured: false })
}
