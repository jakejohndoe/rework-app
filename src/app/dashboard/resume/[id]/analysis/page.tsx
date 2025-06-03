"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  Download,
  Sparkles,
  TrendingUp,
  Target,
  AlertTriangle,
  Lightbulb,
  FileText,
  RefreshCw,
  Eye,
  Share,
  Mail,
  ExternalLink,
  Zap,
  Award,
  BarChart3
} from "lucide-react"

interface AnalysisResult {
  matchScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: {
    section: string
    type: 'improve' | 'add' | 'remove'
    current: string
    suggested: string
    impact: 'high' | 'medium' | 'low'
    reason: string
  }[]
  atsScore: number
  readabilityScore: number
  completenessScore: number
}

export default function AnalysisPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const resumeId = params.id as string

  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock analysis results - replace with real AI analysis
  const [analysisResults] = useState<AnalysisResult>({
    matchScore: 87,
    matchedKeywords: [
      "JavaScript", "React", "Node.js", "AWS", "PostgreSQL", 
      "Full-stack", "Agile", "Git", "API Development", "Problem-solving"
    ],
    missingKeywords: [
      "TypeScript", "Docker", "Kubernetes", "Microservices", 
      "CI/CD", "Test-driven development", "GraphQL"
    ],
    suggestions: [
      {
        section: "Professional Summary",
        type: "improve",
        current: "Experienced software engineer with 5 years of experience",
        suggested: "Results-driven Full-stack Engineer with 5+ years developing scalable web applications using React, Node.js, and AWS",
        impact: "high",
        reason: "Incorporates key job requirements and quantifies experience"
      },
      {
        section: "Skills",
        type: "add",
        current: "JavaScript, React, Node.js, PostgreSQL",
        suggested: "JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker, AWS (EC2, S3, Lambda), GraphQL",
        impact: "high",
        reason: "Adds missing keywords that appear in job requirements"
      },
      {
        section: "Work Experience",
        type: "improve",
        current: "Developed web applications for users",
        suggested: "Architected and developed scalable microservices serving 100K+ daily active users, improving system performance by 40%",
        impact: "medium",
        reason: "Quantifies impact and uses job-relevant terminology"
      },
      {
        section: "Work Experience",
        type: "add",
        current: "",
        suggested: "• Implemented CI/CD pipelines using Docker and Kubernetes, reducing deployment time by 60%",
        impact: "medium",
        reason: "Addresses missing DevOps keywords from job requirements"
      }
    ],
    atsScore: 92,
    readabilityScore: 88,
    completenessScore: 85
  })

  const handleBack = () => {
    router.push(`/dashboard/resume/${resumeId}/job-description`)
  }

  const handleEditResume = () => {
    router.push(`/dashboard/resume/${resumeId}`)
  }

  const handleEditJobDescription = () => {
    router.push(`/dashboard/resume/${resumeId}/job-description`)
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsGeneratingPDF(false)
    
    // In real implementation, this would generate and download the optimized PDF
    console.log('📄 Downloading optimized resume PDF...')
  }

  const handleShare = () => {
    // Share functionality
    console.log('📤 Sharing resume analysis...')
  }

  const handleEmailResults = () => {
    // Email results functionality  
    console.log('📧 Emailing analysis results...')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  useEffect(() => {
    if (status === "authenticated") {
      // Simulate AI analysis process
      const analysisSteps = [
        "Loading resume and job description...",
        "Analyzing keyword matches...",
        "Generating improvement suggestions...",
        "Calculating ATS compatibility...",
        "Finalizing recommendations..."
      ]
      
      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        if (currentStep >= analysisSteps.length) {
          setAnalysisComplete(true)
          setIsAnalyzing(false)
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [status])

  // Loading state during analysis
  if (status === "loading" || isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="circuit-bg min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Resume</h2>
              <p className="text-slate-400">Our AI is optimizing your resume for the job description...</p>
            </div>
            <div className="w-64 mx-auto">
              <Progress value={75} className="h-2" />
              <p className="text-sm text-slate-500 mt-2">Generating improvement suggestions...</p>
            </div>
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
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">AI Analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                  <Award className="w-3 h-3 mr-1" />
                  Analysis Complete
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Results Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Analysis Complete!</h1>
                <p className="text-slate-400 text-lg">
                  Your resume has been optimized for the job description
                </p>
              </div>
            </div>

            {/* Overall Score */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{analysisResults.matchScore}%</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-1">Overall Match</h3>
                    <p className="text-sm text-slate-400">Great match for this role!</p>
                  </div>
                  
                  <div className="md:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">ATS Compatibility</span>
                      <span className={`font-semibold ${getScoreColor(analysisResults.atsScore)}`}>
                        {analysisResults.atsScore}%
                      </span>
                    </div>
                    <Progress value={analysisResults.atsScore} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Keyword Match</span>
                      <span className={`font-semibold ${getScoreColor(analysisResults.matchScore)}`}>
                        {analysisResults.matchScore}%
                      </span>
                    </div>
                    <Progress value={analysisResults.matchScore} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Content Quality</span>
                      <span className={`font-semibold ${getScoreColor(analysisResults.readabilityScore)}`}>
                        {analysisResults.readabilityScore}%
                      </span>
                    </div>
                    <Progress value={analysisResults.readabilityScore} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="glass-dark border-white/10 p-1 w-full">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-primary-400/20 data-[state=active]:text-primary-300 flex-1"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="keywords" 
                  className="data-[state=active]:bg-primary-400/20 data-[state=active]:text-primary-300 flex-1"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Keywords
                </TabsTrigger>
                <TabsTrigger 
                  value="suggestions" 
                  className="data-[state=active]:bg-primary-400/20 data-[state=active]:text-primary-300 flex-1"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Suggestions
                </TabsTrigger>
                <TabsTrigger 
                  value="optimized" 
                  className="data-[state=active]:bg-primary-400/20 data-[state=active]:text-primary-300 flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Optimized
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-white text-sm font-medium">Strong Keyword Match</p>
                            <p className="text-slate-400 text-xs">87% of job requirements keywords are present</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-white text-sm font-medium">ATS Optimized</p>
                            <p className="text-slate-400 text-xs">Clean formatting and proper structure</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-white text-sm font-medium">Relevant Experience</p>
                            <p className="text-slate-400 text-xs">Experience aligns well with job requirements</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Areas for Improvement */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-yellow-400" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-white text-sm font-medium">Missing Keywords</p>
                            <p className="text-slate-400 text-xs">Add TypeScript, Docker, Kubernetes</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-white text-sm font-medium">Quantify Achievements</p>
                            <p className="text-slate-400 text-xs">Add more metrics and numbers to impact statements</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-white text-sm font-medium">Technical Depth</p>
                            <p className="text-slate-400 text-xs">Expand on DevOps and cloud experience</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="keywords" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Matched Keywords */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          Matched Keywords ({analysisResults.matchedKeywords.length})
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Keywords from the job description found in your resume
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysisResults.matchedKeywords.map((keyword, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className="bg-green-500/20 text-green-300 border-green-500/30"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Missing Keywords */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          Missing Keywords ({analysisResults.missingKeywords.length})
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Important keywords from the job description to consider adding
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysisResults.missingKeywords.map((keyword, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-6">
                  <div className="space-y-4">
                    {analysisResults.suggestions.map((suggestion, index) => (
                      <Card key={index} className="glass-card border-white/10">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-yellow-400" />
                              {suggestion.section}
                            </CardTitle>
                            <Badge 
                              variant="secondary" 
                              className={`${
                                suggestion.impact === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                suggestion.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              }`}
                            >
                              {suggestion.impact} impact
                            </Badge>
                          </div>
                          <CardDescription className="text-slate-400">
                            {suggestion.reason}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {suggestion.current && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-300 mb-2">Current:</h4>
                              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-slate-300 text-sm">{suggestion.current}</p>
                              </div>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">
                              {suggestion.type === 'add' ? 'Add:' : 'Suggested:'}
                            </h4>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                              <p className="text-slate-300 text-sm">{suggestion.suggested}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="optimized" className="space-y-6">
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        Optimized Resume Preview
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Preview of your resume with AI-suggested improvements applied
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg p-6 text-gray-900 min-h-96">
                        <div className="text-center mb-6">
                          <h1 className="text-2xl font-bold">John Smith</h1>
                          <p className="text-gray-600">Results-driven Full-stack Engineer</p>
                          <p className="text-sm text-gray-500">john.smith@email.com • (555) 123-4567 • San Francisco, CA</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold border-b border-gray-300 pb-1">PROFESSIONAL SUMMARY</h3>
                            <p className="text-sm mt-2">
                              Results-driven Full-stack Engineer with 5+ years developing scalable web applications using React, Node.js, and AWS. 
                              Proven track record of improving system performance and leading cross-functional teams.
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold border-b border-gray-300 pb-1">TECHNICAL SKILLS</h3>
                            <p className="text-sm mt-2">
                              <strong>Languages:</strong> JavaScript, TypeScript, Python, SQL<br/>
                              <strong>Frontend:</strong> React, Vue.js, HTML5, CSS3, Responsive Design<br/>
                              <strong>Backend:</strong> Node.js, Express, GraphQL, REST APIs<br/>
                              <strong>Cloud & DevOps:</strong> AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD<br/>
                              <strong>Databases:</strong> PostgreSQL, MongoDB, Redis
                            </p>
                          </div>
                          
                          <p className="text-xs text-gray-500 italic text-center">
                            ✨ Optimized with AI suggestions applied
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Download Optimized Resume</h3>
                      <p className="text-slate-400 text-sm">Get your ATS-optimized resume as a PDF</p>
                    </div>
                    <Button 
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPDF}
                      className="btn-gradient w-full"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
                      <RefreshCw className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Make Changes</h3>
                      <p className="text-slate-400 text-sm">Edit your resume or job description</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleEditResume}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 flex-1"
                        size="sm"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Edit Resume
                      </Button>
                      <Button 
                        onClick={handleEditJobDescription}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 flex-1"
                        size="sm"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Edit Job
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    onClick={handleShare}
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-white/10"
                    size="sm"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                  <Button 
                    onClick={handleEmailResults}
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-white/10"
                    size="sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Results
                  </Button>
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost"
                      className="text-slate-300 hover:text-white hover:bg-white/10"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}