/**
 * UploadZone — drag-and-drop file upload with progress indicator.
 */
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function UploadZone({ onUpload, uploading, progress, error }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0 && !uploading) {
        onUpload(acceptedFiles[0])
      }
    },
    [onUpload, uploading],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        id="upload-dropzone"
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-brand-400 bg-brand-500/10'
            : 'border-white/15 bg-surface-50 hover:border-brand-500/50 hover:bg-surface-100'
          }
          ${uploading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} id="file-input" />

        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 size={28} className="text-brand-400 animate-spin" />
          ) : (
            <div className={`p-3 rounded-full ${isDragActive ? 'bg-brand-500/20' : 'bg-surface-200'}`}>
              <Upload size={22} className={isDragActive ? 'text-brand-400' : 'text-gray-400'} />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-300">
              {uploading
                ? 'Processing document…'
                : isDragActive
                ? 'Drop file here'
                : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF or TXT · Max 50 MB</p>
          </div>
        </div>

        {/* Progress bar */}
        {uploading && progress > 0 && (
          <div className="mt-4">
            <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
