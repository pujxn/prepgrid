import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobDescriptionScreen } from '@/components/JobDescriptionScreen'
import { useSession } from '@/hooks/useSession'
import type { Question } from '@/types'

const queryClient = new QueryClient()

function PrepGrid() {
  const { session, startSession } = useSession()

  function handleQuestionsGenerated(jobDescription: string, questions: Question[]) {
    startSession(jobDescription, questions)
  }

  if (!session) {
    return <JobDescriptionScreen onQuestionsGenerated={handleQuestionsGenerated} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-2">
        <p className="text-foreground font-medium">
          {session.questions.length} questions generated
        </p>
        <p className="text-muted-foreground text-sm">Question list UI coming next...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dark">
        <PrepGrid />
      </div>
    </QueryClientProvider>
  )
}
