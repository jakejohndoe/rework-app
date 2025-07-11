// Enhanced Finalize Page with Premium Design System Applied - COMPLETE FIXED VERSION
// src/app/dashboard/resume/[id]/finalize/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
// ✅ ADDED: Import the minimum loading hook
import { useFinalizeLoading } from '@/hooks/useMinimumLoading'
import ResumeLoader from '@/components/resume-loader'
import { ArrowLeft, CheckCircle, Download, Sparkles, ArrowRight, Brain, Crown, Palette, FileText, PartyPopper, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { SVGResumePreview } from '@/components/resume/SVGResumePreview'
import confetti from 'canvas-confetti'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Template {
  id: string
  name: string
  description: string
  color: string
  icon: string
  recommended?: boolean
}

const templates: Template[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean and corporate-friendly design perfect for traditional industries',
    color: 'from-blue-500 to-blue-600',
    icon: '💼',
    recommended: true
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with subtle color accents for tech and creative roles',
    color: 'from-purple-500 to-purple-600',
    icon: '🚀'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean and content-focused for maximum readability',
    color: 'from-green-500 to-green-600',
    icon: '✨'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unique design elements perfect for creative and design professionals',
    color: 'from-orange-500 to-orange-600',
    icon: '🎨'
  }
]

// Template color mapping - each template gets its matching default color
const templateColorMap = {
  professional: { primary: '#2563eb', accent: '#3b82f6' }, // Blue
  modern: { primary: '#7c3aed', accent: '#8b5cf6' },        // Purple  
  minimal: { primary: '#059669', accent: '#10b981' },       // Green
  creative: { primary: '#dc2626', accent: '#ef4444' }       // Red/Orange
}

// Color options for customization
const colorOptions = [
  { name: 'Professional Blue', primary: '#2563eb', accent: '#3b82f6' },
  { name: 'Success Green', primary: '#059669', accent: '#10b981' },
  { name: 'Creative Purple', primary: '#7c3aed', accent: '#8b5cf6' },
  { name: 'Bold Red', primary: '#dc2626', accent: '#ef4444' },
  { name: 'Modern Teal', primary: '#0891b2', accent: '#06b6d4' },
  { name: 'Executive Gray', primary: '#374151', accent: '#6b7280' }
]

export default function EnhancedFinalizePage() {
  console.log('🎯 FINALIZE DEBUG: Component mounted')
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const resumeId = params.id as string
  console.log('🎯 FINALIZE DEBUG: Resume ID:', resumeId)
  console.log('🎯 FINALIZE DEBUG: Session status:', status)
  
  // ✅ ADDED: Minimum loading hook for nice loading transition
  const { shouldHideContent } = useFinalizeLoading()

  const [selectedTemplate, setSelectedTemplate] = useState('professional')
  // Dynamic default colors based on template instead of hardcoded blue
  const [selectedColors, setSelectedColors] = useState(() => 
    templateColorMap['professional']
  )
  const [isDownloading, setIsDownloading] = useState(false)
  const [resumeData, setResumeData] = useState<any>(null)
  const [showSuccessCard, setShowSuccessCard] = useState(false)
  
  // Premium UI State
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isMounted, setIsMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Client-side mount check
  useEffect(() => {
    setIsMounted(true)
    setTimeout(() => setIsLoaded(true), 100)
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

  // Update colors when template changes to match template defaults
  useEffect(() => {
    setSelectedColors(templateColorMap[selectedTemplate as keyof typeof templateColorMap])
  }, [selectedTemplate])

  // ✅ FIXED: Fetch resume data (simplified - no manual loading control needed)
  const fetchResumeData = async () => {
    console.log('🎯 FINALIZE DEBUG: Starting data fetch...')
    try {
      const response = await fetch(`/api/resumes/${resumeId}`)
      console.log('🎯 FINALIZE DEBUG: API response:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('🎯 FINALIZE DEBUG: Data received:', !!data)
        setResumeData(data)
      }
    } catch (error) {
      console.error('🎯 FINALIZE DEBUG: Fetch error:', error)
      toast.error('Failed to load resume data')
    }
  }

  useEffect(() => {
    console.log('🎯 FINALIZE DEBUG: useEffect triggered - status:', status, 'session:', !!session)
    if (status === 'loading') {
      console.log('🎯 FINALIZE DEBUG: Status is loading, waiting...')
      return
    }
    
    if (!session) {
      console.log('🎯 FINALIZE DEBUG: No session, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    console.log('🎯 FINALIZE DEBUG: Starting fetchResumeData')
    fetchResumeData()
  }, [session, status, resumeId])

  // Show loading screen for session loading or minimum loading time
  if (status === "loading" || shouldHideContent) {
    return <ResumeLoader title="Finalizing your resume" subtitle="Preparing download options..." />
  }
  
  // Don't wait for resume data - show the page and let components handle missing data
  if (!session) {
    router.push('/auth/signin')
    return null
  }
  
  console.log('🎯 FINALIZE DEBUG: Proceeding to render main content')

  const handleBackToDashboard = () => {
    router.push(`/dashboard`)
  }

  const triggerConfetti = () => {
    // Enhanced VICTORIOUS confetti celebration!
    const count = 300
    const defaults = {
      origin: { y: 0.7 }
    }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        scalar: 1.4,
        shapes: ['star', 'circle', 'square'],
        colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ffd700', '#ff69b4']
      })
    }

    // Initial burst
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })
    fire(0.2, {
      spread: 60,
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })

    // Secondary celebration burst after delay
    setTimeout(() => {
      fire(0.3, {
        spread: 80,
        startVelocity: 60,
        origin: { x: 0.2, y: 0.6 }
      })
      fire(0.3, {
        spread: 80,
        startVelocity: 60,
        origin: { x: 0.8, y: 0.6 }
      })
    }, 300)

    // Final victory burst
    setTimeout(() => {
      fire(0.4, {
        spread: 150,
        startVelocity: 70,
        decay: 0.85,
        scalar: 1.6,
        shapes: ['star'],
        colors: ['#ffd700', '#ffff00', '#ff4500']
      })
    }, 600)
  }

  const handleEditMore = () => {
    router.push(`/dashboard/resume/${resumeId}/analysis`)
  }

  // Handle downloads with the fixed API
  const handleDownload = async (version: 'original' | 'optimized') => {
    setIsDownloading(true)
    
    try {
      // No toast needed - we'll show success with confetti
      
      // Use the fixed download API with colors
      const response = await fetch(`/api/resumes/${resumeId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          version,
          template: selectedTemplate,
          colors: selectedColors
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Download failed: ${errorText}`)
      }

      // Handle PDF download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume-${version}-${selectedTemplate}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Trigger confetti and show success card instead of toast
      triggerConfetti()
      setShowSuccessCard(true)
      // Auto-hide success card after 10 seconds
      setTimeout(() => setShowSuccessCard(false), 10000)
      
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'download' })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Success Card */}
      {showSuccessCard && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-500">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border-green-400/30 shadow-2xl max-w-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                  <PartyPopper className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">Congratulations! 🎉</CardTitle>
                  <CardDescription className="text-green-100">Your optimized resume is ready</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-50 text-sm leading-relaxed">
                Your AI-enhanced resume has been successfully downloaded! It's been tailored to match your target job description and optimized for ATS systems.
              </p>
              <div className="flex items-center gap-2 text-sm text-green-200">
                <CheckCircle className="w-4 h-4" />
                <span>40% higher ATS match rate</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-200">
                <Zap className="w-4 h-4" />
                <span>Industry-specific keywords added</span>
              </div>
              <Button 
                onClick={handleBackToDashboard}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Premium Background Effects */}
      {isMounted && (
        <>
          {/* Floating Particles */}
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

          {/* Dynamic Gradient Mesh */}
          <div 
            className="absolute inset-0 opacity-30 transition-all duration-1000"
            style={{
              backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)`
            }}
          />
        </>
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

      <div className="circuit-bg min-h-screen relative z-10">
        {/* Enhanced Header with Premium Glassmorphism */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-slate-900/30 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">rework</span>
                </Link>

                <Button 
                  variant="ghost" 
                  onClick={handleBackToDashboard}
                  className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  back to dashboard
                </Button>
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                {/* Enhanced Step Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-glow">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-green-400 font-medium gradient-text">edit resume</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-glow">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-green-400 font-medium gradient-text">job description</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-glow">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-green-400 font-medium gradient-text">ai analysis</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center animate-glow">
                      <Download className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium gradient-text">finalize</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {resumeData?.lastOptimized && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border border-green-500/30 animate-pulse">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    ai enhanced
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Download className="w-3 h-3 mr-1" />
                  ready to download
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Enhanced Page Header */}
            <div className={`text-center space-y-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto animate-float">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="gradient-text">🎉 optimization complete!</span>
                </h1>
                <p className="text-slate-400 text-lg">
                  your resume has been enhanced with ai suggestions. choose your perfect template and colors below.
                </p>
              </div>
            </div>

            {/* Enhanced Template Selection - FIXED BADGE POSITIONING */}
            <div className={`glass-card border-white/10 p-8 hover:scale-[1.005] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    <span className="gradient-text">choose your template</span>
                  </h2>
                  <p className="text-slate-400">select the perfect design for your industry and personal style</p>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">4 professional templates</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {templates.map((template, index) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedTemplate === template.id
                        ? 'border-cyan-400 bg-cyan-500/30 shadow-lg shadow-cyan-500/25 backdrop-blur-sm'
                        : 'border-white/20 glass hover:border-white/40'
                    } ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    {/* FIXED: Badge positioning - centered at top, no overlap, no blinking */}
                    {template.recommended && (
                      <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs px-3 py-1 rounded-full font-bold z-10 shadow-lg transition-all duration-300 ${
                        selectedTemplate === template.id 
                          ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-cyan-900' 
                          : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900'
                      }`}>
                        👑 recommended
                      </div>
                    )}
                    
                    <div className={`w-full h-24 bg-gradient-to-br ${template.color} rounded-xl mb-4 flex items-center justify-center text-4xl shadow-lg`}>
                      {template.icon}
                    </div>
                    
                    <h3 className="text-white font-semibold text-lg mb-2">{template.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{template.description}</p>
                    
                    {selectedTemplate === template.id && (
                      <div className="absolute inset-0 border-2 border-cyan-400 rounded-xl pointer-events-none">
                        <div className="absolute top-3 left-3 bg-cyan-400 text-cyan-900 rounded-full p-1">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Color Customization - COMPACT LAYOUT */}
            <div className={`glass-card border-white/10 p-6 hover:scale-[1.005] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-lg font-bold gradient-text">color customization</h3>
                      <p className="text-slate-400 text-sm">
                        {colorOptions.find(c => c.primary === selectedColors.primary)?.name || 'Custom'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* COMPACT: Horizontal Color Options */}
                <div className="flex items-center gap-3">
                  {colorOptions.map((option, index) => {
                    const isSelected = selectedColors.primary === option.primary
                    
                    return (
                      <button
                        key={option.name}
                        onClick={() => setSelectedColors({ primary: option.primary, accent: option.accent })}
                        className={`relative group transition-all duration-300 ${
                          isSelected ? 'scale-110' : 'hover:scale-105'
                        } ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{ transitionDelay: `${500 + index * 50}ms` }}
                        title={option.name}
                      >
                        {/* Compact Color dot */}
                        <div className={`w-10 h-10 rounded-full p-0.5 transition-all duration-300 ${
                          isSelected 
                            ? 'bg-white/40 shadow-lg ring-2 ring-white/60' 
                            : 'glass hover:bg-white/20'
                        }`}>
                          <div 
                            className="w-full h-full rounded-full relative overflow-hidden shadow-md"
                            style={{ 
                              background: `linear-gradient(135deg, ${option.primary} 0%, ${option.accent} 100%)` 
                            }}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Enhanced Preview Section */}
            <div className={`glass-card border-white/10 p-8 mt-8 hover:scale-[1.005] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    <span className="gradient-text">preview your resume</span>
                  </h2>
                  <p className="text-slate-400">
                    {`your ai-optimized resume with the ${templates.find(t => t.id === selectedTemplate)?.name} template`}
                  </p>
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <SVGResumePreview
                  resumeId={resumeId}
                  version="optimized"
                  template={selectedTemplate}
                  title="Your Optimized Resume"
                  subtitle="Ready for download"
                  showDownload={true}
                  onDownload={() => handleDownload('optimized')}
                  colors={selectedColors}
                />
              </div>
            </div>

            {/* Enhanced Download Section */}
            <div className={`glass-card border-white/10 p-8 hover:scale-[1.01] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                    <Download className="w-8 h-8 text-cyan-400" />
                    <span className="gradient-text">ready to download!</span>
                  </h2>
                  <p className="text-slate-300 text-lg mb-4">
                    your ai-optimized resume is ready with the {templates.find(t => t.id === selectedTemplate)?.name} template and {colorOptions.find(c => c.primary === selectedColors.primary)?.name} colors
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1">
                      ✨ AI Enhanced
                    </Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1">
                      {templates.find(t => t.id === selectedTemplate)?.name} Template
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1">
                      {colorOptions.find(c => c.primary === selectedColors.primary)?.name}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Primary download button */}
                  <Button
                    onClick={() => handleDownload('optimized')}
                    disabled={isDownloading}
                    className="btn-gradient hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/40 relative overflow-hidden group px-12 py-6 text-xl font-bold min-w-[320px] rounded-2xl"
                  >
                    {/* Enhanced shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                    
                    {/* Victory sparkles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-pulse opacity-60"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${20 + (i % 2) * 60}%`,
                            animationDelay: `${i * 0.2}s`,
                            animationDuration: `${1.5 + (i % 3) * 0.5}s`
                          }}
                        />
                      ))}
                    </div>

                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {isDownloading ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>generating your resume...</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Crown className="w-6 h-6 text-yellow-300 animate-bounce" />
                            <Download className="w-6 h-6" />
                            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-bold">Download Resume</span>
                            <span className="text-sm opacity-90">AI-Optimized & Ready!</span>
                          </div>
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={handleEditMore}
                  className="text-slate-400 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  make more changes
                </Button>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Floating Download Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => handleDownload('optimized')}
          disabled={isDownloading}
          className="btn-gradient hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/40 relative overflow-hidden group px-6 py-3 text-lg font-bold rounded-full shadow-lg"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
          
          {/* Floating sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse opacity-60"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${20 + (i % 2) * 60}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${1.5 + (i % 3) * 0.5}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-center gap-2">
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download</span>
              </>
            )}
          </div>
        </Button>
      </div>

      {/* Premium CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes glow {
          from {
            box-shadow: 0 0 20px rgba(44, 199, 208, 0.2);
          }
          to {
            box-shadow: 0 0 30px rgba(44, 199, 208, 0.4), 0 0 40px rgba(139, 92, 246, 0.2);
          }
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  )
}