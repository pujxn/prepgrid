import { FlaskConical } from 'lucide-react'
import { IS_MOCK } from '@/api/groq'

export function MockBanner() {
  if (!IS_MOCK) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 border-t border-amber-500/20">
      <FlaskConical className="h-3.5 w-3.5 text-amber-400 shrink-0" />
      <p className="text-xs text-amber-400">
        Mock mode — add <code className="font-mono bg-amber-500/20 px-1 rounded">VITE_GROQ_API_KEY</code> to <code className="font-mono bg-amber-500/20 px-1 rounded">.env.local</code> to use real AI
      </p>
    </div>
  )
}
