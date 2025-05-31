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
  Download,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

// Simple Resume Preview Component
function SimpleResumePreview({ resumeData, className = "" }: { resumeData: any, className?: string }) {
  const extractName = (contactInfo?: string) => {
    if (!contactInfo || typeof contactInfo !== 'string') return resumeData?.title || 'Resume Preview'
    const lines = contactInfo.split('\n').filter(line => line.trim())
    const nameLine = lines.find(line => 
      !line.includes('@') && 
      !line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/) &&
      line.length > 2
    )
    return nameLine || resumeData?.title || 'Resume Preview'
  }

  const truncateText = (text?: string, maxLength = 100) => {
    if (!text) return ''
    const cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned
  }

  const name = extractName(resumeData?.contactInfo || resumeData?.contact)

  return (
    <Card className={`glass-card border-white/10 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-400" />
          Resume Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-48 h-64 bg-white rounded-sm shadow-lg border border-gray-200 overflow-hidden relative transition-all duration-300 transform-gpu hover:shadow-xl hover:scale-[1.02] mx-auto">
          <div className="text-[8px] p-2 space-y-0.5 h-full overflow-hidden">
            <div className="border-b border-gray-200 pb-1">
              <h1 className="font-bold text-gray-900 truncate text-[6px]">
                {name.toUpperCase()}
              </h1>
              {(resumeData?.contactInfo || resumeData?.contact) && typeof (resumeData?.contactInfo || resumeData?.contact) === 'string' && (
                <div className="text-gray-600 text-[5px]">
                  {truncateText((resumeData?.contactInfo || resumeData?.contact).split('\n').slice(1).join(' '), 40)}
                </div>
              )}
            </div>
            {(resumeData?.summary) && (
              <div>
                <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-[5px]">Summary</h2>
                <p className="text-gray-700 text-[5px]">{truncateText(resumeData.summary, 30)}</p>
              </div>
            )}
            {(resumeData?.experience) && (
              <div>
                <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-[5px]">Experience</h2>
                <div className="text-gray-700 text-[5px]">{truncateText(resumeData.experience, 40)}</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ResumeData {
  id: string
  title: string
  wordCount: number
  createdAt: string
  updatedAt: string
  s3Key?: string        
  s3Bucket?: string     
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
        console.log('✅ Resume saved successfully')
      } else {
        console.error('Failed to save resume:', data.error)
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

  // Check if resume is complete enough for next step
  const isResumeComplete = () => {
    const requiredSections = ['contact', 'summary', 'experience']
    return requiredSections.every(section => editedSections[section as keyof typeof editedSections]?.trim().length > 20)
  }

  // Handle next step
  const handleNext = async () => {
    // Auto-save if there are changes
    if (hasChanges) {
      await handleSave()
    }
    
    // Navigate to job description page
    router.push(`/dashboard/resume/${resumeId}/job-description`)
  }

  // Helper function to get preview data
  const getPreviewData = () => {
    return {
      title: editedTitle,
      contactInfo: editedSections.contact,
      contact: editedSections.contact,
      summary: editedSections.summary,
      experience: editedSections.experience,
      education: editedSections.education,
      skills: editedSections.skills
    }
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
                
                {/* Step Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                    <span className="text-white font-medium">Edit Resume</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-400">2</span>
                    </div>
                    <span className="text-slate-400">Job Description</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-400">3</span>
                    </div>
                    <span className="text-slate-400">AI Analysis</span>
                  </div>
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
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
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
                  <CardDescription className="text-slate-400">
                    Give your resume a clear, descriptive title
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    value={editedTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="bg-white/5 border-white/20 text-white text-lg font-medium placeholder:text-slate-400 focus:border-primary-400"
                    placeholder="e.g. John Smith - Software Engineer Resume"
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
                          <Badge variant="outline" className="text-xs border-red-400/30 text-red-300">Required</Badge>
                        </Label>
                        <Textarea
                          value={editedSections.contact}
                          onChange={(e) => handleSectionChange('contact', e.target.value)}
                          placeholder="Full Name&#10;Email Address&#10;Phone Number&#10;LinkedIn Profile&#10;Location (City, State)"
                          className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[100px]"
                        />
                      </div>

                      {/* Professional Summary */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-secondary-400" />
                          Professional Summary
                          <Badge variant="outline" className="text-xs border-red-400/30 text-red-300">Required</Badge>
                        </Label>
                        <Textarea
                          value={editedSections.summary}
                          onChange={(e) => handleSectionChange('summary', e.target.value)}
                          placeholder="Write a compelling 2-3 sentence summary of your professional experience, key skills, and career objectives..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[120px]"
                        />
                      </div>

                      {/* Work Experience */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-green-400" />
                          Work Experience
                          <Badge variant="outline" className="text-xs border-red-400/30 text-red-300">Required</Badge>
                        </Label>
                        <Textarea
                          value={editedSections.experience}
                          onChange={(e) => handleSectionChange('experience', e.target.value)}
                          placeholder="Job Title - Company Name (Start Date - End Date)&#10;• Key achievement with quantifiable results&#10;• Another achievement demonstrating relevant skills&#10;• Third achievement showing impact and value&#10;&#10;Previous Job Title - Company Name (Start Date - End Date)&#10;• Achievement or responsibility&#10;• Another key accomplishment..."
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
                          placeholder="Degree Name - University/Institution (Graduation Year)&#10;• Relevant coursework, honors, or achievements&#10;• GPA (if 3.5+), Dean's List, scholarships, etc."
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
                          placeholder="Technical Skills: JavaScript, Python, React, Node.js, SQL&#10;Tools & Platforms: Git, Docker, AWS, MongoDB, Jira&#10;Soft Skills: Leadership, Communication, Problem-solving, Team Collaboration"
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
                          placeholder="Awards, certifications, volunteer work, projects, publications, languages, or other relevant information..."
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

              {/* Next Step Button */}
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">Ready for the next step?</h3>
                      <p className="text-slate-400 text-sm">
                        {isResumeComplete() 
                          ? "Your resume looks great! Let's add a job description to optimize it."
                          : "Complete the required sections (Contact, Summary, Experience) to continue."
                        }
                      </p>
                    </div>
                    <Button 
                      onClick={handleNext}
                      disabled={!isResumeComplete()}
                      className="btn-gradient"
                      size="lg"
                    >
                      {isResumeComplete() && <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Next: Job Description
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Resume Preview */}
              <SimpleResumePreview 
                resumeData={getPreviewData()}
                className="sticky top-6"
              />

              {/* Progress Indicator */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Contact Info</span>
                    {editedSections.contact?.length > 20 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Summary</span>
                    {editedSections.summary.length > 20 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Experience</span>
                    {editedSections.experience.length > 20 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Education</span>
                    {editedSections.education.length > 5 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Skills</span>
                    {editedSections.skills.length > 5 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                    )}
                  </div>
                </CardContent>
              </Card>

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
                    <span className="text-slate-400">Last modified:</span>
                    <span className="text-white">{new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}