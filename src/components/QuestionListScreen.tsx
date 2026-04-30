import { ArrowLeft, CheckCircle2, Circle, TriangleAlert, BarChart2, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Category, Question } from '@/types'
import type { Session } from '@/hooks/useSession'
import { cn } from '@/lib/utils'

interface Props {
  session: Session
  timerDuration: number | null
  onSelectQuestion: (question: Question) => void
  onSetTimer: (seconds: number | null) => void
  onViewSummary: () => void
  onReset: () => void
  onRetry?: () => void
}

const CATEGORY_ORDER: Category[] = ['Technical', 'Behavioral', 'Role-specific']

const CATEGORY_STYLES: Record<Category, { dot: string; header: string; count: string }> = {
  Technical: { dot: 'bg-blue-500', header: 'text-blue-400', count: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  Behavioral: { dot: 'bg-violet-500', header: 'text-violet-400', count: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  'Role-specific': { dot: 'bg-amber-500', header: 'text-amber-400', count: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
}

const TIMER_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'No timer', value: null },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
]

export function QuestionListScreen({ session, timerDuration, onSelectQuestion, onSetTimer, onViewSummary, onReset, onRetry }: Props) {
  const byCategory = CATEGORY_ORDER.reduce<Record<Category, Question[]>>(
    (acc, cat) => {
      acc[cat] = session.questions.filter((q) => q.category === cat)
      return acc
    },
    { Technical: [], Behavioral: [], 'Role-specific': [] },
  )

  const evaluatedCount = Object.values(session.answers).filter((a) => a.evaluation).length
  const total = session.questions.length

  if (total === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-secondary">
              <TriangleAlert className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-medium text-foreground">No questions generated</h2>
            <p className="text-sm text-muted-foreground">
              The AI didn't return any questions. Try again with a more detailed job description.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            {onRetry && <Button onClick={onRetry} size="sm">Try again</Button>}
            <Button variant="ghost" size="sm" onClick={onReset}>New job</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Interview Questions</h1>
            <p className="text-sm text-muted-foreground">
              {evaluatedCount === 0
                ? `${total} questions — pick one to start`
                : `${evaluatedCount} of ${total} evaluated`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {evaluatedCount > 0 && (
              <Button variant="outline" size="sm" onClick={onViewSummary} className="gap-1.5">
                <BarChart2 className="h-3.5 w-3.5" />
                Summary
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Edit job description
            </Button>
          </div>
        </div>

        {evaluatedCount > 0 && (
          <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(evaluatedCount / total) * 100}%` }}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Timer className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground mr-1">Timer:</span>
          {TIMER_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => onSetTimer(opt.value)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-md border transition-colors',
                timerDuration === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-border/80',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {CATEGORY_ORDER.map((category) => {
            const questions = byCategory[category]
            if (questions.length === 0) return null
            const styles = CATEGORY_STYLES[category]

            return (
              <section key={category} className="space-y-2">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={cn('text-xs font-semibold uppercase tracking-widest', styles.header)}>
                    {category}
                  </span>
                  <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded border', styles.count)}>
                    {questions.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {questions.map((question) => {
                    const entry = session.answers[question.id]
                    const isEvaluated = !!entry?.evaluation
                    return (
                      <button
                        key={question.id}
                        onClick={() => onSelectQuestion(question)}
                        className="w-full text-left group flex items-start gap-3 px-4 py-3.5 rounded-lg border border-border bg-card hover:bg-secondary hover:border-border/80 transition-colors duration-100"
                      >
                        <span className="mt-0.5 shrink-0">
                          {isEvaluated ? (
                            <CheckCircle2 className={cn('h-4 w-4', styles.dot.replace('bg-', 'text-'))} />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
                          )}
                        </span>
                        <span className={cn('text-sm leading-relaxed flex-1', isEvaluated ? 'text-muted-foreground' : 'text-foreground')}>
                          {question.text}
                        </span>
                        {isEvaluated && (
                          <span className={cn(
                            'text-xs font-semibold tabular-nums shrink-0 mt-0.5',
                            (entry.evaluation?.score ?? 0) >= 7 ? 'text-emerald-400'
                              : (entry.evaluation?.score ?? 0) >= 4 ? 'text-yellow-400'
                              : 'text-red-400',
                          )}>
                            {entry.evaluation?.score}/10
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
