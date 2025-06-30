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
import AutoFillButton from '@/components/auto-fill-button'
import ContactInfoSection from '@/components/resume/ContactInfoSection'
import WorkExperienceSection from '@/components/resume/WorkExperienceSection'
import SkillsSection from '@/components/resume/SkillsSection'
import { ContactInfo, StructuredResumeData, WorkExperience, SkillsStructure } from '@/types/resume'
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
  const extractName = (contactInfo?: string | ContactInfo) => {
    // Handle structured contact info
    if (contactInfo && typeof contactInfo === 'object') {
      const structured = contactInfo as ContactInfo
      return `${structured.firstName} ${structured.lastName}`.trim() || resumeData?.title || 'Resume Preview'
    }
    
    // Handle legacy string contact info
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
              {(resumeData?.contactInfo || resumeData?.contact) && (
                <div className="text-gray-600 text-[5px]">
                  {typeof (resumeData?.contactInfo || resumeData?.contact) === 'object' 
                    ? `${(resumeData.contactInfo as ContactInfo).email} • ${(resumeData.contactInfo as ContactInfo).location}`
                    : truncateText((resumeData?.contactInfo || resumeData?.contact).split('\n').slice(1).join(' '), 40)
                  }
                </div>
              )}
            </div>
            {(resumeData?.summary) && (
              <div>
                <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-[5px]">Summary</h2>
                <p className="text-gray-700 text-[5px]">{truncateText(resumeData.summary, 30)}</p>
              </div>
            )}
            {(resumeData?.experience || resumeData?.workExperience) && (
              <div>
                <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-[5px]">Experience</h2>
                <div className="text-gray-700 text-[5px]">
                  {resumeData?.workExperience ? 
                    truncateText(resumeData.workExperience[0]?.jobTitle + ' - ' + resumeData.workExperience[0]?.company, 40) :
                    truncateText(resumeData.experience, 40)
                  }
                </div>
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
  // Structured fields
  contactInfo?: ContactInfo
  workExperience?: WorkExperience[]
  skills?: SkillsStructure
  education?: any[]
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

  // Structured data state
  const [structuredData, setStructuredData] = useState<StructuredResumeData>({
    contactInfo: undefined,
    professionalSummary: undefined,
    workExperience: [],
    education: [],
    skills: undefined,
    projects: [],
    additionalSections: undefined
  })

  // Helper functions for data conversion
  const convertLegacyContactToStructured = (contactString: string): ContactInfo | undefined => {
    if (!contactString?.trim()) return undefined
    
    const lines = contactString.split('\n').filter(line => line.trim())
    const contactInfo: Partial<ContactInfo> = {}
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.includes('@')) {
        contactInfo.email = trimmed
      } else if (trimmed.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) {
        contactInfo.phone = trimmed
      } else if (trimmed.includes('linkedin.com')) {
        contactInfo.linkedin = trimmed
      } else if (trimmed.includes('github.com')) {
        contactInfo.githubUrl = trimmed
      } else if (trimmed.includes('http')) {
        contactInfo.website = trimmed
      } else if (trimmed.includes(',')) {
        contactInfo.location = trimmed
      } else if (!contactInfo.firstName && !contactInfo.lastName) {
        // First non-special line is likely the name
        const nameParts = trimmed.split(' ')
        contactInfo.firstName = nameParts[0] || ''
        contactInfo.lastName = nameParts.slice(1).join(' ') || ''
      }
    })
    
    // Return only if we have minimum required data
    if (contactInfo.firstName || contactInfo.lastName || contactInfo.email) {
      return {
        firstName: contactInfo.firstName || '',
        lastName: contactInfo.lastName || '',
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        location: contactInfo.location || '',
        linkedin: contactInfo.linkedin,
        website: contactInfo.website,
        githubUrl: contactInfo.githubUrl
      }
    }
    
    return undefined
  }

  const convertStructuredContactToLegacy = (contactInfo: ContactInfo): string => {
    const lines = []
    if (contactInfo.firstName || contactInfo.lastName) {
      lines.push(`${contactInfo.firstName} ${contactInfo.lastName}`.trim())
    }
    if (contactInfo.email) lines.push(contactInfo.email)
    if (contactInfo.phone) lines.push(contactInfo.phone)
    if (contactInfo.linkedin) lines.push(contactInfo.linkedin)
    if (contactInfo.website) lines.push(contactInfo.website)
    if (contactInfo.githubUrl) lines.push(contactInfo.githubUrl)
    if (contactInfo.location) lines.push(contactInfo.location)
    
    return lines.join('\n')
  }

  const convertWorkExperienceToLegacy = (workExperience: WorkExperience[]): string => {
    if (!workExperience || workExperience.length === 0) return ''
    
    return workExperience.map(job => {
      const header = `${job.jobTitle} - ${job.company} (${job.startDate} - ${job.endDate === 'present' ? 'Present' : job.endDate})`
      const location = job.location ? `\nLocation: ${job.location}` : ''
      const achievements = job.achievements && job.achievements.length > 0 && job.achievements[0]?.trim() 
        ? '\n' + job.achievements.filter(a => a.trim()).map(a => `• ${a}`).join('\n')
        : ''
      const technologies = job.technologies && job.technologies.length > 0 
        ? `\nTechnologies: ${job.technologies.join(', ')}`
        : ''
      
      return header + location + achievements + technologies
    }).join('\n\n')
  }

  const convertSkillsToLegacy = (skills: SkillsStructure): string => {
    if (!skills) return ''
    
    const sections = []
    
    if (skills.technical.length > 0) {
      sections.push(`Programming Languages: ${skills.technical.join(', ')}`)
    }
    if (skills.frameworks.length > 0) {
      sections.push(`Frameworks & Libraries: ${skills.frameworks.join(', ')}`)
    }
    if (skills.tools.length > 0) {
      sections.push(`Development Tools: ${skills.tools.join(', ')}`)
    }
    if (skills.cloud.length > 0) {
      sections.push(`Cloud Platforms: ${skills.cloud.join(', ')}`)
    }
    if (skills.databases.length > 0) {
      sections.push(`Databases: ${skills.databases.join(', ')}`)
    }
    if (skills.soft.length > 0) {
      sections.push(`Soft Skills: ${skills.soft.join(', ')}`)
    }
    if (skills.certifications.length > 0) {
      sections.push(`Certifications: ${skills.certifications.join(', ')}`)
    }
    
    return sections.join('\n')
  }

  // Handler for structured contact data
  const handleContactInfoChange = (contactInfo: ContactInfo) => {
    setStructuredData(prev => ({
      ...prev,
      contactInfo: contactInfo
    }))
    
    // Update legacy format for backward compatibility
    const legacyContact = convertStructuredContactToLegacy(contactInfo)
    setEditedSections(prev => ({
      ...prev,
      contact: legacyContact
    }))
    
    setHasChanges(true)
  }

  // Handler for structured work experience data
  const handleWorkExperienceChange = (workExperience: WorkExperience[]) => {
    setStructuredData(prev => ({
      ...prev,
      workExperience: workExperience
    }))
    
    // Update legacy format for backward compatibility
    const legacyExperience = convertWorkExperienceToLegacy(workExperience)
    setEditedSections(prev => ({
      ...prev,
      experience: legacyExperience
    }))
    
    setHasChanges(true)
  }

  // Handler for structured skills data
  const handleSkillsChange = (skills: SkillsStructure) => {
    setStructuredData(prev => ({
      ...prev,
      skills: skills
    }))
    
    // Update legacy format for backward compatibility
    const legacySkills = convertSkillsToLegacy(skills)
    setEditedSections(prev => ({
      ...prev,
      skills: legacySkills
    }))
    
    setHasChanges(true)
  }

  // Convert structured auto-fill data to string-based sections format
  const convertAutoFillDataToSections = (autoFillData: any) => {
    const sections = {
      contact: '',
      summary: autoFillData.summary || '',
      experience: '',
      education: '',
      skills: '',
      other: ''
    }

    // Convert contact object to string
    if (autoFillData.contact) {
      const contactParts = []
      if (autoFillData.contact.fullName) contactParts.push(autoFillData.contact.fullName)
      if (autoFillData.contact.email) contactParts.push(autoFillData.contact.email)
      if (autoFillData.contact.phone) contactParts.push(autoFillData.contact.phone)
      if (autoFillData.contact.location) contactParts.push(autoFillData.contact.location)
      if (autoFillData.contact.linkedin) contactParts.push(autoFillData.contact.linkedin)
      if (autoFillData.contact.website) contactParts.push(autoFillData.contact.website)
      sections.contact = contactParts.join('\n')
    }

    // Convert experience array to string
    if (autoFillData.experience && Array.isArray(autoFillData.experience)) {
      const experienceStrings = autoFillData.experience.map((exp: any) => {
        const header = `${exp.title} - ${exp.company} (${exp.startDate} - ${exp.endDate})`
        const description = exp.description ? `\n${exp.description}` : ''
        return header + description
      })
      sections.experience = experienceStrings.join('\n\n')
    }

    // Convert education array to string
    if (autoFillData.education && Array.isArray(autoFillData.education)) {
      const educationStrings = autoFillData.education.map((edu: any) => {
        return `${edu.degree} - ${edu.school} (${edu.year})`
      })
      sections.education = educationStrings.join('\n')
    }

    // Convert skills array to string
    if (autoFillData.skills && Array.isArray(autoFillData.skills)) {
      sections.skills = autoFillData.skills.join(', ')
    }

    return sections
  }

  // Handle auto-fill completion
  const handleAutoFillComplete = (autoFillData: any) => {
    console.log('🎉 Auto-fill completed with data:', autoFillData)
    
    // Convert the structured auto-fill data to your sections format
    const convertedSections = convertAutoFillDataToSections(autoFillData)
    
    // Update the edited sections
    setEditedSections(convertedSections)

    // Convert to structured data if possible
    if (convertedSections.contact) {
      const structuredContact = convertLegacyContactToStructured(convertedSections.contact)
      if (structuredContact) {
        setStructuredData(prev => ({
          ...prev,
          contactInfo: structuredContact
        }))
      }
    }
    
    // Mark as having changes so user can save
    setHasChanges(true)
    
    // Optionally switch to edit tab to show the populated data
    setActiveTab('edit')
  }

  // Fetch resume data
  const fetchResume = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/resumes/${resumeId}`)
      const data = await response.json()
      
      if (data.success) {
        setResume(data.resume)
        setEditedTitle(data.resume.title)
        
        // Handle different data structures - be defensive about the structure
        let sections = {
          contact: "",
          summary: "",
          experience: "",
          education: "",
          skills: "",
          other: ""
        }
        
        // Try to get sections from currentContent.sections first (old structure)
        if (data.resume.currentContent?.sections) {
          sections = { ...sections, ...data.resume.currentContent.sections }
        }
        // Otherwise try originalContent.sections (fallback)
        else if (data.resume.originalContent?.sections) {
          sections = { ...sections, ...data.resume.originalContent.sections }
        }
        // Handle flat structure from auto-fill API
        else if (data.resume.currentContent) {
          const content = data.resume.currentContent
          sections = {
            contact: content.contact?.fullName ? 
              [content.contact.fullName, content.contact.email, content.contact.phone, content.contact.location]
                .filter(Boolean).join('\n') : '',
            summary: content.summary || '',
            experience: Array.isArray(content.experience) ? 
              content.experience.map((exp: any) => `${exp.title} - ${exp.company} (${exp.startDate} - ${exp.endDate})\n${exp.description}`).join('\n\n') : '',
            education: Array.isArray(content.education) ? 
              content.education.map((edu: any) => `${edu.degree} - ${edu.school} (${edu.year})`).join('\n') : '',
            skills: Array.isArray(content.skills) ? content.skills.join(', ') : '',
            other: ''
          }
        }
        
        setEditedSections(sections)

        // Handle structured data
        const newStructuredData: StructuredResumeData = {
          contactInfo: undefined,
          professionalSummary: undefined,
          workExperience: [],
          education: [],
          skills: undefined,
          projects: [],
          additionalSections: undefined
        }

        // Load structured contact info
        if (data.resume.contactInfo) {
          newStructuredData.contactInfo = data.resume.contactInfo
        } else if (sections.contact) {
          // Convert legacy contact data to structured format
          const convertedContact = convertLegacyContactToStructured(sections.contact)
          if (convertedContact) {
            newStructuredData.contactInfo = convertedContact
          }
        }

        // Load structured work experience
        if (data.resume.workExperience) {
          newStructuredData.workExperience = data.resume.workExperience
        }

        // Load structured skills
        if (data.resume.skills) {
          newStructuredData.skills = data.resume.skills
        }

        setStructuredData(newStructuredData)
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

  // Save changes - UPDATED to include all structured data
  const handleSave = async () => {
    if (!resume || !hasChanges) return

    try {
      setSaving(true)
      
      const updatedContent = {
        ...resume.currentContent,
        sections: editedSections
      }

      // Include all structured data in the save
      const saveData = {
        title: editedTitle,
        currentContent: updatedContent,
        // Include structured fields
        contactInfo: structuredData.contactInfo,
        workExperience: structuredData.workExperience,
        skills: structuredData.skills,
        // Add other structured fields as needed:
        // education: structuredData.education,
        // projects: structuredData.projects,
      }

      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      })

      const data = await response.json()
      
      if (data.success) {
        setResume(prev => prev ? { 
          ...prev, 
          title: editedTitle, 
          currentContent: updatedContent,
          contactInfo: structuredData.contactInfo,
          workExperience: structuredData.workExperience,
          skills: structuredData.skills
        } : null)
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

  // Check if resume is complete enough for next step - UPDATED for structured data
  const isResumeComplete = () => {
    // Check structured data first, then fall back to legacy
    const hasContact = structuredData.contactInfo?.email || editedSections.contact?.trim().length > 20
    const hasSummary = editedSections.summary?.trim().length > 20
    const hasExperience = (structuredData.workExperience && structuredData.workExperience.length > 0) || editedSections.experience?.trim().length > 20
    
    return hasContact && hasSummary && hasExperience
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

  // Helper function to get preview data - UPDATED for structured data
  const getPreviewData = () => {
    return {
      title: editedTitle,
      contactInfo: structuredData.contactInfo,
      contact: editedSections.contact,
      summary: editedSections.summary,
      experience: editedSections.experience,
      workExperience: structuredData.workExperience,
      education: editedSections.education,
      skills: editedSections.skills,
      structuredSkills: structuredData.skills
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
              
              {/* Resume Title with Auto-Fill */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-primary-400" />
                        Resume Title
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Give your resume a clear, descriptive title
                      </CardDescription>
                    </div>
                    
                    {/* Auto-Fill Button */}
                    {resume?.s3Key && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-slate-300 font-medium">Speed up editing!</p>
                          <p className="text-xs text-slate-400">Auto-fill from your uploaded PDF</p>
                        </div>
                        <AutoFillButton
                          resumeId={resumeId}
                          onAutoFillComplete={handleAutoFillComplete}
                          disabled={false}
                          className="shrink-0"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Input
                    value={editedTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="bg-white/5 border-white/20 text-white text-lg font-medium placeholder:text-slate-400 focus:border-primary-400"
                    placeholder="e.g. John Smith - Software Engineer Resume"
                  />
                  
                  {/* Auto-fill help text for empty forms */}
                  {resume?.s3Key && !editedSections?.contact && !editedSections?.summary && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-300 text-sm">✨</span>
                        </div>
                        <div>
                          <h4 className="text-blue-300 font-medium text-sm mb-1">Pro Tip: Auto-fill your resume!</h4>
                          <p className="text-blue-200/80 text-sm">
                            Click the "Auto-fill from PDF" button above to automatically populate all sections with information from your uploaded resume. 
                            You can then edit and refine the content as needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                      {/* Structured Contact Information */}
                      <ContactInfoSection
                        contactInfo={structuredData.contactInfo}
                        onChange={handleContactInfoChange}
                        className="mb-6"
                      />

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

                      {/* Structured Work Experience */}
                      <WorkExperienceSection
                        workExperience={structuredData.workExperience}
                        onChange={handleWorkExperienceChange}
                        className="mb-6"
                      />

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

                      {/* Structured Skills */}
                      <SkillsSection
                        skills={structuredData.skills}
                        onChange={handleSkillsChange}
                        className="mb-6"
                      />

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
                        
                        {(editedSections.contact || structuredData.contactInfo) && (
                          <div>
                            <h3 className="text-lg font-semibold text-primary-400 mb-2 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Contact Information
                            </h3>
                            {structuredData.contactInfo ? (
                              <div className="space-y-1 text-slate-300">
                                <div>{`${structuredData.contactInfo.firstName} ${structuredData.contactInfo.lastName}`.trim()}</div>
                                <div>{structuredData.contactInfo.email}</div>
                                <div>{structuredData.contactInfo.phone}</div>
                                <div>{structuredData.contactInfo.location}</div>
                                {structuredData.contactInfo.linkedin && <div>{structuredData.contactInfo.linkedin}</div>}
                                {structuredData.contactInfo.website && <div>{structuredData.contactInfo.website}</div>}
                                {structuredData.contactInfo.githubUrl && <div>{structuredData.contactInfo.githubUrl}</div>}
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-slate-300">{editedSections.contact}</div>
                            )}
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

                        {(editedSections.experience || structuredData.workExperience?.length) && (
                          <div>
                            <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              Work Experience
                            </h3>
                            {structuredData.workExperience && structuredData.workExperience.length > 0 ? (
                              <div className="space-y-4">
                                {structuredData.workExperience.map((job, index) => (
                                  <div key={job.id} className="border-l border-slate-600 pl-4">
                                    <h4 className="font-semibold text-white">
                                      {job.jobTitle} - {job.company}
                                    </h4>
                                    <p className="text-slate-400 text-sm">
                                      {job.startDate} - {job.endDate === 'present' ? 'Present' : job.endDate}
                                      {job.location && ` • ${job.location}`}
                                    </p>
                                    {job.achievements && job.achievements.length > 0 && job.achievements[0]?.trim() && (
                                      <ul className="mt-2 space-y-1 text-slate-300">
                                        {job.achievements.filter(a => a.trim()).map((achievement, i) => (
                                          <li key={i} className="text-sm">• {achievement}</li>
                                        ))}
                                      </ul>
                                    )}
                                    {job.technologies && job.technologies.length > 0 && (
                                      <p className="mt-2 text-slate-400 text-sm">
                                        <strong>Technologies:</strong> {job.technologies.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-slate-300">{editedSections.experience}</div>
                            )}
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

                        {(editedSections.skills || structuredData.skills) && (
                          <div>
                            <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Skills & Technologies
                            </h3>
                            {structuredData.skills ? (
                              <div className="space-y-2">
                                {structuredData.skills.technical.length > 0 && (
                                  <div><strong>Programming Languages:</strong> {structuredData.skills.technical.join(', ')}</div>
                                )}
                                {structuredData.skills.frameworks.length > 0 && (
                                  <div><strong>Frameworks & Libraries:</strong> {structuredData.skills.frameworks.join(', ')}</div>
                                )}
                                {structuredData.skills.tools.length > 0 && (
                                  <div><strong>Development Tools:</strong> {structuredData.skills.tools.join(', ')}</div>
                                )}
                                {structuredData.skills.cloud.length > 0 && (
                                  <div><strong>Cloud Platforms:</strong> {structuredData.skills.cloud.join(', ')}</div>
                                )}
                                {structuredData.skills.databases.length > 0 && (
                                  <div><strong>Databases:</strong> {structuredData.skills.databases.join(', ')}</div>
                                )}
                                {structuredData.skills.soft.length > 0 && (
                                  <div><strong>Soft Skills:</strong> {structuredData.skills.soft.join(', ')}</div>
                                )}
                                {structuredData.skills.certifications.length > 0 && (
                                  <div><strong>Certifications:</strong> {structuredData.skills.certifications.join(', ')}</div>
                                )}
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-slate-300">{editedSections.skills}</div>
                            )}
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

              {/* Progress Indicator - UPDATED for structured data */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Contact Info</span>
                    {(structuredData.contactInfo?.email || editedSections.contact?.length > 20) ? (
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
                    {(structuredData.workExperience && structuredData.workExperience.length > 0) || editedSections.experience.length > 20 ? (
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
                    {(structuredData.skills && Object.values(structuredData.skills).some(arr => arr.length > 0)) || editedSections.skills.length > 5 ? (
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