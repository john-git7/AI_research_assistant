import { useState, useRef, useEffect } from 'react'
import { askQuestion } from '../services/api'
import { Plus, FileText, X, Sparkles, Trash2 } from 'lucide-react'
import EmptyState from './EmptyState'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'

export default function ChatArea({ 
  documents, 
  selectedDocIds, 
  onToggleDoc,
  onUpload,
  uploading,
  uploadProgress
}) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)
  const bottomRef = useRef(null)

  useEffect(() => {
    let timer
    if (retryAfter > 0) {
      timer = setInterval(() => {
        setRetryAfter(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [retryAfter])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text = input) => {
    if (!text.trim() || loading || retryAfter > 0) return
    
    const userMsg = { id: Date.now(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await askQuestion(text, selectedDocIds)
      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: response.data.answer,
        sources: response.data.sources 
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      if (error.retryAfter) {
        setRetryAfter(error.retryAfter)
      }
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (text) => {
    handleSend(text)
  }

  return (
    <div className="flex flex-col h-full bg-noir-950 relative animate-fade-in">
      <div className="flex-1 px-4 pt-8 pb-20">
        {(messages.length === 0 && selectedDocIds.length === 0) ? (
          <EmptyState 
            onSelectSuggestion={handleSuggestion} 
            onUpload={onUpload}
          />
        ) : (
          <div className="max-w-4xl mx-auto space-y-10">
            {messages.length === 0 && selectedDocIds.length > 0 && (
              <div className="text-center py-32 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-primary/5">
                   <Sparkles size={28} className="text-brand-primary" />
                </div>
                <h3 className="hero-title text-2xl mb-3">Context Synthesized</h3>
                <p className="text-zinc-500 max-w-sm mx-auto">Your research sources are active. Ask anything to begin extraction.</p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
          </div>
        )}
        <div ref={bottomRef} className="h-20" />
      </div>

      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-40">
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          loading={loading}
          retryAfter={retryAfter}
        />
      </div>
    </div>
  )
}
