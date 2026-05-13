/**
 * Axios API client — single source of truth for all backend calls.
 * Base URL reads from environment variable; falls back to /api (Vite proxy).
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min — LLM calls can be slow
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Response interceptor for consistent error messages ────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  },
)

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadDocument = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
}

export const getDocuments = () => api.get('/upload/documents')

// ── Ask ───────────────────────────────────────────────────────────────────────
export const askQuestion = (question, documentIds = [], topK = 5) =>
  api.post('/ask', { question, document_ids: documentIds, top_k: topK })

// ── Summary ───────────────────────────────────────────────────────────────────
export const generateSummary = (documentIds, summaryType = 'concise', query = null) =>
  api.post('/summary', { document_ids: documentIds, summary_type: summaryType, query })

// ── Quiz ──────────────────────────────────────────────────────────────────────
export const generateQuiz = (documentIds, numQuestions = 5, difficulty = 'medium', topic = null) =>
  api.post('/quiz', { document_ids: documentIds, num_questions: numQuestions, difficulty, topic })

// ── Compare ───────────────────────────────────────────────────────────────────
export const compareDocuments = (documentIdA, documentIdB, focusTopic = null) =>
  api.post('/compare', {
    document_id_a: documentIdA,
    document_id_b: documentIdB,
    focus_topic: focusTopic,
  })

// ── Health ────────────────────────────────────────────────────────────────────
export const checkHealth = () => api.get('/health')

export default api
