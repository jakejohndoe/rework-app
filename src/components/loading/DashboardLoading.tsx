"use client"

import { useEffect, useState } from 'react'
import { FileText, User, Briefcase, GraduationCap, Star, CheckCircle } from 'lucide-react'
import { Logo, BetaBadge } from '@/components/ui/logo'

export default function DashboardLoading() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set<number>())
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isMounted, setIsMounted] = useState(false)

  const steps = [
    { icon: User, text: "Loading your profile...", delay: 0 },
    { icon: FileText, text: "Preparing resume editor...", delay: 800 },
    { icon: Briefcase, text: "Setting up templates...", delay: 1600 },
    { icon: GraduationCap, text: "Initializing AI optimizer...", delay: 2400 },
    { icon: Star, text: "Almost ready...", delay: 3200 }
  ]

  // Client-side mount check
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mouse tracking for premium effects
  useEffect(() => {
    if (!isMounted) return
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth * 100, y: e.clientY / window.innerHeight * 100 })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMounted])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Floating Particles Background */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-pulse"
              style={{
                left: `${(i * 13 + 10) % 90 + 5}%`,
                top: `${(i * 17 + 15) % 80 + 10}%`,
                animationDelay: `${(i * 0.3) % 3}s`,
                animationDuration: `${3 + (i % 3)}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Dynamic Gradient Mesh Background */}
      {isMounted && (
        <div 
          className="absolute inset-0 opacity-30 transition-all duration-1000"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)`
          }}
        />
      )}

      {/* Circuit Background */}
      <div className="circuit-bg absolute inset-0"></div>

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Premium Header */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 animate-glow flex flex-col items-center gap-4">
            <Logo size="small" variant="simple" showBadge={false} className="mx-auto" />
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold gradient-text">ReWork</span>
              <BetaBadge size="small" className="animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Taking you to your dashboard</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Setting up your personalized resume workspace
          </p>
        </div>

        {/* Premium Resume Paper Animation */}
        <div className="relative mb-12 flex justify-center">
          <div className="glass-card p-8 max-w-md w-full animate-float relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
            
            <div className="relative z-10">
              {/* Resume Header */}
              <div className="border-b border-slate-300/30 pb-4 mb-4">
                <div className={`h-6 rounded transition-all duration-1000 mb-2 ${
                  completedSteps.has(0) ? 'btn-gradient' : 'bg-gradient-to-r from-slate-300 to-slate-200'
                }`}></div>
                <div className={`h-4 rounded w-3/4 transition-all duration-1000 delay-200 ${
                  completedSteps.has(0) ? 'bg-slate-700' : 'bg-slate-200'
                }`}></div>
              </div>

              {/* Experience Section */}
              <div className="mb-4">
                <div className={`h-4 rounded w-1/2 mb-2 transition-all duration-1000 delay-400 ${
                  completedSteps.has(1) ? 'bg-slate-700' : 'bg-slate-200'
                }`}></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="mb-2">
                    <div className={`h-3 rounded w-full mb-1 transition-all duration-1000 ${
                      completedSteps.has(1) ? 'bg-slate-300' : 'bg-slate-100'
                    }`} style={{ transitionDelay: `${600 + i * 200}ms` }}></div>
                    <div className={`h-3 rounded w-4/5 transition-all duration-1000 ${
                      completedSteps.has(1) ? 'bg-slate-300' : 'bg-slate-100'
                    }`} style={{ transitionDelay: `${700 + i * 200}ms` }}></div>
                  </div>
                ))}
              </div>

              {/* Skills Section */}
              <div className="mb-4">
                <div className={`h-4 rounded w-1/3 mb-2 transition-all duration-1000 delay-1000 ${
                  completedSteps.has(2) ? 'bg-slate-700' : 'bg-slate-200'
                }`}></div>
                <div className="flex flex-wrap gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-6 rounded px-2 transition-all duration-1000 ${
                      completedSteps.has(2) ? 'bg-cyan-200' : 'bg-slate-100'
                    }`} style={{ 
                      transitionDelay: `${1200 + i * 100}ms`,
                      width: `${Math.random() * 40 + 60}px`
                    }}></div>
                  ))}
                </div>
              </div>

              {/* Education Section */}
              <div>
                <div className={`h-4 rounded w-2/5 mb-2 transition-all duration-1000 delay-1800 ${
                  completedSteps.has(3) ? 'bg-slate-700' : 'bg-slate-200'
                }`}></div>
                <div className={`h-3 rounded w-full mb-1 transition-all duration-1000 delay-2000 ${
                  completedSteps.has(3) ? 'bg-slate-300' : 'bg-slate-100'
                }`}></div>
                <div className={`h-3 rounded w-3/4 transition-all duration-1000 delay-2200 ${
                  completedSteps.has(3) ? 'bg-slate-300' : 'bg-slate-100'
                }`}></div>
              </div>
            </div>

            {/* Premium Completion Checkmark */}
            {completedSteps.has(4) && (
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Premium Floating Elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-cyan-400/20 rounded-full animate-ping"></div>
          <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-purple-400/20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Premium Progress Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep >= index
            const isComplete = completedSteps.has(index)
            
            return (
              <div key={index} className={`flex items-center space-x-4 transition-all duration-500 hover:scale-[1.02] ${
                isActive ? 'opacity-100 transform translate-x-0' : 'opacity-30 transform translate-x-4'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isComplete 
                    ? 'bg-green-500 animate-pulse' 
                    : isActive 
                      ? 'btn-gradient animate-glow' 
                      : 'bg-slate-600'
                }`}>
                  {isComplete ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className={`text-lg font-medium transition-all duration-500 ${
                  isComplete 
                    ? 'text-green-400' 
                    : isActive 
                      ? 'gradient-text' 
                      : 'text-slate-500'
                }`}>
                  {step.text}
                </div>
                {isActive && !isComplete && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Premium Progress Bar */}
        <div className="mt-8">
          <div className="w-full glass rounded-full h-3 overflow-hidden relative">
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-pulse"></div>
            
            <div 
              className="h-full btn-gradient transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
            >
              {/* Moving light effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              
              {/* Shimmer sweep */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                style={{ animation: 'shimmer-sweep 2s infinite linear' }}
              ></div>
            </div>
          </div>
          <div className="text-center mt-3 text-lg">
            <span className="gradient-text font-bold">
              {Math.round((completedSteps.size / steps.length) * 100)}% complete
            </span>
          </div>
        </div>
      </div>

      {/* Premium CSS Animations */}
      <style jsx>{`
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(300%) skewX(12deg); }
        }
      `}</style>
    </div>
  )
}