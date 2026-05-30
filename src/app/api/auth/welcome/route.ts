import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email || !process.env.RESEND_API_KEY) return NextResponse.json({ sent: false })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'noreply@almrah.sa',
        to: email,
        subject: '🐑 مرحباً في المراح - تم إنشاء حسابك',
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
            <div style="background:#1e5a10;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
              <h1 style="color:#c9a84c;margin:0;font-size:28px">🐑 المراح</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">منصة إدارة المواشي</p>
            </div>
            <h2 style="color:#1e5a10">مرحباً ${name || 'بك'}!</h2>
            <p>تم إنشاء حسابك في منصة المراح بنجاح.</p>
            <p>لديك <strong>7 أيام تجريبية مجانية</strong> للاستمتاع بجميع الميزات.</p>
            <div style="background:#f8f4ee;border-radius:12px;padding:16px;margin:20px 0">
              <p style="margin:0;font-weight:bold;color:#1e5a10">ابدأ بـ:</p>
              <ul style="color:#555;margin:8px 0">
                <li>تسجيل بيانات قطيعك</li>
                <li>إضافة أول ولادة</li>
                <li>إعداد إشعارات تيليغرام</li>
              </ul>
            </div>
            <div style="text-align:center;margin-top:24px">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                style="background:#1e5a10;color:white;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:bold">
                ابدأ الآن
              </a>
            </div>
            <p style="color:#aaa;font-size:12px;text-align:center;margin-top:24px">المراح - منصة إدارة المواشي</p>
          </div>
        `
      })
    })
    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json({ sent: false })
  }
}
