/**
 * ChatArea — Q&A message thread with citation display.
 * Standard request/response UX (no streaming).
 */
import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, AlertCircle, Info } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import CitationCard from './CitationCard'
import { askQuestion } from '../services/api'

export default function ChatArea({ selectedDocIds }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const question = input.trim()
    if (!question || loading) return

    setInput('')
    setError(null)

    const userMsg = { role: 'user', content: question, id: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await askQuestion(question, selectedDocIds)
      const { answer, sources } = res.data
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: answer, sources, id: Date.now() + 1 },
      ])
    } catch (err) {
      setError(err.message)
      setMessages((prev) => [
        ...prev,
        { role: 'error', content: err.message, sources: [], id: Date.now() + 1 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* No documents warning */}
      {selectedDocIds.length === 0 && (
        <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-400">
          <Info size={13} />
          No documents selected — answers will search across all uploaded documents.
        </div>
      )}

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/15 flex items-center justify-center mb-4">
              <Bot size={28} className="text-brand-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-300 mb-2">Ask anything</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              Ask questions about your uploaded documents. Answers include page citations.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                ${msg.role === 'user'
                  ? 'bg-brand-500'
                  : msg.role === 'error'
                  ? 'bg-red-500/20'
                  : 'bg-surface-300'
                }`}
            >
              {msg.role === 'user'
                ? <User size={14} className="text-white" />
                : msg.role === 'error'
                ? <AlertCircle size={14} className="text-red-400" />
                : <Bot size={14} className="text-brand-400" />
              }
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-2 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-sm'
                    : msg.role === 'error'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-tl-sm'
                    : 'bg-surface-100 text-gray-200 rounded-tl-sm'
                  }`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-100">{children}</strong>,
                      code: ({ children }) => <code className="bg-surface-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>

              {/* Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="w-full space-y-1.5">
                  <p className="text-xs text-gray-500 font-medium">Sources</p>
                  {msg.sources.map((source, i) => (
                    <CitationCard key={i} source={source} index={i + 1} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-300 flex items-center justify-center">
              <Bot size={14} className="text-brand-400" />
            </div>
            <div className="px-4 py-3 bg-surface-100 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2 size={14} className="text-brand-400 animate-spin" />
              <span className="text-sm text-gray-400">Retrieving and generating answer…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 md:px-4 py-4 border-t border-white/5">
        <div className="flex gap-2 items-end">
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents…"
            rows={1}
            className="input flex-1 resize-none min-h-[42px] max-h-32 py-2.5"
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`
            }}
            disabled={loading}
          />
          <button
            id="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary h-[42px] px-3"
            title="Send message (Enter)"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
