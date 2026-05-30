const TELEGRAM_WORKER = process.env.TELEGRAM_WORKER_URL || 'https://almrah-telegram.azizweb2030.workers.dev'

export async function sendTelegramNotification(chatId: string, message: string): Promise<boolean> {
  if (!chatId || !TELEGRAM_WORKER) return false
  try {
    const res = await fetch(TELEGRAM_WORKER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(5000)
    })
    return res.ok
  } catch {
    return false
  }
}

export async function notifyUser(supabase: any, userId: string, key: string, msg: string, type: string = 'نظام') {
  // حفظ في الـ DB
  await supabase.from('notifications').insert({ user_id: userId, key, msg, type, dismissed: false }).catch(() => {})
  
  // إرسال Telegram إذا كان chat_id موجوداً
  const { data: profile } = await supabase.from('profiles').select('telegram_chat_id').eq('id', userId).single()
  if (profile?.telegram_chat_id) {
    await sendTelegramNotification(profile.telegram_chat_id, `🐑 <b>المراح</b>\n${msg}`)
  }
}
