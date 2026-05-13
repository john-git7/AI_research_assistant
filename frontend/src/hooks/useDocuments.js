/**
 * useDocuments — manages document list state and upload logic.
 * Used by Sidebar and UploadZone to share document state.
 */
import { useState, useCallback } from 'react'
import { uploadDocument, getDocuments } from '../services/api'

export function useDocuments() {
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDocuments()
      setDocuments(res.data.documents || [])
    } catch (err) {
      console.error('Failed to fetch documents:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const upload = useCallback(async (file) => {
    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      const res = await uploadDocument(file, setUploadProgress)
      const newDoc = res.data
      setDocuments((prev) => {
        // Avoid duplicates by document_id
        const exists = prev.find((d) => d.document_id === newDoc.document_id)
        if (exists) return prev
        return [...prev, newDoc]
      })
      setUploadProgress(100)
      return newDoc
    } catch (err) {
      setUploadError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  return {
    documents,
    setDocuments,
    uploading,
    uploadProgress,
    uploadError,
    loading,
    fetchDocuments,
    upload,
  }
}
