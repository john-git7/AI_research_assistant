import { useState, useEffect } from 'react'
import { FileText, Sparkles, RefreshCw, ChevronRight } from 'lucide-react'
import { summarizeDocument } from '../services/api'
import ReactMarkdown from 'react-markdown'

export default function SummaryPanel({ selectedDocIds }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)

  useEffect(() => {
    let timer
    if (retryAfter > 0) {
      timer = setInterval(() => {
        setRetryAfter(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [retryAfter])

  const handleSummarize = async () => {
    if (selectedDocIds.length === 0 || retryAfter > 0) return
    setLoading(true)
    try {
      // Pass the entire array, not just the first ID
      const res = await summarizeDocument(selectedDocIds)
      setSummary(res.data.summary)
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
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center mb-6 border border-brand-primary/20 shadow-2xl shadow-brand-primary/5">
            <FileText size={32} className="text-brand-primary" />
          </div>
          <h1 className="hero-title mb-4">Document Synthesis</h1>
          <p className="text-zinc-400 max-w-md">
            Generate high-level overviews and key takeaways from your research sources.
          </p>
        </div>

        {selectedDocIds.length === 0 ? (
          <div className="bg-noir-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-12 text-center animate-fade-in">
             <div className="w-16 h-16 rounded-2xl bg-noir-800 flex items-center justify-center mx-auto mb-6 border border-white/5">
               <FileText size={24} className="text-zinc-600" />
             </div>
             <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">No Context Available</p>
             <p className="text-xs text-zinc-600 mb-8 max-w-[240px] mx-auto">Select documents in the library to enable AI synthesis.</p>
          </div>
        ) : !summary ? (
          <div className="bg-noir-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-12 text-center border-dashed animate-fade-in">
            <button 
              onClick={handleSummarize}
              disabled={loading || retryAfter > 0}
              className="group relative px-8 py-4 rounded-2xl bg-brand-primary text-white font-bold text-sm shadow-2xl shadow-brand-primary/20 hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {loading ? <RefreshCw size={18} className="animate-spin" /> : (retryAfter > 0 ? <RefreshCw size={18} className="animate-pulse" /> : <Sparkles size={18} />)}
                {loading ? 'Synthesizing...' : (retryAfter > 0 ? `Quota Cooldown (${retryAfter}s)` : 'Generate Research Summary')}
              </div>
            </button>
            <p className="text-[10px] text-zinc-600 mt-6 uppercase tracking-[0.2em] font-black">
              {retryAfter > 0 ? 'Gemini API Rate Limit Reached' : `AI will synthesize ${selectedDocIds.length} sources`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-noir-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-slide-up">
               <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                     <Sparkles size={16} className="text-brand-primary" />
                   </div>
                   <h3 className="text-xs font-black text-zinc-100 uppercase tracking-[0.2em]">Research Synthesis</h3>
                 </div>
                 <button onClick={handleSummarize} className="w-10 h-10 rounded-xl bg-noir-800 flex items-center justify-center text-zinc-500 hover:text-brand-primary transition-all">
                    <RefreshCw size={16} />
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
                     h2: ({ children }) => <h2 className="text-md font-bold text-white mb-3 mt-8 first:mt-0">{children}</h2>,
                   }}
                 >
                   {summary}
                 </ReactMarkdown>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

