// Enhanced Analysis Page with Premium Design System Applied
// src/app/dashboard/resume/[id]/analysis/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import Link from "next/link"
import { DownloadButton } from "@/components/download-button"
import EnhancedAISuggestionsTab from "@/components/resume/EnhancedAISuggestionsTab"
import { 
  ArrowLeft, 
  ArrowRight,
  Download,
  CheckCircle,
  TrendingUp,
  Sparkles,
  FileText,
  Target,
  AlertTriangle,
  Brain,
  Share,
  Mail,
  Edit,
  RefreshCw,
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Star
} from "lucide-react"

// Enhanced analysis result interface
interface EnhancedAnalysisResult {
  matchScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: Array<{
    section: string
    type: 'improve' | 'add'
    current: string
    suggested: string
    impact: 'high' | 'medium' | 'low'
    reason: string
  }>
  atsScore: number
  readabilityScore: number
  completenessScore: number
  // Category-specific scores
  categoryScores: {
    contact: number
    experience: number
    skills: number
    education: number
    keywords: number
  }
  jobApplication?: {
    id: string
    jobTitle: string
    company: string
    status: string
  }
  optimizedContent?: {
    contactInfo?: any
    summary?: string
    experience?: string
    skills?: string
    education?: string
  }
}

export default function EnhancedAnalysisPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const resumeId = params.id as string

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<EnhancedAnalysisResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resumeRefreshTrigger, setResumeRefreshTrigger] = useState(0)
  
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

  const analysisSteps = [
    "Loading resume content...",
    "Extracting structured data...",
    "Analyzing job requirements...", 
    "Performing category-specific analysis...",
    "Generating optimization suggestions...",
    "Calculating compatibility scores...",
    "Finalizing enhanced analysis..."
  ]

  // Load existing analysis or start new one
  useEffect(() => {
    const loadOrStartAnalysis = async () => {
      if (!resumeId || status !== "authenticated") return
      
      try {
        setIsLoading(true)
        await performEnhancedAnalysis()
      } catch (error) {
        console.error('Failed to load analysis:', error)
        setError('Failed to start analysis')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrStartAnalysis()
  }, [resumeId, status, resumeRefreshTrigger])

  const performEnhancedAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentStep(0)
    
    try {
      console.log('🚀 Starting enhanced AI analysis for resume:', resumeId)
      
      // Show progress through analysis steps
      for (let i = 0; i < analysisSteps.length - 1; i++) {
        setCurrentStep(i)
        await new Promise(resolve => setTimeout(resolve, 600))
      }
      
      // Perform actual enhanced AI analysis
      setCurrentStep(analysisSteps.length - 1)
      toast.loading('🧠 AI is performing enhanced analysis...', { id: 'analysis' })
      
      const response = await fetch(`/api/resumes/${resumeId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Analysis failed')
      }
      
      const data = await response.json()
      setAnalysisResults(data.analysis)
      
      toast.success('✨ Enhanced analysis complete!', { id: 'analysis' })
      console.log('✅ Enhanced AI analysis complete:', data.analysis)
      
    } catch (error) {
      console.error('❌ Analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setError(errorMessage)
      toast.error(`Analysis failed: ${errorMessage}`, { id: 'analysis' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const retryAnalysis = () => {
    setAnalysisResults(null)
    setError(null)
    performEnhancedAnalysis()
  }

  const handleEditResume = () => {
    router.push(`/dashboard/resume/${resumeId}`)
  }

  const handleEditJob = () => {
    router.push(`/dashboard/resume/${resumeId}/job-description`)
  }

  const handleBack = () => {
    router.push(`/dashboard/resume/${resumeId}/job-description`)
  }

  const handleNext = () => {
    router.push(`/dashboard/resume/${resumeId}/finalize`)
  }

  // Handle when changes are applied - refresh the resume data
  const handleChangesApplied = () => {
    console.log('🔄 Changes applied, refreshing resume data...')
    setResumeRefreshTrigger(prev => prev + 1)
    toast.success('🎉 Your resume has been optimized with AI suggestions!')
  }

  // Get category score color
  const getCategoryColor = (score: number) => {
    if (score >= 85) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contact': return <User className="w-4 h-4" />
      case 'experience': return <Briefcase className="w-4 h-4" />
      case 'skills': return <Zap className="w-4 h-4" />
      case 'education': return <GraduationCap className="w-4 h-4" />
      case 'keywords': return <Target className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
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
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              <span className="gradient-text">loading ai analysis</span>
            </h1>
            <div className="flex justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-slate-400">preparing enhanced analysis...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
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

                <Button onClick={handleBack} variant="ghost" className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  back
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
                    <div className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center animate-glow">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium gradient-text">ai analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {analysisResults && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border border-green-500/30 animate-pulse">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    analysis complete
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Brain className="w-3 h-3 mr-1" />
                  ai-powered
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Loading Analysis State */}
            {isAnalyzing && (
              <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center animate-float">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full animate-pulse"></div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bold">
                    <span className="gradient-text">🧠 enhanced ai analysis</span>
                  </h3>
                  <p className="text-slate-300 text-lg">{analysisSteps[currentStep]}</p>
                  <div className="w-80 bg-slate-700/50 rounded-full h-3 mt-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500 animate-glow"
                      style={{ width: `${((currentStep + 1) / analysisSteps.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    using advanced category-specific analysis with gpt-4o-mini...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isAnalyzing && (
              <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="w-20 h-20 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bold text-white">analysis failed</h3>
                  <p className="text-slate-300 text-lg">{error}</p>
                  <div className="flex gap-3 mt-6">
                    <Button 
                      onClick={retryAnalysis}
                      className="btn-gradient hover:scale-105 transition-all duration-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      retry analysis
                    </Button>
                    <Button 
                      onClick={handleEditJob}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                    >
                      edit job description
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Analysis Results */}
            {analysisResults && !isAnalyzing && (
              <>
                {/* Enhanced Page Header */}
                <div className={`text-center space-y-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto animate-float">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      <span className="gradient-text">🧠 analysis complete!</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                      advanced ai analysis with category-specific scoring for{" "}
                      {analysisResults.jobApplication && (
                        <span className="text-cyan-300 font-medium">
                          {analysisResults.jobApplication.jobTitle} at {analysisResults.jobApplication.company}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Enhanced Match Score and Category Metrics */}
                <Card className={`glass-card border-white/10 hover:scale-[1.01] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Overall Match Score */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-36 h-36 mb-6">
                          <div className="w-36 h-36 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25 animate-glow">
                            <span className="text-4xl font-bold text-white">{analysisResults.matchScore}%</span>
                          </div>
                        </div>
                        <h3 className="text-white font-semibold text-xl text-center mb-3 gradient-text">overall match score</h3>
                        <p className="text-slate-400 text-sm text-center">
                          {analysisResults.matchScore >= 85 ? "🎯 excellent match!" : 
                           analysisResults.matchScore >= 70 ? "✨ great match for this role!" :
                           analysisResults.matchScore >= 55 ? "⚡ good potential with improvements" :
                           "🔧 needs optimization for better fit"}
                        </p>
                      </div>

                      {/* Category Scores */}
                      <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white font-semibold text-xl mb-4 gradient-text">📊 category-specific analysis</h4>
                        
                        {analysisResults.categoryScores && Object.entries(analysisResults.categoryScores).map(([category, score], index) => (
                          <div key={category} className={`space-y-3 p-4 glass rounded-lg hover:bg-white/10 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: `${300 + index * 100}ms` }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                                  {getCategoryIcon(category)}
                                </div>
                                <span className="text-slate-200 font-medium capitalize">
                                  {category === 'contact' ? 'Contact Information' :
                                   category === 'experience' ? 'Work Experience' :
                                   category === 'skills' ? 'Skills & Technologies' :
                                   category === 'education' ? 'Education' :
                                   category === 'keywords' ? 'Keyword Optimization' : category}
                                </span>
                              </div>
                              <span className={`font-bold text-lg ${getCategoryColor(score)}`}>
                                {score}%
                              </span>
                            </div>
                            <Progress value={score} className="h-3" />
                          </div>
                        ))}
                        
                        {/* Traditional Metrics */}
                        <div className="pt-6 border-t border-white/10 space-y-4">
                          <div className="flex items-center justify-between p-3 glass rounded-lg">
                            <span className="text-slate-300 font-medium">ATS Compatibility</span>
                            <span className="text-green-400 font-bold text-lg">{analysisResults.atsScore}%</span>
                          </div>
                          <Progress value={analysisResults.atsScore} className="h-3" />
                          
                          <div className="flex items-center justify-between p-3 glass rounded-lg">
                            <span className="text-slate-300 font-medium">Content Quality</span>
                            <span className="text-green-400 font-bold text-lg">{analysisResults.readabilityScore}%</span>
                          </div>
                          <Progress value={analysisResults.readabilityScore} className="h-3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Analysis Tabs */}
                <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
                  <Tabs defaultValue="suggestions" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 glass-dark border border-white/10 p-1">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/30 data-[state=active]:text-white transition-all duration-300 hover:scale-105">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        enhanced overview
                      </TabsTrigger>
                      <TabsTrigger value="categories" className="data-[state=active]:bg-cyan-500/30 data-[state=active]:text-white transition-all duration-300 hover:scale-105">
                        <Brain className="w-4 h-4 mr-2" />
                        category breakdown
                      </TabsTrigger>
                      <TabsTrigger value="suggestions" className="data-[state=active]:bg-cyan-500/30 data-[state=active]:text-white transition-all duration-300 hover:scale-105">
                        <Sparkles className="w-4 h-4 mr-2" />
                        ai optimization
                      </TabsTrigger>
                      <TabsTrigger value="optimized" className="data-[state=active]:bg-cyan-500/30 data-[state=active]:text-white transition-all duration-300 hover:scale-105">
                        <FileText className="w-4 h-4 mr-2" />
                        optimized content
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Enhanced Strengths */}
                        <Card className="glass-card border-white/10 hover:scale-[1.01] transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="text-green-400 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              <span className="gradient-text">ai-identified strengths</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 p-3 glass rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-white font-medium">Strong Keyword Alignment</p>
                                <p className="text-slate-400 text-sm">
                                  {analysisResults.matchedKeywords.length} critical job keywords identified
                                </p>
                              </div>
                            </div>
                            
                            {analysisResults.categoryScores.contact >= 70 && (
                              <div className="flex items-start gap-3 p-3 glass rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-white font-medium">Professional Contact Information</p>
                                  <p className="text-slate-400 text-sm">Well-structured contact details with professional presentation</p>
                                </div>
                              </div>
                            )}
                            
                            {analysisResults.categoryScores.experience >= 70 && (
                              <div className="flex items-start gap-3 p-3 glass rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-white font-medium">Relevant Work Experience</p>
                                  <p className="text-slate-400 text-sm">Experience demonstrates strong alignment with role requirements</p>
                                </div>
                              </div>
                            )}
                            
                            {analysisResults.atsScore >= 80 && (
                              <div className="flex items-start gap-3 p-3 glass rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-white font-medium">ATS-Optimized Format</p>
                                  <p className="text-slate-400 text-sm">Clean formatting that works well with applicant tracking systems</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Enhanced Areas for Improvement */}
                        <Card className="glass-card border-white/10 hover:scale-[1.01] transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="text-yellow-400 flex items-center gap-2">
                              <Target className="w-5 h-5" />
                              <span className="gradient-text">ai-recommended improvements</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {analysisResults.missingKeywords.length > 0 && (
                              <div className="flex items-start gap-3 p-3 glass rounded-lg">
                                <Target className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-white font-medium">Missing Critical Keywords</p>
                                  <p className="text-slate-400 text-sm">
                                    Add: {analysisResults.missingKeywords.slice(0, 3).join(', ')}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {analysisResults.categoryScores.contact < 70 && (
                              <div className="flex items-start gap-3 p-3 glass rounded-lg">
                                <User className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-white font-medium">Contact Information Enhancement</p>
                                  <p className="text-slate-400 text-sm">Add LinkedIn profile, portfolio links, or improve formatting</p>
                                </div>
                              </div>
                            )}
                            
                            {analysisResults.suggestions.filter(s => s.impact === 'high').length > 0 && (
                              <div className="flex items-start gap-3 p-3 glass rounded-lg">
                                <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-white font-medium">High-Impact Optimizations</p>
                                  <p className="text-slate-400 text-sm">
                                    {analysisResults.suggestions.filter(s => s.impact === 'high').length} AI suggestions to significantly boost match score
                                  </p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="categories" className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {analysisResults.categoryScores && Object.entries(analysisResults.categoryScores).map(([category, score]) => (
                          <Card key={category} className="glass-card border-white/10 hover:scale-[1.01] transition-all duration-300">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                                    {getCategoryIcon(category)}
                                  </div>
                                  <span className="gradient-text">
                                    {category === 'contact' ? 'Contact Information' :
                                     category === 'experience' ? 'Work Experience' :
                                     category === 'skills' ? 'Skills & Technologies' :
                                     category === 'education' ? 'Education' :
                                     category === 'keywords' ? 'Keyword Optimization' : category}
                                  </span>
                                </CardTitle>
                                <Badge className={
                                  score >= 85 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                  score >= 70 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                  'bg-red-500/20 text-red-300 border border-red-500/30'
                                }>
                                  {score}%
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <Progress value={score} className="h-4 mb-4" />
                              <p className="text-slate-400 text-sm">
                                {score >= 85 ? '✅ Excellent performance in this category' :
                                 score >= 70 ? '⚡ Good performance with room for improvement' :
                                 '🔧 Significant improvement needed in this area'}
                              </p>
                              
                              {/* Category-specific suggestions */}
                              {analysisResults.suggestions.filter(s => 
                                s.section.toLowerCase().includes(category) || 
                                (category === 'contact' && s.section.includes('Contact'))
                              ).slice(0, 1).map((suggestion, idx) => (
                                <div key={idx} className="mt-4 p-4 glass rounded-lg border border-slate-600">
                                  <p className="text-slate-300 text-sm font-medium">AI Recommendation:</p>
                                  <p className="text-slate-400 text-sm mt-2">{suggestion.suggested}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* ENHANCED AI SUGGESTIONS TAB - This is the main new feature! */}
                    <TabsContent value="suggestions" className="space-y-6 mt-6">
                      <EnhancedAISuggestionsTab
                        suggestions={analysisResults.suggestions}
                        resumeId={resumeId}
                        onApplyChanges={handleChangesApplied}
                      />
                    </TabsContent>

                    <TabsContent value="optimized" className="space-y-6 mt-6">
                      <Card className="glass-card border-white/10 hover:scale-[1.005] transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                              <Brain className="w-5 h-5 text-white" />
                            </div>
                            <span className="gradient-text">🤖 ai-optimized content preview</span>
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            AI-generated optimizations based on structured analysis
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {analysisResults.optimizedContent ? (
                            <div className="space-y-6">
                              {analysisResults.optimizedContent.contactInfo && (
                                <div>
                                  <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    optimized contact information
                                  </h4>
                                  <div className="glass p-6 border border-green-500/30 rounded-lg">
                                    <div className="space-y-2 text-sm text-slate-200">
                                      <div className="font-medium">{analysisResults.optimizedContent.contactInfo.firstName} {analysisResults.optimizedContent.contactInfo.lastName}</div>
                                      <div>{analysisResults.optimizedContent.contactInfo.email}</div>
                                      <div>{analysisResults.optimizedContent.contactInfo.phone}</div>
                                      <div>{analysisResults.optimizedContent.contactInfo.location}</div>
                                      {analysisResults.optimizedContent.contactInfo.linkedin && (
                                        <div className="text-cyan-300">{analysisResults.optimizedContent.contactInfo.linkedin}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {analysisResults.optimizedContent.summary && (
                                <div>
                                  <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    optimized professional summary
                                  </h4>
                                  <div className="glass p-6 border border-blue-500/30 rounded-lg">
                                    <p className="text-slate-200 text-sm leading-relaxed">{analysisResults.optimizedContent.summary}</p>
                                  </div>
                                </div>
                              )}
                              
                              {analysisResults.optimizedContent.skills && (
                                <div>
                                  <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    optimized skills section
                                  </h4>
                                  <div className="glass p-6 border border-purple-500/30 rounded-lg">
                                    <p className="text-slate-200 text-sm leading-relaxed">{analysisResults.optimizedContent.skills}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="glass p-8 border border-slate-600 rounded-lg text-center">
                              <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                              <p className="text-slate-300 text-lg font-medium mb-2">
                                🔬 ai optimization analysis completed
                              </p>
                              <p className="text-slate-500 text-sm">
                                optimized content suggestions have been generated and saved for download
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Enhanced Action Buttons */}
                <Card className={`glass-card border-white/10 hover:scale-[1.01] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
                          <span className="gradient-text">🚀 ready for success?</span>
                          <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                        </h3>
                        <p className="text-slate-400">
                          use the ai optimization tab to apply suggestions, then finalize your enhanced resume
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <Button 
                          onClick={handleEditResume}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          refine resume
                        </Button>
                        <Button 
                          onClick={handleEditJob}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          update job
                        </Button>
                        <Button 
                          onClick={handleNext}
                          className="btn-gradient hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                          <div className="relative z-10 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            finalize & download
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
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