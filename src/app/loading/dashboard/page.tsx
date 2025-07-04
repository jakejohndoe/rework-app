'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, FileText, Brain } from 'lucide-react'

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
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Floating Particles Background */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse ${
                i % 3 === 0 ? 'w-2 h-2 bg-cyan-400/40' : 
                i % 3 === 1 ? 'w-1.5 h-1.5 bg-purple-400/30' : 
                'w-1 h-1 bg-emerald-400/25'
              }`}
              style={{
                left: `${(i * 13 + 10) % 90 + 5}%`,
                top: `${(i * 17 + 15) % 80 + 10}%`,
                animationDelay: `${(i * 0.4) % 4}s`,
                animationDuration: `${3 + (i % 3)}s`,
                boxShadow: i % 3 === 0 ? '0 0 10px rgba(44, 199, 208, 0.4)' : 
                          i % 3 === 1 ? '0 0 8px rgba(147, 51, 234, 0.3)' : 
                          '0 0 6px rgba(16, 185, 129, 0.2)'
              }}
            />
          ))}
        </div>
      )}

      {/* Dynamic Gradient Mesh Background */}
      {isMounted && (
        <div 
          className="absolute inset-0 opacity-20 transition-all duration-1000"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.2) 0%, transparent 70%)`
          }}
        />
      )}

      {/* Circuit Background */}
      <div className="circuit-bg absolute inset-0 opacity-30"></div>

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Premium Icon with Enhanced Breathing Glow */}
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow relative"
               style={{ animation: 'breathe 3s ease-in-out infinite' }}>
            <Brain className="w-8 h-8 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-2xl animate-ping"></div>
          </div>

          {/* Enhanced Premium Title */}
          <h1 className="text-3xl font-bold mb-2">
            <span 
              className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent animate-pulse"
              style={{ 
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 4s ease-in-out infinite, text-glow 2s ease-in-out infinite alternate'
              }}
            >
              taking you to your dashboard
            </span>
          </h1>
          <p className="text-slate-300 mb-8">setting up your personalized resume workspace</p>

          {/* Enhanced Premium Resume Preview with Dynamic Glow */}
          <div className="relative mb-6">
            <div className={`glass-card p-6 relative animate-float transition-all duration-1000 ${
              progress > 60 ? 'shadow-[0_0_30px_rgba(44,199,208,0.3)]' : ''
            }`} style={{ height: '220px' }}>
              {/* Enhanced background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-50 rounded-xl"></div>
              
              {/* Dynamic glow effect that appears as content fills */}
              {progress > 40 && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-purple-400/5 animate-pulse rounded-xl"></div>
              )}
              
              <div className="space-y-3 relative z-10">
                <div className={`h-4 rounded transition-all duration-1000 transform ${
                  progress > 20 ? 'bg-gradient-to-r from-cyan-400 to-purple-500 scale-100 opacity-100' : 'bg-slate-200 scale-95 opacity-70'
                } w-3/4`}></div>
                <div className={`h-3 rounded w-1/2 transition-all duration-1000 delay-200 transform ${
                  progress > 40 ? 'bg-slate-700 scale-100 opacity-100' : 'bg-slate-200 scale-95 opacity-70'
                }`}></div>
                <div className={`h-3 rounded w-2/3 transition-all duration-1000 delay-400 transform ${
                  progress > 40 ? 'bg-slate-600 scale-100 opacity-100' : 'bg-slate-200 scale-95 opacity-70'
                }`}></div>
                <div className={`h-2 rounded w-full transition-all duration-1000 delay-600 transform ${
                  progress > 60 ? 'bg-slate-400 scale-100 opacity-100' : 'bg-slate-300 scale-95 opacity-70'
                }`}></div>
                <div className={`h-2 rounded w-5/6 transition-all duration-1000 delay-700 transform ${
                  progress > 60 ? 'bg-slate-400 scale-100 opacity-100' : 'bg-slate-300 scale-95 opacity-70'
                }`}></div>
                <div className={`h-2 rounded w-4/5 transition-all duration-1000 delay-800 transform ${
                  progress > 60 ? 'bg-slate-400 scale-100 opacity-100' : 'bg-slate-300 scale-95 opacity-70'
                }`}></div>
                <div className={`h-2 rounded w-3/5 transition-all duration-1000 delay-900 transform ${
                  progress > 60 ? 'bg-slate-400 scale-100 opacity-100' : 'bg-slate-300 scale-95 opacity-70'
                }`}></div>
                <div className={`h-3 rounded w-1/3 mt-4 transition-all duration-1000 delay-1000 transform ${
                  progress > 80 ? 'bg-slate-600 scale-100 opacity-100' : 'bg-slate-400 scale-95 opacity-70'
                }`}></div>
                <div className={`h-2 rounded w-full transition-all duration-1000 delay-1100 transform ${
                  progress > 80 ? 'bg-slate-400 scale-100 opacity-100' : 'bg-slate-300 scale-95 opacity-70'
                }`}></div>
                <div className={`h-2 rounded w-4/5 transition-all duration-1000 delay-1200 transform ${
                  progress > 80 ? 'bg-slate-400 scale-100 opacity-100' : 'bg-slate-300 scale-95 opacity-70'
                }`}></div>
              </div>
            </div>

            {/* Enhanced success checkmark - now outside the overflow container */}
            {progress === 100 && (
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(34,197,94,0.6)] z-20"
                   style={{ animation: 'success-pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Enhanced Premium Horizontal Steps with Staggered Animations */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
            {loadingSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center text-sm transition-all duration-700 hover:scale-105 ${
                  index < currentStep 
                    ? 'text-green-400 transform translate-y-0 opacity-100' 
                    : index === currentStep 
                      ? 'text-cyan-300 transform translate-y-0 opacity-100' 
                      : 'text-slate-500 transform translate-y-2 opacity-60'
                }`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  filter: index < currentStep ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.4))' : 'none'
                }}
              >
                <CheckCircle 
                  className={`w-4 h-4 mr-2 transition-all duration-700 ${
                    index < currentStep 
                      ? 'text-green-400 animate-pulse scale-110' 
                      : index === currentStep 
                        ? 'text-cyan-400 animate-pulse scale-105' 
                        : 'text-slate-600 scale-100'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 150 + 100}ms`,
                    filter: index < currentStep ? 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.6))' : 'none'
                  }}
                />
                <span className="whitespace-nowrap">{step.text}</span>
              </div>
            ))}
          </div>

          {/* Enhanced Premium Progress Bar with Dynamic Pulsing */}
          <div className="w-full glass rounded-full h-3 mb-4 relative overflow-hidden">
            {/* Enhanced background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse"></div>
            
            <div 
              className="btn-gradient h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ 
                width: `${progress}%`,
                animation: progress > 0 && progress < 100 ? 'progress-pulse 2s ease-in-out infinite' : 'none'
              }}
            >
              {/* Enhanced moving light effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
              
              {/* Enhanced shimmer sweep */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                style={{ animation: 'shimmer-sweep 1.5s infinite linear' }}
              ></div>
              
              {/* Progress tip glow */}
              {progress > 5 && progress < 100 && (
                <div className="absolute right-0 top-0 h-full w-2 bg-white/50 rounded-r-full animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Enhanced Premium Status Display with Smooth Transitions */}
          <div className="flex items-center justify-between text-sm">
            <span 
              className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-medium transition-all duration-500 transform"
              style={{ opacity: currentStep > 0 ? 1 : 0.7 }}
            >
              {currentStep > 0 ? loadingSteps[currentStep - 1]?.text : 'starting...'}
            </span>
            <span 
              className="text-cyan-400 font-bold transition-all duration-300 transform"
              style={{ 
                scale: progress % 20 === 0 && progress > 0 ? 1.1 : 1,
                filter: 'drop-shadow(0 0 4px rgba(44, 199, 208, 0.4))'
              }}
            >
              {Math.round(progress)}% complete
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Premium CSS Animations */}
      <style jsx>{`
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(300%) skewX(12deg); }
        }
        
        @keyframes breathe {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(44, 199, 208, 0.3);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(44, 199, 208, 0.5), 0 0 40px rgba(139, 92, 246, 0.3);
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes text-glow {
          0% { text-shadow: 0 0 5px rgba(44, 199, 208, 0.3); }
          100% { text-shadow: 0 0 15px rgba(44, 199, 208, 0.6), 0 0 25px rgba(139, 92, 246, 0.4); }
        }
        
        @keyframes progress-pulse {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(44, 199, 208, 0.4);
          }
          50% { 
            box-shadow: 0 0 15px rgba(44, 199, 208, 0.6), 0 0 25px rgba(139, 92, 246, 0.4);
          }
        }
        
        @keyframes success-pop {
          0% { 
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          70% { 
            transform: scale(1.2) rotate(0deg);
            opacity: 1;
          }
          100% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}