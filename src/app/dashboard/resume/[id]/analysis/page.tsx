// Redesigned Analysis Page with Live Level-Up Dashboard
// src/app/dashboard/resume/[id]/analysis/page.tsx

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { smartToast } from "@/lib/smart-toast"
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Target,
  AlertTriangle,
  Brain,
  Edit,
  RefreshCw,
  User,
  Briefcase,
  GraduationCap,
  Zap,
  BarChart3,
  Lightbulb,
  Trophy,
  Activity,
  ArrowUp,
  Eye,
  Rocket,
  Award,
  Play,
  Gauge
} from "lucide-react"

// Enhanced analysis result interface
interface EnhancedAnalysisResult {
  matchScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: Array<{
    id: string
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
}

export default function RedesignedAnalysisPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const resumeId = params.id as string

  // Core State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<EnhancedAnalysisResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Level-Up System State
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  const [animatingCategories, setAnimatingCategories] = useState<Set<string>>(new Set())
  const [previewSuggestion, setPreviewSuggestion] = useState<string | null>(null)
  
  // Performance State
  const [isMounted, setIsMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  // Mount check for performance
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Optimized mouse tracking
  useEffect(() => {
    if (!isMounted) return
    
    let rafId: number
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        setMousePosition({ 
          x: e.clientX / window.innerWidth * 100, 
          y: e.clientY / window.innerHeight * 100 
        })
        rafId = 0
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
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

  // Memoized calculations for performance
  const categoryData = useMemo(() => {
    if (!analysisResults) return []
    
    const getPerformanceLevel = (score: number) => {
      if (score >= 90) return { level: 'Excellent', color: 'text-green-400', levelDescription: 'Outstanding performance' }
      if (score >= 80) return { level: 'Strong', color: 'text-blue-400', levelDescription: 'Well above expectations' }
      if (score >= 70) return { level: 'Good', color: 'text-yellow-400', levelDescription: 'Solid foundation' }
      if (score >= 60) return { level: 'Fair', color: 'text-orange-400', levelDescription: 'Room for improvement' }
      return { level: 'Needs Work', color: 'text-red-400', levelDescription: 'Requires attention' }
    }
    
    return [
      {
        id: 'contact',
        name: 'Contact Information',
        score: analysisResults.categoryScores.contact,
        description: 'Professional contact details',
        icon: User,
        ...getPerformanceLevel(analysisResults.categoryScores.contact)
      },
      {
        id: 'experience',
        name: 'Work Experience',
        score: analysisResults.categoryScores.experience,
        description: 'Professional background',
        icon: Briefcase,
        ...getPerformanceLevel(analysisResults.categoryScores.experience)
      },
      {
        id: 'skills',
        name: 'Skills & Technologies',
        score: analysisResults.categoryScores.skills,
        description: 'Technical capabilities',
        icon: Zap,
        ...getPerformanceLevel(analysisResults.categoryScores.skills)
      },
      {
        id: 'education',
        name: 'Education',
        score: analysisResults.categoryScores.education,
        description: 'Academic background',
        icon: GraduationCap,
        ...getPerformanceLevel(analysisResults.categoryScores.education)
      },
      {
        id: 'keywords',
        name: 'ATS Optimization',
        score: analysisResults.categoryScores.keywords,
        description: 'Keyword alignment',
        icon: Target,
        ...getPerformanceLevel(analysisResults.categoryScores.keywords)
      }
    ]
  }, [analysisResults])

  // Calculate level-up improvements
  const calculateImprovement = useCallback((suggestionId: string) => {
    if (!analysisResults) return {}
    
    const suggestion = analysisResults.suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return {}
    
    const sectionKey = suggestion.section.toLowerCase()
    const baseScore = analysisResults.categoryScores[sectionKey as keyof typeof analysisResults.categoryScores] || 0
    
    // Impact-based improvements
    const improvement = suggestion.impact === 'high' ? 18 : 
                       suggestion.impact === 'medium' ? 12 : 8
    
    const newScore = Math.min(100, baseScore + improvement)
    
    return {
      category: sectionKey,
      oldScore: baseScore,
      newScore,
      improvement
    }
  }, [analysisResults])

  // Get current displayed score (with stacked improvements)
  const getCurrentScore = useCallback((categoryId: string) => {
    if (!analysisResults) return 0
    
    let baseScore = analysisResults.categoryScores[categoryId as keyof typeof analysisResults.categoryScores] || 0
    let totalImprovement = 0
    
    // Stack all improvements for this category from applied suggestions
    appliedSuggestions.forEach(suggestionId => {
      const improvement = calculateImprovement(suggestionId)
      if (improvement.category === categoryId) {
        totalImprovement += (improvement.improvement || 0)
      }
    })
    
    // Add preview improvement if not already applied
    if (previewSuggestion && !appliedSuggestions.has(previewSuggestion)) {
      const improvement = calculateImprovement(previewSuggestion)
      if (improvement.category === categoryId) {
        totalImprovement += (improvement.improvement || 0)
      }
    }
    
    return Math.min(100, baseScore + totalImprovement)
  }, [analysisResults, appliedSuggestions, previewSuggestion, calculateImprovement])

  // Toggle suggestion (swap mode)
  const toggleSuggestion = useCallback((suggestionId: string) => {
    if (!analysisResults) return
    
    const isCurrentlyApplied = appliedSuggestions.has(suggestionId)
    const suggestion = analysisResults.suggestions.find(s => s.id === suggestionId)
    const improvement = calculateImprovement(suggestionId)
    
    if (isCurrentlyApplied) {
      // Remove suggestion
      setAppliedSuggestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(suggestionId)
        return newSet
      })
      smartToast.success(`↩️ ${suggestion?.section || 'Change'} reverted`)
    } else {
      // Apply suggestion
      setAppliedSuggestions(prev => new Set([...prev, suggestionId]))
      
      // Start animation
      if (improvement.category) {
        setAnimatingCategories(prev => new Set([...prev, improvement.category]))
        setTimeout(() => {
          setAnimatingCategories(prev => {
            const newSet = new Set(prev)
            if (improvement.category) {
              newSet.delete(improvement.category)
            }
            return newSet
          })
        }, 800)
      }
      
      smartToast.success(`✨ ${suggestion?.section || 'Section'} optimized! +${improvement.improvement || 0} points`)
    }
  }, [analysisResults, appliedSuggestions, calculateImprovement])

  // Apply all suggestions
  const applyAllSuggestions = useCallback(() => {
    if (!analysisResults) return
    
    const allSuggestionIds = analysisResults.suggestions.map(s => s.id)
    setAppliedSuggestions(new Set(allSuggestionIds))
    
    // Animate all categories
    const affectedCategories = new Set(
      analysisResults.suggestions.map(s => s.section.toLowerCase())
    )
    setAnimatingCategories(new Set(affectedCategories))
    
    setTimeout(() => {
      setAnimatingCategories(new Set())
    }, 1000)
    
    smartToast.success(`🚀 Applied all ${analysisResults.suggestions.length} optimizations!`)
  }, [analysisResults])

  // Reset all suggestions  
  const resetAllSuggestions = useCallback(() => {
    setAppliedSuggestions(new Set())
    setAnimatingCategories(new Set())
    smartToast.success('🔄 All changes reset')
  }, [])

  // Enhanced suggestion styling
  const getSuggestionStyle = (impact: string) => {
    switch (impact) {
      case 'high': return { 
        priority: 'High Priority', 
        color: 'from-pink-500 to-red-500',
        textColor: 'text-pink-400', 
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/30',
        improvement: '+18 pts'
      }
      case 'medium': return { 
        priority: 'Medium Priority', 
        color: 'from-blue-500 to-cyan-500',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        improvement: '+12 pts'
      }
      case 'low': return { 
        priority: 'Low Priority', 
        color: 'from-emerald-500 to-green-500',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        improvement: '+8 pts'
      }
      default: return { 
        priority: 'Standard', 
        color: 'from-slate-400 to-slate-500', 
        textColor: 'text-slate-400',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/30',
        improvement: '+5 pts'
      }
    }
  }

  // Load analysis
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!resumeId || status !== "authenticated") return
      
      try {
        setIsLoading(true)
        await performAnalysis()
      } catch (error) {
        console.error('Failed to load analysis:', error)
        setError('Failed to start analysis')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalysis()
  }, [resumeId, status])

  const performAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentStep(0)
    
    try {
      // Show progress
      for (let i = 0; i < analysisSteps.length - 1; i++) {
        setCurrentStep(i)
        await new Promise(resolve => setTimeout(resolve, 400)) // Faster for better UX
      }
      
      setCurrentStep(analysisSteps.length - 1)
      
      const response = await fetch(`/api/resumes/${resumeId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Analysis failed')
      }
      
      const data = await response.json()
      
      // Add IDs to suggestions for tracking
      const suggestionsWithIds = data.analysis.suggestions.map((suggestion: any, index: number) => ({
        ...suggestion,
        id: `${suggestion.section}-${index}`
      }))
      
      setAnalysisResults({
        ...data.analysis,
        suggestions: suggestionsWithIds
      })
      
      smartToast.success('🎯 Analysis complete!')
      
    } catch (error) {
      console.error('Analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setError(errorMessage)
      smartToast.error(`Analysis failed: ${errorMessage}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Navigation handlers
  const handleBack = () => router.push(`/dashboard/resume/${resumeId}/job-description`)
  const handleNext = () => router.push(`/dashboard/resume/${resumeId}/finalize`)
  const handleEditResume = () => router.push(`/dashboard/resume/${resumeId}`)
  const handleEditJob = () => router.push(`/dashboard/resume/${resumeId}/job-description`)

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="circuit-bg absolute inset-0"></div>
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 gradient-text">analyzing your resume</h1>
            <div className="flex justify-center space-x-1 mb-4">
              {[0, 1, 2].map(i => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" 
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <p className="text-slate-400">preparing comprehensive analysis...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Optimized Background Effects */}
      {isMounted && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-pulse"
                style={{
                  left: `${(i * 13 + 10) % 90 + 5}%`,
                  top: `${(i * 17 + 15) % 80 + 10}%`,
                  animationDelay: `${(i * 0.4) % 3}s`,
                  animationDuration: `${3 + (i % 2)}s`
                }}
              />
            ))}
          </div>
          <div 
            className="absolute inset-0 opacity-20 transition-all duration-1000"
            style={{
              backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)`
            }}
          />
        </>
      )}

      <div className="circuit-bg absolute inset-0"></div>

      <div className="min-h-screen relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-slate-900/30 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold gradient-text">rework</span>
                </div>

                <Button onClick={handleBack} variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  back
                </Button>
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-green-400 font-medium">edit resume</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-green-400 font-medium">job description</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center animate-pulse">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium gradient-text">ai analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {analysisResults && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    analysis complete
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Loading Analysis State */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center animate-pulse">
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bold gradient-text">🧠 ai analysis in progress</h3>
                  <p className="text-slate-300 text-lg">{analysisSteps[currentStep]}</p>
                  <div className="w-80 bg-slate-700/50 rounded-full h-3 mt-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / analysisSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bold text-white">analysis failed</h3>
                  <p className="text-slate-300 text-lg">{error}</p>
                  <div className="flex gap-3 mt-6">
                    <Button 
                      onClick={() => performAnalysis()}
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      retry analysis
                    </Button>
                    <Button onClick={handleEditJob} variant="outline" className="border-white/20 text-white">
                      edit job description
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Analysis Results - Split Layout */}
            {analysisResults && !isAnalyzing && (
              <>
                {/* Top Overview */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold gradient-text">Analysis Complete</h1>
                      <p className="text-slate-400">
                        {analysisResults.jobApplication ? 
                          `for ${analysisResults.jobApplication.jobTitle} at ${analysisResults.jobApplication.company}` :
                          'AI-powered resume optimization ready'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Split Layout: Suggestions Left, Stats Right */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  {/* LEFT: AI Suggestions */}
                  <div className="space-y-6">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-3">
                          <Lightbulb className="w-6 h-6 text-yellow-400" />
                          <span className="gradient-text">💡 AI Recommendations</span>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Click to apply and watch your stats level up!
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Apply All Controls at Top */}
                        <div className="pb-4 border-b border-white/10 space-y-3">
                          <div className="flex gap-3">
                            <Button 
                              onClick={applyAllSuggestions}
                              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3"
                            >
                              <Rocket className="w-5 h-5 mr-2" />
                              Apply All {analysisResults.suggestions.length} Optimizations
                            </Button>
                            <Button 
                              onClick={resetAllSuggestions}
                              variant="outline"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reset All
                            </Button>
                          </div>
                          <p className="text-slate-500 text-sm text-center">
                            💡 Changes are previewed here and applied when you continue to finalize
                          </p>
                        </div>

                        {analysisResults.suggestions.map((suggestion) => {
                          const style = getSuggestionStyle(suggestion.impact)
                          const isApplied = appliedSuggestions.has(suggestion.id)
                          
                          return (
                            <div 
                              key={suggestion.id}
                              onMouseEnter={() => setPreviewSuggestion(suggestion.id)}
                              onMouseLeave={() => setPreviewSuggestion(null)}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                isApplied 
                                  ? 'border-green-400 bg-green-500/20 opacity-75' 
                                  : `border-white/20 glass hover:${style.borderColor} hover:scale-[1.02]`
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-white font-semibold capitalize">{suggestion.section}</h3>
                                    <Badge className={`${style.textColor} ${style.bgColor} text-xs`}>
                                      {style.priority}
                                    </Badge>
                                    <Badge className="bg-slate-700 text-slate-300 text-xs">
                                      {style.improvement}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-400 text-sm">{suggestion.reason}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3 mb-4">
                                {suggestion.current && (
                                  <div className="p-3 bg-slate-800/50 border border-slate-600 rounded-lg">
                                    <p className="text-slate-300 text-xs font-medium mb-1">Current</p>
                                    <p className="text-slate-400 text-sm">{suggestion.current}</p>
                                  </div>
                                )}
                                
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                  <p className="text-green-300 text-xs font-medium mb-1">AI Suggested</p>
                                  <p className="text-slate-200 text-sm">{suggestion.suggested}</p>
                                </div>
                              </div>

                              <Button 
                                onClick={() => toggleSuggestion(suggestion.id)}
                                className={`w-full font-medium transition-all duration-300 ${
                                  isApplied 
                                    ? 'bg-green-600 hover:bg-red-600 text-white' 
                                    : `bg-gradient-to-r ${style.color} text-white hover:scale-105`
                                }`}
                              >
                                {isApplied ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Applied - Click to Remove
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Preview & Apply
                                  </>
                                )}
                              </Button>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </div>

                  {/* RIGHT: Live Stats Dashboard */}
                  <div className="space-y-6">
                    <Card className="glass-card border-white/10 sticky top-24">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-3">
                          <Gauge className="w-6 h-6 text-cyan-400" />
                          <span className="gradient-text">📊 Live Performance Stats</span>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Watch your scores improve in real-time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Overall Match Score */}
                        <div className="text-center mb-8 p-6 glass rounded-xl">
                          <div className="w-24 h-24 mx-auto mb-4 relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-4 border-cyan-400/30 flex flex-col items-center justify-center">
                              <div className="text-3xl font-bold text-white">
                                {Math.round(
                                  categoryData.reduce((sum, cat) => sum + getCurrentScore(cat.id), 0) / categoryData.length
                                )}%
                              </div>
                              <div className="text-xs text-cyan-300">MATCH</div>
                            </div>
                            {appliedSuggestions.size > 0 && (
                              <div className="absolute -top-2 -right-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                                  +{appliedSuggestions.size}
                                </div>
                              </div>
                            )}
                          </div>
                          <h3 className="text-2xl font-bold gradient-text mb-2">Overall Performance</h3>
                          <p className="text-slate-400">
                            Resume compatibility score
                            {appliedSuggestions.size > 0 && (
                              <span className="block text-green-400 text-sm mt-1">
                                {appliedSuggestions.size} optimization{appliedSuggestions.size !== 1 ? 's' : ''} applied
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Category Bars */}
                        <div className="space-y-6">
                          {categoryData.map((category) => {
                            const IconComponent = category.icon
                            const currentScore = getCurrentScore(category.id)
                            const baseScore = category.score
                            const isAnimating = animatingCategories.has(category.id)
                            const hasImprovement = currentScore > baseScore
                            
                            return (
                              <div 
                                key={category.id}
                                className={`p-4 rounded-xl border-2 transition-all duration-700 ${
                                  hasImprovement 
                                    ? 'border-green-400/50 bg-green-500/10 shadow-lg shadow-green-500/20' 
                                    : 'border-white/10 glass'
                                } ${isAnimating ? 'animate-pulse' : ''}`}
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700 ${
                                      hasImprovement 
                                        ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                                        : 'bg-gradient-to-br from-cyan-400 to-purple-500'
                                    }`}>
                                      <IconComponent className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="text-white font-semibold">{category.name}</h4>
                                      <p className="text-slate-400 text-xs">{category.description}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-2xl font-bold transition-all duration-700 ${
                                      hasImprovement ? 'text-green-400' : category.color
                                    }`}>
                                      {currentScore}%
                                    </div>
                                    {hasImprovement && (
                                      <div className="text-green-400 text-sm font-medium flex items-center gap-1 justify-end">
                                        <ArrowUp className="w-3 h-3" />
                                        +{currentScore - baseScore}
                                      </div>
                                    )}
                                    <Badge className={`${hasImprovement ? 'text-green-400 border-green-400/30' : category.color} bg-transparent border text-xs transition-all duration-700`}>
                                      {hasImprovement ? `Boosted ${category.level}` : category.level}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  {/* Stacked Progress Bar */}
                                  <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
                                    {/* Base Score (always visible) */}
                                    <div 
                                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-slate-500 to-slate-400 transition-all duration-700 rounded-full"
                                      style={{ width: `${baseScore}%` }}
                                    />
                                    {/* Improvement Layer (stacked on top) */}
                                    {hasImprovement && (
                                      <div 
                                        className="absolute top-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 rounded-full"
                                        style={{ 
                                          left: `${baseScore}%`,
                                          width: `${currentScore - baseScore}%`
                                        }}
                                      />
                                    )}
                                    {/* Preview Effect */}
                                    {previewSuggestion && !hasImprovement && (
                                      <div 
                                        className="absolute top-0 h-full bg-gradient-to-r from-yellow-400/50 to-orange-500/50 transition-all duration-300 rounded-full"
                                        style={{ 
                                          left: `${baseScore}%`,
                                          width: `${Math.min(100 - baseScore, 15)}%`
                                        }}
                                      />
                                    )}
                                  </div>
                                  
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">
                                      {hasImprovement ? `Base: ${baseScore}%` : category.levelDescription}
                                    </span>
                                    <span className={hasImprovement ? 'text-green-400' : category.color}>
                                      {hasImprovement ? `Boosted: ${currentScore}%` : `Current: ${currentScore}%`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 border-t border-white/10 space-y-3">
                          <div className="flex gap-3">
                            <Button onClick={handleEditResume} variant="outline" className="flex-1 border-white/20 text-white">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Resume
                            </Button>
                            <Button onClick={handleEditJob} variant="outline" className="flex-1 border-white/20 text-white">
                              <Target className="w-4 h-4 mr-2" />
                              Change Job
                            </Button>
                          </div>
                          <Button 
                            onClick={handleNext}
                            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3"
                          >
                            <Award className="w-5 h-5 mr-2" />
                            Continue to Finalize
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Performance Optimized Styles */}
      <style jsx>{`
        .circuit-bg {
          background-image: radial-gradient(circle at 25% 25%, rgba(44, 199, 208, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
        }
        
        .glass-card {
          backdrop-filter: blur(16px);
          background: rgba(30, 41, 59, 0.3);
        }
        
        .glass {
          backdrop-filter: blur(8px);
          background: rgba(30, 41, 59, 0.2);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #22d3ee, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  )
}