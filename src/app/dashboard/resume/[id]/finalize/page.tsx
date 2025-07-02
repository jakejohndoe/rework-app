// src/app/dashboard/resume/[id]/finalize/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, CheckCircle, Download, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { SVGResumePreview } from '@/components/resume/SVGResumePreview'

interface Template {
  id: string
  name: string
  description: string
  color: string
  icon: string
  recommended?: boolean
}

const templates: Template[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean and corporate-friendly design perfect for traditional industries',
    color: 'from-blue-500 to-blue-600',
    icon: '💼',
    recommended: true
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with subtle color accents for tech and creative roles',
    color: 'from-purple-500 to-purple-600',
    icon: '🚀'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean and content-focused for maximum readability',
    color: 'from-green-500 to-green-600',
    icon: '✨'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unique design elements perfect for creative and design professionals',
    color: 'from-orange-500 to-orange-600',
    icon: '🎨'
  }
]

// Color options for customization
const colorOptions = [
  { name: 'Professional Blue', primary: '#2563eb', accent: '#3b82f6' },
  { name: 'Success Green', primary: '#059669', accent: '#10b981' },
  { name: 'Creative Purple', primary: '#7c3aed', accent: '#8b5cf6' },
  { name: 'Bold Red', primary: '#dc2626', accent: '#ef4444' },
  { name: 'Modern Teal', primary: '#0891b2', accent: '#06b6d4' },
  { name: 'Executive Gray', primary: '#374151', accent: '#6b7280' }
]

export default function FinalizePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const resumeId = params.id as string

  const [selectedTemplate, setSelectedTemplate] = useState('professional')
  const [selectedColors, setSelectedColors] = useState({ 
    primary: '#2563eb', 
    accent: '#3b82f6' 
  })
  const [showComparison, setShowComparison] = useState(false) // Default to false (simplified view)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [resumeData, setResumeData] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchResumeData()
  }, [session, status, resumeId])

  const fetchResumeData = async () => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`)
      if (response.ok) {
        const data = await response.json()
        setResumeData(data)
      }
    } catch (error) {
      console.error('Failed to fetch resume data:', error)
      toast.error('Failed to load resume data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToAnalysis = () => {
    router.push(`/dashboard/resume/${resumeId}/analysis`)
  }

  const handleEditMore = () => {
    router.push(`/dashboard/resume/${resumeId}/analysis`)
  }

  // Handle downloads with the fixed API
  const handleDownload = async (version: 'original' | 'optimized') => {
    setIsDownloading(true)
    
    try {
      toast.loading(`Generating ${version} resume PDF with ${templates.find(t => t.id === selectedTemplate)?.name} template...`, { id: 'download' })
      
      // Use the fixed download API with colors
      const response = await fetch(`/api/resumes/${resumeId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          version,
          template: selectedTemplate,
          colors: selectedColors
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Download failed: ${errorText}`)
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
      toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'download' })
    } finally {
      setIsDownloading(false)
    }
  }

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="circuit-bg min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToAnalysis}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Analysis
                </Button>
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                <div>
                  <h1 className="text-white font-medium">Choose Your Template & Colors</h1>
                  <p className="text-slate-400 text-sm">Your resume is optimized - select your perfect design and colors</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {resumeData?.lastOptimized && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="bg-green-500 rounded-full p-2 mt-1">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">🎉 Resume Optimization Complete!</h1>
                <p className="text-slate-400">
                  Your resume has been enhanced with AI suggestions. Choose your template and colors below.
                </p>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Choose Your Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedTemplate === template.id
                      ? 'border-cyan-400 bg-cyan-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  {template.recommended && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
                      👑 Recommended
                    </div>
                  )}
                  
                  <div className={`w-full h-20 bg-gradient-to-br ${template.color} rounded-lg mb-3 flex items-center justify-center text-3xl`}>
                    {template.icon}
                  </div>
                  
                  <h3 className="text-white font-medium mb-1">{template.name}</h3>
                  <p className="text-slate-400 text-sm leading-tight">{template.description}</p>
                  
                  {selectedTemplate === template.id && (
                    <div className="absolute inset-0 border-2 border-cyan-400 rounded-lg pointer-events-none">
                      <div className="absolute top-2 left-2 bg-cyan-400 text-cyan-900 rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

{/* Color Customization - Compact Version */}
<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Colors</h2>
      <p className="text-slate-400 text-sm">
        {colorOptions.find(c => c.primary === selectedColors.primary)?.name || 'Custom'}
      </p>
    </div>
    
    <div className="flex items-center gap-2">
      {colorOptions.map((option) => {
        const isSelected = selectedColors.primary === option.primary
        
        return (
          <button
            key={option.name}
            onClick={() => setSelectedColors({ primary: option.primary, accent: option.accent })}
            className={`relative group transition-all duration-200 ${
              isSelected ? 'scale-110' : 'hover:scale-105'
            }`}
            title={option.name}
          >
            {/* Color dot container */}
            <div className={`w-10 h-10 rounded-full p-1 transition-all duration-200 ${
              isSelected 
                ? 'bg-white/30 shadow-lg ring-2 ring-white/50' 
                : 'bg-white/10 hover:bg-white/20'
            }`}>
              {/* Primary color */}
              <div 
                className="w-full h-full rounded-full relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${option.primary} 0%, ${option.accent} 100%)` 
                }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {option.name}
            </div>
          </button>
        )
      })}
    </div>
  </div>
</div>

          {/* Preview Section */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Preview Your Resume</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="text-white border-white/20 hover:bg-white/10"
              >
                {showComparison ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Comparison
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Before/After
                  </>
                )}
              </Button>
            </div>

            {showComparison ? (
              <>
                <p className="text-slate-400 mb-6">See the improvements made to your resume with AI optimization</p>
                
                {/* Before vs After Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SVGResumePreview
                    resumeId={resumeId}
                    version="original"
                    template={selectedTemplate}
                    title="Original Resume"
                    subtitle="Before AI optimization"
                    colors={selectedColors}
                  />
                  
                  <SVGResumePreview
                    resumeId={resumeId}
                    version="optimized"
                    template={selectedTemplate}
                    title="Optimized Resume"
                    subtitle="Enhanced with AI suggestions"
                    colors={selectedColors}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-400 mb-6">Your AI-optimized resume with the {templates.find(t => t.id === selectedTemplate)?.name} template</p>
                
                {/* Single Preview - Focus on Optimized */}
                <div className="max-w-3xl mx-auto">
                  <SVGResumePreview
                    resumeId={resumeId}
                    version="optimized"
                    template={selectedTemplate}
                    title="Your Optimized Resume"
                    subtitle="Ready for download"
                    showDownload={true}
                    onDownload={() => handleDownload('optimized')}
                    colors={selectedColors}
                  />
                </div>
              </>
            )}
          </div>

          {/* Download Section - Focus on Optimized */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Ready to Download!</h2>
                <p className="text-slate-400">
                  Your AI-optimized resume is ready with the {templates.find(t => t.id === selectedTemplate)?.name} template and {colorOptions.find(c => c.primary === selectedColors.primary)?.name} colors
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-green-300 border-green-500/30">
                    ✨ AI Enhanced
                  </Badge>
                  <Badge variant="outline" className="text-cyan-300 border-cyan-500/30">
                    {templates.find(t => t.id === selectedTemplate)?.name} Template
                  </Badge>
                  <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                    {colorOptions.find(c => c.primary === selectedColors.primary)?.name}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Secondary button for original */}
                <Button
                  variant="outline"
                  onClick={() => handleDownload('original')}
                  disabled={isDownloading}
                  className="text-slate-400 border-slate-500/30 hover:bg-white/5"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Original
                </Button>
                
                {/* Primary button for optimized */}
                <Button
                  onClick={() => handleDownload('optimized')}
                  disabled={isDownloading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Optimized Resume
                </Button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <Button
                variant="ghost"
                onClick={handleEditMore}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                ← Make More Changes
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}