import { useState } from 'react'
import { Loader2, ArrowRight, BriefcaseIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { generateQuestions } from '@/api/groq'
import type { Question } from '@/types'

interface Props {
  onQuestionsGenerated: (jobDescription: string, questions: Question[]) => void
}

export function JobDescriptionScreen({ onQuestionsGenerated }: Props) {
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!jobDescription.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const questions = await generateQuestions(jobDescription)
      onQuestionsGenerated(jobDescription, questions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions. Check your API key.')
    } finally {
      setIsLoading(false)
    }
  }

  const charCount = jobDescription.length
  const isReady = charCount > 50

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-secondary">
              <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
              PrepGrid
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Interview Prep
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Paste a job description and get a tailored set of interview questions —
            then practice and get AI feedback on your answers.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Job Description
            </label>
            {charCount > 0 && (
              <span className="text-xs text-muted-foreground">{charCount} characters</span>
            )}
          </div>
          <Textarea
            placeholder="Paste the job description here — include the role title, responsibilities, requirements, and any other relevant details..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[280px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-ring text-sm leading-relaxed"
            disabled={isLoading}
          />
          {error && (
            <p className="text-sm text-destructive-foreground bg-destructive/20 border border-destructive/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {!isReady && charCount > 0
              ? 'Add more detail for better questions'
              : isReady
              ? '12–15 questions will be generated across 3 categories'
              : 'Paste a job description to get started'}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!isReady || isLoading}
            className="gap-2 min-w-[160px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Generate Questions
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
