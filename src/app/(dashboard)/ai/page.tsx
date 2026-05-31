'use client'
import { useState, useRef, useEffect } from 'react'

const G = '#1e5a10', GSUBT = '#e8f5e2', BEIGE = '#f8f4ee', BDR = '#d8cfc3', BDARK = '#ede7db'

const SUGGESTIONS = [
  'كيف أضيف ولادة؟','كيف أقرأ التقارير؟','كيف أسجل نفوق؟',
  'كيف أفعّل شبك التلقيح؟','ما معنى رخل ومفطوم؟','كيف أعزل حيوان مريض؟',
]
const WELCOME_MSG = 'مرحباً بك 👋\n\nأنا مساعد منصة **المراح** الذكي.\n\nيمكنك سؤالي عن أي شيء يخص البرنامج وسأجيبك بشكل واضح وبسيط 😊'

export default function AIPage() {
  const [messages, setMessages] = useState<any[]>([{role:'assistant',content:WELCOME_MSG,ts:Date.now()}])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenInfo, setTokenInfo] = useState<{used:number,limit:number}|null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])

  useEffect(() => {
    fetch('/api/ai/usage').then(r=>r.json()).then(j=>{
      if(j.data) setTokenInfo({used:j.data.ai_tokens_used||0,limit:j.data.ai_tokens_limit||5000})
    }).catch(()=>{})
  }, [])

  async function send(msg?: string) {
    const text = (msg||input).trim()
    if(!text||loading) return
    setMessages(p=>[...p,{role:'user',content:text,ts:Date.now()}])
    setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:text,messages:messages.map(m=>({role:m.role,content:m.content}))})
      })
      const d = await res.json()
      setMessages(p=>[...p,{role:'assistant',content:d.response||d.error||'حدث خطأ، حاول مرة أخرى',ts:Date.now()}])
      if(d.tokens&&tokenInfo) setTokenInfo(p=>p?({...p,used:p.used+d.tokens}):p)
    } catch {
      setMessages(p=>[...p,{role:'assistant',content:'حدث خطأ، تحقق من الاتصال',ts:Date.now()}])
    } finally { setLoading(false) }
  }

  const pct = tokenInfo ? Math.min(100,Math.round((tokenInfo.used/tokenInfo.limit)*100)) : 0

  return (
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 8rem)'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexShrink:0}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,color:G,margin:0}}>🤖 المساعد الذكي</h1>
          <p style={{fontSize:12,color:'#9ca3af',margin:'3px 0 0'}}>اسألني عن أي شيء في المراح</p>
        </div>
        {tokenInfo && (
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:11,color:'#9ca3af'}}>{tokenInfo.used.toLocaleString()} / {tokenInfo.limit.toLocaleString()}</div>
            <div style={{width:64,height:5,background:BDR,borderRadius:100,marginTop:4,overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:100,width:`${pct}%`,background:pct>80?'#ef4444':G,transition:'width .3s'}}/>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{flex:1,background:'white',borderRadius:20,border:`1px solid ${BDR}`,padding:14,overflowY:'auto',display:'flex',flexDirection:'column',gap:12,marginBottom:12,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',gap:10,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-end'}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:m.role==='user'?GSUBT:BDARK,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
              {m.role==='user'?'👤':'🤖'}
            </div>
            <div style={{maxWidth:'75%',padding:'10px 14px',borderRadius:m.role==='user'?'18px 18px 6px 18px':'18px 18px 18px 6px',fontSize:14,lineHeight:1.6,whiteSpace:'pre-wrap',
              background:m.role==='user'?G:BEIGE,
              color:m.role==='user'?'white':'#111827',
              boxShadow:'0 1px 3px rgba(0,0,0,0.06)'
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {/* typing indicator */}
        {loading && (
          <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:BDARK,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div>
            <div style={{padding:'12px 16px',borderRadius:'18px 18px 18px 6px',background:BEIGE,display:'flex',gap:5,alignItems:'center'}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:8,height:8,background:G,borderRadius:'50%',animation:'bounce 1s infinite',animationDelay:`${i*0.15}s`}}/>
              ))}
            </div>
          </div>
        )}

        {/* اقتراحات */}
        {messages.length===1 && (
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
            {SUGGESTIONS.map(s=>(
              <button key={s} onClick={()=>send(s)}
                style={{padding:'7px 14px',background:'#faf5ff',border:'1px solid #e9d5ff',borderRadius:100,fontFamily:'inherit',fontSize:12,fontWeight:700,color:'#7c3aed',cursor:'pointer',transition:'all .15s'}}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{display:'flex',gap:10,flexShrink:0}}>
        <input
          style={{flex:1,background:'white',border:`1.5px solid ${BDR}`,borderRadius:14,padding:'12px 16px',fontFamily:'inherit',fontSize:14,outline:'none',color:'#111827',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}
          placeholder="اكتب سؤالك..." value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
          disabled={loading}
        />
        <button onClick={()=>send()} disabled={loading||!input.trim()}
          style={{background:loading||!input.trim()?'#9ca3af':G,color:'white',border:'none',borderRadius:14,padding:'12px 20px',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:loading||!input.trim()?'not-allowed':'pointer',transition:'all .15s',boxShadow:loading||!input.trim()?'none':`0 4px 14px ${G}44`}}>
          {loading?'⏳':'إرسال'}
        </button>
      </div>

      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}
