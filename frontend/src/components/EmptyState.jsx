import { Sparkles, Plus } from 'lucide-react'

export default function EmptyState({ onSelectSuggestion, onUpload }) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center px-6 animate-fade-in">
      
      <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center mb-8 border border-brand-primary/20 shadow-2xl shadow-brand-primary/5">
        <Sparkles size={32} className="text-brand-primary" />
      </div>
      
      <h1 className="hero-title mb-4">ResearchAI</h1>
      <p className="text-lg text-zinc-400 mb-12 leading-relaxed">
        Understand documents faster with AI-powered research. Ask questions, generate summaries, or compare files in one conversation.
      </p>

      <div className="w-full max-w-sm">
        <button
          onClick={onUpload}
          className="w-full group relative flex flex-col items-center justify-center py-10 rounded-3xl bg-noir-900 border border-noir-800 hover:border-brand-primary/50 hover:bg-noir-800 transition-all duration-300"
        >
          <div className="mb-4 p-4 rounded-2xl bg-noir-800 border border-noir-700 group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 transition-all group-hover:scale-110">
            <Plus size={24} className="text-zinc-500 group-hover:text-brand-primary" />
          </div>
          <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-50 tracking-wider uppercase">
            Upload Document
          </span>
          <p className="text-xs text-zinc-600 mt-2">
            PDF or TXT up to 50MB
          </p>
        </button>
      </div>
    </div>
  )
}
