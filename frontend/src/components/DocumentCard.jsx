import { FileText, CheckCircle2, Trash2 } from 'lucide-react'

export default function DocumentCard({ doc, isSelected, onToggle, onDelete }) {
  return (
    <div
      className={`
        group flex items-center justify-between rounded-xl transition-all duration-200
        ${isSelected
          ? 'bg-brand-primary/10 border border-brand-primary/40 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
          : 'bg-noir-900/50 border border-noir-800 hover:border-zinc-700 hover:bg-noir-800'
        }
      `}
    >
      <button
        type="button"
        onClick={() => onToggle(doc.document_id)}
        className="flex-1 flex items-start gap-3 px-3 py-3 text-left min-w-0"
      >
        <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-brand-primary' : 'text-zinc-500'}`}>
          {isSelected ? <CheckCircle2 size={16} /> : <FileText size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate ${isSelected ? 'text-zinc-50' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
            {doc.filename}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider">
            {doc.pages} pages
          </p>
        </div>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(doc.document_id)
          }}
          className="p-3 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Delete document"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
