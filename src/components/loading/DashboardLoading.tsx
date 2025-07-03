"use client"

import { useEffect, useState } from 'react'
import { FileText, User, Briefcase, GraduationCap, Star, CheckCircle } from 'lucide-react'

export default function DashboardLoading() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set<number>())

  const steps = [
    { icon: User, text: "Loading your profile...", delay: 0 },
    { icon: FileText, text: "Preparing resume editor...", delay: 800 },
    { icon: Briefcase, text: "Setting up templates...", delay: 1600 },
    { icon: GraduationCap, text: "Initializing AI optimizer...", delay: 2400 },
    { icon: Star, text: "Almost ready...", delay: 3200 }
  ]

  useEffect(() => {
    const timers = steps.map((step, index) => 
      setTimeout(() => {
        setCurrentStep(index)
        setTimeout(() => {
          setCompletedSteps(prev => new Set([...prev, index]))
        }, 600)
      }, step.delay)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="circuit-bg absolute inset-0"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Taking you to your dashboard
          </h1>
          <p className="text-slate-400">
            Setting up your personalized resume workspace
          </p>
        </div>

        {/* Resume Paper Animation */}
        <div className="relative mb-12">
          <div className="bg-white rounded-lg shadow-2xl p-8 mx-auto max-w-md transform perspective-1000 animate-float">
            {/* Resume Header */}
            <div className="border-b border-slate-200 pb-4 mb-4">
              <div className={`h-6 bg-gradient-to-r from-slate-300 to-slate-200 rounded transition-all duration-1000 mb-2 ${
                completedSteps.has(0) ? 'from-primary-400 to-secondary-500' : ''
              }`}></div>
              <div className={`h-4 bg-slate-200 rounded w-3/4 transition-all duration-1000 delay-200 ${
                completedSteps.has(0) ? 'bg-slate-700' : ''
              }`}></div>
            </div>

            {/* Experience Section */}
            <div className="mb-4">
              <div className={`h-4 bg-slate-200 rounded w-1/2 mb-2 transition-all duration-1000 delay-400 ${
                completedSteps.has(1) ? 'bg-slate-700' : ''
              }`}></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-2">
                  <div className={`h-3 bg-slate-100 rounded w-full mb-1 transition-all duration-1000 ${
                    completedSteps.has(1) ? 'bg-slate-300' : ''
                  }`} style={{ transitionDelay: `${600 + i * 200}ms` }}></div>
                  <div className={`h-3 bg-slate-100 rounded w-4/5 transition-all duration-1000 ${
                    completedSteps.has(1) ? 'bg-slate-300' : ''
                  }`} style={{ transitionDelay: `${700 + i * 200}ms` }}></div>
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div className="mb-4">
              <div className={`h-4 bg-slate-200 rounded w-1/3 mb-2 transition-all duration-1000 delay-1000 ${
                completedSteps.has(2) ? 'bg-slate-700' : ''
              }`}></div>
              <div className="flex flex-wrap gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`h-6 bg-slate-100 rounded px-2 transition-all duration-1000 ${
                    completedSteps.has(2) ? 'bg-primary-100' : ''
                  }`} style={{ 
                    transitionDelay: `${1200 + i * 100}ms`,
                    width: `${Math.random() * 40 + 60}px`
                  }}></div>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div>
              <div className={`h-4 bg-slate-200 rounded w-2/5 mb-2 transition-all duration-1000 delay-1800 ${
                completedSteps.has(3) ? 'bg-slate-700' : ''
              }`}></div>
              <div className={`h-3 bg-slate-100 rounded w-full mb-1 transition-all duration-1000 delay-2000 ${
                completedSteps.has(3) ? 'bg-slate-300' : ''
              }`}></div>
              <div className={`h-3 bg-slate-100 rounded w-3/4 transition-all duration-1000 delay-2200 ${
                completedSteps.has(3) ? 'bg-slate-300' : ''
              }`}></div>
            </div>

            {/* Completion Checkmark */}
            {completedSteps.has(4) && (
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-primary-400/20 rounded-full animate-ping"></div>
          <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-secondary-400/20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep >= index
            const isComplete = completedSteps.has(index)
            
            return (
              <div key={index} className={`flex items-center space-x-4 transition-all duration-500 ${
                isActive ? 'opacity-100 transform translate-x-0' : 'opacity-30 transform translate-x-4'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isComplete 
                    ? 'bg-green-500' 
                    : isActive 
                      ? 'bg-primary-400 animate-pulse' 
                      : 'bg-slate-600'
                }`}>
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`text-lg transition-all duration-500 ${
                  isComplete 
                    ? 'text-green-400' 
                    : isActive 
                      ? 'text-white' 
                      : 'text-slate-500'
                }`}>
                  {step.text}
                </div>
                {isActive && !isComplete && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-400 to-secondary-500 transition-all duration-1000 ease-out"
              style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-slate-400">
            {Math.round((completedSteps.size / steps.length) * 100)}% complete
          </div>
        </div>
      </div>
    </div>
  )
}