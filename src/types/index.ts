export type Category = 'Technical' | 'Behavioral' | 'Role-specific'

export interface Question {
  id: string
  category: Category
  text: string
}

export interface GeneratedQuestions {
  questions: Question[]
}

export interface Strength {
  point: string
}

export interface Weakness {
  point: string
}

export interface Evaluation {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestedAnswer: string
}

export interface AnswerEntry {
  questionId: string
  answer: string
  evaluation?: Evaluation
}
