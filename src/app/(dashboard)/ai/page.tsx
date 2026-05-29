'use client'
import { useState, useRef, useEffect } from 'react'

export default function AIPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = {role:'user', content:input, ts:Date.now()}
    setMessages(p=>[...p, userMsg]); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:input,messages})})
      const d = await res.json()
      setMessages(p=>[...p, {role:'assistant', content:d.response||d.error||'خطأ', ts:Date.now()}])
    } catch { setMessages(p=>[...p, {role:'assistant', content:'حدث خطأ', ts:Date.now()}]) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="page-title mb-4">🤖 المساعد الذكي</h1>
      <div className="flex-1 card overflow-y-auto space-y-3 mb-3 scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-5xl mb-3">🤖</div>
            <p>اسألني أي شيء عن مراحك</p>
            <div className="mt-4 space-y-2 text-sm">
              {['كيف أحسب الولادة المتوقعة؟','ما هي مراحل نمو البهم؟','نصائح لتحسين الإنتاج'].map(q=>(
                <button key={q} onClick={()=>setInput(q)} className="block w-full text-right bg-beige-primary hover:bg-beige-dark rounded-xl px-3 py-2 text-gray-600">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m,i) => (
          <div key={i} className={`flex gap-2 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className="w-8 h-8 rounded-full bg-beige-dark flex items-center justify-center text-sm">{m.role==='user'?'👤':'🤖'}</div>
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm ${m.role==='user'?'bg-green-primary text-white':'bg-beige-primary'}`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-beige-dark flex items-center justify-center">🤖</div>
            <div className="bg-beige-primary px-3 py-3 rounded-2xl flex gap-1">
              {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-green-primary rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="اكتب سؤالك..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/>
        <button onClick={send} disabled={loading||!input.trim()} className="btn-primary px-5">إرسال</button>
      </div>
    </div>
  )
}
