'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const G = '#1e5a10', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'

export default function SettingsPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name:'', farm_name:'', phone:'', telegram_chat_id:'' })
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ new:'', confirm:'' })
  const [pwSaving, setPwSaving] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      setEmail(user.email || '')
      createClient().from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) setForm({ full_name:data.full_name||'', farm_name:data.farm_name||'', phone:data.phone||'', telegram_chat_id:data.telegram_chat_id||'' })
        })
    })
  }, [])

  async function save() {
    setSaving(true)
    const res = await fetch('/api/profile', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const j = await res.json()
    setSaving(false)
    j.error ? toast.error(j.error) : toast.success('تم الحفظ ✅')
  }

  async function changePassword() {
    if (!pwForm.new || pwForm.new !== pwForm.confirm) { toast.error('كلمتا المرور غير متطابقتين'); return }
    if (pwForm.new.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    setPwSaving(true)
    const { error } = await createClient().auth.updateUser({ password: pwForm.new })
    setPwSaving(false)
    if (error) { toast.error(error.message) } else { toast.success('تم تغيير كلمة المرور ✅'); setPwForm({new:'',confirm:''}) }
  }

  async function doLogout() {
    await createClient().auth.signOut()
    router.push('/login')
  }

  const card: React.CSSProperties = {background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}
  const label: React.CSSProperties = {display:'block',fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}
  const input: React.CSSProperties = {width:'100%',background:BEIGE,border:`1.5px solid ${BDR}`,borderRadius:12,padding:'11px 14px',fontFamily:'inherit',fontSize:14,outline:'none',boxSizing:'border-box' as const,color:'#111827'}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>

      {/* Header */}
      <div>
        <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>الإعدادات</h1>
        <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>{email}</p>
      </div>

      {/* بيانات الحساب */}
      <div style={card}>
        <p style={{fontSize:13,fontWeight:800,color:G,margin:'0 0 16px',display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:28,height:28,borderRadius:8,background:'#e8f5e2',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:14}}>👤</span>
          بيانات الحساب
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[
            {k:'full_name', l:'الاسم الكامل', ph:'أدخل اسمك الكامل'},
            {k:'farm_name', l:'اسم المزرعة / المراح', ph:'اسم مراحك'},
            {k:'phone', l:'رقم الجوال', ph:'05xxxxxxxx'},
            {k:'telegram_chat_id', l:'معرّف تيليجرام (Chat ID)', ph:'123456789'},
          ].map(f=>(
            <div key={f.k}>
              <label style={label}>{f.l}</label>
              <input style={input} placeholder={f.ph} value={(form as any)[f.k]}
                onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} />
            </div>
          ))}
          <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'10px 14px',fontSize:12,color:'#92400e'}}>
            💡 للحصول على Chat ID: أرسل رسالة لبوت <strong>@userinfobot</strong> على تيليجرام
          </div>
          <button onClick={save} disabled={saving}
            style={{background:G,color:'white',border:'none',borderRadius:14,padding:'13px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:`0 4px 14px ${G}33`,opacity:saving?0.7:1}}>
            {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* تغيير كلمة المرور */}
      <div style={card}>
        <p style={{fontSize:13,fontWeight:800,color:G,margin:'0 0 16px',display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:28,height:28,borderRadius:8,background:'#eff6ff',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🔐</span>
          تغيير كلمة المرور
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div>
            <label style={label}>كلمة المرور الجديدة</label>
            <input type="password" style={input} placeholder="••••••••" value={pwForm.new}
              onChange={e=>setPwForm(p=>({...p,new:e.target.value}))} />
          </div>
          <div>
            <label style={label}>تأكيد كلمة المرور</label>
            <input type="password" style={input} placeholder="••••••••" value={pwForm.confirm}
              onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} />
          </div>
          <button onClick={changePassword} disabled={pwSaving}
            style={{background:'#1d4ed8',color:'white',border:'none',borderRadius:14,padding:'13px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer',opacity:pwSaving?0.7:1}}>
            {pwSaving ? '⏳...' : '🔑 تغيير كلمة المرور'}
          </button>
        </div>
      </div>

      {/* تسجيل الخروج */}
      <div style={card}>
        <p style={{fontSize:13,fontWeight:800,color:'#dc2626',margin:'0 0 12px',display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:28,height:28,borderRadius:8,background:'#fef2f2',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🚪</span>
          تسجيل الخروج
        </p>
        {!logoutConfirm ? (
          <button onClick={()=>setLogoutConfirm(true)}
            style={{width:'100%',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:14,padding:'13px',fontFamily:'inherit',fontSize:14,fontWeight:700,color:'#dc2626',cursor:'pointer'}}>
            تسجيل الخروج من المراح
          </button>
        ) : (
          <div>
            <p style={{fontSize:13,color:'#6b7280',margin:'0 0 12px',textAlign:'center'}}>هل أنت متأكد من الخروج؟</p>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setLogoutConfirm(false)}
                style={{flex:1,background:BDARK,border:'none',borderRadius:12,padding:'12px',fontFamily:'inherit',fontSize:14,fontWeight:700,color:'#374151',cursor:'pointer'}}>
                إلغاء
              </button>
              <button onClick={doLogout}
                style={{flex:1,background:'linear-gradient(135deg,#991b1b,#ef4444)',border:'none',borderRadius:12,padding:'12px',fontFamily:'inherit',fontSize:14,fontWeight:700,color:'white',cursor:'pointer'}}>
                خروج
              </button>
            </div>
          </div>
        )}
      </div>

      {/* معلومات التطبيق */}
      <div style={{...card, background:BEIGE, textAlign:'center'}}>
        <p style={{fontSize:24,margin:'0 0 6px'}}>🐑</p>
        <p style={{fontSize:14,fontWeight:900,color:G,margin:'0 0 3px'}}>المراح V2</p>
        <p style={{fontSize:11,color:'#9ca3af',margin:0}}>منصة إدارة المواشي الاحترافية</p>
      </div>

    </div>
  )
}
