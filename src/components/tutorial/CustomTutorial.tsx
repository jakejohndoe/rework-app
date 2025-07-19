'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, ArrowLeft, ArrowRight, Play, SkipForward } from 'lucide-react'

interface TutorialStep {
  id: string
  target: string
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
  page: string
  showProgress?: boolean
}

interface TutorialContextType {
  run: boolean
  currentStep: number
  resumeUploaded: boolean
  setResumeUploaded: (uploaded: boolean) => void
  startTutorial: () => void
  skipTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  isVisible: boolean
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export const useTutorial = () => {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard-welcome',
    target: '.dashboard-overview',
    title: 'Welcome to ReWork! 🎉',
    content: 'This is your dashboard where you can manage your resumes and track your optimization progress. Let\'s take a quick tour to help you create your first AI-optimized resume!',
    placement: 'center',
    page: '/dashboard',
    showProgress: true
  },
  {
    id: 'upload-resume',
    target: '.upload-resume-section',
    title: 'Upload Your Resume 📄',
    content: 'Start by uploading your existing resume PDF. Don\'t worry if it\'s not perfect - our AI will help optimize it! You can drag and drop or click to browse for your file.',
    placement: 'bottom',
    page: '/dashboard',
    showProgress: true
  },
  {
    id: 'auto-fill',
    target: '.auto-fill-section',
    title: 'Auto-Fill Your Information ✨',
    content: 'Click "Auto-fill from PDF" to quickly populate all sections with your existing resume data. Then review and complete each section - contact info, summary, work experience, education, and skills.',
    placement: 'bottom',
    page: '/dashboard/resume/[id]',
    showProgress: true
  },
  {
    id: 'continue-job',
    target: '.continue-to-job-button',
    title: 'Add Job Details 🎯',
    content: 'Once you\'ve filled out your resume information, click here to continue to the job description page.',
    placement: 'top',
    page: '/dashboard/resume/[id]',
    showProgress: true
  },
  {
    id: 'job-form',
    target: '.job-description-form',
    title: 'Enter Job Details 💼',
    content: 'Fill in all the job details you can find from the job posting: job title, company name, location, full job description, requirements, and benefits.',
    placement: 'right',
    page: '/dashboard/resume/[id]/job-description',
    showProgress: true
  },
  {
    id: 'start-analysis',
    target: '.start-ai-analysis-button',
    title: 'Start AI Analysis 🤖',
    content: 'This is where the magic happens! Click here to start the AI analysis. Note: This process may take 60-90 seconds as our AI optimizes your resume for this specific job.',
    placement: 'top',
    page: '/dashboard/resume/[id]/job-description',
    showProgress: true
  },
  {
    id: 'suggestions',
    target: '.suggestions-interface',
    title: 'Review AI Suggestions 🔄',
    content: 'Here you can swap individual sections with AI suggestions, apply all optimizations at once, reset changes if needed, and watch your compatibility score improve!',
    placement: 'left',
    page: '/dashboard/resume/[id]/analysis',
    showProgress: true
  },
  {
    id: 'finalize',
    target: '.finalize-options',
    title: 'Finalize Your Resume 🎨',
    content: 'Almost done! Here you can choose from different templates, customize colors to match your style, preview your optimized resume, and download when you\'re ready! Congratulations! You\'ve created your first AI-optimized resume! 🎉',
    placement: 'center',
    page: '/dashboard/resume/[id]/finalize',
    showProgress: true
  }
]

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [run, setRun] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Check if user should see tutorial
  useEffect(() => {
    if (session?.user?.email) {
      const tutorialCompleted = localStorage.getItem(`tutorial_completed_${session.user.email}`)
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${session.user.email}`)
      
      if (!tutorialCompleted && !hasSeenTutorial && pathname === '/dashboard') {
        localStorage.setItem(`tutorial_seen_${session.user.email}`, 'true')
        setTimeout(() => {
          setRun(true)
          setIsVisible(true)
        }, 1500)
      }
    }
  }, [session, pathname])

  // Handle resume upload to continue tutorial
  useEffect(() => {
    if (resumeUploaded && pathname?.includes('/edit') && currentStep === 1) {
      setTimeout(() => {
        setRun(true)
        setIsVisible(true)
        setCurrentStep(2)
      }, 500)
    }
  }, [pathname, resumeUploaded, currentStep])

  const currentTutorialStep = tutorialSteps[currentStep]
  const isCurrentPage = currentTutorialStep && (
    currentTutorialStep.page === pathname || 
    (currentTutorialStep.page.includes('[id]') && pathname?.includes('/dashboard/resume/'))
  )

  const startTutorial = useCallback(() => {
    setRun(true)
    setIsVisible(true)
    setCurrentStep(0)
  }, [])

  const skipTutorial = useCallback(() => {
    setRun(false)
    setIsVisible(false)
    if (session?.user?.email) {
      localStorage.setItem(`tutorial_completed_${session.user.email}`, 'true')
    }
  }, [session])

  const nextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      // Pause if we need to navigate to a different page
      if (tutorialSteps[currentStep + 1]?.page !== pathname) {
        setRun(false)
        setIsVisible(false)
      }
    } else {
      skipTutorial()
    }
  }, [currentStep, pathname, skipTutorial])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  return (
    <TutorialContext.Provider value={{
      run,
      currentStep,
      resumeUploaded,
      setResumeUploaded,
      startTutorial,
      skipTutorial,
      nextStep,
      prevStep,
      isVisible
    }}>
      {children}
      
      {/* Custom Tutorial Overlay */}
      {run && isVisible && isCurrentPage && currentTutorialStep && (
        <TutorialOverlay
          step={currentTutorialStep}
          currentStep={currentStep}
          totalSteps={tutorialSteps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTutorial}
        />
      )}
    </TutorialContext.Provider>
  )
}

interface TutorialOverlayProps {
  step: TutorialStep
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const element = document.querySelector(step.target) as HTMLElement
    if (element) {
      setTargetElement(element)
      element.style.position = 'relative'
      element.style.zIndex = '10001'
      element.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7)'
      element.style.borderRadius = '8px'

      // Calculate tooltip position
      const rect = element.getBoundingClientRect()
      const tooltipWidth = 380
      const tooltipHeight = 200

      let top = rect.bottom + 10
      let left = rect.left + (rect.width / 2) - (tooltipWidth / 2)

      // Adjust for screen boundaries
      if (left < 10) left = 10
      if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10
      if (top + tooltipHeight > window.innerHeight - 10) top = rect.top - tooltipHeight - 10

      // For center placement
      if (step.placement === 'center') {
        top = (window.innerHeight / 2) - (tooltipHeight / 2)
        left = (window.innerWidth / 2) - (tooltipWidth / 2)
      }

      setTooltipPosition({ top, left })
    }

    return () => {
      if (element) {
        element.style.position = ''
        element.style.zIndex = ''
        element.style.boxShadow = ''
        element.style.borderRadius = ''
      }
    }
  }, [step])

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/70 z-10000" />
      
      {/* Tutorial tooltip */}
      <Card 
        className="fixed z-10002 w-96 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl"
        style={{ 
          top: tooltipPosition.top, 
          left: tooltipPosition.left 
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-400">{step.title}</h3>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-slate-300 mb-6 leading-relaxed">{step.content}</p>
          
          {step.showProgress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Step {currentStep + 1} of {totalSteps}</span>
                <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSkip}>
                <SkipForward className="w-4 h-4 mr-1" />
                Skip Tour
              </Button>
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={onPrev}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                size="sm" 
                onClick={onNext}
              >
                {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}