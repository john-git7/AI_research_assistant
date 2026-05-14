import { useState, useEffect } from 'react'
import { GitCompare, Sparkles, RefreshCw, FileText, CheckCircle2 } from 'lucide-react'
import { compareDocuments } from '../services/api'
import ReactMarkdown from 'react-markdown'

export default function ComparePanel({ documents, selectedDocIds }) {
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)

  const [retryAfter, setRetryAfter] = useState(0)

  const selectedDocs = documents.filter(doc => selectedDocIds.includes(doc.document_id))

  useEffect(() => {
    let timer
    if (retryAfter > 0) {
      timer = setInterval(() => {
        setRetryAfter(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [retryAfter])

  const handleCompare = async () => {
    if (selectedDocIds.length < 2 || retryAfter > 0) return
    setLoading(true)
    try {
      const res = await compareDocuments(selectedDocIds)
      setComparison(res.data.comparison)
    } catch (err) {
      if (err.retryAfter) {
        setRetryAfter(err.retryAfter)
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col py-12 px-6 animate-fade-in scrollbar-none">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center mb-6 border border-brand-primary/20 shadow-2xl shadow-brand-primary/5">
            <GitCompare size={32} className="text-brand-primary" />
          </div>
          <h1 className="hero-title mb-4">Cross-Document Analysis</h1>
          <p className="text-zinc-400 max-w-md">
            Identify contradictions, consensus, and unique insights across multiple research sources.
          </p>
        </div>

        {!comparison ? (
          <div className="space-y-8">
            <div className="bg-noir-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 text-center border-dashed animate-fade-in">
              <div className="flex justify-center -space-x-4 mb-8">
                {selectedDocs.length > 0 ? (
                  selectedDocs.slice(0, 3).map((doc, i) => (
                    <div key={doc.document_id} className="w-12 h-12 rounded-xl bg-noir-800 border border-noir-700 flex items-center justify-center shadow-2xl" style={{ zIndex: 3 - i }}>
                      <FileText size={20} className="text-brand-primary" />
                    </div>
                  ))
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-noir-800 border border-noir-700 border-dashed flex items-center justify-center">
                    <FileText size={20} className="text-zinc-600" />
                  </div>
                )}
                {selectedDocIds.length > 3 && (
                  <div className="w-12 h-12 rounded-xl bg-noir-800 border border-noir-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                    +{selectedDocIds.length - 3}
                  </div>
                )}
              </div>

              <button 
                onClick={handleCompare}
                disabled={loading || selectedDocIds.length < 2 || retryAfter > 0}
                className="group relative px-10 py-4 rounded-2xl bg-brand-primary text-white font-bold text-sm shadow-2xl shadow-brand-primary/20 hover:scale-105 transition-all duration-300 disabled:opacity-30"
              >
                <div className="flex items-center gap-3">
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : (retryAfter > 0 ? <RefreshCw size={18} className="animate-pulse" /> : <Sparkles size={18} />)}
                  {loading ? 'Analyzing Differences...' : (retryAfter > 0 ? `Quota Cooldown (${retryAfter}s)` : 'Run Comparative Analysis')}
                </div>
              </button>
              
              <p className="text-[10px] text-zinc-600 mt-6 uppercase tracking-[0.2em] font-black">
                {retryAfter > 0 
                  ? 'Gemini API Rate Limit Reached' 
                  : (selectedDocIds.length < 2 
                    ? 'Select at least 2 documents in the context hub' 
                    : `Synthesizing insights from ${selectedDocIds.length} sources`)
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            <div className="bg-noir-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-slide-up">
               <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                     <GitCompare size={16} className="text-brand-primary" />
                   </div>
                   <h3 className="text-xs font-black text-zinc-100 uppercase tracking-[0.2em]">Comparative Report</h3>
                 </div>
                 <button onClick={() => setComparison(null)} className="px-4 py-2 rounded-xl bg-noir-800 text-[10px] font-black text-zinc-500 hover:text-zinc-200 transition-all uppercase tracking-widest border border-white/5">
                    Reset Analysis
                 </button>
               </div>
               
               <div className="prose prose-invert max-w-none">
                 <ReactMarkdown
                   components={{
                     p: ({ children }) => <p className="text-zinc-300 leading-relaxed mb-6 last:mb-0 text-sm">{children}</p>,
                     ul: ({ children }) => <ul className="list-disc list-inside space-y-3 mb-6 text-sm text-zinc-400">{children}</ul>,
                     li: ({ children }) => <li className="marker:text-brand-primary">{children}</li>,
                     strong: ({ children }) => <strong className="font-bold text-zinc-50">{children}</strong>,
                     h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-4">{children}</h1>,
                     h2: ({ children }) => <h2 className="text-md font-bold text-white mb-3 mt-8 first:mt-0 border-l-2 border-brand-primary pl-4">{children}</h2>,
                     h3: ({ children }) => <h3 className="text-sm font-bold text-zinc-200 mb-2 mt-6">{children}</h3>,
                   }}
                 >
                   {comparison}
                 </ReactMarkdown>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
