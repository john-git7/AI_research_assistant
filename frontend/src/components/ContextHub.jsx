import { FileText, Plus, Trash2, Sparkles } from 'lucide-react'

export default function ContextHub({ 
  documents, 
  selectedDocIds, 
  onToggleDoc, 
  onUpload 
}) {
  const selectedDocs = documents.filter(doc => selectedDocIds.includes(doc.document_id))

  if (selectedDocIds.length === 0) return null

  return (
    <div className="w-full animate-fade-in">
      <div className="bg-noir-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl flex items-center gap-6">
        <div className="flex items-center gap-3 pl-2 border-r border-white/5 pr-6">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <div className="absolute inset-0 bg-brand-primary/40 blur-md rounded-full" />
          </div>
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">
            Context Hub <span className="text-zinc-600 ml-1">({selectedDocIds.length})</span>
          </h3>
        </div>

        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-none py-1">
          {selectedDocs.map(doc => (
            <div 
              key={doc.document_id}
              className="group relative flex items-center gap-2 px-3 py-2 rounded-xl bg-noir-800/40 border border-white/5 hover:border-brand-primary/30 hover:bg-noir-800 transition-all duration-300"
            >
              <FileText size={12} className="text-zinc-500 group-hover:text-brand-primary" />
              <span className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-100 truncate max-w-[120px]">
                {doc.filename}
              </span>
              <button 
                onClick={() => onToggleDoc(doc.document_id)}
                className="ml-1 text-zinc-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pl-4 border-l border-white/5">
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
          >
            <Plus size={12} />
            Add
          </button>
          <button 
            onClick={() => selectedDocIds.forEach(id => onToggleDoc(id))}
            className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors mr-2"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
