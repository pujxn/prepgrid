import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobDescriptionScreen } from '@/components/JobDescriptionScreen'
import { QuestionListScreen } from '@/components/QuestionListScreen'
import { AnswerScreen } from '@/components/AnswerScreen'
import { SummaryScreen } from '@/components/SummaryScreen'
import { MockBanner } from '@/components/MockBanner'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useSession } from '@/hooks/useSession'
import type { Question } from '@/types'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  return (localStorage.getItem('theme') as Theme) ?? 'dark'
}

const queryClient = new QueryClient()

type View = 'input' | 'questions' | 'answer' | 'summary'

function PrepGrid() {
  const { session, startSession, saveAnswer, saveEvaluation, saveFollowUp, reset } = useSession()
  const [view, setView] = useState<View>('input')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [timerDuration, setTimerDuration] = useState<number | null>(null)

  function handleQuestionsGenerated(jobDescription: string, questions: Question[]) {
    startSession(jobDescription, questions)
    setView('questions')
  }

  function handleQuestionsRegenerated(jobDescription: string, questions: Question[]) {
    reset()
    startSession(jobDescription, questions)
    setView('questions')
  }

  function handleSelectQuestion(question: Question) {
    setSelectedQuestion(question)
    setView('answer')
  }

  function handleSelectQuestionById(questionId: string) {
    const q = session?.questions.find((q) => q.id === questionId)
    if (q) handleSelectQuestion(q)
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

  if (view === 'input' || !session) {
    return (
      <JobDescriptionScreen
        initialValue={session?.jobDescription}
        onQuestionsGenerated={session ? handleQuestionsRegenerated : handleQuestionsGenerated}
      />
    )
  }

  if (view === 'questions') {
    return (
      <QuestionListScreen
        session={session}
        timerDuration={timerDuration}
        onSelectQuestion={handleSelectQuestion}
        onSetTimer={setTimerDuration}
        onViewSummary={() => setView('summary')}
        onReset={handleBack}
      />
    )
  }

  if (view === 'answer' && selectedQuestion) {
    return (
      <AnswerScreen
        key={selectedQuestion.id}
        question={selectedQuestion}
        session={session}
        timerDuration={timerDuration}
        onBack={() => setView('questions')}
        onNavigate={handleSelectQuestion}
        onSaveAnswer={saveAnswer}
        onSaveEvaluation={saveEvaluation}
        onSaveFollowUp={saveFollowUp}
      />
    )
  }

  if (view === 'summary') {
    return (
      <SummaryScreen
        session={session}
        onBack={() => setView('questions')}
        onSelectQuestion={handleSelectQuestionById}
        onReset={handleReset}
      />
    )
  }

  return null
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  function toggleTheme() {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return next
    })
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className={theme}>
        <PrepGrid />
        <MockBanner />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
    </QueryClientProvider>
  )
}
