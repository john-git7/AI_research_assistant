/**
 * Sidebar — document list, upload zone, and navigation actions.
 */
import { useEffect } from 'react'
import { FileText, Trash2, BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react'
import UploadZone from './UploadZone'

export default function Sidebar({
  documents,
  selectedDocIds,
  onToggleDoc,
  onUpload,
  uploading,
  uploadProgress,
  uploadError,
  onRefresh,
  loading,
}) {
  return (
    <aside className="flex flex-col h-full bg-surface-50 border-r border-white/5 w-72 flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <BookOpen size={15} className="text-white" />
          </div>
          <h1 className="text-sm font-bold text-gray-100">ResearchAI</h1>
        </div>
        <p className="text-xs text-gray-500 pl-9">RAG-powered document assistant</p>
      </div>

      {/* Upload Zone */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Upload Document
        </p>
        <UploadZone
          onUpload={onUpload}
          uploading={uploading}
          progress={uploadProgress}
          error={uploadError}
        />
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Documents ({documents.length})
          </p>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-ghost p-1 rounded-md"
            title="Refresh document list"
            id="refresh-documents-btn"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={28} className="text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No documents yet.</p>
            <p className="text-xs text-gray-600">Upload a PDF or TXT file above.</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {documents.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.document_id)
              return (
                <li key={doc.document_id}>
                  <button
                    id={`doc-${doc.document_id}`}
                    onClick={() => onToggleDoc(doc.document_id)}
                    className={`
                      w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left
                      transition-all duration-150 group
                      ${isSelected
                        ? 'bg-brand-500/15 border border-brand-500/30'
                        : 'bg-surface-100 border border-transparent hover:border-white/10'
                      }
                    `}
                  >
                    <div className={`flex-shrink-0 mt-0.5 ${isSelected ? 'text-brand-400' : 'text-gray-500'}`}>
                      {isSelected
                        ? <CheckCircle2 size={14} />
                        : <FileText size={14} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isSelected ? 'text-brand-300' : 'text-gray-300'}`}>
                        {doc.filename}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {doc.pages != null ? `${doc.pages} pages` : ''}
                        {doc.pages != null && doc.chunks_created != null ? ' · ' : ''}
                        {doc.chunks_created != null ? `${doc.chunks_created} chunks` : ''}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {selectedDocIds.length > 0 && (
        <div className="px-4 py-3 border-t border-white/5">
          <p className="text-xs text-brand-400 font-medium">
            {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} selected
          </p>
          <p className="text-xs text-gray-600">Click a document to deselect</p>
        </div>
      )}
    </aside>
  )
}
