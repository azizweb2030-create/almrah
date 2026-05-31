'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const G = '#1e5a10', BEIGE = '#f8f4ee', BDR = '#d8cfc3'

const TYPE_CONFIG: Record<string,{icon:string,bg:string,color:string}> = {
  'ولادة':   {icon:'🐑',bg:'#dcfce7',color:'#15803d'},
  'نفوق':    {icon:'💀',bg:'#fef2f2',color:'#dc2626'},
  'بيطرة':   {icon:'🩺',bg:'#eff6ff',color:'#1d4ed8'},
  'مرحلة':   {icon:'📊',bg:'#f5f3ff',color:'#7c3aed'},
  'نظام':    {icon:'🔔',bg:'#fffbeb',color:'#d97706'},
  'اشتراك':  {icon:'💳',bg:'#fdf4ff',color:'#9333ea'},
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'unread'>('all')

  useEffect(() => {
    fetch('/api/notifications').then(r=>r.json()).then(j=>{setNotifs(j.data||[]);setLoading(false)})
  }, [])

  async function dismiss(id: string) {
    await fetch(`/api/notifications/${id}`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({dismissed:true})})
    setNotifs(p => p.map(n => n.id===id ? {...n,dismissed:true} : n))
  }

  async function dismissAll() {
    const unread = notifs.filter(n=>!n.dismissed)
    await Promise.all(unread.map(n => fetch(`/api/notifications/${n.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({dismissed:true})})))
    setNotifs(p => p.map(n => ({...n,dismissed:true})))
    toast.success('تم تعيين الكل كمقروء')
  }

  const filtered = filter==='unread' ? notifs.filter(n=>!n.dismissed) : notifs
  const unreadCount = notifs.filter(n=>!n.dismissed).length

  const card: React.CSSProperties = {background:'white',borderRadius:18,border:`1px solid ${BDR}`,padding:14,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{height:32,width:160,borderRadius:10,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>
      {[...Array(5)].map((_,i)=><div key={i} style={{height:72,borderRadius:18,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>التنبيهات</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>
            {unreadCount > 0 ? `${unreadCount} غير مقروء` : 'كل شيء مقروء ✓'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={dismissAll} style={{background:BEIGE,border:`1px solid ${BDR}`,borderRadius:12,padding:'8px 14px',fontFamily:'inherit',fontSize:13,fontWeight:700,color:'#374151',cursor:'pointer'}}>
            ✓ تعيين الكل
          </button>
        )}
      </div>

      {/* فلتر */}
      <div style={{display:'flex',gap:8,background:'#ede7db',padding:4,borderRadius:16}}>
        {[{k:'all',l:`الكل (${notifs.length})`},{k:'unread',l:`غير مقروء (${unreadCount})`}].map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k as any)}
            style={{flex:1,padding:'8px',borderRadius:12,border:'none',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',
              background:filter===f.k?'white':'transparent',color:filter===f.k?G:'#6b7280',
              boxShadow:filter===f.k?'0 1px 4px rgba(0,0,0,0.08)':'none'}}>
            {f.l}
          </button>
        ))}
      </div>

      {/* القائمة */}
      {filtered.length===0 ? (
        <div style={{...card,textAlign:'center',padding:'48px 20px'}}>
          <p style={{fontSize:40,margin:'0 0 12px'}}>🔔</p>
          <p style={{fontWeight:700,color:'#374151',margin:'0 0 4px'}}>لا تنبيهات</p>
          <p style={{fontSize:13,color:'#9ca3af',margin:0}}>ستظهر التنبيهات هنا</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map((n:any) => {
            const cfg = TYPE_CONFIG[n.type] || {icon:'🔔',bg:'#f3f4f6',color:'#6b7280'}
            return (
              <div key={n.id} style={{...card,display:'flex',alignItems:'flex-start',gap:12,opacity:n.dismissed?0.55:1,borderColor:n.dismissed?BDR:'#d1fae5'}}>
                <div style={{width:40,height:40,borderRadius:11,background:cfg.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                  {cfg.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                    <span style={{background:cfg.bg,color:cfg.color,padding:'1px 7px',borderRadius:100,fontSize:10,fontWeight:700}}>{n.type}</span>
                    {!n.dismissed && <span style={{width:7,height:7,borderRadius:'50%',background:'#3b82f6',display:'inline-block'}}/>}
                  </div>
                  <p style={{margin:0,fontSize:13,fontWeight:600,color:'#111827',lineHeight:1.4}}>{n.message}</p>
                  <p style={{margin:'4px 0 0',fontSize:11,color:'#9ca3af'}}>{n.created_at?.split('T')[0]}</p>
                </div>
                {!n.dismissed && (
                  <button onClick={()=>dismiss(n.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:16,padding:4,flexShrink:0}}>✓</button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
