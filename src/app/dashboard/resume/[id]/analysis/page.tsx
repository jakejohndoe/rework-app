// Redesigned Analysis Page with Live Level-Up Dashboard
// src/app/dashboard/resume/[id]/analysis/page.tsx

"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import ResumeLoader from '@/components/resume-loader'
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Target,
  AlertTriangle,
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
  Gauge,
  FileText,
  Search,
  Database,
  Settings
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

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
  const [error, setError] = useState<string | null>(null)
  
  // Loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  // Level-Up System State
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  const [animatingCategories, setAnimatingCategories] = useState<Set<string>>(new Set())
  const [previewSuggestion, setPreviewSuggestion] = useState<string | null>(null)
  
  // Performance State
  const [isMounted, setIsMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  
  // Animation State
  const [typewriterText, setTypewriterText] = useState("")
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false)
  const [stepCompleted, setStepCompleted] = useState(false)
  
  // Suggestion Application State
  const [isApplyingSuggestions, setIsApplyingSuggestions] = useState(false)
  const [applicationStep, setApplicationStep] = useState(0)
  
  // Typewriter effect function
  const typewriterEffect = async (text: string, speed: number = 50) => {
    setTypewriterText("")
    setIsTypewriterComplete(false)
    setStepCompleted(false)
    
    for (let i = 0; i <= text.length; i++) {
      setTypewriterText(text.slice(0, i))
      await new Promise(resolve => setTimeout(resolve, speed))
    }
    
    setIsTypewriterComplete(true)
    
    // Brief celebration effect
    setTimeout(() => {
      setStepCompleted(true)
      setTimeout(() => setStepCompleted(false), 500)
    }, 300)
  }

  // Mount check for performance
  useEffect(() => {
    setIsMounted(true)
    // Faster loading for better UX
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 800)
    return () => clearTimeout(timer)
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
    {
      icon: FileText,
      text: "Loading your resume content and job requirements...",
      color: "text-cyan-400"
    },
    {
      icon: Search,
      text: "Extracting structured data from your professional background...",
      color: "text-blue-400"
    },
    {
      icon: Briefcase,
      text: "Analyzing job requirements and identifying key criteria...",
      color: "text-indigo-400"
    },
    {
      icon: Target,
      text: "Mapping your experience to target role requirements...",
      color: "text-violet-400"
    },
    {
      icon: Database,
      text: "Performing deep category-specific analysis (skills, experience, education)...",
      color: "text-purple-400"
    },
    {
      icon: Sparkles, // Using Sparkles instead of Logo for consistency
      text: "AI is generating personalized optimization suggestions...",
      color: "text-pink-400"
    },
    {
      icon: Zap,
      text: "Identifying keyword gaps and enhancement opportunities...",
      color: "text-amber-400"
    },
    {
      icon: BarChart3,
      text: "Calculating ATS compatibility and match scores...",
      color: "text-emerald-400"
    },
    {
      icon: TrendingUp,
      text: "Benchmarking against industry standards and best practices...",
      color: "text-green-400"
    },
    {
      icon: Sparkles,
      text: "Finalizing your enhanced analysis report...",
      color: "text-yellow-400"
    }
  ]
  
  const applicationSteps = [
    {
      icon: Settings,
      text: "Preparing to apply AI optimizations...",
      color: "text-cyan-400"
    },
    {
      icon: Database,
      text: "Applying content improvements to resume sections...",
      color: "text-blue-400"
    },
    {
      icon: Sparkles,
      text: "Optimizing keywords and formatting...",
      color: "text-purple-400"
    },
    {
      icon: CheckCircle,
      text: "Finalizing your enhanced resume...",
      color: "text-emerald-400"
    }
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
    
    // Map suggestion section to category ID (ensure consistency)
    const sectionMap: { [key: string]: string } = {
      'contact': 'contact',
      'experience': 'experience', 
      'work experience': 'experience',
      'skills': 'skills',
      'education': 'education',
      'keywords': 'keywords',
      'ats': 'keywords'
    }
    
    const sectionKey = sectionMap[suggestion.section.toLowerCase()] || suggestion.section.toLowerCase()
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
    
  }, [analysisResults])

  // Reset all suggestions  
  const resetAllSuggestions = useCallback(() => {
    setAppliedSuggestions(new Set())
    setAnimatingCategories(new Set())
  }, [])

  // Enhanced suggestion styling - FIXED: All buttons now use consistent bluish gradient
  const getSuggestionStyle = (impact: string) => {
    switch (impact) {
      case 'high': return { 
        priority: 'High Priority', 
        color: 'from-cyan-400 to-purple-500', // CHANGED: Now uses consistent gradient
        textColor: 'text-pink-400', 
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/30',
        improvement: '+18 pts'
      }
      case 'medium': return { 
        priority: 'Medium Priority', 
        color: 'from-cyan-400 to-purple-500', // CHANGED: Now uses consistent gradient
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        improvement: '+12 pts'
      }
      case 'low': return { 
        priority: 'Low Priority', 
        color: 'from-cyan-400 to-purple-500', // CHANGED: Now uses consistent gradient
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        improvement: '+8 pts'
      }
      default: return { 
        priority: 'Standard', 
        color: 'from-cyan-400 to-purple-500', // CHANGED: Now uses consistent gradient
        textColor: 'text-slate-400',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/30',
        improvement: '+5 pts'
      }
    }
  }

  // Load analysis - CHECK IF THERE'S EXISTING DATA FIRST
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!resumeId || status !== "authenticated") return
      
      try {
        // First try to load existing analysis
        const response = await fetch(`/api/resumes/${resumeId}/analyze`)
        if (response.ok) {
          const data = await response.json()
          if (data.analysis) {
            // Add IDs to suggestions for tracking
            const suggestionsWithIds = data.analysis.suggestions.map((suggestion: any, index: number) => ({
              ...suggestion,
              id: `${suggestion.section}-${index}`
            }))
            
            setAnalysisResults({
              ...data.analysis,
              suggestions: suggestionsWithIds
            })
            setIsInitialLoading(false)
            return
          }
        }
        
        // If no existing analysis, start new analysis
        await performAnalysis()
      } catch (error) {
        console.error('Failed to load analysis:', error)
        setError('Failed to start analysis')
        setIsInitialLoading(false)
      }
    }

    loadAnalysis()
  }, [resumeId, status])

  const performAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentStep(0)
    
    try {
      // Start the API call immediately in parallel
      const apiPromise = fetch(`/api/resumes/${resumeId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      // Show gradual progress through all steps with typewriter effect
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentStep(i)
        await typewriterEffect(analysisSteps[i].text, 30) // Typewriter effect
        
        // Even timing distribution across 10 steps - ~4 seconds each step
        // Total animation time: ~40 seconds to match API call duration
        const pauseDuration = i < analysisSteps.length - 1 ? 3800 : 1000 // Last step shorter
        await new Promise(resolve => setTimeout(resolve, pauseDuration))
      }
      
      // Wait for API to complete
      const response = await apiPromise
      
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
      
      console.log('✅ Analysis completed successfully!')
      
    } catch (error) {
      console.error('❌ Analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
      setIsInitialLoading(false)
    }
  }

  // Apply suggestions function
  const applySuggestionsAndNavigate = async () => {
    if (!analysisResults || appliedSuggestions.size === 0) {
      // If no suggestions selected, just navigate
      router.push(`/dashboard/resume/${resumeId}/finalize`)
      return
    }

    setIsApplyingSuggestions(true)
    setApplicationStep(0)

    try {
      // Prepare suggestions for API
      const suggestionsToApply = analysisResults.suggestions
        .filter((suggestion) => appliedSuggestions.has(suggestion.id))
        .map((suggestion) => ({
          section: suggestion.section,
          type: suggestion.type as 'improve' | 'add',
          current: suggestion.current,
          suggested: suggestion.suggested,
          impact: suggestion.impact,
          reason: suggestion.reason
        }))

      console.log('🚀 Applying suggestions:', suggestionsToApply)

      // Step through application process with typewriter effect
      for (let i = 0; i < applicationSteps.length; i++) {
        setApplicationStep(i)
        await typewriterEffect(applicationSteps[i].text, 40)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Make API call to apply suggestions
      const response = await fetch(`/api/resumes/${resumeId}/apply-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: suggestionsToApply })
      })

      if (!response.ok) {
        throw new Error('Failed to apply suggestions')
      }

      console.log('✅ Suggestions applied successfully!')
      
      // Navigate to finalize page
      router.push(`/dashboard/resume/${resumeId}/finalize`)
      
    } catch (error) {
      console.error('❌ Failed to apply suggestions:', error)
      setError('Failed to apply suggestions. Please try again.')
      setIsApplyingSuggestions(false)
    }
  }

  // Navigation handlers
  const [isNavigating, setIsNavigating] = useState(false)
  
  const handleBack = () => router.push(`/dashboard/resume/${resumeId}/job-description`)
  const handleNext = () => {
    console.log('🚀 ANALYSIS DEBUG: Navigating to finalize page for resume:', resumeId)
    
    // Store any pending suggestions for finalization
    if (typeof window !== 'undefined') {
      const pendingSuggestions = JSON.stringify({
        resumeId,
        timestamp: Date.now(),
        // Store any swapped suggestions from the AI suggestions component
        note: 'Suggestions will be applied during finalization'
      });
      sessionStorage.setItem('pendingSuggestions', pendingSuggestions);
      console.log('💾 Stored pending suggestions for finalization');
    }
    
    try {
      router.push(`/dashboard/resume/${resumeId}/finalize`)
    } catch (error) {
      console.error('Router push failed, using window.location:', error)
      window.location.href = `/dashboard/resume/${resumeId}/finalize`
    }
  }
  const handleEditResume = () => router.push(`/dashboard/resume/${resumeId}`)
  const handleEditJob = () => router.push(`/dashboard/resume/${resumeId}/job-description`)

  // Loading state
  if (isInitialLoading || status === "loading") {
    return <ResumeLoader title="Preparing AI analysis" subtitle="Loading optimization engine..." fullScreen={true} />
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
                <Link href="/" className="flex items-center space-x-2 group">
                  <Logo size="xs" variant="simple" className="group-hover:scale-110 transition-all duration-300" />
                  <span className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">ReWork</span>
                </Link>

                <Button onClick={handleBack} variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
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
                      <Logo size="xs" variant="simple" className="w-4 h-4" />
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
              <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
                {/* Neural Network Background */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* Neural Nodes */}
                  {[...Array(12)].map((_, i) => (
                    <div key={`node-${i}`}>
                      <div
                        className="absolute w-2 h-2 bg-cyan-400/20 rounded-full"
                        style={{
                          left: `${(i * 13 + 10) % 90 + 5}%`,
                          top: `${(i * 17 + 15) % 80 + 10}%`,
                          animation: 'neuralPulse 3s ease-in-out infinite',
                          animationDelay: `${(i * 0.3) % 2}s`
                        }}
                      />
                      {/* Neural Connections */}
                      {i < 8 && (
                        <div
                          className="absolute h-px bg-gradient-to-r from-purple-400/10 to-transparent"
                          style={{
                            left: `${(i * 13 + 10) % 90 + 5}%`,
                            top: `${(i * 17 + 15) % 80 + 10}%`,
                            width: `${Math.abs((((i + 3) * 13 + 10) % 90 + 5) - ((i * 13 + 10) % 90 + 5))}%`,
                            transform: `rotate(${((i * 37) % 180) - 90}deg)`,
                            transformOrigin: 'left center',
                            animation: 'connectionFlow 4s ease-in-out infinite',
                            animationDelay: `${(i * 0.5) % 3}s`
                          }}
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Data Flow Particles */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`particle-${i}`}
                      className="absolute w-1 h-1 bg-gradient-to-r from-cyan-300 to-purple-300 rounded-full"
                      style={{
                        left: `${(i * 15 + 5) % 95}%`,
                        top: `${(i * 23 + 20) % 70 + 15}%`,
                        animation: 'dataFlow 6s linear infinite',
                        animationDelay: `${(i * 0.8) % 5}s`
                      }}
                    />
                  ))}
                </div>

                {/* Main Loading Animation */}
                <div className="relative flex flex-col items-center" style={{ animation: 'breathe 4s ease-in-out infinite' }}>
                  {/* Resume Paper Animation - Fixed position */}
                  <div className="relative w-64 h-80">
                    {/* Paper Background */}
                    <div 
                      className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl"
                      style={{
                        animation: 'paperFloat 3s ease-in-out infinite'
                      }}
                    >
                      {/* Paper Lines */}
                      <div className="p-8 space-y-4">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="h-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded"
                            style={{
                              animation: 'lineFill 2s ease-out forwards',
                              animationDelay: `${i * 0.3}s`,
                              width: '0%',
                              opacity: 0
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Floating Icon */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center"
                         style={{
                           animation: currentStep === 4 ? 'brainPulse 1s ease-in-out infinite' : 'iconFloat 2s ease-in-out infinite'
                         }}>
                      {React.createElement(analysisSteps[currentStep]?.icon || Sparkles, { 
                        className: `w-6 h-6 text-white ${analysisSteps[currentStep]?.color || 'text-white'}` 
                      })}
                    </div>

                    {/* AI Sparkles */}
                    <div className="absolute -bottom-4 -left-4">
                      <svg 
                        className="w-8 h-8 text-cyan-400" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                        style={{
                          animation: 'spinSlow 4s linear infinite'
                        }}
                      >
                        <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.82 15.45L16 22L11.18 17.45L7 21L8.27 14.73L2 16L6.18 10.45L2 7L8.26 8.09L7 2L11.82 6.55L16 2L14.73 8.27L21 7L16.82 12.55L21 16L14.73 14.73L16 21L11.82 16.82L7 21L8.27 14.91L2 16L6.55 11.18Z"/>
                      </svg>
                    </div>
                    
                    {/* Step Completion Celebration */}
                    {stepCompleted && (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                            style={{
                              left: `${20 + i * 15}%`,
                              top: `${10 + (i % 2) * 20}%`,
                              animation: 'celebrate 0.6s ease-out forwards',
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </>
                    )}
                  </div>

                  {/* Loading Text - Positioned below with fixed layout */}
                  <div className="mt-8 text-center w-full">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse">
                      AI Analysis In Progress
                    </h2>
                    <div className="h-12 flex items-center justify-center mt-2">
                      <div className="flex items-center gap-3">
                        {React.createElement(analysisSteps[currentStep]?.icon || Sparkles, { 
                          className: `w-5 h-5 ${analysisSteps[currentStep]?.color || 'text-cyan-400'}` 
                        })}
                        <p className="text-slate-400 text-sm font-mono">
                          {typewriterText}
                          {!isTypewriterComplete && <span className="animate-pulse">|</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-32 h-2 bg-cyan-400/20 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-700 rounded-full relative"
                          style={{ 
                            width: `${((currentStep + 1) / analysisSteps.length) * 100}%`,
                            boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/50 to-purple-500/50 rounded-full animate-pulse" />
                        </div>
                      </div>
                      <span className="text-slate-400 text-xs font-medium">
                        {currentStep + 1} / {analysisSteps.length}
                      </span>
                    </div>
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

            {/* Applying Suggestions Loading State */}
            {isApplyingSuggestions && (
              <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
                {/* Neural Network Background */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* Neural Nodes */}
                  {[...Array(8)].map((_, i) => (
                    <div key={`app-node-${i}`}>
                      <div
                        className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
                        style={{
                          left: `${(i * 15 + 15) % 85 + 10}%`,
                          top: `${(i * 19 + 20) % 70 + 15}%`,
                          animation: 'neuralPulse 2s ease-in-out infinite',
                          animationDelay: `${(i * 0.4) % 1.5}s`
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Main Application Animation */}
                <div className="relative flex flex-col items-center" style={{ animation: 'breathe 3s ease-in-out infinite' }}>
                  {/* Resume Transformation Animation */}
                  <div className="relative w-64 h-80">
                    {/* Original Resume */}
                    <div 
                      className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20"
                      style={{
                        animation: 'paperFloat 2s ease-in-out infinite'
                      }}
                    >
                      {/* Resume Lines */}
                      <div className="p-8 space-y-4">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="h-2 bg-gradient-to-r from-slate-400/30 to-slate-400/10 rounded"
                            style={{
                              width: `${70 + (i * 5)}%`,
                              animation: 'optimizeLine 3s ease-in-out infinite',
                              animationDelay: `${i * 0.2}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Application Icon */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center"
                         style={{
                           animation: 'brainPulse 1.5s ease-in-out infinite'
                         }}>
                      {React.createElement(applicationSteps[applicationStep]?.icon || Settings, { 
                        className: `w-6 h-6 text-white ${applicationSteps[applicationStep]?.color || 'text-white'}` 
                      })}
                    </div>

                    {/* Enhancement Sparkles */}
                    <div className="absolute -bottom-4 -left-4">
                      <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Application Text */}
                  <div className="mt-8 text-center w-full">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse">
                      Applying AI Optimizations
                    </h2>
                    <div className="h-12 flex items-center justify-center mt-2">
                      <div className="flex items-center gap-3">
                        {React.createElement(applicationSteps[applicationStep]?.icon || Settings, { 
                          className: `w-5 h-5 ${applicationSteps[applicationStep]?.color || 'text-cyan-400'}` 
                        })}
                        <p className="text-slate-400 text-sm font-mono">
                          {typewriterText}
                          {!isTypewriterComplete && <span className="animate-pulse">|</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-32 h-2 bg-emerald-400/20 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-700 rounded-full relative"
                          style={{ 
                            width: `${((applicationStep + 1) / applicationSteps.length) * 100}%`,
                            boxShadow: '0 0 10px rgba(52, 211, 153, 0.5)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/50 to-cyan-500/50 rounded-full animate-pulse" />
                        </div>
                      </div>
                      <span className="text-slate-400 text-xs font-medium">
                        {applicationStep + 1} / {applicationSteps.length}
                      </span>
                    </div>
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
                            
                            // Calculate applied improvements for this category
                            const appliedImprovements = Array.from(appliedSuggestions).reduce((total, suggestionId) => {
                              const improvement = calculateImprovement(suggestionId)
                              return improvement.category === category.id ? total + (improvement.improvement || 0) : total
                            }, 0)
                            
                            // Check if this category has applied improvements (persistent highlight)
                            const hasAppliedImprovement = appliedImprovements > 0
                            // Check if there's any improvement (including preview)
                            const hasAnyImprovement = currentScore > baseScore
                            
                            return (
                              <div 
                                key={category.id}
                                className={`p-4 rounded-xl border-2 transition-all duration-700 ${
                                  hasAppliedImprovement 
                                    ? 'border-green-400/60 bg-green-500/15 shadow-lg shadow-green-500/25' 
                                    : hasAnyImprovement
                                      ? 'border-yellow-400/50 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                                      : 'border-white/10 glass'
                                } ${isAnimating ? 'animate-pulse' : ''}`}
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700 ${
                                      hasAppliedImprovement 
                                        ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                                        : hasAnyImprovement
                                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
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
                                      hasAppliedImprovement 
                                        ? 'text-green-400' 
                                        : hasAnyImprovement 
                                          ? 'text-yellow-400' 
                                          : category.color
                                    }`}>
                                      {currentScore}%
                                    </div>
                                    {hasAnyImprovement && (
                                      <div className={`text-sm font-medium flex items-center gap-1 justify-end transition-all duration-700 ${
                                        hasAppliedImprovement ? 'text-green-400' : 'text-yellow-400'
                                      }`}>
                                        <ArrowUp className="w-3 h-3" />
                                        +{currentScore - baseScore}
                                        {hasAppliedImprovement && (
                                          <span className="text-xs bg-green-500/20 px-1 rounded">APPLIED</span>
                                        )}
                                      </div>
                                    )}
                                    <Badge className={`${
                                      hasAppliedImprovement 
                                        ? 'text-green-400 border-green-400/30' 
                                        : hasAnyImprovement 
                                          ? 'text-yellow-400 border-yellow-400/30'
                                          : category.color
                                    } bg-transparent border text-xs transition-all duration-700`}>
                                      {hasAppliedImprovement 
                                        ? `Applied ${category.level}` 
                                        : hasAnyImprovement 
                                          ? `Preview ${category.level}` 
                                          : category.level}
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
                                    {/* Applied Improvements Layer (persistent green) */}
                                    {appliedImprovements > 0 && (
                                      <div 
                                        className="absolute top-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 rounded-full"
                                        style={{ 
                                          left: `${baseScore}%`,
                                          width: `${appliedImprovements}%`
                                        }}
                                      />
                                    )}
                                    {/* Preview Layer (temporary yellow) */}
                                    {previewSuggestion && !appliedSuggestions.has(previewSuggestion) && (
                                      <div 
                                        className="absolute top-0 h-full bg-gradient-to-r from-yellow-400/70 to-orange-500/70 transition-all duration-300 rounded-full"
                                        style={{ 
                                          left: `${baseScore + appliedImprovements}%`,
                                          width: `${Math.min(100 - baseScore - appliedImprovements, calculateImprovement(previewSuggestion)?.improvement || 0)}%`
                                        }}
                                      />
                                    )}
                                  </div>
                                  
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">
                                      {hasAnyImprovement ? `Base: ${baseScore}%` : category.levelDescription}
                                    </span>
                                    <span className={`transition-all duration-700 ${
                                      hasAppliedImprovement 
                                        ? 'text-green-400' 
                                        : hasAnyImprovement 
                                          ? 'text-yellow-400' 
                                          : category.color
                                    }`}>
                                      {hasAppliedImprovement 
                                        ? `Applied: ${currentScore}%` 
                                        : hasAnyImprovement 
                                          ? `Preview: ${currentScore}%` 
                                          : `Current: ${currentScore}%`}
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
                            onClick={applySuggestionsAndNavigate}
                            disabled={isApplyingSuggestions}
                            className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                            <div className="relative z-10 flex items-center justify-center gap-2">
                              {isApplyingSuggestions ? (
                                <>
                                  <Settings className="w-5 h-5 animate-spin" />
                                  applying suggestions...
                                </>
                              ) : (
                                <>
                                  <Award className="w-5 h-5" />
                                  continue to finalize
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </>
                              )}
                            </div>
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
        
        @keyframes paperFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        @keyframes lineFill {
          0% { width: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }

        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes brainPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(147, 51, 234, 0.5); }
          50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(147, 51, 234, 0.8); }
        }
        
        @keyframes iconFloat {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(2deg); }
        }
        
        @keyframes celebrate {
          0% { transform: scale(0) translateY(0); opacity: 1; }
          50% { transform: scale(1.2) translateY(-20px); opacity: 0.8; }
          100% { transform: scale(0) translateY(-40px); opacity: 0; }
        }
        
        @keyframes neuralPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 5px rgba(34, 211, 238, 0.3); }
          50% { transform: scale(1.5); box-shadow: 0 0 15px rgba(34, 211, 238, 0.6); }
        }
        
        @keyframes connectionFlow {
          0% { opacity: 0; }
          50% { opacity: 0.3; }
          100% { opacity: 0; }
        }
        
        @keyframes dataFlow {
          0% { transform: translateX(-100px) translateY(-50px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100px) translateY(50px); opacity: 0; }
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes optimizeLine {
          0% { background: linear-gradient(to right, rgba(148, 163, 184, 0.3), rgba(148, 163, 184, 0.1)); }
          50% { background: linear-gradient(to right, rgba(52, 211, 153, 0.6), rgba(34, 211, 238, 0.3)); }
          100% { background: linear-gradient(to right, rgba(148, 163, 184, 0.3), rgba(148, 163, 184, 0.1)); }
        }
      `}</style>
    </div>
  )
}