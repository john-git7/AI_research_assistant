import { useState, useEffect, useRef } from 'react'
import { Sparkles, Layers } from 'lucide-react'
import ChatArea from '../components/ChatArea'
import GlassDock from '../components/GlassDock'
import SourceManager from '../components/SourceManager'
import SummaryPanel from '../components/SummaryPanel'
import QuizPanel from '../components/QuizPanel'
import ComparePanel from '../components/ComparePanel'
import ContextHub from '../components/ContextHub'
import { useDocuments } from '../hooks/useDocuments'
import { checkHealth } from '../services/api'
import UploadProgress from '../components/UploadProgress'

export default function Dashboard() {
  const [activeMode, setActiveMode] = useState('chat')
  const [selectedDocIds, setSelectedDocIds] = useState([])
  const [apiStatus, setApiStatus] = useState('checking')
  const [isSourceManagerOpen, setIsSourceManagerOpen] = useState(false)
  const [currentUploadingFile, setCurrentUploadingFile] = useState(null)

  const {
    documents,
    uploading,
    uploadProgress,
    loading: docsLoading,
    fetchDocuments,
    upload,
    removeDoc,
  } = useDocuments()

  useEffect(() => {
    fetchDocuments()
    const interval = setInterval(() => {
      checkHealth()
        .then(() => setApiStatus('ok'))
        .catch(() => setApiStatus('error'))
    }, 5000)
    
    checkHealth()
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'))

    return () => clearInterval(interval)
  }, [])

  const handleToggleDoc = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    )
  }

  const handleUpload = async (file) => {
    setCurrentUploadingFile(file.name)
    try {
      const newDoc = await upload(file)
      if (newDoc?.document_id) {
        setSelectedDocIds((prev) =>
          prev.includes(newDoc.document_id) ? prev : [...prev, newDoc.document_id],
        )
      }
      setTimeout(() => setCurrentUploadingFile(null), 2000)
    } catch {
      setCurrentUploadingFile(null)
    }
  }

  const handleDeleteDoc = async (docId) => {
    try {
      await removeDoc(docId)
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId))
    } catch {
      // error handled in hook
    }
  }

  const fileInputRef = useRef(null)

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col h-screen w-full bg-noir-950 overflow-hidden font-sans">
      {currentUploadingFile && (
        <UploadProgress 
          progress={uploadProgress} 
          filename={currentUploadingFile} 
          status={uploading ? 'uploading' : 'done'}
        />
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        className="hidden"
        accept=".pdf,.txt"
      />
      {/* Premium Header */}
      <header className="h-20 flex items-center justify-between px-8 bg-gradient-to-b from-noir-950 to-transparent z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center shadow-2xl shadow-brand-primary/40 group cursor-pointer hover:scale-105 transition-transform duration-300">
            <Sparkles size={20} className="text-white group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-50 tracking-tight">ResearchAI</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1 h-1 rounded-full ${apiStatus === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                System {apiStatus === 'ok' ? 'Live' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsSourceManagerOpen(true)}
          className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-noir-900/50 backdrop-blur-xl border border-noir-800 hover:border-brand-primary/50 hover:bg-noir-800 transition-all duration-300"
        >
          <div className="relative">
            <Layers size={18} className="text-zinc-400 group-hover:text-brand-primary transition-colors" />
            {selectedDocIds.length > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-primary text-[10px] font-bold text-white flex items-center justify-center border-2 border-noir-950 shadow-lg animate-pulse">
                {selectedDocIds.length}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-50 transition-colors">
            Library
          </span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative optimize-scroll scrollbar-none">
        <div className="w-full max-w-5xl mx-auto px-6 py-8 optimize-gpu">
          {/* Sticky Research Context Hub */}
          <div className="sticky top-0 z-30 pt-2 pb-6 bg-gradient-to-b from-noir-950 via-noir-950/90 to-transparent">
            <ContextHub 
              documents={documents}
              selectedDocIds={selectedDocIds}
              onToggleDoc={handleToggleDoc}
              onUpload={triggerUpload}
            />
          </div>

          <div className="pb-40">
            {activeMode === 'chat' && (
              <ChatArea 
                documents={documents}
                selectedDocIds={selectedDocIds} 
                onToggleDoc={handleToggleDoc}
                onUpload={triggerUpload}
                uploading={uploading}
                uploadProgress={uploadProgress}
              />
            )}
            {activeMode === 'summary' && (
              <SummaryPanel selectedDocIds={selectedDocIds} />
            )}
            {activeMode === 'quiz' && (
              <QuizPanel selectedDocIds={selectedDocIds} />
            )}
            {activeMode === 'compare' && (
              <ComparePanel documents={documents} selectedDocIds={selectedDocIds} />
            )}
          </div>
        </div>
      </main>

      {/* Navigation Dock */}
      <GlassDock 
        activeMode={activeMode} 
        onModeChange={setActiveMode} 
      />

      {/* Overlay Source Manager */}
      {isSourceManagerOpen && (
        <SourceManager
          documents={documents}
          selectedDocIds={selectedDocIds}
          onToggleDoc={handleToggleDoc}
          onUpload={handleUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onRefresh={fetchDocuments}
          loading={docsLoading}
          onDeleteDoc={handleDeleteDoc}
          onClose={() => setIsSourceManagerOpen(false)}
        />
      )}
    </div>
  )
}
