import { cn } from '@/lib/utils'

interface Props {
  secondsLeft: number
  totalSeconds: number
  isExpired: boolean
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function TimerBar({ secondsLeft, totalSeconds, isExpired }: Props) {
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0

  const barColor = isExpired
    ? 'bg-red-500'
    : pct > 50
    ? 'bg-emerald-500'
    : pct > 25
    ? 'bg-yellow-500'
    : 'bg-red-500'

  const textColor = isExpired
    ? 'text-red-400'
    : pct > 50
    ? 'text-emerald-400'
    : pct > 25
    ? 'text-yellow-400'
    : 'text-red-400'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Time remaining
        </span>
        <span className={cn('text-sm font-mono font-semibold tabular-nums', textColor)}>
          {isExpired ? "Time's up" : fmt(secondsLeft)}
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-linear', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
