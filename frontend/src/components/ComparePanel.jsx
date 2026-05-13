/**
 * ComparePanel — two-document selector + comparison results table.
 */
import { useState } from 'react'
import { Loader2, GitCompare, AlertCircle, CheckCircle, XCircle, Layers, AlertTriangle } from 'lucide-react'
import { compareDocuments } from '../services/api'

function ResultSection({ title, items, icon: Icon, colorClass }) {
  if (!items || items.length === 0) return null
  return (
    <div className="card">
      <div className={`flex items-center gap-2 mb-3 ${colorClass}`}>
        <Icon size={15} />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto badge bg-white/5 text-gray-400">{items.length}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
            <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${colorClass.includes('emerald') ? 'bg-emerald-400' : colorClass.includes('red') ? 'bg-red-400' : colorClass.includes('amber') ? 'bg-amber-400' : 'bg-brand-400'}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ComparePanel({ documents }) {
  const [docA, setDocA] = useState('')
  const [docB, setDocB] = useState('')
  const [focusTopic, setFocusTopic] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCompare = async () => {
    if (!docA || !docB) {
      setError('Select two different documents to compare.')
      return
    }
    if (docA === docB) {
      setError('Please select two different documents.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await compareDocuments(docA, docB, focusTopic || null)
      setResult(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const docOptions = documents.map((d) => (
    <option key={d.document_id} value={d.document_id}>
      {d.filename}
    </option>
  ))

  return (
    <div className="p-4 space-y-5 h-full overflow-y-auto">
      <div>
        <h2 className="section-title">Compare Documents</h2>

        {documents.length < 2 ? (
          <div className="card text-center py-8">
            <GitCompare size={28} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Upload at least 2 documents to compare.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label htmlFor="compare-doc-a" className="block text-xs text-gray-400 mb-1.5">
                  Document A
                </label>
                <select
                  id="compare-doc-a"
                  value={docA}
                  onChange={(e) => setDocA(e.target.value)}
                  className="input"
                  disabled={loading}
                >
                  <option value="">Select document…</option>
                  {docOptions}
                </select>
              </div>
              <div>
                <label htmlFor="compare-doc-b" className="block text-xs text-gray-400 mb-1.5">
                  Document B
                </label>
                <select
                  id="compare-doc-b"
                  value={docB}
                  onChange={(e) => setDocB(e.target.value)}
                  className="input"
                  disabled={loading}
                >
                  <option value="">Select document…</option>
                  {docOptions}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="compare-topic" className="block text-xs text-gray-400 mb-1.5">
                Focus topic <span className="text-gray-600">(optional)</span>
              </label>
              <input
                id="compare-topic"
                type="text"
                value={focusTopic}
                onChange={(e) => setFocusTopic(e.target.value)}
                placeholder="e.g. methodology, results…"
                className="input"
                disabled={loading}
              />
            </div>

            <button
              id="compare-btn"
              onClick={handleCompare}
              disabled={loading || !docA || !docB || docA === docB}
              className="btn-primary w-full justify-center"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" />Comparing…</>
              ) : (
                <><GitCompare size={15} />Compare Documents</>
              )}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-3 animate-slide-up">
          {/* Summary card */}
          <div className="card border-brand-500/20">
            <p className="text-xs text-gray-400 mb-1 font-medium">Comparison Summary</p>
            <p className="text-sm text-gray-200 leading-relaxed">{result.summary}</p>
            <div className="divider" />
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="truncate">📄 {result.document_a}</span>
              <span className="text-gray-600">vs</span>
              <span className="truncate">📄 {result.document_b}</span>
            </div>
          </div>

          <ResultSection
            title="Similarities"
            items={result.similarities}
            icon={CheckCircle}
            colorClass="text-emerald-400"
          />
          <ResultSection
            title="Differences"
            items={result.differences}
            icon={XCircle}
            colorClass="text-red-400"
          />
          <ResultSection
            title="Topic Overlap"
            items={result.topic_overlap}
            icon={Layers}
            colorClass="text-brand-400"
          />
          <ResultSection
            title="Contradictions"
            items={result.contradictions}
            icon={AlertTriangle}
            colorClass="text-amber-400"
          />
        </div>
      )}
    </div>
  )
}
