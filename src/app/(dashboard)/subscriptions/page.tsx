'use client'
import { useState, useEffect } from 'react'
import { formatArabicDate } from '@/lib/utils/dates'
import { formatCurrency } from '@/lib/utils/format'
import toast from 'react-hot-toast'

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [subscribing, setSubscribing] = useState('')

  useEffect(() => { fetch('/api/subscriptions').then(r=>r.json()).then(j=>setSubs(j.data||[])) }, [])

  async function subscribe(plan:string) {
    setSubscribing(plan)
    const res = await fetch('/api/subscriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan})})
    const j = await res.json()
    if (j.error) { toast.error(j.error); setSubscribing(''); return }
    setSubs(p=>[j.data,...p]); toast.success('تم إرسال طلب الاشتراك'); setSubscribing('')
  }

  const active = subs.find(s=>s.status==='active')
  const PLAN_AR: Record<string,string> = {monthly:'شهري',lifetime:'دائم',trial:'تجريبي'}

  return (
    <div className="space-y-6">
      <h1 className="page-title">💳 الاشتراك</h1>
      {active ? (
        <div className="bg-green-subtle border border-green-primary/30 rounded-2xl p-4">
          <p className="font-black text-green-primary text-lg">✅ اشتراك نشط</p>
          <p className="text-sm text-gray-600 mt-1">خطة {PLAN_AR[active.plan]||active.plan}</p>
          {active.expires_at && <p className="text-sm text-gray-500 mt-1">ينتهي في {formatArabicDate(active.expires_at)}</p>}
          {!active.expires_at && <p className="text-sm text-green-primary mt-1">♾️ دائم</p>}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="font-bold text-amber-700">⚠️ لا يوجد اشتراك نشط</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {[{key:'monthly',label:'الشهرية',price:49,period:'شهر',features:['جميع الميزات','30,000 توكن AI']},
          {key:'lifetime',label:'الدائمة',price:299,period:'مرة',features:['جميع الميزات','100,000 توكن AI','تحديثات مجانية']}].map(plan=>(
          <div key={plan.key} className="card space-y-4">
            <div>
              <p className="font-black text-lg">{plan.label}</p>
              <p className="text-2xl font-black text-green-primary">{formatCurrency(plan.price)} <span className="text-sm text-gray-500 font-normal">/ {plan.period}</span></p>
            </div>
            <ul className="space-y-1">{plan.features.map(f=><li key={f} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-primary">✓</span>{f}</li>)}</ul>
            <button onClick={()=>subscribe(plan.key)} disabled={!!subscribing||active?.plan===plan.key}
              className={`w-full py-2.5 rounded-xl font-bold text-sm ${active?.plan===plan.key?'bg-green-subtle text-green-primary':'btn-primary'}`}>
              {subscribing===plan.key?'⏳...' : active?.plan===plan.key?'✅ مفعّل':'اشتراك الآن'}
            </button>
          </div>
        ))}
      </div>
      {subs.length>0 && (
        <div className="card">
          <h2 className="font-bold mb-3">سجل الاشتراكات</h2>
          {subs.map((s:any)=>(
            <div key={s.id} className="flex items-center justify-between p-3 bg-beige-primary rounded-xl mb-2">
              <div><p className="font-medium text-sm">{PLAN_AR[s.plan]} — {formatCurrency(s.amount)}</p><p className="text-xs text-gray-400">{formatArabicDate(s.created_at)}</p></div>
              <span className="badge-gray text-xs">{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
