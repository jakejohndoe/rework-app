// src/hooks/useButtonFeedback.ts
import { useState } from 'react'

export function useButtonFeedback() {
  const [isLoading, setIsLoading] = useState(false)
  
  const withFeedback = async (action: () => Promise<void> | void) => {
    setIsLoading(true)
    try {
      await action()
    } finally {
      // Keep loading state for minimum 300ms for visual feedback
      setTimeout(() => setIsLoading(false), 300)
    }
  }
  
  return { isLoading, withFeedback }
}

// Usage example:
/*
const { isLoading, withFeedback } = useButtonFeedback()

<Button 
  onClick={() => withFeedback(async () => {
    await router.push('/next-page')
  })}
  disabled={isLoading}
  className={isLoading ? 'opacity-75 cursor-not-allowed' : ''}
>
  {isLoading ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Loading...
    </div>
  ) : (
    'Continue'
  )}
</Button>
*/