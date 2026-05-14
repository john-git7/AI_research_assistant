import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText, ExternalLink } from 'lucide-react'

export default function CitationAccordion({ sources }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 hover:text-brand-primary transition-colors uppercase tracking-widest mb-2"
      >
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Sources ({sources.length})
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
          {sources.map((source, i) => (
            <div
              key={i}
              className="group p-3 rounded-xl bg-noir-950 border border-noir-800 hover:border-zinc-700 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={12} className="text-zinc-500 flex-shrink-0" />
                  <span className="text-[10px] font-medium text-zinc-400 truncate">
                    {source.document}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-600 bg-noir-900 px-1.5 py-0.5 rounded">
                  p.{source.page}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 italic group-hover:text-zinc-400 transition-colors">
                "{source.chunk}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
