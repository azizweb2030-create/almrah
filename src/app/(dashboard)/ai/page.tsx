'use client'
import { useState, useRef, useEffect } from 'react'

// اقتراحات مطابقة للكود الأصلي
const SUGGESTIONS = [
  'كيف أضيف ولادة؟',
  'كيف أقرأ التقارير؟',
  'كيف أسجل نفوق؟',
  'كيف أفعّل شبك التلقيح؟',
  'ما معنى رخل ومفطوم؟',
  'كيف أعزل حيوان مريض؟',
]

const WELCOME_MSG = 'مرحباً بك 👋\n\nأنا مساعد منصة **المراح** الذكي.\n\nيمكنك سؤالي عن أي شيء يخص البرنامج وسأجيبك بشكل واضح وبسيط 😊'

export default function AIPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: WELCOME_MSG, ts: Date.now() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenInfo, setTokenInfo] = useState<{used:number,limit:number}|null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetch('/api/ai/usage').then(r=>r.json()).then(j=>{
      if (j.data) setTokenInfo({ used: j.data.ai_tokens_used||0, limit: j.data.ai_tokens_limit||5000 })
    }).catch(()=>{})
  }, [])

  async function send(msg?: string) {
    const text = (msg || input).trim()
    if (!text || loading) return
    const userMsg = { role: 'user', content: text, ts: Date.now() }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, messages: messages.map(m=>({role:m.role,content:m.content})) })
      })
      const d = await res.json()
      setMessages(p => [...p, {
        role: 'assistant',
        content: d.response || d.error || 'حدث خطأ، حاول مرة أخرى',
        ts: Date.now()
      }])
      if (d.tokens && tokenInfo) {
        setTokenInfo(p => p ? ({ ...p, used: p.used + d.tokens }) : p)
      }
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'حدث خطأ، تحقق من الاتصال', ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  const pct = tokenInfo ? Math.min(100, Math.round((tokenInfo.used/tokenInfo.limit)*100)) : 0

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-3">
        <h1 className="page-title">🤖 المساعد الذكي</h1>
        {tokenInfo && (
          <div className="text-xs text-gray-400 text-left">
            <span>{tokenInfo.used.toLocaleString()} / {tokenInfo.limit.toLocaleString()}</span>
            <div className="w-16 h-1 bg-beige-border rounded-full mt-0.5 overflow-hidden">
              <div className={`h-full rounded-full ${pct>80?'bg-red-400':'bg-green-primary'}`} style={{width:`${pct}%`}}/>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 card overflow-y-auto space-y-3 mb-3 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className="w-8 h-8 rounded-full bg-beige-dark flex items-center justify-center text-sm flex-shrink-0">
              {m.role==='user'?'👤':'🤖'}
            </div>
            <div className={`max-w-xs lg:max-w-md px-3 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${m.role==='user'?'bg-green-primary text-white':'bg-beige-primary text-gray-800'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-beige-dark flex items-center justify-center">🤖</div>
            <div className="bg-beige-primary px-4 py-3 rounded-2xl flex gap-1">
              {[0,1,2].map(i=>(
                <div key={i} className="w-2 h-2 bg-green-primary rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>
              ))}
            </div>
          </div>
        )}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-xs font-bold hover:bg-purple-100 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="اكتب سؤالك..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-primary px-5">
          {loading ? '⏳' : 'إرسال'}
        </button>
      </div>
    </div>
  )
}
