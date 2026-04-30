import { useState } from 'react'
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Lightbulb, SendHorizonal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { evaluateAnswer } from '@/api/groq'
import type { Question, Evaluation } from '@/types'
import type { Session } from '@/hooks/useSession'
import { cn } from '@/lib/utils'

interface Props {
  question: Question
  session: Session
  onBack: () => void
  onSaveAnswer: (questionId: string, answer: string) => void
  onSaveEvaluation: (questionId: string, evaluation: Evaluation) => void
}

const CATEGORY_STYLES = {
  Technical: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Behavioral: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'Role-specific': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 7
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : score >= 4
      ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
      : 'text-red-400 border-red-500/30 bg-red-500/10'

  return (
    <div className={cn('flex items-baseline gap-1 px-3 py-1.5 rounded-lg border', color)}>
      <span className="text-3xl font-bold tabular-nums">{score}</span>
      <span className="text-sm font-medium opacity-70">/ 10</span>
    </div>
  )
}

export function AnswerScreen({ question, session, onBack, onSaveAnswer, onSaveEvaluation }: Props) {
  const saved = session.answers[question.id]
  const [answer, setAnswer] = useState(saved?.answer ?? '')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(saved?.evaluation ?? null)

  async function handleSubmit() {
    if (!answer.trim()) return
    onSaveAnswer(question.id, answer)
    setIsEvaluating(true)
    setError(null)
    try {
      const result = await evaluateAnswer(question.text, answer)
      setEvaluation(result)
      onSaveEvaluation(question.id, result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed. Try again.')
    } finally {
      setIsEvaluating(false)
    }
  }

  const canSubmit = answer.trim().length > 20 && !isEvaluating

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Questions
          </Button>
          <span className="text-muted-foreground/40 text-sm">/</span>
          <span className={cn('text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded border', CATEGORY_STYLES[question.category])}>
            {question.category}
          </span>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-medium text-foreground leading-relaxed">
            {question.text}
          </h2>

          <div className="space-y-3">
            <Textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[200px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground/50 text-sm leading-relaxed focus-visible:ring-ring"
              disabled={isEvaluating}
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={!canSubmit} className="gap-2">
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    {evaluation ? 'Re-evaluate' : 'Get Feedback'}
                    <SendHorizonal className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {evaluation && !isEvaluating && (
          <div className="space-y-4 pt-2">
            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest">Feedback</h3>
              <ScoreBadge score={evaluation.score} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Strengths</p>
                <ul className="space-y-2">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80 leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">Weaknesses</p>
                <ul className="space-y-2">
                  {evaluation.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80 leading-snug">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Suggested Answer</p>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{evaluation.suggestedAnswer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
