'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications').then(r=>r.json()).then(j=>{setNotifs(j.data||[]);setLoading(false)})
  }, [])

  async function dismissAll() {
    await fetch('/api/notifications',{method:'PATCH'})
    setNotifs(p=>p.map(n=>({...n,dismissed:true}))); toast.success('تم تعليم الكل')
  }

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-16"/>)}</div>

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">🔔 الإشعارات</h1>
        {notifs.some(n=>!n.dismissed) && <button onClick={dismissAll} className="btn-secondary text-sm px-3 py-1.5">✓ قراءة الكل</button>}
      </div>
      {notifs.length===0 ? (
        <div className="card text-center py-16"><div className="text-5xl mb-3">🔔</div><p className="text-gray-500">لا توجد إشعارات</p></div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n:any) => (
            <div key={n.id} className={`card flex gap-3 ${!n.dismissed?'border-green-primary/30 bg-green-subtle/20':''}`}>
              <div className="flex-1">
                <p className={`text-sm font-medium ${!n.dismissed?'text-green-primary':''}`}>{n.msg || n.key}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString('ar-SA')}</p>
              </div>
              {!n.dismissed && <span className="w-2 h-2 bg-green-primary rounded-full mt-1.5 flex-shrink-0"/>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
