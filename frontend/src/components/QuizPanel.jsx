/**
 * QuizPanel — MCQ generation and interactive answer-reveal cards.
 */
import { useState } from 'react'
import { Loader2, HelpCircle, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { generateQuiz } from '../services/api'

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard']
const DIFFICULTY_COLORS = {
  easy: 'badge-green',
  medium: 'badge-yellow',
  hard: 'badge-red',
}

function QuizCard({ question, index }) {
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState(null)

  const isCorrect = selected === question.answer

  return (
    <div className="card space-y-3 animate-slide-up">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-mono font-bold">
          {index}
        </span>
        <p className="text-sm text-gray-200 font-medium leading-snug">{question.question}</p>
      </div>

      <div className="space-y-2 pl-9">
        {question.options.map((option, i) => {
          const isAnswer = option === question.answer
          const isSelected = option === selected

          let optionClass = 'border-white/10 bg-surface-100 text-gray-300 hover:border-white/20'
          if (revealed || selected) {
            if (isAnswer) optionClass = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
            else if (isSelected && !isAnswer) optionClass = 'border-red-500/40 bg-red-500/10 text-red-400'
            else optionClass = 'border-white/5 bg-surface-50 text-gray-500'
          }

          return (
            <button
              key={i}
              id={`quiz-${index}-option-${i}`}
              onClick={() => {
                if (!revealed && !selected) {
                  setSelected(option)
                  setRevealed(true)
                }
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs text-left transition-all duration-150 ${optionClass}`}
              disabled={revealed}
            >
              {revealed && isAnswer && <CheckCircle2 size={13} className="flex-shrink-0" />}
              {revealed && isSelected && !isAnswer && <XCircle size={13} className="flex-shrink-0" />}
              {(!revealed || (!isAnswer && !isSelected)) && (
                <span className="w-4 h-4 flex-shrink-0" />
              )}
              {option}
            </button>
          )
        })}
      </div>

      {/* Reveal answer button */}
      {!revealed && !selected && (
        <button
          id={`reveal-answer-${index}`}
          onClick={() => setRevealed(true)}
          className="btn-ghost text-xs pl-9"
        >
          <ChevronDown size={13} />
          Reveal answer
        </button>
      )}

      {/* Explanation */}
      {revealed && question.explanation && (
        <div className="pl-9 animate-fade-in">
          <div className="p-2.5 bg-surface-200 rounded-lg border border-white/5">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-medium text-brand-400">Explanation: </span>
              {question.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuizPanel({ selectedDocIds }) {
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const [topic, setTopic] = useState('')
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
      const res = await generateQuiz(selectedDocIds, numQuestions, difficulty, topic || null)
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
        <h2 className="section-title">Quiz Generator</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Num questions */}
          <div>
            <label htmlFor="num-questions" className="block text-xs text-gray-400 mb-1.5">
              Number of questions
            </label>
            <select
              id="num-questions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="input"
              disabled={loading}
            >
              {[3, 5, 8, 10, 15].map((n) => (
                <option key={n} value={n}>{n} questions</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Difficulty</label>
            <div className="flex gap-1.5">
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d}
                  id={`difficulty-${d}`}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all duration-150
                    ${difficulty === d
                      ? d === 'easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : d === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-surface-100 text-gray-500 border border-white/10 hover:border-white/20'
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional topic */}
        <div className="mb-4">
          <label htmlFor="quiz-topic" className="block text-xs text-gray-400 mb-1.5">
            Topic <span className="text-gray-600">(optional)</span>
          </label>
          <input
            id="quiz-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Focus on a specific topic…"
            className="input"
            disabled={loading}
          />
        </div>

        {selectedDocIds.length === 0 && (
          <p className="text-xs text-amber-400 mb-3">⚠ Select documents from the sidebar first.</p>
        )}

        <button
          id="generate-quiz-btn"
          onClick={handleGenerate}
          disabled={loading || selectedDocIds.length === 0}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" />Generating quiz…</>
          ) : (
            <><HelpCircle size={15} />Generate Quiz</>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {result && result.questions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={DIFFICULTY_COLORS[result.difficulty] || 'badge-blue'}>
              {result.difficulty}
            </span>
            <span className="text-xs text-gray-500">{result.questions.length} questions</span>
          </div>
          {result.questions.map((q, i) => (
            <QuizCard key={i} question={q} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
