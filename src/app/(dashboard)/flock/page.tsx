'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const G = '#1e5a10', GOLD = '#c9a84c', GOLDD = '#a8872e', GOLDS = '#fdf8ec'
const GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'
const COLORS = ['أبيض','أسود','بني','رمادي','أحمر','مختلط']

export default function FlockPage() {
  const [flock,    setFlock]    = useState<any>(null)
  const [rams,     setRams]     = useState<any[]>([])
  const [births,   setBirths]   = useState<any[]>([])
  const [tab,      setTab]      = useState<'flock'|'rams'>('flock')
  const [editing,  setEditing]  = useState(false)
  const [total,    setTotal]    = useState(0)
  const [ramForm,  setRamForm]  = useState({ram_id:'',name:'',color:''})
  const [showNew,  setShowNew]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/flock').then(r=>r.json()),
      fetch('/api/rams').then(r=>r.json()),
      fetch('/api/births').then(r=>r.json()),
    ]).then(([f,r,b]) => {
      setFlock(f.data); setTotal(f.data?.total_sheep||0)
      setRams(r.data||[]); setBirths(b.data||[])
      setLoading(false)
    })
  }, [])

  /* ── إحصائيات ── */
  const producerSet = new Set(births.map((r:any)=>r.mom_id+'_'+r.mom_color))
  const breedingCount = births.filter((r:any)=>r.in_breeding).length
  const activeRams = rams.filter(r=>!r.dead)
  const deadRams   = rams.filter(r=>r.dead)
  const now = new Date()
  let bahm=0, rakhalWean=0, rakhalReady=0, kharafSale=0, totalDeaths=0

  births.forEach((r:any)=>{
    const bd = r.original_birth_date||r.birth_date
    const months = bd?(now.getTime()-new Date(bd).getTime())/(1000*60*60*24*30.44):0
    ;(r.babies||[]).forEach((b:any)=>{
      if(b.health==='نفوق'){totalDeaths++;return}
      if(!b.stage&&months<3) bahm++
      if(b.gender==='رخل'){
        if(b.stage==='مفطوم'||(!b.stage&&months>=3&&months<7)) rakhalWean++
        if(b.stage==='جاهز للإنتاج'||(!b.stage&&months>=7))   rakhalReady++
      } else {
        if(b.stage==='جاهز للبيع'||(!b.stage&&months>=3)) kharafSale++
      }
    })
  })

  async function saveFlock(){
    setSaving(true)
    const res = await fetch('/api/flock',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({total_sheep:total})})
    const j = await res.json()
    setFlock(j.data); setEditing(false); setSaving(false); toast.success('تم الحفظ ✅')
  }

  async function addRam(){
    if(!ramForm.ram_id.trim()){toast.error('رقم الفحل مطلوب');return}
    setSaving(true)
    const res = await fetch('/api/rams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ramForm)})
    const j = await res.json()
    if(j.error){toast.error(j.error);setSaving(false);return}
    setRams(p=>[j.data,...p]); setShowNew(false); setRamForm({ram_id:'',name:'',color:''}); setSaving(false)
    toast.success('تمت الإضافة ✅')
  }

  async function markDead(id:string){
    await fetch(`/api/rams/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({dead:true})})
    setRams(p=>p.map(r=>r.id===id?{...r,dead:true}:r))
    toast.success('تم التحديث')
  }

  /* ── helpers ── */
  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:16,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}
  const inp:  React.CSSProperties = {width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:12,padding:'11px 14px',fontFamily:'inherit',fontSize:14,outline:'none',boxSizing:'border-box' as const,color:'#111827'}

  if(loading) return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{height:32,width:160,borderRadius:10,background:BDARK,animation:'shimmer 1.5s infinite'}}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[...Array(3)].map((_,i)=><div key={i} style={{height:100,borderRadius:20,background:BDARK,animation:'shimmer 1.5s infinite'}}/>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[...Array(4)].map((_,i)=><div key={i} style={{height:90,borderRadius:20,background:BDARK,animation:'shimmer 1.5s infinite'}}/>)}
      </div>
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>

      {/* ── Header ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>القطيع</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>إجمالي ومراحل القطيع</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          {tab==='flock'&&!editing&&(
            <button onClick={()=>setEditing(true)}
              style={{background:BDARK,border:'none',borderRadius:12,padding:'8px 14px',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',color:'#374151'}}>
              ✏️ تعديل
            </button>
          )}
          {tab==='rams'&&(
            <button onClick={()=>setShowNew(p=>!p)}
              style={{background:showNew?BDARK:G,color:showNew?'#374151':'white',border:'none',borderRadius:12,padding:'8px 14px',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer'}}>
              {showNew?'إلغاء':'＋ فحل'}
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:0,background:BDARK,padding:4,borderRadius:18}}>
        {([['flock',`🐑 القطيع`],['rams',`🐏 الفحول (${activeRams.length})`]] as [string,string][]).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k as any)}
            style={{flex:1,padding:'10px',borderRadius:14,border:'none',fontFamily:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .15s',
              background:tab===k?'white':'transparent',
              color:tab===k?G:'#6b7280',
              boxShadow:tab===k?'0 1px 4px rgba(0,0,0,0.08)':'none'
            }}>{l}</button>
        ))}
      </div>

      {/* ════ TAB: القطيع ════ */}
      {tab==='flock'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>

          {/* إجمالي القطيع */}
          {editing?(
            <div style={{...card,border:`2px solid ${G}`}}>
              <p style={{fontSize:13,fontWeight:800,color:G,margin:'0 0 14px'}}>تعديل الإجمالي</p>
              <input type="number" min="0" style={{...inp,fontSize:28,fontWeight:900,textAlign:'center',height:64}}
                value={total} onChange={e=>setTotal(parseInt(e.target.value)||0)} />
              <div style={{display:'flex',gap:8,marginTop:12}}>
                <button onClick={saveFlock} disabled={saving}
                  style={{flex:1,background:G,color:'white',border:'none',borderRadius:12,padding:'12px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',opacity:saving?0.7:1}}>
                  {saving?'⏳ جاري...':'💾 حفظ'}
                </button>
                <button onClick={()=>{setEditing(false);setTotal(flock?.total_sheep||0)}}
                  style={{background:BDARK,border:'none',borderRadius:12,padding:'12px 18px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',color:'#374151'}}>
                  إلغاء
                </button>
              </div>
            </div>
          ):(
            <div style={{...card,background:`linear-gradient(135deg,white 60%,${GSUBT})`,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,right:0,left:0,height:4,borderRadius:'20px 20px 0 0',background:`linear-gradient(90deg,${G},${GOLD})`}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:4}}>
                <div>
                  <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:1}}>إجمالي القطيع</p>
                  <div style={{fontSize:52,fontWeight:900,color:G,lineHeight:1}}>{flock?.total_sheep||0}</div>
                  <p style={{fontSize:13,color:'#9ca3af',margin:'4px 0 0'}}>رأس</p>
                </div>
                <div style={{fontSize:64,opacity:0.15,userSelect:'none'}}>🐑</div>
              </div>
            </div>
          )}

          {/* إحصائيات رئيسية — 3 بطاقات */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            {[
              {icon:'🐑',v:producerSet.size, l:'الأمهات',   c:G,      bg:GSUBT},
              {icon:'🔗',v:breedingCount,    l:'في الشبك',  c:GOLDD,  bg:GOLDS},
              {icon:'🐏',v:activeRams.length,l:'الفحول',    c:'#6d28d9',bg:'#f5f3ff'},
            ].map(s=>(
              <div key={s.l} style={{...card,background:s.bg,border:`1px solid ${s.c}22`,textAlign:'center',padding:'14px 8px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:3,borderRadius:'20px 20px 0 0',background:s.c}}/>
                <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                <div style={{fontSize:28,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:11,color:s.c,opacity:0.8,marginTop:4,fontWeight:600}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* مراحل المواليد */}
          <div>
            <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 10px',textTransform:'uppercase',letterSpacing:1}}>مراحل المواليد</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {icon:'🍼',v:bahm,        l:'البهم',           sub:'0 – 3 أشهر', c:'#7c3aed',bg:'#f5f3ff'},
                {icon:'🔔',v:rakhalWean,  l:'رخال مفطومة',     sub:'3 – 7 أشهر', c:'#d97706',bg:'#fffbeb'},
                {icon:'🌿',v:rakhalReady, l:'رخال للإنتاج',    sub:'7+ أشهر',    c:G,         bg:GSUBT},
                {icon:'🏷️',v:kharafSale, l:'خرفان للبيع',     sub:'3+ أشهر',    c:'#db2777', bg:'#fdf2f8'},
              ].map(s=>(
                <div key={s.l} style={{...card,background:s.bg,border:`1px solid ${s.c}22`,display:'flex',alignItems:'center',gap:12,padding:'14px'}}>
                  <div style={{width:44,height:44,borderRadius:13,background:`${s.c}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{fontSize:26,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
                    <div style={{fontSize:12,color:s.c,fontWeight:700,marginTop:2}}>{s.l}</div>
                    <div style={{fontSize:10,color:'#9ca3af'}}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* نفوق */}
          {totalDeaths>0&&(
            <div style={{...card,background:'#fef2f2',border:'1px solid #fecaca',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:13,background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>💀</div>
              <div>
                <div style={{fontSize:22,fontWeight:900,color:'#dc2626',lineHeight:1}}>{totalDeaths}</div>
                <div style={{fontSize:12,color:'#dc2626',marginTop:2}}>حالة نفوق مسجلة</div>
              </div>
            </div>
          )}

          {/* ملخص */}
          <div style={card}>
            <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 10px',textTransform:'uppercase',letterSpacing:1}}>ملخص سريع</p>
            {[
              {l:'سجلات الولادة',   v:births.length,   icon:'📋'},
              {l:'إجمالي المواليد', v:births.reduce((s:number,r:any)=>s+(r.babies?.length||0),0), icon:'🍼'},
              {l:'الفحول الكلي',    v:rams.length,     icon:'🐏'},
              {l:'الفحول النافقة',  v:deadRams.length, icon:'💀'},
            ].map(row=>(
              <div key={row.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${BDR}`}}>
                <span style={{fontSize:13,color:'#6b7280',display:'flex',alignItems:'center',gap:8}}><span>{row.icon}</span>{row.l}</span>
                <span style={{fontSize:18,fontWeight:900,color:G}}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════ TAB: الفحول ════ */}
      {tab==='rams'&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>

          {/* نموذج إضافة */}
          {showNew&&(
            <div style={{...card,border:`2px solid ${G}`}}>
              <p style={{fontSize:13,fontWeight:800,color:G,margin:'0 0 14px'}}>إضافة فحل جديد</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:'#6b7280',marginBottom:5}}>رقم الفحل *</label>
                  <input style={inp} placeholder="F001" value={ramForm.ram_id} onChange={e=>setRamForm(p=>({...p,ram_id:e.target.value}))} />
                </div>
                <div>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:'#6b7280',marginBottom:5}}>الاسم (اختياري)</label>
                  <input style={inp} placeholder="المبروك" value={ramForm.name} onChange={e=>setRamForm(p=>({...p,name:e.target.value}))} />
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'#6b7280',marginBottom:5}}>اللون</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {COLORS.map(c=>(
                    <button key={c} type="button" onClick={()=>setRamForm(p=>({...p,color:c}))}
                      style={{padding:'6px 12px',borderRadius:10,border:`1.5px solid ${c===ramForm.color?G:BDR}`,background:c===ramForm.color?G:'white',color:c===ramForm.color?'white':'#374151',fontFamily:'inherit',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={addRam} disabled={saving}
                  style={{flex:1,background:G,color:'white',border:'none',borderRadius:12,padding:'12px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',opacity:saving?0.7:1}}>
                  {saving?'⏳...':'💾 إضافة الفحل'}
                </button>
                <button onClick={()=>{setShowNew(false);setRamForm({ram_id:'',name:'',color:''})}}
                  style={{background:BDARK,border:'none',borderRadius:12,padding:'12px 18px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',color:'#374151'}}>
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* الفحول النشطة */}
          {activeRams.length>0&&(
            <div>
              <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 8px',textTransform:'uppercase',letterSpacing:1}}>نشط — {activeRams.length}</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {activeRams.map((r:any)=>(
                  <div key={r.id} style={{...card,display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:44,height:44,borderRadius:13,background:GSUBT,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🐏</div>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontWeight:800,fontSize:14}}>{r.ram_id}{r.name&&` — ${r.name}`}</p>
                      <p style={{margin:'2px 0 0',fontSize:11,color:'#9ca3af'}}>{r.color||'—'}</p>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{background:GSUBT,color:G,padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:700}}>نشط</span>
                      <button onClick={()=>markDead(r.id)}
                        style={{background:'#fef2f2',border:'none',borderRadius:8,padding:'5px 10px',color:'#dc2626',fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                        نفوق
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* الفحول النافقة */}
          {deadRams.length>0&&(
            <div>
              <p style={{fontSize:11,fontWeight:800,color:'#9ca3af',margin:'0 0 8px',textTransform:'uppercase',letterSpacing:1}}>نافق — {deadRams.length}</p>
              <div style={{display:'flex',flexDirection:'column',gap:8,opacity:0.5}}>
                {deadRams.map((r:any)=>(
                  <div key={r.id} style={{...card,display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:44,height:44,borderRadius:13,background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>💀</div>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontWeight:800,fontSize:14}}>{r.ram_id}{r.name&&` — ${r.name}`}</p>
                      <p style={{margin:'2px 0 0',fontSize:11,color:'#9ca3af'}}>{r.color||'—'}</p>
                    </div>
                    <span style={{background:'#fef2f2',color:'#dc2626',padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:700}}>نافق</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* فارغ */}
          {rams.length===0&&(
            <div style={{...card,textAlign:'center',padding:'48px 20px'}}>
              <p style={{fontSize:40,margin:'0 0 12px'}}>🐏</p>
              <p style={{fontWeight:700,color:'#374151',margin:'0 0 4px'}}>لا فحول مسجلة</p>
              <p style={{fontSize:12,color:'#9ca3af',margin:0}}>اضغط + لإضافة فحل</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
