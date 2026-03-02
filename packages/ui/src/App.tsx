import { useState, useRef, useEffect } from 'react'
import './App.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  debug?: unknown
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [debug, setDebug] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async () => {
    const q = input.trim()
    if (!q || loading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: q,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const placeholderId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: 'assistant', content: '...' },
    ])

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, debug }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                id: m.id,
                role: 'assistant' as const,
                content: data.text,
                debug: data.debug,
              }
            : m
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                id: m.id,
                role: 'assistant' as const,
                content: `Error: ${message}`,
                debug: debug ? { error: message } : undefined,
              }
            : m
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const inConversation = messages.length > 0

  return (
    <div className="app">
      {inConversation ? (
        <>
          <header className="top-bar">
            <h1 className="title">Kol HaTorah</h1>
            <div className="top-actions">
              <label className="debug-toggle">
                <input
                  type="checkbox"
                  checked={debug}
                  onChange={(e) => setDebug(e.target.checked)}
                />
                <span>Debug</span>
              </label>
              <button
                type="button"
                className="new-chat-btn"
                onClick={() => setMessages([])}
              >
                New chat
              </button>
            </div>
          </header>

          <div className="messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`message message-${m.role}`}
              >
                <div className="bubble">
                  <div
                    className="content"
                    style={{
                      direction: 'rtl',
                      unicodeBidi: 'plaintext',
                      textAlign: m.role === 'user' ? 'right' : 'right',
                    }}
                  >
                    {m.content}
                  </div>
                  {debug && m.debug != null && (
                    <details className="debug-details">
                      <summary>Debug</summary>
                      <pre>{JSON.stringify(m.debug, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="composer">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="שאילתה..."
              disabled={loading}
              rows={2}
              style={{
                direction: 'rtl',
                unicodeBidi: 'plaintext',
                textAlign: 'right',
              }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <div className="landing">
          <h1 className="landing-title">Kol HaTorah</h1>
          <p className="landing-subtitle">חפש בתנ"ך, במשנה ובמקורות</p>
          <div className="search-bar">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="שאילתה..."
              rows={2}
              style={{
                direction: 'rtl',
                unicodeBidi: 'plaintext',
                textAlign: 'right',
              }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
