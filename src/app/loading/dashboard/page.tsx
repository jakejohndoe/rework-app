// src/components/loading/DashboardLoading.tsx - EXACT ORIGINAL LOGIC, only height changed

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, FileText } from 'lucide-react'

const loadingSteps = [
  { id: 1, text: "Loading your profile...", duration: 800 },
  { id: 2, text: "Preparing resume editor...", duration: 600 },
  { id: 3, text: "Setting up templates...", duration: 700 },
  { id: 4, text: "Initializing AI optimizer...", duration: 900 },
  { id: 5, text: "Almost ready...", duration: 500 }
]

export default function DashboardLoading() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let stepIndex = 0
    let progressValue = 0

    const runSteps = () => {
      if (stepIndex < loadingSteps.length) {
        setCurrentStep(stepIndex + 1)
        
        // Animate progress
        const stepProgress = ((stepIndex + 1) / loadingSteps.length) * 100
        const progressInterval = setInterval(() => {
          progressValue += 2
          if (progressValue >= stepProgress) {
            progressValue = stepProgress
            clearInterval(progressInterval)
          }
          setProgress(progressValue)
        }, 20)

        setTimeout(() => {
          stepIndex++
          runSteps()
        }, loadingSteps[stepIndex].duration)
      } else {
        // Complete and redirect
        setTimeout(() => {
          router.push('/dashboard')
        }, 300)
      }
    }

    runSteps()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">Taking you to your dashboard</h1>
        <p className="text-slate-300 mb-8">Setting up your personalized resume workspace</p>

        {/* Compact Resume Preview - ONLY CHANGE: Reduced height from 300px+ to 200px */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-lg" style={{ height: '200px' }}>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            <div className="h-2 bg-slate-800 rounded w-1/2"></div>
            <div className="h-2 bg-slate-600 rounded w-2/3"></div>
            <div className="h-1 bg-slate-300 rounded w-full"></div>
            <div className="h-1 bg-slate-300 rounded w-5/6"></div>
            <div className="h-1 bg-slate-300 rounded w-4/5"></div>
            <div className="h-1 bg-slate-300 rounded w-3/5"></div>
            <div className="h-2 bg-slate-400 rounded w-1/3"></div>
            <div className="mt-4 h-2 bg-slate-600 rounded w-1/2"></div>
            <div className="h-1 bg-slate-300 rounded w-full"></div>
            <div className="h-1 bg-slate-300 rounded w-4/5"></div>
          </div>
        </div>

        {/* Horizontal checkmarks going horizontally instead of vertically */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
          {loadingSteps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-center text-sm transition-all duration-300 ${
                index < currentStep 
                  ? 'text-green-400' 
                  : index === currentStep 
                    ? 'text-white' 
                    : 'text-slate-500'
              }`}
            >
              <CheckCircle 
                className={`w-4 h-4 mr-2 transition-all duration-300 ${
                  index < currentStep 
                    ? 'text-green-400' 
                    : index === currentStep 
                      ? 'text-cyan-400' 
                      : 'text-slate-600'
                }`} 
              />
              <span className="whitespace-nowrap">{step.text}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Current Step and Progress Percentage */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">
            {currentStep > 0 ? loadingSteps[currentStep - 1]?.text : 'Starting...'}
          </span>
          <span className="text-cyan-400 font-medium">
            {Math.round(progress)}% complete
          </span>
        </div>
      </div>
    </div>
  )
}