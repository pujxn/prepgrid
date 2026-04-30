import { useState, useEffect, useRef } from 'react'

export function useTimer(durationSeconds: number | null, onExpire: () => void) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(durationSeconds)
  const [isExpired, setIsExpired] = useState(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!durationSeconds) return
    setSecondsLeft(durationSeconds)
    setIsExpired(false)

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          setIsExpired(true)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [durationSeconds])

  return { secondsLeft, isExpired }
}
