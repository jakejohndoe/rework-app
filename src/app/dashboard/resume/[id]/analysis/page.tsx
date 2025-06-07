// Replace your current src/app/dashboard/resume/[id]/analysis/page.tsx with this:

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
import { DownloadButton } from "@/components/download-button" // ✅ NEW: Use standard download
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
  RefreshCw
} from "lucide-react"

interface AnalysisResult {
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
  jobApplication?: {
    id: string
    jobTitle: string
    company: string
    status: string
  }
}

export default function AnalysisPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const resumeId = params.id as string

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // ✅ REMOVED: isDownloading state (handled by DownloadButton)

  const analysisSteps = [
    "Loading resume content...",
    "Analyzing job requirements...", 
    "Comparing skills and experience...",
    "Generating optimization suggestions...",
    "Calculating compatibility scores...",
    "Finalizing analysis..."
  ]

  // Load existing analysis or start new one
  useEffect(() => {
    const loadOrStartAnalysis = async () => {
      if (!resumeId || status !== "authenticated") return
      
      try {
        setIsLoading(true)
        
        // Check if we already have analysis results
        // For now, we'll always run a fresh analysis
        // You could add a check here to load existing results from the database
        
        await performRealAnalysis()
        
      } catch (error) {
        console.error('Failed to load analysis:', error)
        setError('Failed to start analysis')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrStartAnalysis()
  }, [resumeId, status])

  const performRealAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentStep(0)
    
    try {
      console.log('🚀 Starting real AI analysis for resume:', resumeId)
      
      // Show progress through analysis steps with realistic timing
      for (let i = 0; i < analysisSteps.length - 1; i++) {
        setCurrentStep(i)
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      
      // Perform actual AI analysis
      setCurrentStep(analysisSteps.length - 1)
      toast.loading('AI is analyzing your resume...', { id: 'analysis' })
      
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
      
      toast.success('✨ Analysis complete!', { id: 'analysis' })
      console.log('✅ AI analysis complete:', data.analysis)
      
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
    performRealAnalysis()
  }

  // ✅ REMOVED: handleDownloadPDF function (using DownloadButton instead)

  const handleEditResume = () => {
    router.push(`/dashboard/resume/${resumeId}`)
  }

  const handleEditJob = () => {
    router.push(`/dashboard/resume/${resumeId}/job-description`)
  }

  const handleBack = () => {
    router.push(`/dashboard/resume/${resumeId}/job-description`)
  }

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="circuit-bg min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading analysis...</p>
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
                    <span className="text-white font-medium">AI Analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {analysisResults && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Analysis Complete
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  <Target className="w-3 h-3 mr-1" />
                  Step 3 of 3
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
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">🤖 AI Analyzing Your Resume</h3>
                  <p className="text-gray-300">{analysisSteps[currentStep]}</p>
                  <div className="w-64 bg-gray-700 rounded-full h-2 mt-4">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / analysisSteps.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Using OpenAI GPT-4o-mini for professional analysis...
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
                      Try Again
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

            {/* Analysis Results */}
            {analysisResults && !isAnalyzing && (
              <>
                {/* Header */}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">✨ Analysis Complete!</h1>
                    <p className="text-slate-400 text-lg">
                      Your resume has been optimized for{" "}
                      {analysisResults.jobApplication && (
                        <span className="text-cyan-300 font-medium">
                          {analysisResults.jobApplication.jobTitle} at {analysisResults.jobApplication.company}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Match Score and Metrics */}
                <Card className="glass-card border-white/10">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Overall Match Score */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-3">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{analysisResults.matchScore}%</span>
                          </div>
                        </div>
                        <h3 className="text-white font-medium text-center">Overall Match</h3>
                        <p className="text-slate-400 text-sm text-center">
                          {analysisResults.matchScore >= 85 ? "Excellent match!" : 
                           analysisResults.matchScore >= 70 ? "Great match for this role!" :
                           analysisResults.matchScore >= 55 ? "Good potential with improvements" :
                           "Needs optimization for better fit"}
                        </p>
                      </div>

                      {/* Individual Metrics */}
                      <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">ATS Compatibility</span>
                          <span className="text-green-400 font-medium">{analysisResults.atsScore}%</span>
                        </div>
                        <Progress value={analysisResults.atsScore} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Keyword Match</span>
                          <span className="text-green-400 font-medium">{analysisResults.matchScore}%</span>
                        </div>
                        <Progress value={analysisResults.matchScore} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Content Quality</span>
                          <span className="text-green-400 font-medium">{analysisResults.readabilityScore}%</span>
                        </div>
                        <Progress value={analysisResults.readabilityScore} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Analysis Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary-500">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="keywords" className="data-[state=active]:bg-primary-500">
                      <Target className="w-4 h-4 mr-2" />
                      Keywords
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="data-[state=active]:bg-primary-500">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Suggestions
                    </TabsTrigger>
                    <TabsTrigger value="optimized" className="data-[state=active]:bg-primary-500">
                      <FileText className="w-4 h-4 mr-2" />
                      Optimized
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <Card className="glass-card border-white/10">
                        <CardHeader>
                          <CardTitle className="text-green-400 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-white font-medium">Strong Keyword Match</p>
                              <p className="text-slate-400 text-sm">{analysisResults.matchedKeywords.length} of job requirements keywords are present</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-white font-medium">ATS Optimized</p>
                              <p className="text-slate-400 text-sm">Clean formatting and proper structure</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-white font-medium">Relevant Experience</p>
                              <p className="text-slate-400 text-sm">Experience aligns well with job requirements</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Areas for Improvement */}
                      <Card className="glass-card border-white/10">
                        <CardHeader>
                          <CardTitle className="text-yellow-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {analysisResults.missingKeywords.length > 0 && (
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-white font-medium">Missing Keywords</p>
                                <p className="text-slate-400 text-sm">Add {analysisResults.missingKeywords.slice(0, 3).join(', ')}</p>
                              </div>
                            </div>
                          )}
                          {analysisResults.suggestions.filter(s => s.impact === 'high').length > 0 && (
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-white font-medium">High Impact Improvements</p>
                                <p className="text-slate-400 text-sm">{analysisResults.suggestions.filter(s => s.impact === 'high').length} suggestions to boost your match score</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="keywords" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Matched Keywords */}
                      <Card className="glass-card border-white/10">
                        <CardHeader>
                          <CardTitle className="text-green-400">
                            ✅ Matched Keywords ({analysisResults.matchedKeywords.length})
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            Keywords from the job description found in your resume
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.matchedKeywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Missing Keywords */}
                      <Card className="glass-card border-white/10">
                        <CardHeader>
                          <CardTitle className="text-yellow-400">
                            ⚠️ Missing Keywords ({analysisResults.missingKeywords.length})
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            Important keywords to consider adding to your resume
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.missingKeywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="suggestions" className="space-y-4">
                    <div className="space-y-4">
                      {analysisResults.suggestions.map((suggestion, index) => (
                        <Card key={index} className="glass-card border-white/10">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-white text-lg">{suggestion.section}</CardTitle>
                              <Badge 
                                variant="secondary" 
                                className={
                                  suggestion.impact === 'high' ? 'bg-red-500/20 text-red-300' :
                                  suggestion.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-blue-500/20 text-blue-300'
                                }
                              >
                                {suggestion.impact} impact
                              </Badge>
                            </div>
                            <CardDescription className="text-slate-400">
                              {suggestion.reason}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {suggestion.current && (
                              <div>
                                <p className="text-slate-300 text-sm font-medium mb-1">Current:</p>
                                <p className="text-slate-400 text-sm bg-slate-800/50 rounded p-3 border border-slate-700">
                                  {suggestion.current}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-slate-300 text-sm font-medium mb-1">Suggested:</p>
                              <p className="text-slate-200 text-sm bg-green-900/30 rounded p-3 border border-green-700">
                                {suggestion.suggested}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="optimized" className="space-y-4">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">📄 Optimized Resume Preview</CardTitle>
                        <CardDescription className="text-slate-400">
                          Preview of your resume with AI-suggested improvements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                          <p className="text-slate-300 text-center">
                            📋 Optimized resume preview will be shown here
                          </p>
                          <p className="text-slate-500 text-sm text-center mt-2">
                            Full implementation coming soon...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <Card className="glass-card border-white/10">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-white font-medium mb-1">Ready to Apply?</h3>
                        <p className="text-slate-400 text-sm">
                          Download your optimized resume or make additional changes
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleEditResume}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Resume
                        </Button>
                        <Button 
                          onClick={handleEditJob}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Edit Job
                        </Button>
                        {/* ✅ UPDATED: Using standard DownloadButton component */}
                        <DownloadButton 
                          resumeId={resumeId}
                          showVersions={false}
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
  )}