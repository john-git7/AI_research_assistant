export default function TypingIndicator() {
  return (
    <div className="flex items-start justify-start w-full animate-fade-in">
      <div className="bg-noir-900 border border-noir-800 px-5 py-4 rounded-3xl rounded-tl-sm flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></div>
      </div>
    </div>
  )
}
