/**
 * CitationCard — collapsible source citation with page and chunk preview.
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText, BookOpen } from 'lucide-react'

export default function CitationCard({ source, index }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-surface-100 hover:bg-surface-200 transition-colors text-left"
        aria-expanded={expanded}
      >
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-mono font-medium">
          {index}
        </span>
        <FileText size={14} className="text-gray-500 flex-shrink-0" />
        <span className="text-xs text-gray-300 font-medium truncate flex-1">
          {source.document}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
          <BookOpen size={11} />
          p.{source.page}
        </span>
        {expanded ? (
          <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-3 py-2.5 bg-surface-50 border-t border-white/5 animate-fade-in">
          <p className="text-xs text-gray-400 font-mono leading-relaxed">
            "{source.chunk}"
          </p>
        </div>
      )}
    </div>
  )
}
