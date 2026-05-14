import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Response interceptor for consistent error messages & toasts ────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    let message = err.response?.data?.detail || err.response?.data?.message || err.message || 'An unexpected error occurred.'
    
    // Handle Quota Exceeded (429) specifically
    if (err.response?.status === 429 || message.includes('quota exceeded') || message.includes('429')) {
      const waitMatch = message.match(/retry in ([\d.]+)s/i)
      const waitTime = waitMatch ? Math.ceil(parseFloat(waitMatch[1])) : 30
      message = `Quota Exceeded. Please wait ${waitTime} seconds before trying again.`
      
      toast.error(message, { 
        id: 'api-quota-error',
        duration: 5000,
        icon: '⏳'
      })
      
      const quotaError = new Error(message)
      quotaError.retryAfter = waitTime
      return Promise.reject(quotaError)
    } else {
      toast.error(message, { id: 'api-error' })
    }
    
    return Promise.reject(new Error(message))
  },
)

export const uploadDocument = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
}

export const getDocuments = () => api.get(`/upload/documents?t=${Date.now()}`)
export const deleteDocument = (documentId) => api.delete(`/upload/documents/${documentId}`)

export const askQuestion = (question, documentIds = [], topK = 5) =>
  api.post('/ask', { question, document_ids: documentIds, top_k: topK })

export const summarizeDocument = (documentIds, summaryType = 'concise', query = null) =>
  api.post('/summary', { document_ids: documentIds, summary_type: summaryType, query })

export const generateQuiz = (documentIds, numQuestions = 5, difficulty = 'medium', topic = null) =>
  api.post('/quiz', { document_ids: documentIds, num_questions: numQuestions, difficulty, topic })

// Synchronized with frontend array-based selection
export const compareDocuments = (documentIds, focusTopic = null) =>
  api.post('/compare', {
    document_ids: documentIds,
    focus_topic: focusTopic,
  })

export const checkHealth = () => api.get('/health')

export default api
