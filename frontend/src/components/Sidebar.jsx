import { Sparkles, RefreshCw, X, Activity, Trash2, Settings, Shield } from 'lucide-react'
import DocumentCard from './DocumentCard'
import { useRef } from 'react'

export default function Sidebar({
  documents,
  selectedDocIds,
  onToggleDoc,
  onUpload,
  uploading,
  uploadProgress,
  onRefresh,
  loading,
  onDeleteDoc,
  onClose,
  apiStatus,
}) {
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      onUpload(e.target.files[0])
    }
  }

  return (
    <aside className="flex flex-col h-full bg-noir-950 border-r border-noir-800 w-[280px] flex-shrink-0 relative">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-semibold text-zinc-50 tracking-tight">ResearchAI</h1>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-50 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        <p className="text-[11px] text-zinc-500 uppercase tracking-[0.2em] font-medium ml-10">
          Intelligent Research
        </p>
      </div>

      {/* Primary Action: Upload */}
      <div className="px-6 mb-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.txt"
        />
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="w-full group relative flex flex-col items-center justify-center py-6 rounded-2xl bg-noir-900 border border-noir-800 hover:border-brand-primary/50 hover:bg-noir-800 transition-all duration-300"
        >
          <div className="mb-2 p-2 rounded-xl bg-noir-800 border border-noir-700 group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 transition-colors">
            <RefreshCw size={18} className={`text-zinc-500 group-hover:text-brand-primary ${uploading ? 'animate-spin' : ''}`} />
          </div>
          <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-50 tracking-wide">
            {uploading ? `Uploading ${uploadProgress}%` : 'Upload Document'}
          </span>
          {uploading && (
            <div className="absolute bottom-0 left-0 h-1 bg-brand-primary transition-all duration-300 rounded-b-2xl" style={{ width: `${uploadProgress}%` }} />
          )}
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.15em]">
            Files ({documents.length})
          </h2>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.document_id}
              doc={doc}
              isSelected={selectedDocIds.includes(doc.document_id)}
              onToggle={onToggleDoc}
              onDelete={onDeleteDoc}
            />
          ))}
          
          {documents.length === 0 && !loading && (
            <div className="py-12 border-2 border-dashed border-noir-800 rounded-2xl flex flex-col items-center justify-center text-center px-4">
              <p className="text-xs text-zinc-600 leading-relaxed">
                No documents uploaded yet.<br/>Click above to start.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Settings */}
      <div className="px-6 py-6 border-t border-noir-800 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {apiStatus === 'ok' ? 'System Live' : 'System Offline'}
            </span>
          </div>
          <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

