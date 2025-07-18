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
import { QuickDownloadButton, DownloadButton } from "@/components/download-button"
import { SettingsModal } from "@/components/settings-modal"
import ResumeLoader from "@/components/resume-loader"
// ✅ WORKING: Keep the coordinated loading approach that's working
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
  Download,
  Eye,
  TrendingUp,
  CheckCircle,
  Grid3x3,
  List,
  Star
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  
  // ✅ WORKING: Keep the exact same coordinated loading logic
  const [shouldShowContent, setShouldShowContent] = useState(false)
  const [loadingStartTime] = useState(() => Date.now())
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isMinTimeElapsed, setIsMinTimeElapsed] = useState(false)
  
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [resumes, setResumes] = useState<any[]>([])
  const [jobApplications, setJobApplications] = useState<any[]>([])
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState<{id: string, title: string} | null>(null)
  const [aiBuilderModalOpen, setAiBuilderModalOpen] = useState(false)
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isMounted, setIsMounted] = useState(false)

  // ✅ WORKING: Keep the exact same coordinated loading logic
  useEffect(() => {
    // Removed debug logging for performance
  }, [isDataLoaded, isMinTimeElapsed, shouldShowContent, loadingStartTime])

  // ✅ WORKING: Keep the coordinated loading check
  useEffect(() => {
    if (isDataLoaded && isMinTimeElapsed) {
      setShouldShowContent(true)
    }
  }, [isDataLoaded, isMinTimeElapsed, loadingStartTime])

  // Client-side mount check
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mouse tracking for premium effects - FIXED VERSION
  useEffect(() => {
    if (!isMounted) return
    
    let rafId: number
    
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle updates using requestAnimationFrame
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
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isMounted])

  // ✅ WORKING: Keep the exact same coordinated loading logic
  useEffect(() => {
    // Main effect triggered
    
    if (status === 'loading') {
      // Session still loading, waiting...
      return
    }
    
    if (status !== 'authenticated') {
      // Not authenticated, will redirect
      return
    }

    // Starting coordinated loading...
    
    // Start minimum time timer (2 seconds for faster response)
    // Starting 2-second minimum timer
    const minTimeTimer = setTimeout(() => {
      // Minimum time (2s) elapsed!
      setIsMinTimeElapsed(true)
    }, 2000)

    // Start data fetching
    // Starting data fetch...
    const fetchData = async () => {
      const fetchStartTime = Date.now()
      // Fetching resumes from API...
      
      try {
        const response = await fetch('/api/resumes')
        const fetchTime = Date.now() - fetchStartTime
        // API response received
        
        const data = await response.json()
        // JSON parsed
        
        if (data.success) {
          setResumes(data.resumes)
          setJobApplications(data.jobApplications || [])
          // Resumes set in state
        } else {
          console.error('❌ DASHBOARD DEBUG: API returned error:', data.error)
        }
      } catch (error) {
        console.error('❌ DASHBOARD DEBUG: Fetch error:', error)
      } finally {
        const totalFetchTime = Date.now() - fetchStartTime
        // Data fetch complete!
        setIsDataLoaded(true)
      }
    }

    fetchData()

    return () => {
      // Cleaning up timers
      clearTimeout(minTimeTimer)
    }
  }, [status, session])

  // ✅ WORKING: Keep the exact same early return logic that's working
  // Render check

  if (!shouldShowContent) {
    // Showing ResumeLoader
    return <ResumeLoader />
  }

  // Rendering full dashboard content

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    // Redirecting to signin
    redirect("/auth/signin")
  }

  const handleUploadComplete = (resumes: any[]) => {
    // Upload complete
    setIsUploadOpen(false)
    // Refresh data after upload
    fetchResumes()
  }

  // ✅ SIMPLIFIED: Basic fetch function for refreshes (no loading logic)
  const fetchResumes = async () => {
    // Refreshing resumes...
    try {
      const response = await fetch('/api/resumes')
      const data = await response.json()
      
      if (data.success) {
        setResumes(data.resumes)
        setJobApplications(data.jobApplications || [])
        // Resumes refreshed
      } else {
        console.error('❌ DASHBOARD DEBUG: Refresh failed:', data.error)
      }
    } catch (error) {
      console.error('❌ DASHBOARD DEBUG: Refresh error:', error)
    }
  }

  const openDeleteModal = (resumeId: string, resumeTitle: string) => {
    setResumeToDelete({id: resumeId, title: resumeTitle})
    setDeleteModalOpen(true)
  }

  const handleDeleteResume = async () => {
    if (!resumeToDelete) return

    try {
      setDeletingResumeId(resumeToDelete.id)
      
      const response = await fetch(`/api/resumes/${resumeToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setResumes(prev => prev.filter(resume => resume.id !== resumeToDelete.id))
        setDeleteModalOpen(false)
        setResumeToDelete(null)
        // Resume deleted successfully
      } else {
        console.error('❌ DASHBOARD DEBUG: Delete failed:', data.error)
        alert('Failed to delete resume. Please try again.')
      }
    } catch (error) {
      console.error('❌ DASHBOARD DEBUG: Delete error:', error)
      alert('Failed to delete resume. Please try again.')
    } finally {
      setDeletingResumeId(null)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setResumeToDelete(null)
  }

  const handleAIBuilder = () => {
    // AI Builder clicked (coming soon)
    setAiBuilderModalOpen(true)
  }

  const handlePremiumUpgrade = () => {
    // Premium upgrade clicked (coming soon)
    setPremiumModalOpen(true)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'just now'
    if (diffInHours === 1) return '1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return '1 day ago'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const mockResumes = resumes

  const isPremium = session?.user?.plan === "PREMIUM"
  const resumeLimit = isPremium ? "Unlimited" : "3"
  const currentResumes = resumes.length || 0
  const totalResumesCreated = session?.user?.resumesCreated || 0
  const usagePercentage = isPremium ? 0 : Math.min((totalResumesCreated / 3) * 100, 100)

  const optimizedCount = resumes.filter(r => r.lastOptimized).length
  const totalWords = resumes.reduce((total, resume) => total + (resume.wordCount || 0), 0)

  // Render stats

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Floating Particles Background - Subtle */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/10 rounded-full animate-pulse"
              style={{
                left: `${(i * 13 + 10) % 90 + 5}%`,
                top: `${(i * 17 + 15) % 80 + 10}%`,
                animationDelay: `${(i * 0.5) % 4}s`,
                animationDuration: `${4 + (i % 2)}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Dynamic Gradient Mesh Background */}
      {isMounted && (
        <div 
          className="absolute inset-0 opacity-20 transition-all duration-1000"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.2) 0%, transparent 70%)`
          }}
        />
      )}

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="circuit-bg min-h-screen relative z-10">
        {/* Premium Glassmorphism Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-slate-900/40 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 group">
                <Logo size="xs" variant="simple" className="group-hover:scale-110 transition-all duration-300" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:scale-105 transition-transform duration-300">ReWork</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  onClick={() => signOut()} 
                  variant="ghost" 
                  className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Enhanced Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400">
                    Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}!
                  </span>
                  <span className="ml-2">👋</span>
                </h1>
                <p className="text-slate-300 text-lg">
                  Ready to optimize your resume for your next opportunity?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="relative px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Resume
                  </div>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Premium Stats with 3D Effects */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: FileText, label: "Active Resumes", value: currentResumes, color: "cyan" },
              { icon: Target, label: "Total Size", value: resumes.reduce((total, resume) => total + (resume.fileSize || 0), 0) > 0 ? `${((resumes.reduce((total, resume) => total + (resume.fileSize || 0), 0)) / 1024 / 1024).toFixed(1)} MB` : '—', color: "purple" },
              { icon: TrendingUp, label: "Optimization Rate", value: currentResumes > 0 ? `${Math.round((optimizedCount / currentResumes) * 100)}%` : '-', color: "emerald" },
              { icon: Clock, label: "Applications Created", value: jobApplications.length || 0, color: "amber" }
            ].map((stat, index) => (
              <Card 
                key={index}
                className="bg-slate-800/40 backdrop-blur-sm border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 group relative overflow-hidden"
                style={{
                  transform: 'perspective(1000px)',
                  transition: 'all 0.3s ease-out'
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const centerX = rect.width / 2
                  const centerY = rect.height / 2
                  const rotateX = (y - centerY) / centerY * -5
                  const rotateY = (x - centerX) / centerX * 5
                  e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${stat.color}-400/20 rounded-lg group-hover:bg-${stat.color}-400/30 transition-colors duration-300`}>
                      <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                      <p className="text-xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{false ? '-' : stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Premium Quick Actions */}
              <Card className="bg-slate-800/40 backdrop-blur-sm border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white p-4 rounded-lg justify-start group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 text-left"
                      onClick={() => setIsUploadOpen(true)}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <Upload className="w-4 h-4 group-hover:animate-bounce" />
                          <span className="font-medium">Upload Resume</span>
                        </div>
                        <span className="text-xs opacity-80">Start with an existing resume</span>
                      </div>
                    </button>
                    
                    <button 
                      className="border border-white/20 text-white hover:bg-white/10 p-4 rounded-lg justify-start relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm text-left"
                      onClick={handleAIBuilder}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                          <span className="font-medium">AI Builder</span>
                          <Badge className="bg-amber-600 text-white text-xs px-1 py-0">
                            Soon
                          </Badge>
                        </div>
                        <span className="text-xs opacity-60">Create from scratch with AI</span>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Resume List */}
              <Card className="bg-slate-800/40 backdrop-blur-sm border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-white">Your Resumes</CardTitle>
                      <Badge variant="secondary" className="bg-cyan-400/20 text-cyan-300">
                        {currentResumes} of {resumeLimit}
                      </Badge>
                    </div>
                    
                    {currentResumes > 0 && (
                      <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-600 backdrop-blur-sm">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white scale-105' : 'text-slate-400 hover:text-white hover:scale-105'}`}
                        >
                          <Grid3x3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-white scale-105' : 'text-slate-400 hover:text-white hover:scale-105'}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  {mockResumes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No resumes yet</h3>
                      <p className="text-slate-400 mb-4">Create your first AI-optimized resume to get started</p>
                      <button 
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                        onClick={() => setIsUploadOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2 inline" />
                        Create Your First Resume
                      </button>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                      {mockResumes.map((resume) => (
                        <div key={resume.id} className={`p-4 border border-white/10 rounded-lg hover:border-cyan-400/30 transition-all duration-300 group hover:scale-[1.01] backdrop-blur-sm bg-slate-800/20 ${viewMode === 'list' ? 'flex flex-col' : ''}`}>
                          <div className={`flex items-center gap-4 ${viewMode === 'list' ? 'flex-col' : ''}`}>
                            {/* PDF Thumbnail */}
                            <div className="flex-shrink-0">
                              <PDFThumbnail 
                                resumeId={resume.id}
                                className={`hover:scale-105 transition-transform duration-200 ${viewMode === 'list' ? 'w-[100px] h-[130px]' : 'w-[120px] h-[156px]'}`}
                              />
                            </div>
                            
                            {/* Resume Info */}
                            <div className={`flex-1 min-w-0 ${viewMode === 'list' ? 'text-center' : ''}`}>
                              <div className={`flex items-center gap-2 mb-1 ${viewMode === 'list' ? 'justify-center' : ''}`}>
                                <FileText className="w-4 h-4 text-cyan-400" />
                                <h4 className="font-medium text-white truncate">{resume.title}</h4>
                                {resume.lastOptimized && (
                                  <Badge variant="secondary" className="bg-green-400/20 text-green-300 text-xs">
                                    ✨ Optimized
                                  </Badge>
                                )}
                                {resume.analysisScore && (
                                  <Badge variant="secondary" className="bg-blue-400/20 text-blue-300 text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    {Math.round(resume.analysisScore)}%
                                  </Badge>
                                )}
                              </div>
                              <div className={`flex items-center space-x-4 text-sm text-slate-400 mb-2 ${viewMode === 'list' ? 'justify-center flex-wrap' : ''}`}>
                                <span>Modified {formatTimeAgo(resume.updatedAt)}</span>
                                <span>•</span>
                                <span>{resume.fileSize ? `${(resume.fileSize / 1024).toFixed(0)} KB` : '—'}</span>
                              </div>
                              <div className={`${viewMode === 'list' ? 'flex justify-center' : ''}`}>
                                <Badge 
                                  variant="secondary" 
                                  className={resume.status === 'optimized' ? 'bg-green-400/20 text-green-300' : 'bg-amber-400/20 text-amber-300'}
                                >
                                  {resume.status === 'draft' ? 'Draft' : resume.status === 'optimized' ? 'Optimized' : resume.status || 'Draft'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Action Buttons with Premium Styling */}
                            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'mt-3 justify-center' : ''}`}>
                              <Link href={`/dashboard/resume/${resume.id}`}>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                                  Edit
                                </Button>
                              </Link>
                              
                              <Link href={`/dashboard/resume/${resume.id}/job-description`}>
                                <button className="px-3 py-1 text-sm bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded hover:scale-105 transition-all duration-300">
                                  Optimize
                                </button>
                              </Link>
                              
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => openDeleteModal(resume.id, resume.title)}
                                disabled={deletingResumeId === resume.id}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 hover:scale-105 transition-all duration-300"
                              >
                                {deletingResumeId === resume.id ? (
                                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Premium Download Options */}
                          <div className="mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-slate-500">
                                Download options:
                              </div>
                              <div className="flex gap-2">
                                <DownloadButton 
                                  resumeId={resume.id}
                                  size="sm"
                                  variant="ghost"
                                  showVersions={false}
                                  showPreview={true}
                                  className="text-slate-400 hover:text-white text-xs px-2 py-1 h-auto hover:scale-105 transition-all duration-300"
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

              {/* Premium Quick Stats */}
              {mockResumes.length > 0 && (
                <Card className="bg-slate-800/40 backdrop-blur-sm border-white/10 relative overflow-hidden hover:scale-[1.01] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="pb-4 relative z-10">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer backdrop-blur-sm">
                        <p className="text-2xl font-bold text-cyan-400">
                          {mockResumes.reduce((total, resume) => total + (resume.fileSize || 0), 0) > 0 
                            ? `${((mockResumes.reduce((total, resume) => total + (resume.fileSize || 0), 0)) / 1024 / 1024).toFixed(1)} MB`
                            : '—'
                          }
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Total file size</p>
                      </div>
                      
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer backdrop-blur-sm">
                        <p className="text-2xl font-bold text-green-400">
                          {mockResumes.filter(r => r.lastOptimized).length}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Resumes enhanced</p>
                      </div>
                      
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer backdrop-blur-sm">
                        <p className="text-2xl font-bold text-purple-400">
                          {mockResumes.length}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Documents created</p>
                      </div>
                      
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer backdrop-blur-sm">
                        <p className="text-2xl font-bold text-amber-400">
                          {Math.max(...mockResumes.map(r => r.applications || 0), 0)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Most used resume</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 transition-all backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-200 font-medium">Total applications</p>
                          <p className="text-xs text-slate-400">AI optimizations created</p>
                        </div>
                        <p className="text-xl font-bold text-cyan-300">
                          {jobApplications.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Enhanced Premium Sidebar */}
            <div className="space-y-6">
              {/* Premium Plan Status */}
              <Card className={`bg-slate-800/40 backdrop-blur-sm border relative overflow-hidden hover:scale-[1.02] transition-all duration-300 ${isPremium ? 'border-purple-400/30' : 'border-white/20'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 hover:opacity-100 transition-opacity duration-500 ${isPremium ? 'from-purple-500/10 to-transparent' : 'from-cyan-500/5 to-transparent'}`}></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="text-white flex items-center gap-2">
                    {isPremium ? (
                      <Crown className="w-5 h-5 text-purple-400" />
                    ) : (
                      <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full" />
                    )}
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                    {!isPremium && usagePercentage >= 80 && (
                      <Badge className={`text-xs ${usagePercentage >= 100 ? 'bg-red-600 animate-pulse' : 'bg-amber-600'} text-white`}>
                        {usagePercentage >= 100 ? 'Full' : 'Nearly Full'}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Resume usage</span>
                      <span className="text-white font-medium">{totalResumesCreated} / {resumeLimit}</span>
                    </div>
                    {!isPremium && (
                      <div className="space-y-2">
                        <Progress value={usagePercentage} className="h-2 bg-slate-700" />
                        <p className="text-xs text-slate-400">
                          {usagePercentage >= 100 ? (
                            <span className="text-red-400 animate-pulse">⚠️ Limit reached - upgrade to continue</span>
                          ) : usagePercentage >= 80 ? (
                            <span className="text-amber-400">⚡ {3 - totalResumesCreated} resume{3 - totalResumesCreated !== 1 ? 's' : ''} remaining</span>
                          ) : (
                            `${3 - totalResumesCreated} resume${3 - totalResumesCreated !== 1 ? 's' : ''} remaining`
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {!isPremium && (
                    <>
                      <Separator className="bg-white/20" />
                      <div className="space-y-2">
                        <p className="text-sm text-slate-200 font-medium">Upgrade to unlock:</p>
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li className="flex items-center gap-2 hover:text-white transition-colors">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            Unlimited resumes
                          </li>
                          <li className="flex items-center gap-2 hover:text-white transition-colors">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            Advanced AI optimization
                          </li>
                          <li className="flex items-center gap-2 hover:text-white transition-colors">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            Premium templates
                          </li>
                          <li className="flex items-center gap-2 hover:text-white transition-colors">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            Priority support
                          </li>
                        </ul>
                      </div>
                      <button 
                        onClick={handlePremiumUpgrade}
                        className="w-full bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-400 hover:to-cyan-500 text-white py-2 px-4 rounded-lg font-medium group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                      >
                        <Crown className="w-4 h-4 mr-2 inline group-hover:animate-bounce" />
                        Upgrade to Premium
                      </button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Premium Recent Activity */}
              <Card className="bg-slate-800/40 backdrop-blur-sm border border-white/20 relative overflow-hidden hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    {resumes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-slate-400">Live</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3 text-sm">
                    {resumes.length > 0 ? (
                      <>
                        {/* Show real recent activity based on actual data */}
                        {resumes.slice(0, 3).map((resume, index) => (
                          <div key={resume.id} className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all backdrop-blur-sm">
                            <div className={`w-2 h-2 ${resume.lastOptimized ? 'bg-green-400' : 'bg-blue-400'} rounded-full flex-shrink-0`}></div>
                            <div className="flex-1">
                              <p className="text-slate-100">
                                {resume.lastOptimized ? 'Resume optimized' : 'Resume created'}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {formatTimeAgo(resume.lastOptimized || resume.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {jobApplications.slice(0, 1).map((application, index) => (
                          <div key={application.id} className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all backdrop-blur-sm">
                            <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-slate-100">Application created</p>
                              <p className="text-slate-400 text-xs">
                                {formatTimeAgo(application.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-8 h-8 text-slate-500 mx-auto mb-2">
                          <BarChart3 className="w-full h-full" />
                        </div>
                        <p className="text-sm text-slate-400">No activity yet</p>
                        <p className="text-xs text-slate-500">Create your first resume to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Premium Pro Tips */}            
              <Card className="bg-slate-800/40 backdrop-blur-sm border border-cyan-400/30 relative overflow-hidden hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  {currentResumes === 0 ? (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      🚀 <strong>Getting started:</strong> Upload your existing resume first - our AI will analyze it and suggest improvements while preserving your personal style and experience.
                    </p>
                  ) : optimizedCount === 0 ? (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      ⚡ <strong>First optimization:</strong> Try optimizing one of your resumes for a specific job posting. Our AI can increase your match rate by up to 40%.
                    </p>
                  ) : optimizedCount < currentResumes ? (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      🎯 <strong>Complete your set:</strong> You have {currentResumes - optimizedCount} unoptimized resume{currentResumes - optimizedCount !== 1 ? 's' : ''}. Optimize them for different job types to maximize opportunities.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      🏆 <strong>Optimization master:</strong> All your resumes are AI-optimized! Consider creating targeted versions for specific job categories or industries.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Premium Upload Modal */}
          {isUploadOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsUploadOpen(false)}
              />
              
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-white/10 max-w-4xl w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-2 hover:scale-[1.01] transition-all rounded-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                      ✨ Upload Your Resume
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsUploadOpen(false)}
                      className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0 hover:scale-110 transition-all"
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg border border-purple-400/20 hover:border-purple-400/40 transition-all backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium mb-1">Don't have a resume yet?</h3>
                        <p className="text-slate-300 text-sm">AI Builder coming soon - create from scratch with artificial intelligence</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="border-purple-400/50 text-purple-300 hover:bg-purple-400/10 hover:scale-105 transition-all backdrop-blur-sm"
                          onClick={handleAIBuilder}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Builder
                          <Badge className="bg-amber-600 text-white text-xs px-1 py-0 ml-2">
                            Soon
                          </Badge>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <ResumeUploader
                    onUploadComplete={handleUploadComplete}
                    maxFiles={3}
                  />
                </div>
              </div>
            </div>
          )}

          <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />

          {/* Custom Delete Confirmation Modal */}
          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-red-500/30 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-semibold flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  Delete Resume
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-6">
                <p className="text-slate-300 text-base leading-relaxed mb-4">
                  Are you sure you want to delete <span className="text-white font-semibold">"{resumeToDelete?.title}"</span>?
                </p>
                <p className="text-red-400 text-sm">
                  ⚠️ This action cannot be undone. All resume data will be permanently deleted.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={closeDeleteModal}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteResume}
                  disabled={deletingResumeId === resumeToDelete?.id}
                  className="bg-red-500 hover:bg-red-600 text-white border-0 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                >
                  {deletingResumeId === resumeToDelete?.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </div>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Forever
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* AI Builder Coming Soon Modal */}
          <Dialog open={aiBuilderModalOpen} onOpenChange={setAiBuilderModalOpen}>
            <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-semibold flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  AI Builder
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-6">
                <p className="text-slate-300 text-base leading-relaxed mb-4">
                  🚀 <span className="text-white font-semibold">AI Builder is coming soon!</span>
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  This feature will let you create a professional resume from scratch using artificial intelligence. Just answer a few questions and let AI build your perfect resume.
                </p>
                <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-medium">✨ Coming Features:</p>
                  <ul className="text-purple-200 text-sm mt-2 space-y-1">
                    <li>• AI-powered content generation</li>
                    <li>• Smart skill recommendations</li>
                    <li>• Industry-specific templates</li>
                    <li>• Real-time optimization</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setAiBuilderModalOpen(false)}
                  className="bg-purple-500 hover:bg-purple-600 text-white border-0 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Got it!
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Premium Upgrade Coming Soon Modal */}
          <Dialog open={premiumModalOpen} onOpenChange={setPremiumModalOpen}>
            <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-semibold flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-cyan-400" />
                  </div>
                  Premium Plan
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-6">
                <p className="text-slate-300 text-base leading-relaxed mb-4">
                  🚀 <span className="text-white font-semibold">Premium features are coming soon!</span>
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  We're still in beta and working hard to bring you amazing premium features. Stay tuned for updates on unlimited resumes, priority support, and exclusive templates!
                </p>
                <div className="bg-cyan-900/20 rounded-lg p-3 border border-cyan-500/20">
                  <p className="text-cyan-300 text-sm font-medium">👑 Coming Premium Features:</p>
                  <ul className="text-cyan-200 text-sm mt-2 space-y-1">
                    <li>• Automated cover letters</li>
                    <li>• Unlimited resume creation</li>
                    <li>• Premium templates & designs</li>
                    <li>• Advanced AI optimizations</li>
                    <li>• Priority customer support</li>
                    <li>• Export to multiple formats</li>
                  </ul>
                </div>
                <div className="mt-3 p-2 bg-amber-900/20 rounded border border-amber-500/20">
                  <p className="text-amber-300 text-xs">
                    🔥 Beta users will get early access and special pricing!
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setPremiumModalOpen(false)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Awesome!
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>

      {/* Custom CSS for Premium Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}