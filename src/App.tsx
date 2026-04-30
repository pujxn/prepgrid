import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobDescriptionScreen } from '@/components/JobDescriptionScreen'
import { QuestionListScreen } from '@/components/QuestionListScreen'
import { AnswerScreen } from '@/components/AnswerScreen'
import { MockBanner } from '@/components/MockBanner'
import { useSession } from '@/hooks/useSession'
import type { Question } from '@/types'

const queryClient = new QueryClient()

type View = 'input' | 'questions' | 'answer'

function PrepGrid() {
  const { session, startSession, saveAnswer, saveEvaluation, reset } = useSession()
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

  function handleBack() {
    setSelectedQuestion(null)
    setView('input')
  }

  function handleReset() {
    reset()
    setSelectedQuestion(null)
    setView('input')
  }

  function handleQuestionsRegenerated(jobDescription: string, questions: Question[]) {
    reset()
    startSession(jobDescription, questions)
    setView('questions')
  }

  if (view === 'input' || !session) {
    return (
      <JobDescriptionScreen
        initialValue={session?.jobDescription}
        onQuestionsGenerated={session ? handleQuestionsRegenerated : handleQuestionsGenerated}
      />
  }

  if (view === 'questions') {
    return (
      <QuestionListScreen
        session={session}
        onSelectQuestion={handleSelectQuestion}
        onReset={handleBack}
      />
    )
  }

  if (view === 'answer' && selectedQuestion) {
    return (
      <AnswerScreen
        question={selectedQuestion}
        session={session}
        onBack={() => setView('questions')}
        onNavigate={handleSelectQuestion}
        onSaveAnswer={saveAnswer}
        onSaveEvaluation={saveEvaluation}
      />
    )
  }

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dark">
        <PrepGrid />
        <MockBanner />
      </div>
    </QueryClientProvider>
  )
}
