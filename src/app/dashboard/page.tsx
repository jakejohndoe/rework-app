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
import { PDFThumbnail } from "@/components/pdf-thumbnail"
import { QuickDownloadButton, DownloadButton } from "@/components/download-button" // ✅ NEW: Download buttons
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
  Trash2,
  Download, // ✅ NEW: Download icon
  Eye // ✅ NEW: Preview icon
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

  // ✅ Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return '1 day ago'
    return `${Math.floor(diffInHours / 24)} days ago`
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
                    <div className="space-y-4">
                      {mockResumes.map((resume) => (
                        <div key={resume.id} className="p-4 border border-white/10 rounded-lg hover:border-primary-400/30 transition-all duration-200 group">
                          <div className="flex items-center gap-4">
                            {/* PDF Thumbnail */}
                            <div className="flex-shrink-0">
                              <PDFThumbnail 
                                resumeId={resume.id}
                                className="w-[120px] h-[156px] hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            
                            {/* Resume Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-cyan-400" />
                                <h4 className="font-medium text-white truncate">{resume.title}</h4>
                                {/* ✅ NEW: Quick download indicator */}
                                {resume.lastOptimized && (
                                  <Badge variant="secondary" className="bg-green-400/20 text-green-300 text-xs">
                                    ✨ Optimized
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                                <span>Modified {formatTimeAgo(resume.updatedAt)}</span>
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
                            
                            {/* ✅ UPDATED: Action Buttons with Download */}
                            <div className="flex items-center space-x-2">
                              {/* Download button with dropdown */}
                              <DownloadButton 
                                resumeId={resume.id}
                                size="sm"
                                variant="outline"
                                showVersions={!!resume.lastOptimized}
                                showPreview={true}
                                className="text-slate-300 hover:text-white border-slate-600 hover:border-slate-400"
                              />
                              
                              {/* Edit button */}
                              <Link href={`/dashboard/resume/${resume.id}`}>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                                  Edit
                                </Button>
                              </Link>
                              
                              {/* Optimize button */}
                              <Link href={`/dashboard/resume/${resume.id}/job-description`}>
                                <Button size="sm" className="btn-gradient">
                                  Optimize
                                </Button>
                              </Link>
                              
                              {/* Delete button */}
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
                          
                          {/* ✅ NEW: Expanded download options on hover */}
                          <div className="mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-slate-500">
                                Download options:
                              </div>
                              <div className="flex gap-2">
                                <DownloadButton 
                                  resumeId={resume.id}
                                  size="sm"
                                  variant="ghost"
                                  showVersions={!!resume.lastOptimized}
                                  showPreview={true}
                                  className="text-slate-400 hover:text-white text-xs px-2 py-1 h-auto"
                                />
                              </div>
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
              <Card className={`glass-card border border-white/20 ${isPremium ? 'border-purple-400/30' : 'border-white/20'}`}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    {isPremium ? (
                      <Crown className="w-5 h-5 text-purple-400" />
                    ) : (
                      <div className="w-5 h-5 bg-gradient-primary rounded-full" />
                    )}
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Resume Usage</span>
                      <span className="text-white font-medium">{currentResumes} / {resumeLimit}</span>
                    </div>
                    {!isPremium && (
                      <Progress value={usagePercentage} className="h-2 bg-slate-700" />
                    )}
                  </div>
                  
                  {!isPremium && (
                    <>
                      <Separator className="bg-white/20" />
                      <div className="space-y-2">
                        <p className="text-sm text-slate-200 font-medium">Upgrade to unlock:</p>
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li>• Unlimited resumes</li>
                          <li>• Advanced AI optimization</li>
                          <li>• Premium templates</li>
                          <li>• Priority support</li>
                        </ul>
                      </div>
                      <Button className="w-full btn-gradient font-medium">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* ✅ FIXED: Download Quick Actions */}
              <Card className="glass-card border border-white/20 bg-slate-800/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-400" />
                    Quick Downloads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockResumes.length > 0 ? (
                      <>
                        <p className="text-sm text-slate-300 mb-3">Recent resumes:</p>
                        {mockResumes.slice(0, 2).map((resume) => (
                          <div key={resume.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium truncate">{resume.title}</p>
                              <p className="text-xs text-slate-300">
                                {resume.lastOptimized ? 'Optimized' : 'Original'}
                              </p>
                            </div>
                            <QuickDownloadButton 
                              resumeId={resume.id}
                              className="ml-2 text-xs px-2 py-1 h-auto border-slate-500 text-slate-200 hover:text-white hover:border-slate-400"
                            />
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-300">No resumes to download yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Upload a resume to get started!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card border border-white/20 bg-slate-800/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-slate-100">Resume optimized</p>
                        <p className="text-slate-400 text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-slate-100">New resume created</p>
                        <p className="text-slate-400 text-xs">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30">
                      <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-slate-100">Application submitted</p>
                        <p className="text-slate-400 text-xs">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}            
              <Card className="glass-card border border-primary-400/30 bg-primary-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-primary-300 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    Download both original and AI-optimized versions of your resume. Use different versions for different types of job applications for better results.
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