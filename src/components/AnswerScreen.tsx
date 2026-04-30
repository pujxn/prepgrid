import { useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, XCircle, Lightbulb, SendHorizonal, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { evaluateAnswer, generateFollowUp, evaluateFollowUpAnswer } from '@/api/groq'
import { useKeydown } from '@/hooks/useKeydown'
import { useTimer } from '@/hooks/useTimer'
import { TimerBar } from '@/components/TimerBar'
import type { Question, Evaluation, FollowUp } from '@/types'
import type { Session } from '@/hooks/useSession'
import { cn } from '@/lib/utils'

interface Props {
  question: Question
  session: Session
  timerDuration: number | null
  onBack: () => void
  onNavigate: (question: Question) => void
  onSaveAnswer: (questionId: string, answer: string) => void
  onSaveEvaluation: (questionId: string, evaluation: Evaluation) => void
  onSaveFollowUp: (questionId: string, followUp: FollowUp) => void
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

export function AnswerScreen({
  question, session, timerDuration,
  onBack, onNavigate, onSaveAnswer, onSaveEvaluation, onSaveFollowUp,
}: Props) {
  const saved = session.answers[question.id]
  const [answer, setAnswer] = useState(saved?.answer ?? '')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(saved?.evaluation ?? null)

  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(saved?.followUp?.question ?? null)
  const [followUpAnswer, setFollowUpAnswer] = useState(saved?.followUp?.answer ?? '')
  const [followUpFeedback, setFollowUpFeedback] = useState<string | null>(saved?.followUp?.feedback ?? null)
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false)
  const [isEvaluatingFollowUp, setIsEvaluatingFollowUp] = useState(false)

  const currentIndex = session.questions.findIndex((q) => q.id === question.id)
  const prevQuestion = currentIndex > 0 ? session.questions[currentIndex - 1] : null
  const nextQuestion = currentIndex < session.questions.length - 1 ? session.questions[currentIndex + 1] : null

  function handleExpire() {
    if (answer.trim().length > 20) handleSubmit()
  }

  const { secondsLeft, isExpired } = useTimer(timerDuration, handleExpire)

  useKeydown('Escape', () => onBack(), [onBack])
  useKeydown('Enter', (e) => {
    if ((e.metaKey || e.ctrlKey) && canSubmit) handleSubmit()
  }, [answer, isEvaluating])

  async function handleSubmit() {
    if (!answer.trim()) return
    onSaveAnswer(question.id, answer)
    setIsEvaluating(true)
    setError(null)
    try {
      const result = await evaluateAnswer(question.text, answer)
      setEvaluation(result)
      onSaveEvaluation(question.id, result)
      setFollowUpQuestion(null)
      setFollowUpAnswer('')
      setFollowUpFeedback(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed. Try again.')
    } finally {
      setIsEvaluating(false)
    }
  }

  async function handleGetFollowUp() {
    setIsLoadingFollowUp(true)
    try {
      const q = await generateFollowUp(question.text, answer)
      setFollowUpQuestion(q)
    } catch {
      setFollowUpQuestion("Can you elaborate further on the key decisions you made and why?")
    } finally {
      setIsLoadingFollowUp(false)
    }
  }

  async function handleSubmitFollowUp() {
    if (!followUpQuestion || !followUpAnswer.trim()) return
    setIsEvaluatingFollowUp(true)
    try {
      const feedback = await evaluateFollowUpAnswer(question.text, followUpQuestion, followUpAnswer)
      setFollowUpFeedback(feedback)
      onSaveFollowUp(question.id, { question: followUpQuestion, answer: followUpAnswer, feedback })
    } catch {
      setFollowUpFeedback("Good effort — try to be more specific with concrete examples and measurable outcomes.")
    } finally {
      setIsEvaluatingFollowUp(false)
    }
  }

  const canSubmit = answer.trim().length > 20 && !isEvaluating && !isExpired
  const canSubmitFollowUp = followUpAnswer.trim().length > 10 && !isEvaluatingFollowUp

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => prevQuestion && onNavigate(prevQuestion)}
              disabled={!prevQuestion} className="h-8 w-8 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums w-12 text-center">
              {currentIndex + 1} / {session.questions.length}
            </span>
            <Button variant="ghost" size="icon" onClick={() => nextQuestion && onNavigate(nextQuestion)}
              disabled={!nextQuestion} className="h-8 w-8 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-medium text-foreground leading-relaxed">{question.text}</h2>

          <div className="space-y-3">
            {timerDuration && secondsLeft !== null && (
              <TimerBar secondsLeft={secondsLeft} totalSeconds={timerDuration} isExpired={isExpired} />
            )}

            <Textarea
              placeholder={isExpired ? "Time's up — your answer was submitted." : "Type your answer here..."}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[200px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground/50 text-sm leading-relaxed focus-visible:ring-ring"
              disabled={isEvaluating || isExpired}
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {nextQuestion && (
                  <Button variant="ghost" size="sm" onClick={() => onNavigate(nextQuestion)}
                    className="gap-1.5 text-muted-foreground">
                    Skip <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                <span className="text-xs text-muted-foreground/50">
                  {canSubmit ? <span className="hidden sm:inline">⌘ Enter to submit</span>
                    : answer.trim().length > 0 && !isExpired ? 'Keep going...' : null}
                </span>
              </div>
              <Button onClick={handleSubmit} disabled={!canSubmit} className="gap-2">
                {isEvaluating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Evaluating...</>
                ) : (
                  <>{evaluation ? 'Re-evaluate' : 'Get Feedback'}<SendHorizonal className="h-4 w-4" /></>
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

            {/* Follow-up section */}
            {!followUpQuestion && (
              <div className="flex items-center gap-3 pt-1">
                <Button variant="outline" size="sm" onClick={handleGetFollowUp}
                  disabled={isLoadingFollowUp} className="gap-2 text-muted-foreground">
                  {isLoadingFollowUp
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating...</>
                    : <><MessageSquare className="h-3.5 w-3.5" />Get follow-up question</>}
                </Button>
                {nextQuestion && (
                  <Button variant="outline" size="sm" onClick={() => onNavigate(nextQuestion)} className="gap-2 ml-auto">
                    Next question <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {followUpQuestion && (
              <div className="rounded-lg border border-border bg-card p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Follow-up</p>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed">{followUpQuestion}</p>

                {!followUpFeedback ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Answer the follow-up..."
                      value={followUpAnswer}
                      onChange={(e) => setFollowUpAnswer(e.target.value)}
                      className="min-h-[120px] resize-none bg-background border-border text-foreground placeholder:text-muted-foreground/50 text-sm leading-relaxed"
                      disabled={isEvaluatingFollowUp}
                    />
                    <div className="flex items-center justify-between">
                      {nextQuestion && (
                        <Button variant="ghost" size="sm" onClick={() => onNavigate(nextQuestion)}
                          className="gap-2 text-muted-foreground">
                          Skip <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" onClick={handleSubmitFollowUp}
                        disabled={!canSubmitFollowUp} className="gap-2 ml-auto">
                        {isEvaluatingFollowUp
                          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Evaluating...</>
                          : <><SendHorizonal className="h-3.5 w-3.5" />Submit</>}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">
                      Your answer: {followUpAnswer}
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{followUpFeedback}</p>
                    {nextQuestion && (
                      <div className="flex justify-end pt-1">
                        <Button variant="outline" size="sm" onClick={() => onNavigate(nextQuestion)} className="gap-2">
                          Next question <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
