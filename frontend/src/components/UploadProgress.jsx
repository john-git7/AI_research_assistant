import { Loader2, FileText, CheckCircle2 } from 'lucide-react'

export default function UploadProgress({ progress, filename, status = 'uploading' }) {
  return (
    <div className="fixed bottom-32 right-8 z-[100] animate-slide-up">
      <div className="bg-noir-900/80 backdrop-blur-2xl border border-noir-800 rounded-2xl p-4 shadow-2xl flex items-center gap-4 min-w-[320px]">
        <div className="w-12 h-12 rounded-xl bg-noir-800 border border-noir-700 flex items-center justify-center">
          {status === 'uploading' ? (
            <div className="relative">
              <Loader2 size={20} className="text-brand-primary animate-spin" />
              <div className="absolute inset-0 bg-brand-primary/20 blur-lg rounded-full" />
            </div>
          ) : (
            <CheckCircle2 size={20} className="text-emerald-500" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-semibold text-zinc-50 truncate max-w-[180px]">
              {filename || 'Document'}
            </p>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {status === 'uploading' ? `${progress}%` : 'Done'}
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-noir-800 rounded-full overflow-hidden border border-noir-700">
            <div 
              className="h-full bg-gradient-to-r from-brand-primary to-brand-hover transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-600 mt-1.5 font-medium uppercase tracking-widest">
            {status === 'uploading' ? 'Analyzing document structure...' : 'Ready for research'}
          </p>
        </div>
      </div>
    </div>
  )
}
