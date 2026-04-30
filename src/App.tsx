import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobDescriptionScreen } from '@/components/JobDescriptionScreen'
import { QuestionListScreen } from '@/components/QuestionListScreen'
import { useSession } from '@/hooks/useSession'
import type { Question } from '@/types'

const queryClient = new QueryClient()

type View = 'input' | 'questions' | 'answer'

function PrepGrid() {
  const { session, startSession, reset } = useSession()
  const [view, setView] = useState<View>('input')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  function handleQuestionsGenerated(jobDescription: string, questions: Question[]) {
    startSession(jobDescription, questions)
    setView('questions')
  }

  function handleSelectQuestion(question: Question) {
    setSelectedQuestion(question)
    setView('answer')
  }

  function handleReset() {
    reset()
    setSelectedQuestion(null)
    setView('input')
  }

  if (view === 'input' || !session) {
    return <JobDescriptionScreen onQuestionsGenerated={handleQuestionsGenerated} />
  }

  if (view === 'questions') {
    return (
      <QuestionListScreen
        session={session}
        onSelectQuestion={handleSelectQuestion}
        onReset={handleReset}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-2">
        <p className="text-foreground font-medium">{selectedQuestion?.text}</p>
        <p className="text-muted-foreground text-sm">Answer input coming next...</p>
        <button
          onClick={() => setView('questions')}
          className="text-xs text-muted-foreground underline underline-offset-2 mt-2"
        >
          ← Back to questions
        </button>
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
