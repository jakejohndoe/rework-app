// Enhanced Finalize Page with Premium Design System Applied
// src/app/dashboard/resume/[id]/finalize/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, CheckCircle, Download, Eye, EyeOff, Sparkles, ArrowRight, Brain, Crown, Palette, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { SVGResumePreview } from '@/components/resume/SVGResumePreview'

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
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const resumeId = params.id as string

  const [selectedTemplate, setSelectedTemplate] = useState('professional')
  const [selectedColors, setSelectedColors] = useState({ 
    primary: '#2563eb', 
    accent: '#3b82f6' 
  })
  const [showComparison, setShowComparison] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [resumeData, setResumeData] = useState<any>(null)
  
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

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchResumeData()
  }, [session, status, resumeId])

  const fetchResumeData = async () => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`)
      if (response.ok) {
        const data = await response.json()
        setResumeData(data)
      }
    } catch (error) {
      console.error('Failed to fetch resume data:', error)
      toast.error('Failed to load resume data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToAnalysis = () => {
    router.push(`/dashboard/resume/${resumeId}/analysis`)
  }

  const handleEditMore = () => {
    router.push(`/dashboard/resume/${resumeId}/analysis`)
  }

  // Handle downloads with the fixed API
  const handleDownload = async (version: 'original' | 'optimized') => {
    setIsDownloading(true)
    
    try {
      toast.loading(`Generating ${version} resume PDF with ${templates.find(t => t.id === selectedTemplate)?.name} template...`, { id: 'download' })
      
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

      toast.success(`✅ ${version} resume downloaded successfully!`, { id: 'download' })
      
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'download' })
    } finally {
      setIsDownloading(false)
    }
  }

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Premium Loading Background */}
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
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)`
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
        
        <div className="circuit-bg min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-glow">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              <span className="gradient-text">preparing final resume</span>
            </h1>
            <div className="flex justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-slate-400">loading templates and customization...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
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
                <div className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">rework</span>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={handleBackToAnalysis}
                  className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  back to analysis
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
          <div className="max-w-7xl mx-auto space-y-8">
            
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

            {/* Enhanced Success Message */}
            <div className={`glass-card border-green-500/30 p-8 hover:scale-[1.01] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 animate-glow">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-3">
                    <span className="gradient-text">resume optimization complete!</span>
                  </h2>
                  <p className="text-slate-300 text-lg mb-4">
                    your resume has been enhanced with ai suggestions and is now ready for customization and download.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                      ✨ AI Enhanced
                    </Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      🎯 Job-Optimized
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      📄 Ready to Download
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Template Selection */}
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
                        ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/25'
                        : 'border-white/20 glass hover:border-white/40'
                    } ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    {template.recommended && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                        👑 recommended
                      </div>
                    )}
                    
                    <div className={`w-full h-24 bg-gradient-to-br ${template.color} rounded-xl mb-4 flex items-center justify-center text-4xl shadow-lg`}>
                      {template.icon}
                    </div>
                    
                    <h3 className="text-white font-semibold text-lg mb-2">{template.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{template.description}</p>
                    
                    {selectedTemplate === template.id && (
                      <div className="absolute inset-0 border-2 border-cyan-400 rounded-xl pointer-events-none animate-pulse">
                        <div className="absolute top-3 left-3 bg-cyan-400 text-cyan-900 rounded-full p-1">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Color Customization */}
            <div className={`glass-card border-white/10 p-8 hover:scale-[1.005] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <Palette className="w-6 h-6 text-cyan-400" />
                    <span className="gradient-text">color customization</span>
                  </h2>
                  <p className="text-slate-400">
                    currently selected: <span className="text-white font-medium">
                      {colorOptions.find(c => c.primary === selectedColors.primary)?.name || 'Custom'}
                    </span>
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {colorOptions.map((option, index) => {
                    const isSelected = selectedColors.primary === option.primary
                    
                    return (
                      <button
                        key={option.name}
                        onClick={() => setSelectedColors({ primary: option.primary, accent: option.accent })}
                        className={`relative group transition-all duration-300 ${
                          isSelected ? 'scale-125' : 'hover:scale-110'
                        } ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{ transitionDelay: `${500 + index * 50}ms` }}
                        title={option.name}
                      >
                        {/* Color dot container */}
                        <div className={`w-12 h-12 rounded-full p-1 transition-all duration-300 ${
                          isSelected 
                            ? 'bg-white/30 shadow-xl ring-2 ring-white/50' 
                            : 'glass hover:bg-white/20'
                        }`}>
                          {/* Primary color */}
                          <div 
                            className="w-full h-full rounded-full relative overflow-hidden shadow-lg"
                            style={{ 
                              background: `linear-gradient(135deg, ${option.primary} 0%, ${option.accent} 100%)` 
                            }}
                          >
                            {/* Selection indicator */}
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white drop-shadow-lg animate-pulse" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced Tooltip */}
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-3 py-1 glass text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-white/20">
                          {option.name}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Enhanced Preview Section */}
            <div className={`glass-card border-white/10 p-8 hover:scale-[1.005] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    <span className="gradient-text">preview your resume</span>
                  </h2>
                  <p className="text-slate-400">
                    {showComparison ? 'see the improvements made with ai optimization' : `your ai-optimized resume with the ${templates.find(t => t.id === selectedTemplate)?.name} template`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(!showComparison)}
                  className="border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  {showComparison ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      hide comparison
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      show before/after
                    </>
                  )}
                </Button>
              </div>

              {showComparison ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <SVGResumePreview
                    resumeId={resumeId}
                    version="original"
                    template={selectedTemplate}
                    title="Original Resume"
                    subtitle="Before AI optimization"
                    colors={selectedColors}
                  />
                  
                  <SVGResumePreview
                    resumeId={resumeId}
                    version="optimized"
                    template={selectedTemplate}
                    title="Optimized Resume"
                    subtitle="Enhanced with AI suggestions"
                    colors={selectedColors}
                  />
                </div>
              ) : (
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
              )}
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
                  {/* Secondary button for original */}
                  <Button
                    variant="outline"
                    onClick={() => handleDownload('original')}
                    disabled={isDownloading}
                    className="border-slate-500/30 text-slate-400 hover:bg-white/5 hover:scale-105 transition-all duration-300 px-6"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    download original
                  </Button>
                  
                  {/* Primary button for optimized */}
                  <Button
                    onClick={() => handleDownload('optimized')}
                    disabled={isDownloading}
                    className="btn-gradient hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group px-8 py-3"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                    <div className="relative z-10 flex items-center gap-2">
                      {isDownloading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                      download optimized resume
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