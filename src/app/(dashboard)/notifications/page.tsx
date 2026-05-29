'use client'
import { useState, useEffect } from 'react'
import { formatArabicDate } from '@/lib/utils/dates'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([])

  useEffect(() => { fetch('/api/notifications').then(r=>r.json()).then(j=>setNotifs(j.data||[])) }, [])

  async function markAll() {
    await fetch('/api/notifications',{method:'PATCH'})
    setNotifs(p=>p.map(n=>({...n,is_read:true}))); toast.success('تم تعليم الكل')
  }

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">🔔 الإشعارات</h1>
        {notifs.some(n=>!n.is_read) && <button onClick={markAll} className="btn-secondary text-sm px-3 py-1.5">✓ كل</button>}
      </div>
      {notifs.length===0 ? <div className="card text-center py-16"><div className="text-5xl mb-3">🔔</div><p className="text-gray-500">لا توجد إشعارات</p></div> : (
        <div className="space-y-2">
          {notifs.map((n:any) => (
            <div key={n.id} className={`card flex gap-3 ${!n.is_read?'border-green-primary/30 bg-green-subtle/20':''}`}>
              <div className="flex-1">
                <p className={`text-sm font-medium ${!n.is_read?'text-green-primary':''}`}>{n.title}</p>
                <p className="text-xs text-gray-500">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatArabicDate(n.created_at)}</p>
              </div>
              {!n.is_read && <span className="w-2 h-2 bg-green-primary rounded-full mt-1 flex-shrink-0"/>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
