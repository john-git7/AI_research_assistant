/**
 * SummaryPanel — summary type selector and rendered output with sources.
 */
import { useState } from 'react'
import { Loader2, FileText, AlertCircle, AlignLeft, AlignJustify, List } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import CitationCard from './CitationCard'
import { generateSummary } from '../services/api'

const SUMMARY_TYPES = [
  { id: 'concise', label: 'Concise', icon: AlignLeft, description: '2-3 paragraphs' },
  { id: 'detailed', label: 'Detailed', icon: AlignJustify, description: 'Full coverage' },
  { id: 'bullets', label: 'Bullet Points', icon: List, description: '6-12 key points' },
]

export default function SummaryPanel({ selectedDocIds }) {
  const [summaryType, setSummaryType] = useState('concise')
  const [focusTopic, setFocusTopic] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (selectedDocIds.length === 0) {
      setError('Select at least one document from the sidebar.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await generateSummary(selectedDocIds, summaryType, focusTopic || null)
      setResult(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-5 h-full overflow-y-auto">
      <div>
        <h2 className="section-title">Document Summary</h2>

        {/* Summary type selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {SUMMARY_TYPES.map((type) => {
            const Icon = type.icon
            const isActive = summaryType === type.id
            return (
              <button
                key={type.id}
                id={`summary-type-${type.id}`}
                onClick={() => setSummaryType(type.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-150
                  ${isActive
                    ? 'border-brand-500/50 bg-brand-500/10 text-brand-400'
                    : 'border-white/10 bg-surface-100 text-gray-400 hover:border-white/20'
                  }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{type.label}</span>
                <span className="text-xs text-gray-500">{type.description}</span>
              </button>
            )
          })}
        </div>

        {/* Optional focus topic */}
        <div className="mb-4">
          <label htmlFor="summary-topic" className="block text-xs text-gray-400 mb-1.5">
            Focus topic <span className="text-gray-600">(optional)</span>
          </label>
          <input
            id="summary-topic"
            type="text"
            value={focusTopic}
            onChange={(e) => setFocusTopic(e.target.value)}
            placeholder="e.g. climate change, methodology, findings…"
            className="input"
            disabled={loading}
          />
        </div>

        {/* Selected docs info */}
        {selectedDocIds.length > 0 ? (
          <p className="text-xs text-gray-500 mb-4">
            Summarising {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''}.
          </p>
        ) : (
          <p className="text-xs text-amber-400 mb-4">⚠ Select documents from the sidebar first.</p>
        )}

        <button
          id="generate-summary-btn"
          onClick={handleGenerate}
          disabled={loading || selectedDocIds.length === 0}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <FileText size={15} />
              Generate Summary
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-blue capitalize">{result.summary_type}</span>
              <span className="text-xs text-gray-500">summary</span>
            </div>
            <div className="prose prose-sm prose-invert max-w-none text-gray-300 text-sm leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 mb-3">{children}</ul>,
                  li: ({ children }) => <li className="text-gray-300">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-100">{children}</strong>,
                }}
              >
                {result.summary}
              </ReactMarkdown>
            </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Sources ({result.sources.length})</p>
              {result.sources.map((source, i) => (
                <CitationCard key={i} source={source} index={i + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
