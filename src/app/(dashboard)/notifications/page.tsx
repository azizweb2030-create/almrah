'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

const TYPE_ICONS: Record<string,string> = {
  'ولادة':'🐑','نفوق':'📋','بيطرة':'🩺','مرحلة':'📊','نظام':'🔔','اشتراك':'💳'
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications').then(r=>r.json()).then(j=>{
      setNotifs(j.data||[]);setLoading(false)
    })
  }, [])

  async function dismissAll() {
    await fetch('/api/notifications',{method:'PATCH'})
    setNotifs(p=>p.map(n=>({...n,dismissed:true})))
    toast.success('تم تعليم الكل كمقروء')
  }

  async function dismissOne(id:string) {
    // تحديث محلي فقط (الـ API يحدث الكل)
    setNotifs(p=>p.map(n=>n.id===id?{...n,dismissed:true}:n))
  }

  const unread = notifs.filter(n=>!n.dismissed)

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="skeleton h-16"/>)}</div>

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">🔔 الإشعارات</h1>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <span className="badge-red text-xs">{unread.length}</span>
          )}
          {unread.length > 0 && (
            <button onClick={dismissAll} className="btn-secondary text-sm px-3 py-1.5">✓ قراءة الكل</button>
          )}
        </div>
      </div>

      {notifs.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🔔</div>
          <p className="text-gray-500">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n:any) => {
            const icon = TYPE_ICONS[n.type] || '🔔'
            return (
              <div key={n.id}
                className={cn('card flex items-start gap-3 transition-all', !n.dismissed?'border-green-primary/30 bg-green-subtle/10':'opacity-70')}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg', !n.dismissed?'bg-green-subtle':'bg-beige-dark')}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !n.dismissed?'font-medium text-gray-900':'text-gray-500')}>
                    {n.msg || n.key}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {n.type && <span className="text-xs text-gray-400">{n.type}</span>}
                    <span className="text-xs text-gray-400">
                      {new Date(n.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
                {!n.dismissed && (
                  <div className="w-2 h-2 bg-green-primary rounded-full flex-shrink-0 mt-1.5"/>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
