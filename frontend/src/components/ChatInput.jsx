import { Send, Loader2 } from 'lucide-react'

export default function ChatInput({ input, setInput, onSend, loading, retryAfter }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="fixed bottom-24 left-0 right-0 px-4 pt-4 bg-gradient-to-t from-noir-950 via-noir-950/90 to-transparent">
      <div className="max-w-4xl mx-auto relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-hover rounded-[2rem] opacity-0 group-focus-within:opacity-10 transition duration-500 blur"></div>
        
        <div className="relative flex items-end gap-2 bg-noir-900/80 backdrop-blur-2xl border border-noir-800 focus-within:border-brand-primary/50 rounded-[2rem] p-2 transition-all duration-300">
          <div className="w-4" /> {/* Spacer */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={retryAfter > 0 ? `API Cooldown: ${retryAfter}s` : "Ask anything about your documents..."}
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-50 placeholder-zinc-600 text-sm py-3 px-1 resize-none min-h-[44px] max-h-48"
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 192)}px`
            }}
            disabled={loading || retryAfter > 0}
          />

          <button
            onClick={onSend}
            disabled={!input.trim() || loading || retryAfter > 0}
            className={`
              p-3 rounded-2xl transition-all duration-300
              ${input.trim() && !loading && retryAfter === 0
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-100 hover:scale-105'
                : 'bg-noir-800 text-zinc-700 scale-90 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (retryAfter > 0 ? (
              <div className="text-[10px] font-black text-brand-primary animate-pulse">{retryAfter}s</div>
            ) : (
              <Send size={20} />
            ))}
          </button>
        </div>
        
        <div className="mt-3 flex justify-center gap-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            {retryAfter > 0 ? 'Gemini API Rate Limit Reached - Waiting for cooldown' : 'Press Enter to send · Shift+Enter for new line'}
          </p>
        </div>
      </div>
    </div>
  )
}
