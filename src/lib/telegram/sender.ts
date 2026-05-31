// Telegram Sender — يرسل مباشرة لـ Telegram API أو عبر Cloudflare Worker
// يدعم كلا الطريقتين تلقائياً حسب الـ env vars المتوفرة

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_WORKER   = process.env.TELEGRAM_WORKER_URL || 'https://almrah-telegram.azizweb2030.workers.dev'

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  if (!chatId) return false
  
  // الطريقة 1: مباشرة عبر Telegram Bot API (أفضل)
  if (TELEGRAM_BOT_TOKEN) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
        signal: AbortSignal.timeout(8000)
      })
      const data = await res.json() as { ok: boolean }
      if (data.ok) return true
    } catch { /* fallthrough */ }
  }
  
  // الطريقة 2: عبر Cloudflare Worker (fallback)
  try {
    const res = await fetch(TELEGRAM_WORKER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(5000)
    })
    return res.ok
  } catch {
    return false
  }
}

// الدالة الرئيسية: تحفظ في DB + ترسل Telegram
export async function notifyUser(
  supabase: any,
  userId: string,
  key: string,
  msg: string,
  type: string = 'نظام'
) {
  // حفظ في الإشعارات
  await supabase
    .from('notifications')
    .insert({ user_id: userId, key, msg, type, dismissed: false })
    .onConflict('user_id,key')
    .ignore()
    .catch(() => {})

  // إرسال Telegram
  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_chat_id, notifications_enabled')
    .eq('id', userId)
    .single()

  if (profile?.telegram_chat_id && profile?.notifications_enabled !== false) {
    await sendTelegramMessage(
      profile.telegram_chat_id,
      `🐑 <b>المراح</b>\n${msg}`
    )
  }
}

// Alias للتوافق مع الكود القديم
export const sendTelegramNotification = sendTelegramMessage
