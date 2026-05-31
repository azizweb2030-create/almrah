'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const G = '#1e5a10', GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'
const GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3'

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/subscriptions').then(r=>r.json()),
      fetch('/api/profile').then(r=>r.json()),
    ]).then(([s,p]) => {
      setSubs(s.data||[]); setProfile(p.data)
      setLoading(false)
    })
  }, [])

  const activeSub = subs.find(s => s.status === 'active')
  const isActive = !!activeSub
  const isPending = subs.some(s => s.status === 'pending')

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}

  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {[...Array(3)].map((_,i)=><div key={i} style={{height:100,borderRadius:20,background:'#e5e7eb',animation:'shimmer 1.5s infinite'}}/>)}
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>

      <div>
        <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>اشتراكي</h1>
        <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>إدارة اشتراكك في المراح</p>
      </div>

      {/* حالة الاشتراك */}
      <div style={{...card, background: isActive ? GSUBT : '#fffbeb', border: `1px solid ${isActive ? G+'33' : '#fde68a'}`}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:52,height:52,borderRadius:15,background:isActive?G:'#f59e0b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>
            {isActive ? '✅' : isPending ? '⏳' : '⚠️'}
          </div>
          <div style={{flex:1}}>
            <p style={{margin:0,fontWeight:900,fontSize:16,color:isActive?G:isPending?'#92400e':'#374151'}}>
              {isActive ? 'اشتراك نشط' : isPending ? 'اشتراك قيد المراجعة' : 'لا يوجد اشتراك نشط'}
            </p>
            {activeSub && (
              <p style={{margin:'4px 0 0',fontSize:12,color:'#6b7280'}}>
                ينتهي: {activeSub.end_date ? new Date(activeSub.end_date).toLocaleDateString('ar-SA') : 'دائم'}
                {activeSub.plan && ` · ${activeSub.plan}`}
              </p>
            )}
            {isPending && !isActive && (
              <p style={{margin:'4px 0 0',fontSize:12,color:'#92400e'}}>سيتم تفعيل اشتراكك قريباً</p>
            )}
          </div>
          <div style={{background:isActive?G:isPending?'#f59e0b':'#9ca3af',color:'white',padding:'4px 12px',borderRadius:100,fontSize:12,fontWeight:700,flexShrink:0}}>
            {isActive ? 'فعّال' : isPending ? 'معلق' : 'منتهي'}
          </div>
        </div>
      </div>

      {/* خطط الاشتراك */}
      <div>
        <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:1}}>خطط الاشتراك</p>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>

          {/* شهري */}
          <div style={{...card,border:`2px solid ${BDR}`,position:'relative',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div>
                <p style={{margin:'0 0 3px',fontSize:16,fontWeight:900}}>الخطة الشهرية</p>
                <p style={{margin:0,fontSize:12,color:'#6b7280'}}>تجديد شهري تلقائي</p>
              </div>
              <div style={{textAlign:'left'}}>
                <span style={{fontSize:26,fontWeight:900,color:G}}>٣٠</span>
                <span style={{fontSize:13,color:'#6b7280'}}> ر.س / شهر</span>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
              {['✅ وصول كامل لجميع الميزات','✅ إشعارات تيليجرام','✅ مساعد AI','✅ تصدير PDF','✅ دعم فني'].map(f=>(
                <p key={f} style={{margin:0,fontSize:12,color:'#374151'}}>{f}</p>
              ))}
            </div>
            <button onClick={()=>toast('تواصل معنا على تيليجرام @almrah_support')}
              style={{width:'100%',background:G,color:'white',border:'none',borderRadius:12,padding:'12px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer'}}>
              اشترك الآن
            </button>
          </div>

          {/* دائم */}
          <div style={{...card,border:`2px solid ${GOLD}`,position:'relative',overflow:'hidden',background:`linear-gradient(135deg,white,${GOLDS})`}}>
            <div style={{position:'absolute',top:12,left:12,background:GOLD,color:'white',padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:700}}>
              الأفضل قيمة ⭐
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,marginTop:24}}>
              <div>
                <p style={{margin:'0 0 3px',fontSize:16,fontWeight:900}}>الخطة الدائمة</p>
                <p style={{margin:0,fontSize:12,color:'#6b7280'}}>دفعة واحدة للأبد</p>
              </div>
              <div style={{textAlign:'left'}}>
                <span style={{fontSize:26,fontWeight:900,color:GOLDD}}>٢٩٩</span>
                <span style={{fontSize:13,color:'#6b7280'}}> ر.س</span>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
              {['✅ كل مزايا الخطة الشهرية','✅ وصول مدى الحياة','✅ جميع التحديثات مجاناً','✅ أولوية في الدعم الفني'].map(f=>(
                <p key={f} style={{margin:0,fontSize:12,color:'#374151'}}>{f}</p>
              ))}
            </div>
            <button onClick={()=>toast('تواصل معنا على تيليجرام @almrah_support')}
              style={{width:'100%',background:`linear-gradient(135deg,${GOLDD},${GOLD})`,color:'white',border:'none',borderRadius:12,padding:'12px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:`0 4px 14px ${GOLD}55`}}>
              اشترك مدى الحياة
            </button>
          </div>
        </div>
      </div>

      {/* تاريخ الاشتراكات */}
      {subs.length > 0 && (
        <div style={card}>
          <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:1}}>تاريخ الاشتراكات</p>
          {subs.map((s:any)=>(
            <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${BDR}`}}>
              <div>
                <p style={{margin:0,fontSize:13,fontWeight:600}}>{s.plan||'اشتراك'}</p>
                <p style={{margin:'2px 0 0',fontSize:11,color:'#9ca3af'}}>{s.start_date?.split('T')[0]} → {s.end_date?.split('T')[0]||'دائم'}</p>
              </div>
              <span style={{background:s.status==='active'?GSUBT:s.status==='pending'?'#fffbeb':'#f3f4f6',color:s.status==='active'?G:s.status==='pending'?'#92400e':'#6b7280',padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:700}}>
                {s.status==='active'?'نشط':s.status==='pending'?'معلق':'منتهي'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* تواصل */}
      <div style={{...card,textAlign:'center',background:BEIGE}}>
        <p style={{fontSize:20,margin:'0 0 8px'}}>💬</p>
        <p style={{fontSize:13,fontWeight:700,margin:'0 0 4px'}}>تحتاج مساعدة في الاشتراك؟</p>
        <p style={{fontSize:12,color:'#6b7280',margin:'0 0 12px'}}>تواصل معنا عبر تيليجرام</p>
        <a href="https://t.me/almrah_support" target="_blank" rel="noopener"
          style={{display:'inline-flex',alignItems:'center',gap:8,background:'#0088cc',color:'white',padding:'10px 20px',borderRadius:12,textDecoration:'none',fontSize:14,fontWeight:700}}>
          📱 @almrah_support
        </a>
      </div>

    </div>
  )
}
