'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'
export default function AdminSettingsPage() {
  const [on, setOn] = useState(false)
  const [msg, setMsg] = useState('المنصة تحت الصيانة، سنعود قريباً.')
  useEffect(() => { fetch('/api/admin/maintenance').then(r=>r.json()).then(j=>setOn(j.enabled||false)) }, [])
  async function save() {
    await fetch('/api/admin/maintenance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled:on,message:msg})})
    toast.success(on?'تم تفعيل الصيانة':'تم إلغاء الصيانة')
  }
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900">⚙️ الإعدادات</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-bold">🔧 وضع الصيانة</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div><p className="font-medium">وضع الصيانة</p><p className="text-xs text-gray-500">يوجه الزوار لصفحة الصيانة</p></div>
          <button onClick={()=>setOn(e=>!e)} className={cn('w-14 h-7 rounded-full transition-colors relative', on?'bg-red-500':'bg-gray-300')}>
            <span className={cn('absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all', on?'right-1':'left-1')}/>
          </button>
        </div>
        {on && <div><label className="block text-sm mb-1">رسالة الصيانة</label><textarea className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 resize-none" rows={3} value={msg} onChange={e=>setMsg(e.target.value)}/></div>}
        <button onClick={save} className="w-full bg-gray-900 text-white rounded-xl py-3 font-bold text-sm">💾 حفظ</button>
      </div>
    </div>
  )
}
