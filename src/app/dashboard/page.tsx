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
  Brain,
  TrendingUp,
  CheckCircle,
  Grid3x3,
  List,
  Star
} from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [resumes, setResumes] = useState<any[]>([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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
    fetchResumes()
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
        setResumes(prev => prev.filter(resume => resume.id !== resumeId))
        console.log('✅ Resume deleted successfully')
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

  const handleAIBuilder = () => {
    alert('🚀 AI Builder is coming soon! This feature will let you create a resume from scratch using AI.')
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
  const usagePercentage = isPremium ? 0 : Math.min((currentResumes / 3) * 100, 100)

  const optimizedCount = resumes.filter(r => r.lastOptimized).length
  const totalWords = resumes.reduce((total, resume) => total + (resume.wordCount || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen">
        {/* Sticky header with better visual hierarchy */}
        <header className="border-b border-white/10 glass-dark sticky top-0 z-40 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold gradient-text">ReWork</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/10 hover:scale-105 transition-all"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  onClick={() => signOut()} 
                  variant="ghost" 
                  className="text-white hover:bg-white/10 hover:scale-105 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Welcome section - FIXED: Removed confusing badge */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-slate-300">
                  Ready to optimize your resume for your next opportunity?
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  size="lg" 
                  className="btn-gradient animate-glow hover:scale-105 transition-all"
                  onClick={() => setIsUploadOpen(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Resume
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced stats with micro-interactions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card border-white/10 hover:border-primary-400/30 hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-400/20 rounded-lg group-hover:bg-primary-400/30 transition-colors">
                    <FileText className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Active Resumes</p>
                    <p className="text-xl font-bold text-white">{isLoadingResumes ? '-' : currentResumes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 hover:border-secondary-400/30 hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary-400/20 rounded-lg">
                    <Target className="w-4 h-4 text-secondary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Size</p>
                    <p className="text-xl font-bold text-white">
                      {resumes.reduce((total, resume) => total + (resume.fileSize || 0), 0) > 0 
                        ? `${((resumes.reduce((total, resume) => total + (resume.fileSize || 0), 0)) / 1024 / 1024).toFixed(1)} MB`
                        : '—'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 hover:border-green-400/30 hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-400/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Optimization Rate</p>
                    <p className="text-xl font-bold text-white">
                      {currentResumes > 0 ? `${Math.round((optimizedCount / currentResumes) * 100)}%` : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 hover:border-yellow-400/30 hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-400/20 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Time Saved</p>
                    <p className="text-xl font-bold text-white">
                      {currentResumes > 0 ? `${(currentResumes * 3.2).toFixed(1)}h` : '-'}
                      <span className="text-xs text-slate-500 ml-1">est</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions with micro-interactions */}
              <Card className="glass-card border-white/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      className="btn-gradient h-auto p-4 justify-start group hover:scale-[1.02] transition-all duration-200"
                      onClick={() => setIsUploadOpen(true)}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <Upload className="w-4 h-4 group-hover:animate-bounce" />
                          <span className="font-medium">Upload Resume</span>
                        </div>
                        <span className="text-xs opacity-80">Start with an existing resume</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-white/20 text-white hover:bg-white/10 h-auto p-4 justify-start relative overflow-hidden group hover:scale-[1.02] transition-all duration-200"
                      onClick={handleAIBuilder}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                          <span className="font-medium">AI Builder</span>
                          <Badge className="bg-yellow-600 text-white text-xs px-1 py-0">
                            Soon
                          </Badge>
                        </div>
                        <span className="text-xs opacity-60">Create from scratch with AI</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Resume List with Grid/List toggle */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-white">Your Resumes</CardTitle>
                      <Badge variant="secondary" className="bg-primary-400/20 text-primary-300">
                        {currentResumes} of {resumeLimit}
                      </Badge>
                    </div>
                    
                    {currentResumes > 0 && (
                      <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-600">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-primary-500 text-white scale-105' : 'text-slate-400 hover:text-white hover:scale-105'}`}
                        >
                          <Grid3x3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-primary-500 text-white scale-105' : 'text-slate-400 hover:text-white hover:scale-105'}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
                        className="btn-gradient hover:scale-105 transition-all"
                        onClick={() => setIsUploadOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Resume
                      </Button>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                      {mockResumes.map((resume) => (
                        <div key={resume.id} className={`p-4 border border-white/10 rounded-lg hover:border-primary-400/30 transition-all duration-200 group hover:scale-[1.01] ${viewMode === 'list' ? 'flex flex-col' : ''}`}>
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
                                {resume.lastOptimized && (
                                  <Badge variant="secondary" className="bg-blue-400/20 text-blue-300 text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    {Math.floor(Math.random() * 20) + 80}%
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
                                  className={resume.status === 'optimized' ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'}
                                >
                                  {resume.status || 'draft'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'mt-3 justify-center' : ''}`}>
                              <Link href={`/dashboard/resume/${resume.id}`}>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:scale-105 transition-all">
                                  Edit
                                </Button>
                              </Link>
                              
                              <Link href={`/dashboard/resume/${resume.id}/job-description`}>
                                <Button size="sm" className="btn-gradient hover:scale-105 transition-all">
                                  Optimize
                                </Button>
                              </Link>
                              
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteResume(resume.id, resume.title)}
                                disabled={deletingResumeId === resume.id}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 hover:scale-105 transition-all"
                              >
                                {deletingResumeId === resume.id ? (
                                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Download options on hover - improved */}
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
                                  showVersions={!!resume.lastOptimized}
                                  showPreview={true}
                                  className="text-slate-400 hover:text-white text-xs px-2 py-1 h-auto hover:scale-105 transition-all"
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

              {/* Enhanced Quick Stats */}
              {mockResumes.length > 0 && (
                <Card className="glass-card border-white/10 bg-gradient-to-br from-slate-800/30 to-cyan-900/20 hover:scale-[1.01] transition-all duration-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer">
                      <p className="text-2xl font-bold text-cyan-400">
                        {mockResumes.reduce((total, resume) => total + (resume.fileSize || 0), 0) > 0 
                          ? `${((mockResumes.reduce((total, resume) => total + (resume.fileSize || 0), 0)) / 1024 / 1024).toFixed(1)} MB`
                          : '—'
                        }
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Total File Size</p>
                    </div>
                      
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer">
                        <p className="text-2xl font-bold text-green-400">
                          {mockResumes.filter(r => r.lastOptimized).length}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Resumes Enhanced</p>
                      </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer">
                          <p className="text-2xl font-bold text-purple-400">
                            {mockResumes.length}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Documents Created</p>
                        </div>
                                            
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer">
                        <p className="text-2xl font-bold text-yellow-400">
                          {Math.max(...mockResumes.map(r => r.applications || 0), 0)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Most Used Resume</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-200 font-medium">Total Time Saved</p>
                          <p className="text-xs text-slate-400">Based on industry averages</p>
                        </div>
                        <p className="text-xl font-bold text-cyan-300">
                          {(currentResumes * 3.2).toFixed(1)}h
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Plan Status with dynamic usage warnings */}
              <Card className={`glass-card border border-white/20 hover:scale-[1.02] transition-all duration-200 ${isPremium ? 'border-purple-400/30 bg-purple-900/10' : 'border-white/20'}`}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    {isPremium ? (
                      <Crown className="w-5 h-5 text-purple-400" />
                    ) : (
                      <div className="w-5 h-5 bg-gradient-primary rounded-full" />
                    )}
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                    {!isPremium && usagePercentage >= 80 && (
                      <Badge className={`text-xs ${usagePercentage >= 100 ? 'bg-red-600 animate-pulse' : 'bg-orange-600'} text-white`}>
                        {usagePercentage >= 100 ? 'Full' : 'Nearly Full'}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Resume Usage</span>
                      <span className="text-white font-medium">{currentResumes} / {resumeLimit}</span>
                    </div>
                    {!isPremium && (
                      <div className="space-y-2">
                        <Progress value={usagePercentage} className="h-2 bg-slate-700" />
                        <p className="text-xs text-slate-400">
                          {usagePercentage >= 100 ? (
                            <span className="text-red-400 animate-pulse">⚠️ Limit reached - upgrade to continue</span>
                          ) : usagePercentage >= 80 ? (
                            <span className="text-yellow-400">⚡ {3 - currentResumes} resume{3 - currentResumes !== 1 ? 's' : ''} remaining</span>
                          ) : (
                            `${3 - currentResumes} resume${3 - currentResumes !== 1 ? 's' : ''} remaining this month`
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
                      <Button className="w-full btn-gradient font-medium group hover:scale-[1.02] transition-all">
                        <Crown className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                        Upgrade to Premium
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity with live indicators */}
              <Card className="glass-card border border-white/20 bg-slate-800/50 hover:scale-[1.02] transition-all duration-200">
                <CardHeader className="pb-4">
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
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {resumes.length > 0 ? (
                      <>
                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer">
                          <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-slate-100">Resume optimized</p>
                            <p className="text-slate-400 text-xs">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer">
                          <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-slate-100">New resume created</p>
                            <p className="text-slate-400 text-xs">1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 hover:scale-105 transition-all cursor-pointer">
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-slate-100">Application submitted</p>
                            <p className="text-slate-400 text-xs">3 days ago</p>
                          </div>
                        </div>
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

              {/* Adaptive Pro Tips based on user state */}            
              <Card className="glass-card border border-primary-400/30 bg-primary-900/20 hover:scale-[1.02] transition-all duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-primary-300 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentResumes === 0 ? (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      🚀 <strong>Getting Started:</strong> Upload your existing resume first - our AI will analyze it and suggest improvements while preserving your personal style and experience.
                    </p>
                  ) : optimizedCount === 0 ? (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      ⚡ <strong>First Optimization:</strong> Try optimizing one of your resumes for a specific job posting. Our AI can increase your match rate by up to 40%.
                    </p>
                  ) : optimizedCount < currentResumes ? (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      🎯 <strong>Complete Your Set:</strong> You have {currentResumes - optimizedCount} unoptimized resume{currentResumes - optimizedCount !== 1 ? 's' : ''}. Optimize them for different job types to maximize opportunities.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      🏆 <strong>Power User:</strong> Download both original and AI-optimized versions of your resume. Use different versions for different types of job applications for better results.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Upload Modal */}
          {isUploadOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsUploadOpen(false)}
              />
              
              <div className="relative glass-card border-white/10 max-w-4xl w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-2 hover:scale-[1.01] transition-all">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-2xl font-bold gradient-text">
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

                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg border border-purple-400/20 hover:border-purple-400/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium mb-1">Don't have a resume yet?</h3>
                        <p className="text-slate-300 text-sm">AI Builder coming soon - create from scratch with artificial intelligence</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="border-purple-400/50 text-purple-300 hover:bg-purple-400/10 hover:scale-105 transition-all"
                          onClick={handleAIBuilder}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Builder
                          <Badge className="bg-yellow-600 text-white text-xs px-1 py-0 ml-2">
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