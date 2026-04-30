import { useEffect } from 'react'

export function useKeydown(
  key: string,
  handler: (e: KeyboardEvent) => void,
  deps: React.DependencyList = [],
) {
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === key) handler(e)
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
