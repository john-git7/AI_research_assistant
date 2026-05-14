import { X, RefreshCw, Layers } from 'lucide-react'
import DocumentCard from './DocumentCard'

export default function SourceManager({ 
  documents, 
  selectedDocIds, 
  onToggleDoc, 
  onUpload, 
  uploading, 
  uploadProgress, 
  onRefresh, 
  loading, 
  onDeleteDoc, 
  onClose 
}) {

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xl" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-noir-900 border border-noir-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-8 py-6 border-b border-noir-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-noir-800 flex items-center justify-center border border-noir-700">
              <Layers size={20} className="text-brand-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">Sources</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mt-0.5">
                Manage Research Context
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-50 hover:bg-noir-800 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>



        <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-none">
          {/* Document List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                Your Library ({documents.length})
              </h3>
              <button 
                onClick={onRefresh}
                disabled={loading}
                className="text-zinc-600 hover:text-brand-primary transition-colors flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.document_id}
                  doc={doc}
                  isSelected={selectedDocIds.includes(doc.document_id)}
                  onToggle={onToggleDoc}
                  onDelete={onDeleteDoc}
                />
              ))}
            </div>

            {documents.length === 0 && !loading && (
              <div className="py-12 text-center">
                <p className="text-sm text-zinc-600 italic">Your library is empty. Upload a file above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-noir-950 border-t border-noir-800 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {selectedDocIds.length} sources selected for active context
          </p>
          <button 
            onClick={onClose}
            className="btn-primary"
          >
            Apply Context
          </button>
        </div>
      </div>
    </div>
  )
}
