"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { redirect } from "next/navigation"
import Link from "next/link"
import ResumeUploader from "@/components/resume-uploader"
import { ResumePreviewThumbnail } from "@/components/resume-preview"
import { 
  FileText, 
  Plus, 
  Crown, 
  Zap, 
  Upload,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Target,
  Clock,
  Trash2
} from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [resumes, setResumes] = useState<any[]>([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null)

  // Fetch user's resumes
  const fetchResumes = async () => {
    try {
      setIsLoadingResumes(true)
      const response = await fetch('/api/resumes')
      const data = await response.json()
      
      if (data.success) {
        setResumes(data.resumes)
      } else {
        console.error('Failed to fetch resumes:', data.error)
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setIsLoadingResumes(false)
    }
  }

  // Load resumes when user is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchResumes()
    }
  }, [status])

  // Redirect if not authenticated
  if (status === "loading") {
    return <DashboardLoading />
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  const handleUploadComplete = (resumes: any[]) => {
    console.log('Upload complete:', resumes)
    setIsUploadOpen(false)
    // Refresh the resume list
    fetchResumes()
    // Could show success toast here
  }

  const handleDeleteResume = async (resumeId: string, resumeTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${resumeTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingResumeId(resumeId)
      
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        // Remove from local state
        setResumes(prev => prev.filter(resume => resume.id !== resumeId))
        console.log('✅ Resume deleted successfully')
        // Could show success toast here
      } else {
        console.error('Failed to delete resume:', data.error)
        alert('Failed to delete resume. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      alert('Failed to delete resume. Please try again.')
    } finally {
      setDeletingResumeId(null)
    }
  }

  // Helper function to extract resume data for preview
  const getResumePreviewData = (resume: any) => {
    // Handle both current and original content structure
    const sections = resume.currentContent?.sections || resume.originalContent?.sections || {}
    
    return {
      title: resume.title,
      contactInfo: sections.contact || sections.contactInfo,
      summary: sections.summary,
      experience: sections.experience,
      education: sections.education,
      skills: sections.skills
    }
  }

  // Helper function to get PDF URL for actual document preview
  const getPdfUrl = (resume: any): string | undefined => {
    // Check if resume has S3 key (new S3-uploaded resumes)
    if (resume.s3Key) {
      return `/api/resumes/${resume.id}/url`
    }
    return undefined
  }

  const mockResumes = resumes

  const isPremium = session?.user?.plan === "PREMIUM"
  const resumeLimit = isPremium ? "Unlimited" : "3"
  const currentResumes = resumes.length || 0
  const usagePercentage = isPremium ? 0 : Math.min((currentResumes / 3) * 100, 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 glass-dark">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
                  <span className="text-xl font-bold gradient-text">ReWork</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  onClick={() => signOut()} 
                  variant="ghost" 
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-slate-300">
                  Ready to optimize your resume for your next opportunity?
                </p>
              </div>
              <Button 
                size="lg" 
                className="btn-gradient animate-glow"
                onClick={() => setIsUploadOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Resume
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-400/20 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Active Resumes</p>
                    <p className="text-2xl font-bold text-white">{isLoadingResumes ? '-' : currentResumes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary-400/20 rounded-lg">
                    <Target className="w-5 h-5 text-secondary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Applications</p>
                    <p className="text-2xl font-bold text-white">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-400/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Success Rate</p>
                    <p className="text-2xl font-bold text-white">78%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-400/20 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Avg. Time Saved</p>
                    <p className="text-2xl font-bold text-white">4.2h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Resume List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      className="btn-gradient h-auto p-4 justify-start"
                      onClick={() => setIsUploadOpen(true)}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <Upload className="w-4 h-4" />
                          <span className="font-medium">Upload Resume</span>
                        </div>
                        <span className="text-xs opacity-80">Start with an existing resume</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-auto p-4 justify-start">
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium">AI Builder</span>
                        </div>
                        <span className="text-xs opacity-60">Create from scratch with AI</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resume List */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Your Resumes</CardTitle>
                    <Badge variant="secondary" className="bg-primary-400/20 text-primary-300">
                      {currentResumes} of {resumeLimit}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingResumes ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-400">Loading your resumes...</p>
                    </div>
                  ) : mockResumes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No resumes yet</h3>
                      <p className="text-slate-400 mb-4">Create your first AI-optimized resume to get started</p>
                      <Button 
                        className="btn-gradient"
                        onClick={() => setIsUploadOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Resume
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mockResumes.map((resume) => (
                        <div key={resume.id} className="p-4 border border-white/10 rounded-lg hover:border-primary-400/30 transition-all duration-200 group">
                          <div className="flex items-center gap-4">
                            {/* Resume Preview Thumbnail */}
                            <div className="flex-shrink-0">
                              <ResumePreviewThumbnail 
                                pdfUrl={getPdfUrl(resume) || undefined}
                                resumeData={getResumePreviewData(resume)}
                                className="hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            
                            {/* Resume Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-cyan-400" />
                                <h4 className="font-medium text-white truncate">{resume.title}</h4>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                                <span>Modified {resume.lastModified}</span>
                                <span>•</span>
                                <span>{resume.applications || 0} applications</span>
                                {resume.wordCount && (
                                  <>
                                    <span>•</span>
                                    <span>{resume.wordCount} words</span>
                                  </>
                                )}
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={resume.status === 'optimized' ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'}
                              >
                                {resume.status || 'draft'}
                              </Badge>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                              <Link href={`/dashboard/resume/${resume.id}`}>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                                  Edit
                                </Button>
                              </Link>
                              <Button size="sm" className="btn-gradient">
                                Optimize
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteResume(resume.id, resume.title)}
                                disabled={deletingResumeId === resume.id}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              >
                                {deletingResumeId === resume.id ? (
                                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Plan Status */}
              <Card className={`glass-card ${isPremium ? 'border-purple-400/30' : 'border-white/10'}`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {isPremium ? (
                      <Crown className="w-5 h-5 text-purple-400" />
                    ) : (
                      <div className="w-5 h-5 bg-gradient-primary rounded-full" />
                    )}
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Resume Usage</span>
                        <span className="text-white">{currentResumes} / {resumeLimit}</span>
                      </div>
                      {!isPremium && (
                        <Progress value={usagePercentage} className="h-2" />
                      )}
                    </div>
                    
                    {!isPremium && (
                      <>
                        <Separator className="bg-white/10" />
                        <div className="space-y-2">
                          <p className="text-sm text-slate-300">Upgrade to unlock:</p>
                          <ul className="text-sm text-slate-400 space-y-1">
                            <li>• Unlimited resumes</li>
                            <li>• Advanced AI optimization</li>
                            <li>• Premium templates</li>
                            <li>• Priority support</li>
                          </ul>
                        </div>
                        <Button className="w-full btn-gradient">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="text-white">Resume optimized</p>
                        <p className="text-slate-400">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div>
                        <p className="text-white">New resume created</p>
                        <p className="text-slate-400">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div>
                        <p className="text-white">Application submitted</p>
                        <p className="text-slate-400">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}            
              <Card className="glass-card border-primary-400/20">
                <CardHeader>
                  <CardTitle className="text-primary-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    Tailor your resume for each job application. Our AI can help you optimize keywords and content for better ATS compatibility.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upload Resume Modal */}
          {isUploadOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsUploadOpen(false)}
              />
              
              {/* Modal Content */}
              <div className="relative glass-card border-white/10 max-w-4xl w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-2">
                <div className="p-6">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-2xl font-bold gradient-text">
                      ✨ Upload Your Resume
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsUploadOpen(false)}
                      className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <ResumeUploader
                    onUploadComplete={handleUploadComplete}
                    maxFiles={5}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  )
}