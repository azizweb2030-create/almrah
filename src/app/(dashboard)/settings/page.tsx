'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [form, setForm] = useState({ full_name: '', farm_name: '', phone: '', telegram_chat_id: '' })
  const [userId, setUserId] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ new: '', confirm: '' })

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      createClient().from('profiles').select('full_name,farm_name,phone,telegram_chat_id')
        .eq('id', user.id).single()
        .then(({ data }) => {
          if (data) setForm({
            full_name: data.full_name || '',
            farm_name: data.farm_name || '',
            phone: data.phone || '',
            telegram_chat_id: data.telegram_chat_id || '',
          })
        })
    })
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { error } = await createClient().from('profiles').update(form).eq('id', userId)
    setSaving(false)
    if (error) toast.error('فشل الحفظ: ' + error.message)
    else toast.success('✅ تم حفظ البيانات')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.new !== pwForm.confirm) { toast.error('كلمة المرور غير متطابقة'); return }
    if (pwForm.new.length < 6) { toast.error('كلمة المرور قصيرة جداً'); return }
    const { error } = await createClient().auth.updateUser({ password: pwForm.new })
    if (error) toast.error('فشل: ' + error.message)
    else { toast.success('✅ تم تغيير كلمة المرور'); setPwForm({ new: '', confirm: '' }) }
  }

  async function logout() {
    await createClient().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="page-title">⚙️ الإعدادات</h1>
      <form onSubmit={saveProfile} className="card space-y-4">
        <h2 className="font-bold">بيانات الحساب</h2>
        {[
          { k: 'full_name', l: 'الاسم الكامل', p: 'اسمك الكريم' },
          { k: 'farm_name', l: 'اسم المراح', p: 'مراح الخير' },
          { k: 'phone', l: 'رقم الجوال', p: '05xxxxxxxx' },
          { k: 'telegram_chat_id', l: 'معرف تيليغرام', p: '123456789' },
        ].map(f => (
          <div key={f.k}>
            <label className="label">{f.l}</label>
            <input className="input" placeholder={f.p} value={(form as any)[f.k]}
              onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} />
          </div>
        ))}
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? 'جاري الحفظ...' : '💾 حفظ البيانات'}
        </button>
      </form>

      <form onSubmit={changePassword} className="card space-y-4">
        <h2 className="font-bold">🔐 تغيير كلمة المرور</h2>
        <div>
          <label className="label">كلمة المرور الجديدة</label>
          <input type="password" className="input" placeholder="••••••••" value={pwForm.new}
            onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))} />
        </div>
        <div>
          <label className="label">تأكيد كلمة المرور</label>
          <input type="password" className="input" placeholder="••••••••" value={pwForm.confirm}
            onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
        </div>
        <button type="submit" className="btn-primary w-full">تغيير كلمة المرور</button>
      </form>

      <div className="card">
        <button onClick={logout} className="w-full text-red-500 text-sm py-2 hover:text-red-700 transition-colors">
          🚪 تسجيل الخروج
        </button>
      </div>
    </div>
  )
}
