'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handle(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-beige-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-primary rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">🐑</div>
          <h1 className="text-2xl font-black text-green-primary">المراح</h1>
        </div>
        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <p className="font-bold text-green-primary">تم إرسال رابط الاستعادة</p>
              <p className="text-sm text-gray-500 mt-2">تحقق من بريدك الإلكتروني</p>
              <Link href="/login" className="btn-primary inline-block mt-4 text-sm px-6">العودة للدخول</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">استعادة كلمة المرور</h2>
              <form onSubmit={handle} className="space-y-4">
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <input type="email" className="input" dir="ltr" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? '⏳ جاري...' : 'إرسال رابط الاستعادة'}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center mt-4">
          <Link href="/login" className="text-sm text-green-primary">← العودة لتسجيل الدخول</Link>
        </p>
      </div>
    </div>
  )
}
