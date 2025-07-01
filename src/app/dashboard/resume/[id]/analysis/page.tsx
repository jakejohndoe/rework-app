// Updated Analysis Page with Enhanced AI Suggestions Integration
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
  const [resumeRefreshTrigger, setResumeRefreshTrigger] = useState(0) // For refreshing after applying changes

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="circuit-bg min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading enhanced analysis...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 glass-dark">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={handleBack} variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                {/* Step Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-green-400 font-medium">Edit Resume</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-green-400 font-medium">Job Description</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">Enhanced AI Analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {analysisResults && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enhanced Analysis Complete
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  <Brain className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Loading Analysis State */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-cyan-500" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">🧠 Enhanced AI Analysis in Progress</h3>
                  <p className="text-gray-300">{analysisSteps[currentStep]}</p>
                  <div className="w-80 bg-gray-700 rounded-full h-2 mt-4">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / analysisSteps.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Using advanced category-specific analysis with GPT-4o-mini...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">Analysis Failed</h3>
                  <p className="text-gray-300">{error}</p>
                  <div className="flex gap-3 mt-4">
                    <Button 
                      onClick={retryAnalysis}
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Enhanced Analysis
                    </Button>
                    <Button 
                      onClick={handleEditJob}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Edit Job Description
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Analysis Results */}
            {analysisResults && !isAnalyzing && (
              <>
                {/* Header */}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">🧠 Enhanced Analysis Complete!</h1>
                    <p className="text-slate-400 text-lg">
                      Advanced AI analysis with category-specific scoring for{" "}
                      {analysisResults.jobApplication && (
                        <span className="text-cyan-300 font-medium">
                          {analysisResults.jobApplication.jobTitle} at {analysisResults.jobApplication.company}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Enhanced Match Score and Category Metrics */}
                <Card className="glass-card border-white/10">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Overall Match Score */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-4">
                          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">{analysisResults.matchScore}%</span>
                          </div>
                        </div>
                        <h3 className="text-white font-medium text-center mb-2">Overall Match Score</h3>
                        <p className="text-slate-400 text-sm text-center">
                          {analysisResults.matchScore >= 85 ? "🎯 Excellent match!" : 
                           analysisResults.matchScore >= 70 ? "✨ Great match for this role!" :
                           analysisResults.matchScore >= 55 ? "⚡ Good potential with improvements" :
                           "🔧 Needs optimization for better fit"}
                        </p>
                      </div>

                      {/* Category Scores */}
                      <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-white font-medium mb-3">📊 Category-Specific Analysis</h4>
                        
                        {analysisResults.categoryScores && Object.entries(analysisResults.categoryScores).map(([category, score]) => (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(category)}
                                <span className="text-slate-300 capitalize">
                                  {category === 'contact' ? 'Contact Information' :
                                   category === 'experience' ? 'Work Experience' :
                                   category === 'skills' ? 'Skills & Technologies' :
                                   category === 'education' ? 'Education' :
                                   category === 'keywords' ? 'Keyword Optimization' : category}
                                </span>
                              </div>
                              <span className={`font-medium ${getCategoryColor(score)}`}>
                                {score}%
                              </span>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        ))}
                        
                        {/* Traditional Metrics */}
                        <div className="pt-4 border-t border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">ATS Compatibility</span>
                            <span className="text-green-400 font-medium">{analysisResults.atsScore}%</span>
                          </div>
                          <Progress value={analysisResults.atsScore} className="h-2" />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Content Quality</span>
                            <span className="text-green-400 font-medium">{analysisResults.readabilityScore}%</span>
                          </div>
                          <Progress value={analysisResults.readabilityScore} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Analysis Tabs */}
                <Tabs defaultValue="suggestions" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary-500">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Enhanced Overview
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="data-[state=active]:bg-primary-500">
                      <Brain className="w-4 h-4 mr-2" />
                      Category Breakdown
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="data-[state=active]:bg-primary-500">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Optimization
                    </TabsTrigger>
                    <TabsTrigger value="optimized" className="data-[state=active]:bg-primary-500">
                      <FileText className="w-4 h-4 mr-2" />
                      Optimized Content
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Enhanced Strengths */}
                      <Card className="glass-card border-white/10">
                        <CardHeader>
                          <CardTitle className="text-green-400 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            AI-Identified Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-white font-medium">Strong Keyword Alignment</p>
                              <p className="text-slate-400 text-sm">
                                {analysisResults.matchedKeywords.length} critical job keywords identified
                              </p>
                            </div>
                          </div>
                          
                          {analysisResults.categoryScores.contact >= 70 && (
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-white font-medium">Professional Contact Information</p>
                                <p className="text-slate-400 text-sm">Well-structured contact details with professional presentation</p>
                              </div>
                            </div>
                          )}
                          
                          {analysisResults.categoryScores.experience >= 70 && (
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-white font-medium">Relevant Work Experience</p>
                                <p className="text-slate-400 text-sm">Experience demonstrates strong alignment with role requirements</p>
                              </div>
                            </div>
                          )}
                          
                          {analysisResults.atsScore >= 80 && (
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-white font-medium">ATS-Optimized Format</p>
                                <p className="text-slate-400 text-sm">Clean formatting that works well with applicant tracking systems</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Enhanced Areas for Improvement */}
                      <Card className="glass-card border-white/10">
                        <CardHeader>
                          <CardTitle className="text-yellow-400 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            AI-Recommended Improvements
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {analysisResults.missingKeywords.length > 0 && (
                            <div className="flex items-start gap-3">
                              <Target className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-white font-medium">Missing Critical Keywords</p>
                                <p className="text-slate-400 text-sm">
                                  Add: {analysisResults.missingKeywords.slice(0, 3).join(', ')}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {analysisResults.categoryScores.contact < 70 && (
                            <div className="flex items-start gap-3">
                              <User className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-white font-medium">Contact Information Enhancement</p>
                                <p className="text-slate-400 text-sm">Add LinkedIn profile, portfolio links, or improve formatting</p>
                              </div>
                            </div>
                          )}
                          
                          {analysisResults.suggestions.filter(s => s.impact === 'high').length > 0 && (
                            <div className="flex items-start gap-3">
                              <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
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

                  <TabsContent value="categories" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {analysisResults.categoryScores && Object.entries(analysisResults.categoryScores).map(([category, score]) => (
                        <Card key={category} className="glass-card border-white/10">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-white flex items-center gap-2">
                                {getCategoryIcon(category)}
                                {category === 'contact' ? 'Contact Information' :
                                 category === 'experience' ? 'Work Experience' :
                                 category === 'skills' ? 'Skills & Technologies' :
                                 category === 'education' ? 'Education' :
                                 category === 'keywords' ? 'Keyword Optimization' : category}
                              </CardTitle>
                              <Badge className={
                                score >= 85 ? 'bg-green-500/20 text-green-300' :
                                score >= 70 ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-red-500/20 text-red-300'
                              }>
                                {score}%
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Progress value={score} className="h-3 mb-3" />
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
                              <div key={idx} className="mt-3 p-3 bg-slate-800/50 rounded border border-slate-700">
                                <p className="text-slate-300 text-sm font-medium">AI Recommendation:</p>
                                <p className="text-slate-400 text-sm mt-1">{suggestion.suggested}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* ENHANCED AI SUGGESTIONS TAB - This is the main new feature! */}
                  <TabsContent value="suggestions" className="space-y-4">
                    <EnhancedAISuggestionsTab
                      suggestions={analysisResults.suggestions}
                      resumeId={resumeId}
                      onApplyChanges={handleChangesApplied}
                    />
                  </TabsContent>

                  <TabsContent value="optimized" className="space-y-4">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">🤖 AI-Optimized Content Preview</CardTitle>
                        <CardDescription className="text-slate-400">
                          AI-generated optimizations based on structured analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analysisResults.optimizedContent ? (
                          <div className="space-y-4">
                            {analysisResults.optimizedContent.contactInfo && (
                              <div>
                                <h4 className="text-green-400 font-medium mb-2">✨ Optimized Contact Information</h4>
                                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700">
                                  <div className="space-y-1 text-sm text-slate-200">
                                    <div>{analysisResults.optimizedContent.contactInfo.firstName} {analysisResults.optimizedContent.contactInfo.lastName}</div>
                                    <div>{analysisResults.optimizedContent.contactInfo.email}</div>
                                    <div>{analysisResults.optimizedContent.contactInfo.phone}</div>
                                    <div>{analysisResults.optimizedContent.contactInfo.location}</div>
                                    {analysisResults.optimizedContent.contactInfo.linkedin && (
                                      <div>{analysisResults.optimizedContent.contactInfo.linkedin}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {analysisResults.optimizedContent.summary && (
                              <div>
                                <h4 className="text-blue-400 font-medium mb-2">✨ Optimized Professional Summary</h4>
                                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700">
                                  <p className="text-slate-200 text-sm">{analysisResults.optimizedContent.summary}</p>
                                </div>
                              </div>
                            )}
                            
                            {analysisResults.optimizedContent.skills && (
                              <div>
                                <h4 className="text-purple-400 font-medium mb-2">✨ Optimized Skills Section</h4>
                                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700">
                                  <p className="text-slate-200 text-sm">{analysisResults.optimizedContent.skills}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 text-center">
                            <Brain className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-300">
                              🔬 AI optimization analysis completed
                            </p>
                            <p className="text-slate-500 text-sm mt-2">
                              Optimized content suggestions have been generated and saved for download
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Enhanced Action Buttons */}
                <Card className="glass-card border-white/10">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-white font-medium mb-1">🚀 Ready for Success?</h3>
                        <p className="text-slate-400 text-sm">
                          Use the AI Optimization tab to swap suggestions, then download your enhanced resume
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleEditResume}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Refine Resume
                        </Button>
                        <Button 
                          onClick={handleEditJob}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Update Job
                        </Button>
                        <DownloadButton 
                          resumeId={resumeId}
                          showVersions={true}
                          showPreview={false}
                          className="btn-gradient gap-2"
                          variant="default"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}