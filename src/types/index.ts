export type Category = 'Technical' | 'Behavioral' | 'Role-specific'

export interface Question {
  id: string
  category: Category
  text: string
}

export interface Evaluation {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestedAnswer: string
}

export interface FollowUp {
  question: string
  answer: string
  feedback: string
}

export interface AnswerEntry {
  questionId: string
  answer: string
  evaluation?: Evaluation
  followUp?: FollowUp
}
