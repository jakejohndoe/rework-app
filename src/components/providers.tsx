"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/sonner"
import { TutorialProvider } from "@/components/tutorial/CustomTutorial"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TutorialProvider>
        {children}
      </TutorialProvider>
      <Toaster />
    </SessionProvider>
  )
}