/**
 * Dashboard — main layout with sidebar + tabbed panel area.
 */
import { useState, useEffect } from 'react'
import { MessageSquare, FileText, HelpCircle, GitCompare, Activity } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import SummaryPanel from '../components/SummaryPanel'
import QuizPanel from '../components/QuizPanel'
import ComparePanel from '../components/ComparePanel'
import { useDocuments } from '../hooks/useDocuments'
import { checkHealth } from '../services/api'

const TABS = [
  { id: 'chat', label: 'Ask', icon: MessageSquare },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'compare', label: 'Compare', icon: GitCompare },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chat')
  const [selectedDocIds, setSelectedDocIds] = useState([])
  const [apiStatus, setApiStatus] = useState('checking') // 'ok' | 'error' | 'checking'

  const {
    documents,
    uploading,
    uploadProgress,
    uploadError,
    loading: docsLoading,
    fetchDocuments,
    upload,
    removeDoc,
  } = useDocuments()

  useEffect(() => {
    fetchDocuments()
    checkHealth()
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'))
  }, [])

  const handleToggleDoc = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    )
  }

  const handleUpload = async (file) => {
    try {
      const newDoc = await upload(file)
      // Auto-select newly uploaded document
      if (newDoc?.document_id) {
        setSelectedDocIds((prev) =>
          prev.includes(newDoc.document_id) ? prev : [...prev, newDoc.document_id],
        )
      }
    } catch {
      // error already set in hook
    }
  }

  const handleDeleteDoc = async (docId) => {
    try {
      await removeDoc(docId)
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId))
    } catch {
      // error already handled/logged in hook
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        documents={documents}
        selectedDocIds={selectedDocIds}
        onToggleDoc={handleToggleDoc}
        onUpload={handleUpload}
        uploading={uploading}
        uploadProgress={uploadProgress}
        uploadError={uploadError}
        onRefresh={fetchDocuments}
        loading={docsLoading}
        onDeleteDoc={handleDeleteDoc}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-surface-50 flex-shrink-0">
          {/* Tab navigation */}
          <nav className="flex items-center gap-0.5" role="tablist">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-brand-500/15 text-brand-400'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-surface-200'
                    }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* API status indicator */}
          <div className="flex items-center gap-2">
            <Activity size={13} className={apiStatus === 'ok' ? 'text-emerald-400' : apiStatus === 'error' ? 'text-red-400' : 'text-gray-500 animate-pulse'} />
            <span className="text-xs text-gray-500">
              {apiStatus === 'ok' ? 'API connected' : apiStatus === 'error' ? 'API offline' : 'Connecting…'}
            </span>
          </div>
        </header>

        {/* Panel content */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <ChatArea selectedDocIds={selectedDocIds} />
          )}
          {activeTab === 'summary' && (
            <SummaryPanel selectedDocIds={selectedDocIds} />
          )}
          {activeTab === 'quiz' && (
            <QuizPanel selectedDocIds={selectedDocIds} />
          )}
          {activeTab === 'compare' && (
            <ComparePanel documents={documents} />
          )}
        </main>
      </div>
    </div>
  )
}
