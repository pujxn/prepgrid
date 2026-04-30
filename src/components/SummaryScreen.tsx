import { ArrowLeft, RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types'
import type { Session } from '@/hooks/useSession'
import { cn } from '@/lib/utils'

interface Props {
  session: Session
  onBack: () => void
  onSelectQuestion: (questionId: string) => void
  onReset: () => void
}

const CATEGORY_STYLES: Record<Category, { header: string; bg: string; border: string }> = {
  Technical: { header: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
  Behavioral: { header: 'text-violet-400', bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
  'Role-specific': { header: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
}

function scoreColor(score: number) {
  if (score >= 7) return 'text-emerald-400'
  if (score >= 4) return 'text-yellow-400'
  return 'text-red-400'
}

function scoreBg(score: number) {
  if (score >= 7) return 'bg-emerald-500/10 border-emerald-500/20'
  if (score >= 4) return 'bg-yellow-500/10 border-yellow-500/20'
  return 'bg-red-500/10 border-red-500/20'
}

function verdict(avg: number) {
  if (avg >= 8) return { label: 'Interview ready', color: 'text-emerald-400' }
  if (avg >= 6) return { label: 'Getting there', color: 'text-yellow-400' }
  if (avg >= 4) return { label: 'Needs more practice', color: 'text-orange-400' }
  return { label: 'Keep practicing', color: 'text-red-400' }
}

export function SummaryScreen({ session, onBack, onSelectQuestion, onReset }: Props) {
  const evaluated = Object.values(session.answers).filter((a) => a.evaluation)
  const total = session.questions.length
  const answeredCount = evaluated.length

  const avgScore =
    answeredCount > 0
      ? Math.round((evaluated.reduce((sum, a) => sum + (a.evaluation?.score ?? 0), 0) / answeredCount) * 10) / 10
      : 0

  const categories: Category[] = ['Technical', 'Behavioral', 'Role-specific']

  const categoryStats = categories.map((cat) => {
    const qs = session.questions.filter((q) => q.category === cat)
    const evaluatedInCat = qs.filter((q) => session.answers[q.id]?.evaluation)
    const avg =
      evaluatedInCat.length > 0
        ? Math.round(
            (evaluatedInCat.reduce((sum, q) => sum + (session.answers[q.id]?.evaluation?.score ?? 0), 0) /
              evaluatedInCat.length) *
              10,
          ) / 10
        : null
    return { category: cat, total: qs.length, answered: evaluatedInCat.length, avg }
  })

  const rankedCategories = categoryStats.filter((c) => c.avg !== null).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
  const best = rankedCategories[0]
  const worst = rankedCategories[rankedCategories.length - 1]
  const { label: verdictLabel, color: verdictColor } = verdict(avgScore)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Questions
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Start over
          </Button>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Session Summary</h1>
          <p className="text-sm text-muted-foreground">
            {answeredCount} of {total} questions answered
          </p>
        </div>

        {answeredCount > 0 && (
          <>
            <div className={cn('flex items-center justify-between rounded-xl border p-5', scoreBg(avgScore))}>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overall score</p>
                <p className={cn('text-4xl font-bold tabular-nums', scoreColor(avgScore))}>{avgScore}</p>
                <p className="text-xs text-muted-foreground">out of 10</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Readiness</p>
                <p className={cn('text-lg font-semibold', verdictColor)}>{verdictLabel}</p>
              </div>
            </div>

            {rankedCategories.length > 1 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {best && (
                  <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Strongest</p>
                      <p className="text-sm text-foreground mt-0.5">{best.category}</p>
                      <p className="text-xs text-muted-foreground">{best.avg} avg score</p>
                    </div>
                  </div>
                )}
                {worst && worst.category !== best?.category && (
                  <div className="flex items-start gap-3 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                    <TrendingDown className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest">Needs work</p>
                      <p className="text-sm text-foreground mt-0.5">{worst.category}</p>
                      <p className="text-xs text-muted-foreground">{worst.avg} avg score</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              {categories.map((cat) => {
                const stat = categoryStats.find((c) => c.category === cat)!
                const qs = session.questions.filter((q) => q.category === cat)
                if (qs.length === 0) return null
                const styles = CATEGORY_STYLES[cat]

                return (
                  <section key={cat} className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn('text-xs font-semibold uppercase tracking-widest', styles.header)}>
                        {cat}
                      </span>
                      {stat.avg !== null && (
                        <span className={cn('text-xs font-medium', scoreColor(stat.avg))}>
                          {stat.avg} avg
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {qs.map((q) => {
                        const entry = session.answers[q.id]
                        const score = entry?.evaluation?.score ?? null
                        return (
                          <button
                            key={q.id}
                            onClick={() => onSelectQuestion(q.id)}
                            className={cn(
                              'w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors duration-100',
                              styles.bg, styles.border,
                              'hover:bg-secondary hover:border-border/80',
                            )}
                          >
                            <span className="flex-1 text-sm text-foreground/80 leading-snug line-clamp-1">
                              {q.text}
                            </span>
                            {score !== null ? (
                              <span className={cn('text-sm font-semibold tabular-nums shrink-0', scoreColor(score))}>
                                {score}/10
                              </span>
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>
          </>
        )}

        {answeredCount === 0 && (
          <div className="text-center py-16 space-y-2">
            <p className="text-muted-foreground">No answers yet.</p>
            <Button variant="ghost" size="sm" onClick={onBack}>
              Go answer some questions
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
