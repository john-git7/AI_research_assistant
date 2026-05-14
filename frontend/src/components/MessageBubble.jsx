import ReactMarkdown from 'react-markdown'
import CitationAccordion from './CitationAccordion'

export default function MessageBubble({ msg }) {
  const isAssistant = msg.role === 'assistant'
  const isUser = msg.role === 'user'

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`flex flex-col gap-3 max-w-[85%] sm:max-w-3xl ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-5 py-4 rounded-3xl text-sm leading-relaxed
            ${isUser
              ? 'bg-brand-primary text-white rounded-tr-sm shadow-xl shadow-brand-primary/10'
              : 'bg-noir-900 border border-noir-800 text-zinc-200 rounded-tl-sm'
            }
          `}
        >
          {isAssistant ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
                strong: ({ children }) => <strong className="font-semibold text-zinc-50">{children}</strong>,
                code: ({ children }) => <code className="bg-noir-800 px-1.5 py-0.5 rounded-md text-xs font-mono text-brand-primary">{children}</code>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          ) : (
            msg.content
          )}
        </div>

        {isAssistant && msg.sources && msg.sources.length > 0 && (
          <div className="w-full mt-1">
            <CitationAccordion sources={msg.sources} />
          </div>
        )}
      </div>
    </div>
  )
}
