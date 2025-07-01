// Resume Finalize Page - Template Selection and Download
// src/app/dashboard/resume/[id]/finalize/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Download,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Sparkles,
  Users,
  Palette,
  Zap,
  Crown,
  ArrowRight,
  RefreshCw
} from "lucide-react"

interface ResumeData {
  id: string
  title: string
  lastOptimized: string | null
  optimizationCount?: number
}

interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  borderColor: string
  bgColor: string
  features: string[]
  recommended?: boolean
}

export default function FinalizePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const resumeId = params.id as string

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional')
  const [showComparison, setShowComparison] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Template definitions
  const templates: Template[] = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, corporate-friendly design perfect for traditional industries',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-400',
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-500/10',
      features: ['ATS-Optimized', 'Clean Layout', 'Corporate Style'],
      recommended: true
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary layout with subtle colors and modern typography',
      icon: <Zap className="w-6 h-6" />,
      color: 'text-purple-400',
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-500/10',
      features: ['Contemporary', 'Color Accents', 'Modern Fonts']
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple, distraction-free format focusing on content',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-green-400',
      borderColor: 'border-green-400',
      bgColor: 'bg-green-500/10',
      features: ['Ultra Clean', 'Content Focus', 'Timeless']
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Unique design with visual elements for creative professionals',
      icon: <Palette className="w-6 h-6" />,
      color: 'text-orange-400',
      borderColor: 'border-orange-400',
      bgColor: 'bg-orange-500/10',
      features: ['Visual Elements', 'Creative Flair', 'Standout Design']
    }
  ]

  // Load resume data
  useEffect(() => {
    const loadResumeData = async () => {
      if (!resumeId || status !== "authenticated") return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/resumes/${resumeId}`)
        
        if (!response.ok) {
          throw new Error('Failed to load resume data')
        }
        
        const data = await response.json()
        setResumeData({
          id: data.id,
          title: data.title,
          lastOptimized: data.lastOptimized,
          optimizationCount: 5 // This could come from the API or be calculated
        })
        
      } catch (error) {
        console.error('Error loading resume data:', error)
        toast.error('Failed to load resume data')
      } finally {
        setIsLoading(false)
      }
    }

    loadResumeData()
  }, [resumeId, status])

  // Handle navigation
  const handleBack = () => {
    router.push(`/dashboard/resume/${resumeId}/analysis`)
  }

  const handleEditMore = () => {
    router.push(`/dashboard/resume/${resumeId}/analysis`)
  }

  // Handle downloads
  const handleDownload = async (version: 'original' | 'optimized') => {
    setIsDownloading(true)
    
    try {
      toast.loading(`Generating ${version} resume PDF with ${templates.find(t => t.id === selectedTemplate)?.name} template...`, { id: 'download' })
      
      // Integrate with your existing download system
      const response = await fetch(`/api/resumes/${resumeId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          version,
          template: selectedTemplate 
        })
      })

      if (!response.ok) {
        throw new Error('Download failed')
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
      toast.error('Download failed. Please try again.', { id: 'download' })
    } finally {
      setIsDownloading(false)
    }
  }

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="circuit-bg min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading finalize options...</p>
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
                  Back to Analysis
                </Button>
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                <div>
                  <h1 className="text-white font-medium">Finalize & Download</h1>
                  <p className="text-slate-400 text-sm">Choose your template and download your optimized resume</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {resumeData?.lastOptimized && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Optimized {new Date(resumeData.lastOptimized).toLocaleDateString()}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Enhanced
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Success Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">🎉 Resume Optimization Complete!</h1>
                <p className="text-slate-400 text-lg">
                  Your resume has been enhanced with AI suggestions. Now choose your perfect template and download.
                </p>
                {resumeData?.optimizationCount && (
                  <Badge className="mt-2 bg-green-500/20 text-green-300 border-green-500/30">
                    +{resumeData.optimizationCount} AI Improvements Applied
                  </Badge>
                )}
              </div>
            </div>

            {/* Template Selection */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Palette className="w-6 h-6 text-cyan-400" />
                  Choose Your Template
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Select the perfect design that matches your industry and personal style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all duration-300 border-2 ${
                        selectedTemplate === template.id
                          ? `${template.borderColor} ${template.bgColor} shadow-lg scale-105`
                          : 'border-white/20 hover:border-white/30 glass-card'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          {/* Template Preview */}
                          <div className={`w-16 h-20 mx-auto rounded border-2 ${template.borderColor} ${template.bgColor} flex items-center justify-center`}>
                            <div className={template.color}>
                              {template.icon}
                            </div>
                          </div>
                          
                          {/* Template Info */}
                          <div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <h3 className="text-white font-medium">{template.name}</h3>
                              {template.recommended && (
                                <Crown className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-slate-400 text-sm mb-3">{template.description}</p>
                            
                            {/* Features */}
                            <div className="space-y-1">
                              {template.features.map((feature, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs border-white/20 text-slate-300"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* Selection Indicator */}
                          {selectedTemplate === template.id && (
                            <div className="flex items-center justify-center">
                              <CheckCircle className={`w-5 h-5 ${template.color}`} />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preview & Comparison Options */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-medium mb-1">Preview & Compare</h3>
                    <p className="text-slate-400 text-sm">
                      {showComparison 
                        ? 'Viewing side-by-side comparison of original vs optimized resume'
                        : 'See how your optimizations improved your resume'
                      }
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => setShowComparison(!showComparison)}
                    variant="outline"
                    className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 gap-2"
                  >
                    {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showComparison ? 'Hide' : 'Show'} Comparison
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Side-by-Side Comparison */}
            {showComparison && (
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Before vs After Comparison</CardTitle>
                  <CardDescription className="text-slate-400">
                    See the improvements made to your resume with AI optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-slate-300 font-medium">Original Resume</h5>
                        <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                          Before AI
                        </Badge>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 min-h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                          <span className="text-slate-400">Original resume preview</span>
                          <p className="text-slate-500 text-sm mt-2">Basic formatting, standard content</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-green-300 font-medium">Optimized Resume</h5>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Enhanced
                        </Badge>
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-6 border border-green-700 min-h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Sparkles className="w-6 h-6 text-green-400" />
                          </div>
                          <span className="text-green-300">AI-optimized resume preview</span>
                          <p className="text-green-400 text-sm mt-2">
                            Enhanced keywords, improved formatting, {resumeData?.optimizationCount || 'multiple'} improvements
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Download Actions */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="text-center lg:text-left">
                    <h3 className="text-white font-medium text-lg mb-2">Ready to Download!</h3>
                    <p className="text-slate-400 mb-2">
                      Your resume is optimized and ready. Choose your preferred version:
                    </p>
                    <div className="flex items-center gap-2 justify-center lg:justify-start">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        Template: {templates.find(t => t.id === selectedTemplate)?.name}
                      </Badge>
                      {resumeData?.optimizationCount && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          +{resumeData.optimizationCount} Improvements
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      onClick={handleEditMore}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Make More Changes
                    </Button>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleDownload('original')}
                        variant="outline"
                        disabled={isDownloading}
                        className="border-white/20 text-white hover:bg-white/10 gap-2"
                      >
                        {isDownloading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Download Original
                      </Button>
                      
                      <Button
                        onClick={() => handleDownload('optimized')}
                        disabled={isDownloading}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 gap-2 min-w-[180px]"
                      >
                        {isDownloading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Download Optimized
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Tips */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="text-center">
                  <h4 className="text-white font-medium mb-2">🚀 You're All Set!</h4>
                  <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                    Your AI-optimized resume is ready to help you land your dream job. The optimizations have improved 
                    keyword matching, formatting, and content quality for better ATS compatibility and recruiter appeal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}