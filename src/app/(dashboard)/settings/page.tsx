'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [form, setForm] = useState({full_name:'',farm_name:'',phone:'',telegram_chat_id:''})
  const [userId, setUserId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); createClient().from('profiles').select('*').eq('id',user.id).single().then(({data}) => { if(data) setForm({full_name:data.full_name||'',farm_name:data.farm_name||'',phone:data.phone||'',telegram_chat_id:data.telegram_chat_id||''}) }) }
    })
  }, [])

  async function save(e:React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await createClient().from('profiles').update(form).eq('id',userId)
    toast.success('تم الحفظ'); setSaving(false)
  }

  async function logout() {
    await createClient().auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="page-title">⚙️ الإعدادات</h1>
      <form onSubmit={save} className="card space-y-4">
        <h2 className="font-bold">بيانات الحساب</h2>
        {[{k:'full_name',l:'الاسم الكامل'},{k:'farm_name',l:'اسم المراح'},{k:'phone',l:'رقم الجوال'},{k:'telegram_chat_id',l:'معرف تيليغرام'}].map(f=>(
          <div key={f.k}><label className="label">{f.l}</label><input className="input" value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}/></div>
        ))}
        <button type="submit" className="btn-primary w-full" disabled={saving}>{saving?'جاري...':'💾 حفظ'}</button>
      </form>
      <div className="card">
        <button onClick={logout} className="w-full text-red-500 text-sm py-2 hover:text-red-700">🚪 تسجيل الخروج</button>
      </div>
    </div>
  )
}
