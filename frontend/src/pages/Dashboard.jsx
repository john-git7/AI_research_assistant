/**
 * Dashboard — main layout with sidebar + tabbed panel area.
 */
import { useState, useEffect } from 'react'
import { MessageSquare, FileText, HelpCircle, GitCompare, Activity, Menu } from 'lucide-react'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
    <div className="flex h-screen overflow-hidden w-full">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Drawer Container */}
          <div className="relative flex flex-col h-full z-10 shadow-2xl">
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
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-full">
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
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden w-full">
        {/* Top bar */}
        <header className="flex items-center justify-between px-3 md:px-4 py-2.5 border-b border-white/5 bg-surface-50 flex-shrink-0 gap-2">
          {/* Left section: Hamburger + Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none min-w-0 py-0.5">
            {/* Hamburger button for mobile */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-200 hover:bg-surface-200 rounded-lg transition-colors flex-shrink-0"
              title="Open sidebar"
              id="open-sidebar-btn"
            >
              <Menu size={18} />
            </button>

            {/* Tab navigation */}
            <nav className="flex items-center gap-1 flex-shrink-0" role="tablist">
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
                    className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-150 whitespace-nowrap
                      ${isActive
                        ? 'bg-brand-500/15 text-brand-400'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-surface-200'
                      }`}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* API status indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0 pl-1">
            <Activity size={13} className={apiStatus === 'ok' ? 'text-emerald-400' : apiStatus === 'error' ? 'text-red-400' : 'text-gray-500 animate-pulse'} />
            <span className="hidden sm:inline text-xs text-gray-500">
              {apiStatus === 'ok' ? 'API connected' : apiStatus === 'error' ? 'API offline' : 'Connecting…'}
            </span>
          </div>
        </header>

        {/* Panel content */}
        <main className="flex-1 overflow-hidden w-full">
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
