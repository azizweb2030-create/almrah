'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const router = useRouter()
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard')
    })
  }, [])

  return (
    <div style={{ fontFamily:"'Tajawal',sans-serif", direction:'rtl', color:'#f0e8d0', background:'linear-gradient(180deg,#080a06 0%,#0f130b 60%,#080a06 100%)', minHeight:'100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet"/>
      {/* Header */}
      <header style={{padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(201,168,76,0.15)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:28}}>🐑</span>
          <span style={{fontSize:22,fontWeight:900,color:'#c9a84c'}}>المراح</span>
        </div>
        <div style={{display:'flex',gap:12}}>
          <a href="/login" style={{color:'#f0e8d0',textDecoration:'none',fontSize:15,fontWeight:600,padding:'8px 20px',border:'1px solid rgba(201,168,76,0.4)',borderRadius:12}}>دخول</a>
          <a href="/register" style={{background:'#c9a84c',color:'#080a06',textDecoration:'none',fontSize:15,fontWeight:700,padding:'8px 20px',borderRadius:12}}>ابدأ مجاناً</a>
        </div>
      </header>

      {/* Hero */}
      <section style={{minHeight:'85vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'60px 24px',position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 100% 80% at 50% -20%,rgba(45,90,27,0.5) 0%,transparent 60%)',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1,maxWidth:700}}>
          <div style={{display:'inline-block',background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.3)',borderRadius:100,padding:'6px 18px',fontSize:13,color:'#c9a84c',marginBottom:24}}>✨ النسخة الثانية — أقوى وأسرع</div>
          <h1 style={{fontSize:'clamp(36px,7vw,72px)',fontWeight:900,lineHeight:1.1,marginBottom:20}}>
            <span style={{color:'#c9a84c'}}>إدارة مراحك</span><br/>باحترافية تامة
          </h1>
          <p style={{fontSize:18,color:'rgba(240,232,208,0.7)',lineHeight:1.7,margin:'0 auto 40px',maxWidth:500}}>
            منصة رقمية متكاملة لتتبع القطيع، تسجيل الولادات، ومتابعة الصحة — كل شيء في مكان واحد
          </p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/register" style={{background:'#c9a84c',color:'#080a06',textDecoration:'none',fontSize:17,fontWeight:800,padding:'16px 40px',borderRadius:16}}>ابدأ تجربة مجانية</a>
            <a href="/login" style={{color:'#f0e8d0',textDecoration:'none',fontSize:17,fontWeight:600,padding:'16px 32px',border:'1px solid rgba(240,232,208,0.3)',borderRadius:16}}>تسجيل الدخول</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{padding:'80px 24px',maxWidth:1000,margin:'0 auto'}}>
        <h2 style={{textAlign:'center',fontSize:32,fontWeight:900,color:'#c9a84c',marginBottom:50}}>كل ما تحتاجه في مكان واحد</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
          {[
            {icon:'🐑',title:'متابعة القطيع',desc:'تتبع إجمالي القطيع وجميع التغييرات تلقائياً'},
            {icon:'🍼',title:'تسجيل الولادات',desc:'سجّل الولادات وتابع مراحل نمو المواليد تلقائياً'},
            {icon:'🤰',title:'شبك التلقيح',desc:'عداد ذكي للحمل مع تنبيهات الولادة المتوقعة'},
            {icon:'🩺',title:'البيطرة والصحة',desc:'عزل الحالات المرضية ومتابعتها يومياً'},
            {icon:'🤖',title:'مساعد AI',desc:'اسأل المساعد الذكي عن أي شيء في مراحك'},
            {icon:'📊',title:'تقارير PDF',desc:'تصدير تقارير احترافية بضغطة واحدة'},
          ].map(f => (
            <div key={f.title} style={{background:'rgba(240,232,208,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:20,padding:28}}>
              <div style={{fontSize:36,marginBottom:12}}>{f.icon}</div>
              <h3 style={{fontSize:18,fontWeight:800,color:'#c9a84c',marginBottom:8}}>{f.title}</h3>
              <p style={{fontSize:14,color:'rgba(240,232,208,0.65)',lineHeight:1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'80px 24px',textAlign:'center',borderTop:'1px solid rgba(201,168,76,0.1)'}}>
        <h2 style={{fontSize:36,fontWeight:900,marginBottom:16}}>جاهز تبدأ؟</h2>
        <p style={{color:'rgba(240,232,208,0.6)',marginBottom:32}}>7 أيام تجريبية مجانية — لا يلزم بطاقة ائتمان</p>
        <a href="/register" style={{background:'#c9a84c',color:'#080a06',textDecoration:'none',fontSize:18,fontWeight:800,padding:'18px 50px',borderRadius:16,display:'inline-block'}}>ابدأ الآن مجاناً</a>
      </section>

      {/* Footer */}
      <footer style={{padding:'30px 24px',textAlign:'center',color:'rgba(240,232,208,0.3)',fontSize:13,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        🐑 المراح — منصة إدارة المواشي © 2025
      </footer>
    </div>
  )
}
