import { useState } from 'react'
import type { Question, AnswerEntry, Evaluation, FollowUp } from '@/types'

export interface Session {
  jobDescription: string
  questions: Question[]
  answers: Record<string, AnswerEntry>
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)

  function startSession(jobDescription: string, questions: Question[]) {
    setSession({ jobDescription, questions, answers: {} })
  }

  function saveAnswer(questionId: string, answer: string) {
    setSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: { questionId, answer, evaluation: prev.answers[questionId]?.evaluation },
        },
      }
    })
  }

  function saveEvaluation(questionId: string, evaluation: Evaluation) {
    setSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: { ...prev.answers[questionId], evaluation },
        },
      }
    })
  }

  function saveFollowUp(questionId: string, followUp: FollowUp) {
    setSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: { ...prev.answers[questionId], followUp },
        },
      }
    })
  }

  function reset() {
    setSession(null)
  }

  return { session, startSession, saveAnswer, saveEvaluation, saveFollowUp, reset }
}
