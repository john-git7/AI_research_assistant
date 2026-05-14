import { useState, useEffect } from 'react'
import { HelpCircle, Play, RefreshCw, CheckCircle2 } from 'lucide-react'
import { generateQuiz } from '../services/api'

export default function QuizPanel({ selectedDocIds }) {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

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

  const handleGenerate = async () => {
    if (selectedDocIds.length === 0 || retryAfter > 0) return
    setLoading(true)
    setSubmitted(false)
    setAnswers({})
    try {
      const res = await generateQuiz(selectedDocIds, 5)
      setQuiz(res.data.questions) // Synchronized with QuizResponse schema
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
            <HelpCircle size={32} className="text-brand-primary" />
          </div>
          <h1 className="hero-title mb-4">Knowledge Assessment</h1>
          <p className="text-zinc-400 max-w-md">
            Test your understanding with AI-generated questions based on your research.
          </p>
        </div>

        {!quiz ? (
          <div className="bg-noir-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-12 text-center border-dashed animate-fade-in">
            <button 
              onClick={handleGenerate}
              disabled={loading || selectedDocIds.length === 0 || retryAfter > 0}
              className="group relative px-8 py-4 rounded-2xl bg-brand-primary text-white font-bold text-sm shadow-2xl shadow-brand-primary/20 hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {loading ? <RefreshCw size={18} className="animate-spin" /> : (retryAfter > 0 ? <RefreshCw size={18} className="animate-pulse" /> : <Play size={18} />)}
                {loading ? 'Synthesizing Questions...' : (retryAfter > 0 ? `Quota Cooldown (${retryAfter}s)` : 'Start Knowledge Assessment')}
              </div>
            </button>
            <p className="text-[10px] text-zinc-600 mt-6 uppercase tracking-[0.2em] font-black">
              {retryAfter > 0 ? 'Gemini API Rate Limit Reached' : (selectedDocIds.length === 0 ? 'Selection Required' : `AI will analyze ${selectedDocIds.length} sources`)}
            </p>
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            {quiz.map((q, idx) => (
              <div key={idx} className="bg-noir-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <p className="text-sm font-bold text-zinc-100 mb-6 flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-noir-800 border border-white/5 flex items-center justify-center text-[10px] font-black text-brand-primary shadow-lg">
                    {idx + 1}
                  </span>
                  <span className="mt-1 leading-relaxed">{q.question}</span>
                </p>
                <div className="grid grid-cols-1 gap-3 ml-12">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => !submitted && setAnswers(prev => ({ ...prev, [idx]: oIdx }))}
                      className={`
                        text-left px-5 py-4 rounded-2xl text-xs font-semibold transition-all duration-300 border
                        ${answers[idx] === oIdx 
                          ? 'bg-brand-primary/20 border-brand-primary/40 text-white shadow-lg shadow-brand-primary/5' 
                          : 'bg-noir-800/50 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-noir-800'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${answers[idx] === oIdx ? 'bg-brand-primary animate-pulse' : 'bg-zinc-800'}`} />
                        {opt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
 
            {!submitted && (
              <button 
                onClick={() => setSubmitted(true)}
                className="w-full py-5 rounded-[2rem] bg-zinc-50 text-noir-950 font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-2xl disabled:opacity-30"
                disabled={Object.keys(answers).length < quiz.length}
              >
                Submit Assessment
              </button>
            )}

            {submitted && (
              <div className="bg-brand-primary/10 backdrop-blur-2xl border border-brand-primary/20 rounded-[2.5rem] p-10 text-center animate-slide-up shadow-2xl shadow-brand-primary/10">
                <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-brand-primary" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Assessment Complete</h3>
                <p className="text-sm text-zinc-400 mb-8">AI has analyzed your responses. Ready for another challenge?</p>
                <button onClick={handleGenerate} className="px-8 py-3 rounded-xl bg-noir-800 text-zinc-100 font-bold text-xs border border-white/10 hover:bg-noir-700 transition-all uppercase tracking-widest">
                  Try Another Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
