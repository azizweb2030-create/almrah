'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

const G='#1e5a10', GSUBT='#e8f5e2', BEIGE='#f8f4ee', BDR='#d8cfc3', GOLD='#c9a84c'
const card: React.CSSProperties = { background:'white', borderRadius:20, border:`1px solid ${BDR}`, padding:20, boxShadow:'0 1px 3px rgba(0,0,0,0.05)', marginBottom:16 }
const inp: React.CSSProperties = { width:'100%', background:BEIGE, border:`1px solid ${BDR}`, borderRadius:12, padding:'10px 14px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as any }
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }

export default function SettingsPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name:'', farm_name:'', phone:'', telegram_chat_id:'' })
  const [pwd, setPwd] = useState({ current:'', new:'', confirm:'' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [telegramBot, setTelegramBot] = useState<any>(null)
  const [testingTg, setTestingTg] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [economy, setEconomy] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(true)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data } = await sb.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setForm({
          full_name: data.full_name || '',
          farm_name: data.farm_name || '',
          phone: data.phone || '',
          telegram_chat_id: data.telegram_chat_id || ''
        })
        setEconomy(data.economy_mode || false)
        setNotifEnabled(data.notifications_enabled !== false)
      }
      setLoading(false)
    })
    // فحص Bot
    fetch('/api/telegram/setup').then(r=>r.json()).then(d=>setTelegramBot(d)).catch(()=>{})
  }, [router])

  async function saveProfile() {
    setSaving(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    const { error } = await sb.from('profiles').update({
      ...form, economy_mode: economy, notifications_enabled: notifEnabled
    }).eq('id', user.id)
    setSaving(false)
    if (error) toast.error('فشل الحفظ')
    else toast.success('✅ تم الحفظ')
  }

  async function testTelegram() {
    if (!form.telegram_chat_id.trim()) { toast.error('أدخل Chat ID أولاً'); return }
    setTestingTg(true)
    const res = await fetch('/api/telegram/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: form.telegram_chat_id.trim() })
    })
    const j = await res.json()
    setTestingTg(false)
    if (j.success) {
      toast.success('✅ تم الربط! تحقق من Telegram')
      await saveProfile()
    } else {
      toast.error(j.error || 'فشل الإرسال — تحقق من Chat ID')
    }
  }

  async function changePassword() {
    if (pwd.new !== pwd.confirm) { toast.error('كلمتا المرور غير متطابقتين'); return }
    if (pwd.new.length < 6) { toast.error('كلمة المرور 6 أحرف على الأقل'); return }
    setSavingPwd(true)
    const { error } = await createClient().auth.updateUser({ password: pwd.new })
    setSavingPwd(false)
    if (error) toast.error(error.message)
    else { toast.success('✅ تم تغيير كلمة المرور'); setPwd({ current:'', new:'', confirm:'' }) }
  }

  async function logout() {
    await createClient().auth.signOut()
    router.push('/login')
  }

  if (loading) return <div style={{ display:'flex', flexDirection:'column', gap:16 }}>{[...Array(3)].map((_,i)=><div key={i} className="skeleton" style={{ height:100, borderRadius:20 }}/>)}</div>

  return (
    <div style={{ maxWidth:480, margin:'0 auto' }}>
      <h1 style={{ fontSize:24, fontWeight:900, color:G, marginBottom:20 }}>⚙️ الإعدادات</h1>

      {/* الملف الشخصي */}
      <div style={card}>
        <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:G }}>👤 الملف الشخصي</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[
            { k:'full_name', l:'الاسم الكامل', ph:'اسمك الكريم' },
            { k:'farm_name', l:'اسم المراح', ph:'اسم مراحك' },
            { k:'phone', l:'رقم الجوال', ph:'05xxxxxxxx', dir:'ltr' },
          ].map(f => (
            <div key={f.k}>
              <label style={lbl}>{f.l}</label>
              <input style={{...inp, direction: f.dir as any || 'rtl'}} placeholder={f.ph}
                value={(form as any)[f.k]}
                onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}/>
            </div>
          ))}
        </div>
        <button onClick={saveProfile} disabled={saving}
          style={{ marginTop:16, width:'100%', background:G, color:'white', border:'none', borderRadius:12, padding:'11px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:saving?0.7:1 }}>
          {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
        </button>
      </div>

      {/* Telegram */}
      <div style={card}>
        <h2 style={{ fontSize:16, fontWeight:700, marginBottom:4, color:G }}>📱 إشعارات Telegram</h2>
        {telegramBot?.configured ? (
          <p style={{ fontSize:13, color:'#6b7280', marginBottom:12 }}>
            البوت: <b>@{telegramBot.username}</b> — {telegramBot.name}
          </p>
        ) : (
          <div style={{ background:'#fef3cd', border:'1px solid #ffc107', borderRadius:12, padding:'10px 14px', marginBottom:12 }}>
            <p style={{ fontSize:13, margin:0, color:'#856404' }}>
              ⚠️ البوت غير مكوّن — أضف <code>TELEGRAM_BOT_TOKEN</code> في Vercel Environment Variables
            </p>
            <p style={{ fontSize:12, margin:'4px 0 0', color:'#856404' }}>
              1. افتح Telegram → ابحث عن <b>@BotFather</b><br/>
              2. أرسل <code>/newbot</code> واتبع الخطوات<br/>
              3. انسخ الـ Token وأضفه في Vercel → Settings → Environment Variables
            </p>
          </div>
        )}

        <div style={{ marginBottom:12 }}>
          <label style={lbl}>Chat ID</label>
          <input style={{ ...inp, direction:'ltr' }} placeholder="123456789"
            value={form.telegram_chat_id}
            onChange={e => setForm(p => ({ ...p, telegram_chat_id: e.target.value }))}/>
          <p style={{ fontSize:11, color:'#9ca3af', margin:'4px 0 0' }}>
            للحصول على Chat ID: ابعث رسالة للبوت <b>@userinfobot</b> في Telegram
          </p>
        </div>

        <button onClick={testTelegram} disabled={testingTg || !telegramBot?.configured}
          style={{ width:'100%', background:testingTg?'#9ca3af':GOLD, color:'white', border:'none', borderRadius:12, padding:'10px', fontSize:14, fontWeight:600, cursor:telegramBot?.configured?'pointer':'not-allowed', fontFamily:'inherit' }}>
          {testingTg ? '⏳ جاري الإرسال...' : '📨 اختبار الإشعار + حفظ'}
        </button>
      </div>

      {/* الإعدادات */}
      <div style={card}>
        <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:G }}>🔔 الإشعارات والأداء</h2>
        {[
          { k:'notif', l:'تفعيل الإشعارات', v:notifEnabled, set:setNotifEnabled },
          { k:'eco', l:'وضع الاقتصاد (AI)', v:economy, set:setEconomy },
        ].map(s => (
          <div key={s.k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${BDR}` }}>
            <span style={{ fontSize:14 }}>{s.l}</span>
            <div onClick={() => s.set(!s.v)} style={{
              width:44, height:24, borderRadius:12, cursor:'pointer', transition:'all .2s',
              background: s.v ? G : '#d1d5db', position:'relative'
            }}>
              <div style={{
                position:'absolute', top:2, transition:'all .2s',
                left: s.v ? 'calc(100% - 22px)' : 2,
                width:20, height:20, borderRadius:'50%', background:'white',
                boxShadow:'0 1px 3px rgba(0,0,0,0.2)'
              }}/>
            </div>
          </div>
        ))}
      </div>

      {/* تغيير كلمة المرور */}
      <div style={card}>
        <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:G }}>🔒 تغيير كلمة المرور</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div><label style={lbl}>كلمة المرور الجديدة</label><input type="password" style={inp} placeholder="6 أحرف على الأقل" value={pwd.new} onChange={e=>setPwd(p=>({...p,new:e.target.value}))}/></div>
          <div><label style={lbl}>تأكيد كلمة المرور</label><input type="password" style={inp} placeholder="أعد الكتابة" value={pwd.confirm} onChange={e=>setPwd(p=>({...p,confirm:e.target.value}))}/></div>
          <button onClick={changePassword} disabled={savingPwd || !pwd.new}
            style={{ background:G, color:'white', border:'none', borderRadius:12, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:savingPwd||!pwd.new?0.5:1 }}>
            {savingPwd ? '⏳...' : '🔒 تغيير كلمة المرور'}
          </button>
        </div>
      </div>

      {/* تسجيل الخروج */}
      <div style={card}>
        {!showLogout ? (
          <button onClick={()=>setShowLogout(true)} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, color:'#dc2626', fontFamily:'inherit', padding:'4px' }}>
            🚪 تسجيل الخروج
          </button>
        ) : (
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:14, color:'#374151', marginBottom:12 }}>هل تريد تسجيل الخروج؟</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={logout} style={{ flex:1, background:'#dc2626', color:'white', border:'none', borderRadius:12, padding:'10px', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>تأكيد الخروج</button>
              <button onClick={()=>setShowLogout(false)} style={{ flex:1, background:BEIGE, border:`1px solid ${BDR}`, borderRadius:12, padding:'10px', cursor:'pointer', fontFamily:'inherit' }}>إلغاء</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
