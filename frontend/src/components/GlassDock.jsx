import { MessageSquare, FileText, HelpCircle, GitCompare } from 'lucide-react'

const MODES = [
  { id: 'chat', label: 'Ask', icon: MessageSquare },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'compare', label: 'Compare', icon: GitCompare },
]

export default function GlassDock({ activeMode, onModeChange }) {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-1.5 px-2 py-2 bg-noir-900/40 backdrop-blur-3xl border border-noir-700/50 rounded-[2rem] shadow-2xl shadow-black/40 relative">
        {/* Active Background Glow */}
        <div className="absolute inset-0 rounded-[2rem] shadow-[0_0_25px_rgba(168,85,247,0.1)] pointer-events-none" />
        
        {MODES.map((mode) => {
          const isActive = activeMode === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`
                group relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300
                ${isActive 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-noir-800/60'
                }
              `}
            >
              <mode.icon size={18} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`} />
              {isActive && (
                <span className="text-xs font-semibold tracking-wide animate-fade-in">
                  {mode.label}
                </span>
              )}
              {!isActive && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-noir-800 border border-noir-700 rounded text-[10px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
                  {mode.label}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
