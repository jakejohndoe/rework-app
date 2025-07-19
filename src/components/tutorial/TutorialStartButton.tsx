'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { HelpCircle, Play } from 'lucide-react'
import { useTutorial } from './CustomTutorial'

export const TutorialStartButton: React.FC = () => {
  const { startTutorial } = useTutorial()

  return (
    <Button
      onClick={startTutorial}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/50"
    >
      <Play className="w-4 h-4" />
      Take Tutorial
    </Button>
  )
}

export default TutorialStartButton