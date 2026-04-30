import { ArrowLeft, CheckCircle2, Circle, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Category, Question } from '@/types'
import type { Session } from '@/hooks/useSession'
import { cn } from '@/lib/utils'

interface Props {
  session: Session
  onSelectQuestion: (question: Question) => void
  onReset: () => void
  onRetry?: () => void
}

const CATEGORY_ORDER: Category[] = ['Technical', 'Behavioral', 'Role-specific']

const CATEGORY_STYLES: Record<Category, { label: string; dot: string; header: string; count: string }> = {
  Technical: {
    label: 'Technical',
    dot: 'bg-blue-500',
    header: 'text-blue-400',
    count: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  Behavioral: {
    label: 'Behavioral',
    dot: 'bg-violet-500',
    header: 'text-violet-400',
    count: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  'Role-specific': {
    label: 'Role-specific',
    dot: 'bg-amber-500',
    header: 'text-amber-400',
    count: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
}

export function QuestionListScreen({ session, onSelectQuestion, onReset, onRetry }: Props) {
  const byCategory = CATEGORY_ORDER.reduce<Record<Category, Question[]>>(
    (acc, cat) => {
      acc[cat] = session.questions.filter((q) => q.category === cat)
      return acc
    },
    { Technical: [], Behavioral: [], 'Role-specific': [] },
  )

  const answeredCount = Object.keys(session.answers).length
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
            {onRetry && (
              <Button onClick={onRetry} size="sm">Try again</Button>
            )}
            <Button variant="ghost" size="sm" onClick={onReset}>
              New job
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Interview Questions
            </h1>
            <p className="text-sm text-muted-foreground">
              {answeredCount === 0
                ? `${total} questions — pick one to start`
                : `${answeredCount} of ${total} answered`}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground shrink-0 gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Edit job description
          </Button>
        </div>

        {answeredCount > 0 && (
          <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(answeredCount / total) * 100}%` }}
            />
          </div>
        )}

        <div className="space-y-8">
          {CATEGORY_ORDER.map((category) => {
            const questions = byCategory[category]
            if (questions.length === 0) return null
            const styles = CATEGORY_STYLES[category]

            return (
              <section key={category} className="space-y-2">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={cn('text-xs font-semibold uppercase tracking-widest', styles.header)}>
                    {styles.label}
                  </span>
                  <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded border', styles.count)}>
                    {questions.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {questions.map((question) => {
                    const isAnswered = !!session.answers[question.id]
                    return (
                      <button
                        key={question.id}
                        onClick={() => onSelectQuestion(question)}
                        className="w-full text-left group flex items-start gap-3 px-4 py-3.5 rounded-lg border border-border bg-card hover:bg-secondary hover:border-border/80 transition-colors duration-100"
                      >
                        <span className="mt-0.5 shrink-0">
                          {isAnswered ? (
                            <CheckCircle2 className={cn('h-4 w-4', styles.dot.replace('bg-', 'text-'))} />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
                          )}
                        </span>
                        <span className={cn('text-sm leading-relaxed', isAnswered ? 'text-muted-foreground' : 'text-foreground')}>
                          {question.text}
                        </span>
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
