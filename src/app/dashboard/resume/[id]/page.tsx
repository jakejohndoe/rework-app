"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit3, 
  FileText, 
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Clock,
  Download
} from "lucide-react"

interface ResumeData {
  id: string
  title: string
  wordCount: number
  createdAt: string
  updatedAt: string
  originalContent: {
    rawText: string
    sections: {
      contact: string
      summary: string
      experience: string
      education: string
      skills: string
      other: string
    }
    metadata: {
      originalFileName: string
      fileSize: number
      fileType: string
      uploadedAt: string
      wordCount: number
      processingStatus?: string
    }
  }
  currentContent: any
}

export default function ResumeEditorPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const resumeId = params.id as string

  const [resume, setResume] = useState<ResumeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")
  const [hasChanges, setHasChanges] = useState(false)

  // Editable content state
  const [editedTitle, setEditedTitle] = useState("")
  const [editedSections, setEditedSections] = useState({
    contact: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
    other: ""
  })

  // Fetch resume data
  const fetchResume = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/resumes/${resumeId}`)
      const data = await response.json()
      
      if (data.success) {
        setResume(data.resume)
        setEditedTitle(data.resume.title)
        setEditedSections(data.resume.currentContent.sections || data.resume.originalContent.sections)
      } else {
        console.error('Failed to fetch resume:', data.error)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching resume:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  // Save changes
  const handleSave = async () => {
    if (!resume || !hasChanges) return

    try {
      setSaving(true)
      
      const updatedContent = {
        ...resume.currentContent,
        sections: editedSections
      }

      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editedTitle,
          content: updatedContent
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResume(prev => prev ? { ...prev, title: editedTitle, currentContent: updatedContent } : null)
        setHasChanges(false)
        // Could show success toast here
        console.log('✅ Resume saved successfully')
      } else {
        console.error('Failed to save resume:', data.error)
        // Could show error toast here
      }
    } catch (error) {
      console.error('Error saving resume:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSectionChange = (section: string, value: string) => {
    setEditedSections(prev => ({ ...prev, [section]: value }))
    setHasChanges(true)
  }

  const handleTitleChange = (value: string) => {
    setEditedTitle(value)
    setHasChanges(true)
  }

  useEffect(() => {
    if (status === "authenticated" && resumeId) {
      fetchResume()
    }
  }, [status, resumeId])

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="circuit-bg min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading resume...</p>
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

  // Resume not found
  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="circuit-bg min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Resume not found</h1>
            <Link href="/dashboard">
              <Button className="btn-gradient">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 glass-dark">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary-400" />
                  <span className="text-white font-medium">{resume.title}</span>
                  <Badge variant="secondary" className="bg-slate-600/50 text-slate-300">
                    {resume.wordCount} words
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {hasChanges && (
                  <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300">
                    <Clock className="w-3 h-3 mr-1" />
                    Unsaved changes
                  </Badge>
                )}
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="btn-gradient"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-6">
              {/* Resume Title */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary-400" />
                    Resume Title
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={editedTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="bg-white/5 border-white/20 text-white text-lg font-medium placeholder:text-slate-400 focus:border-primary-400"
                    placeholder="Enter resume title..."
                  />
                </CardContent>
              </Card>

              {/* Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="glass-card border-white/10 rounded-xl">
                  <div className="p-6 pb-0">
                    <TabsList className="glass-dark border-white/10 p-1">
                      <TabsTrigger 
                        value="edit" 
                        className="data-[state=active]:bg-primary-400/20 data-[state=active]:text-primary-300"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Sections
                      </TabsTrigger>
                      <TabsTrigger 
                        value="preview" 
                        className="data-[state=active]:bg-primary-400/20 data-[state=active]:text-primary-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="raw" 
                        className="data-[state=active]:bg-primary-400/20 data-[state=active]:text-primary-300"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Raw Text
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="edit" className="space-y-6 mt-0">
                      {/* Contact Information */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-primary-400" />
                          Contact Information
                        </Label>
                        <Textarea
                          value={editedSections.contact}
                          onChange={(e) => handleSectionChange('contact', e.target.value)}
                          placeholder="Email, phone, address, LinkedIn..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[80px]"
                        />
                      </div>

                      {/* Professional Summary */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-secondary-400" />
                          Professional Summary
                        </Label>
                        <Textarea
                          value={editedSections.summary}
                          onChange={(e) => handleSectionChange('summary', e.target.value)}
                          placeholder="Brief professional summary or objective..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[120px]"
                        />
                      </div>

                      {/* Work Experience */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-green-400" />
                          Work Experience
                        </Label>
                        <Textarea
                          value={editedSections.experience}
                          onChange={(e) => handleSectionChange('experience', e.target.value)}
                          placeholder="Job titles, companies, dates, achievements..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[200px]"
                        />
                      </div>

                      {/* Education */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-400" />
                          Education
                        </Label>
                        <Textarea
                          value={editedSections.education}
                          onChange={(e) => handleSectionChange('education', e.target.value)}
                          placeholder="Degrees, schools, certifications..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[120px]"
                        />
                      </div>

                      {/* Skills */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Skills & Technologies
                        </Label>
                        <Textarea
                          value={editedSections.skills}
                          onChange={(e) => handleSectionChange('skills', e.target.value)}
                          placeholder="Technical skills, programming languages, tools..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[120px]"
                        />
                      </div>

                      {/* Other */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium">
                          Additional Information
                        </Label>
                        <Textarea
                          value={editedSections.other}
                          onChange={(e) => handleSectionChange('other', e.target.value)}
                          placeholder="Awards, projects, volunteer work, other relevant information..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[120px]"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-0">
                      <div className="space-y-6 text-white">
                        {editedTitle && (
                          <div className="text-center">
                            <h1 className="text-2xl font-bold gradient-text mb-2">{editedTitle}</h1>
                          </div>
                        )}
                        
                        {editedSections.contact && (
                          <div>
                            <h3 className="text-lg font-semibold text-primary-400 mb-2 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Contact Information
                            </h3>
                            <div className="whitespace-pre-wrap text-slate-300">{editedSections.contact}</div>
                          </div>
                        )}

                        {editedSections.summary && (
                          <div>
                            <h3 className="text-lg font-semibold text-secondary-400 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Professional Summary
                            </h3>
                            <div className="whitespace-pre-wrap text-slate-300">{editedSections.summary}</div>
                          </div>
                        )}

                        {editedSections.experience && (
                          <div>
                            <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              Work Experience
                            </h3>
                            <div className="whitespace-pre-wrap text-slate-300">{editedSections.experience}</div>
                          </div>
                        )}

                        {editedSections.education && (
                          <div>
                            <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              Education
                            </h3>
                            <div className="whitespace-pre-wrap text-slate-300">{editedSections.education}</div>
                          </div>
                        )}

                        {editedSections.skills && (
                          <div>
                            <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Skills & Technologies
                            </h3>
                            <div className="whitespace-pre-wrap text-slate-300">{editedSections.skills}</div>
                          </div>
                        )}

                        {editedSections.other && (
                          <div>
                            <h3 className="text-lg font-semibold text-slate-400 mb-2">
                              Additional Information
                            </h3>
                            <div className="whitespace-pre-wrap text-slate-300">{editedSections.other}</div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="raw" className="mt-0">
                      <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                        <h3 className="text-white font-medium mb-3">Original Extracted Text</h3>
                        <div className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                          {resume.originalContent.rawText}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* File Info */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">File Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Original file:</span>
                    <span className="text-white">{resume.originalContent.metadata.originalFileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File size:</span>
                    <span className="text-white">{(resume.originalContent.metadata.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="text-white">{resume.originalContent.metadata.fileType.split('/')[1].toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploaded:</span>
                    <span className="text-white">{new Date(resume.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last modified:</span>
                    <span className="text-white">{new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full btn-gradient" disabled>
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize with AI
                    <Badge variant="secondary" className="ml-2 bg-yellow-400/20 text-yellow-300 text-xs">
                      Coming Soon
                    </Badge>
                  </Button>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" disabled>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}