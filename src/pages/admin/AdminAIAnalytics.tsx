import { useState, useRef, useEffect } from 'react'
import { aiApi } from '../../api/ai'
import { Send, Bot, User } from 'lucide-react'

const ROSE = '#3A5D36'; const PINK = '#C5963B'; const GOLD = '#C5963B'


interface Message { role: 'user' | 'ai'; content: string }

export default function AdminAIAnalytics() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const prompt = input
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: prompt }])
    setLoading(true)
    try {
      const res = await aiApi.adminAnalytics(prompt)
      setMessages((prev) => [...prev, { role: 'ai', content: res.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Error getting response. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">AI Analytics</h1>
      <div className="flex flex-col"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, height: 'calc(100vh - 200px)' }}>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(233,30,140,0.07)', border: '1px solid rgba(233,30,140,0.12)' }}>
                <Bot className="h-8 w-8" style={{ color: GOLD }} />
              </div>
              <p className="text-white font-semibold mb-2">Ask me anything about your business</p>
              <p className="text-sm text-gray-600">e.g. "What's my best-selling product?" or "Show me revenue trend"</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                  style={{ background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.18)' }}>
                  <Bot className="h-4 w-4" style={{ color: GOLD }} />
                </div>
              )}
              <div className="max-w-2xl px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap"
                style={msg.role === 'user'
                  ? { background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, color: '#000', borderBottomRightRadius: 4 }
                  : { background: 'rgba(255,255,255,0.05)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 }
                }>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-gray-800">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                style={{ background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.18)' }}>
                <Bot className="h-4 w-4" style={{ color: GOLD }} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: `${GOLD} transparent transparent transparent` }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <input
            className="dark-input flex-1"
            placeholder="Ask about your business..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button onClick={sendMessage} disabled={loading}
            className="px-4 py-2.5 rounded-xl text-black font-black disabled:opacity-60 flex items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
