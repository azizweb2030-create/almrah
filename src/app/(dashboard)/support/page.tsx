'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const G = '#1e5a10', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'

const STATUS_CONFIG: Record<string,{label:string,bg:string,color:string}> = {
  'مفتوح':       {label:'مفتوح',       bg:'#dcfce7', color:'#15803d'},
  'قيد_المعالجة':{label:'قيد المعالجة',bg:'#fffbeb', color:'#d97706'},
  'محلول':       {label:'محلول',       bg:'#f0fdf4', color:'#16a34a'},
  'مغلق':        {label:'مغلق',        bg:'#f3f4f6', color:'#6b7280'},
}
const PRIORITIES = ['عادية','متوسطة','عالية','عاجلة']
const CATEGORIES = ['مشكلة تقنية','اقتراح','استفسار','شكوى','أخرى']

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title:'', body:'', category:'استفسار', priority:'عادية' })
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [reply, setReply] = useState('')
  const [replying, setReplying] = useState(false)

  useEffect(() => {
    fetch('/api/support').then(r=>r.json()).then(j=>{setTickets(j.data||[]);setLoading(false)})
  }, [])

  async function submit() {
    if (!form.title.trim() || !form.body.trim()) { toast.error('أدخل العنوان والرسالة'); return }
    setSaving(true)
    const res = await fetch('/api/support', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const j = await res.json()
    if (j.error) { toast.error(j.error) } else {
      setTickets(p=>[j.data,...p]); setShowNew(false); setForm({title:'',body:'',category:'استفسار',priority:'عادية'})
      toast.success('تم إرسال تذكرة الدعم ✅')
    }
    setSaving(false)
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setReplying(true)
    const res = await fetch(`/api/support/${selected.id}/replies`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:reply})})
    const j = await res.json()
    if (!j.error) {
      const updated = {...selected, replies:[...(selected.replies||[]), j.data]}
      setSelected(updated); setTickets(p=>p.map(t=>t.id===selected.id?{...t,replies:updated.replies}:t)); setReply('')
    }
    setReplying(false)
  }

  async function openTicket(t: any) {
    const res = await fetch(`/api/support/${t.id}`).then(r=>r.json())
    setSelected(res.data || t)
  }

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:16,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}
  const input: React.CSSProperties = {width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:12,padding:'11px 14px',fontFamily:'inherit',fontSize:14,outline:'none',boxSizing:'border-box' as const,color:'#111827'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {[...Array(3)].map((_,i)=><div key={i} style={{height:80,borderRadius:20,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )

  // تفاصيل تذكرة
  if (selected) return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <button onClick={()=>setSelected(null)}
        style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',fontFamily:'inherit',fontSize:14,fontWeight:600,color:G,cursor:'pointer',padding:0}}>
        ← رجوع
      </button>
      <div style={card}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
          <div style={{flex:1}}>
            <p style={{fontSize:16,fontWeight:800,margin:'0 0 6px'}}>{selected.title}</p>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {(() => { const s=STATUS_CONFIG[selected.status]; return s ? <span style={{background:s.bg,color:s.color,padding:'2px 8px',borderRadius:100,fontSize:11,fontWeight:700}}>{s.label}</span> : null })()}
              <span style={{background:BEIGE,color:'#6b7280',padding:'2px 8px',borderRadius:100,fontSize:11}}>{selected.category}</span>
              <span style={{background:BEIGE,color:'#6b7280',padding:'2px 8px',borderRadius:100,fontSize:11}}>{selected.priority}</span>
            </div>
          </div>
        </div>
        <div style={{background:BEIGE,borderRadius:12,padding:14,fontSize:13,color:'#374151',lineHeight:1.7,marginBottom:12}}>
          {selected.body}
        </div>
        <p style={{fontSize:11,color:'#9ca3af',margin:0}}>{selected.created_at?.split('T')[0]}</p>
      </div>

      {/* الردود */}
      {(selected.replies||[]).length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:0,textTransform:'uppercase',letterSpacing:1}}>الردود ({selected.replies.length})</p>
          {selected.replies.map((r:any,i:number)=>(
            <div key={r.id||i} style={{...card,background:r.is_admin?'#f0fdf4':BEIGE,borderColor:r.is_admin?`${G}33`:BDR}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:r.is_admin?G:'#6b7280',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'white',fontWeight:700,flexShrink:0}}>
                  {r.is_admin?'A':'أ'}
                </div>
                <span style={{fontSize:12,fontWeight:700,color:r.is_admin?G:'#374151'}}>{r.is_admin?'فريق المراح':'أنت'}</span>
                <span style={{fontSize:11,color:'#9ca3af',marginRight:'auto'}}>{r.created_at?.split('T')[0]}</span>
              </div>
              <p style={{margin:0,fontSize:13,color:'#374151',lineHeight:1.6}}>{r.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* إضافة رد */}
      {selected.status !== 'مغلق' && (
        <div style={card}>
          <p style={{fontSize:12,fontWeight:700,color:'#6b7280',margin:'0 0 8px'}}>أضف رداً</p>
          <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={3} placeholder="اكتب ردك هنا..."
            style={{...input,resize:'none' as const,marginBottom:8}} />
          <button onClick={sendReply} disabled={replying||!reply.trim()}
            style={{background:G,color:'white',border:'none',borderRadius:12,padding:'11px 20px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',opacity:replying||!reply.trim()?0.6:1}}>
            {replying?'⏳ جاري الإرسال...':'📤 إرسال'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>الدعم الفني</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>{tickets.length} تذكرة</p>
        </div>
        <button onClick={()=>setShowNew(p=>!p)}
          style={{background:showNew?BDARK:G,color:showNew?'#374151':'white',border:'none',borderRadius:14,padding:'10px 16px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer'}}>
          {showNew?'إلغاء':'＋ تذكرة'}
        </button>
      </div>

      {/* نموذج تذكرة جديدة */}
      {showNew && (
        <div style={{...card,border:`2px solid ${G}`}}>
          <p style={{fontSize:14,fontWeight:800,color:G,margin:'0 0 14px'}}>تذكرة دعم جديدة</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:6}}>العنوان *</label>
              <input style={input} placeholder="وصف مختصر للمشكلة أو الاستفسار" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:6}}>التصنيف</label>
                <select style={input} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:6}}>الأولوية</label>
                <select style={input} value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                  {PRIORITIES.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:6}}>التفاصيل *</label>
              <textarea rows={4} style={{...input,resize:'none' as const}} placeholder="اشرح مشكلتك أو استفسارك بالتفصيل..." value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))} />
            </div>
            <button onClick={submit} disabled={saving}
              style={{background:G,color:'white',border:'none',borderRadius:12,padding:'13px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',opacity:saving?0.7:1}}>
              {saving?'⏳ جاري الإرسال...':'📤 إرسال التذكرة'}
            </button>
          </div>
        </div>
      )}

      {/* قائمة التذاكر */}
      {tickets.length===0 ? (
        <div style={{...card,textAlign:'center',padding:'48px 20px'}}>
          <p style={{fontSize:40,margin:'0 0 12px'}}>🎫</p>
          <p style={{fontWeight:700,margin:'0 0 4px'}}>لا تذاكر مسجّلة</p>
          <p style={{fontSize:12,color:'#9ca3af',margin:0}}>اضغط + لفتح تذكرة دعم جديدة</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {tickets.map((t:any)=>{
            const s = STATUS_CONFIG[t.status]||STATUS_CONFIG['مفتوح']
            return (
              <button key={t.id} onClick={()=>openTicket(t)}
                style={{...card,display:'flex',alignItems:'center',gap:12,textAlign:'right',width:'100%',cursor:'pointer',background:'white'}}>
                <div style={{width:40,height:40,borderRadius:11,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🎫</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                    <span style={{fontSize:14,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</span>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <span style={{background:s.bg,color:s.color,padding:'1px 7px',borderRadius:100,fontSize:10,fontWeight:700}}>{s.label}</span>
                    <span style={{fontSize:11,color:'#9ca3af'}}>{t.created_at?.split('T')[0]}</span>
                    {(t.replies?.length||0)>0 && <span style={{fontSize:11,color:'#6b7280'}}>💬 {t.replies.length}</span>}
                  </div>
                </div>
                <span style={{color:'#d1d5db',fontSize:16,flexShrink:0}}>←</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
