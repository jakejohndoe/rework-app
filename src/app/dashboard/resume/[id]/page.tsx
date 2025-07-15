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
import EducationSection from '@/components/resume/EducationSection'
import ProfessionalSummarySection from '@/components/resume/ProfessionalSummarySection'
import { CollapsibleSectionWrapper } from '@/components/resume/CollapsibleSectionWrapper'
import { ContactInfo, StructuredResumeData, WorkExperience, SkillsStructure, Education, ProfessionalSummary } from '@/types/resume'
// ✅ ADDED: Import the minimum loading hook
import { useResumeLoading } from '@/hooks/useMinimumLoading'
import ResumeLoader from '@/components/resume-loader'
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
  CheckCircle2,
  Sparkles
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

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
    <Card className={`glass-card border-white/10 hover:scale-[1.02] transition-all duration-300 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <FileText className="w-3 h-3 text-white" />
          </div>
          <span className="gradient-text">live preview</span>
          <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full ml-auto">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-48 h-64 bg-white rounded-sm shadow-lg border border-gray-200 overflow-hidden relative transition-all duration-300 transform-gpu hover:shadow-xl hover:scale-[1.02] mx-auto group">
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
            {(resumeData?.summary || resumeData?.structuredSummary) && (
              <div>
                <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-[5px]">Summary</h2>
                <p className="text-gray-700 text-[5px]">
                  {resumeData?.structuredSummary ? 
                    truncateText(resumeData.structuredSummary.summary, 30) :
                    truncateText(resumeData.summary, 30)
                  }
                </p>
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
            {(resumeData?.education || resumeData?.structuredEducation) && (
              <div>
                <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-[5px]">Education</h2>
                <div className="text-gray-700 text-[5px]">
                  {resumeData?.structuredEducation ? 
                    truncateText(`${resumeData.structuredEducation[0]?.degree} - ${resumeData.structuredEducation[0]?.institution}`, 40) :
                    truncateText(resumeData.education, 40)
                  }
                </div>
              </div>
            )}
          </div>
          
          {/* Premium glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm"></div>
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
  education?: Education[]
  professionalSummary?: ProfessionalSummary
}

export default function ResumeEditorPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const resumeId = params.id as string

  // ✅ ADDED: Minimum loading hook for 3.5 seconds
  const { shouldShowContent } = useResumeLoading()

  const [resume, setResume] = useState<ResumeData | null>(null)
  // ✅ REMOVED: All competing loading state logic
  const [isSaving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")
  const [hasChanges, setHasChanges] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isMounted, setIsMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

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

  // Client-side mount check and premium effects
  useEffect(() => {
    setIsMounted(true)
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  // Mouse tracking for premium effects
  useEffect(() => {
    if (!isMounted) return
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth * 100, y: e.clientY / window.innerHeight * 100 })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMounted])

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
        ? `\nTools/Software: ${job.technologies.join(', ')}`
        : ''
      
      return header + location + achievements + technologies
    }).join('\n\n')
  }

  const convertSkillsToLegacy = (skills: SkillsStructure): string => {
    if (!skills) return ''
    
    const sections = []
    
    if (skills.technical.length > 0) {
      sections.push(`Core Job Skills: ${skills.technical.join(', ')}`)
    }
    if (skills.tools.length > 0) {
      sections.push(`Software & Tools: ${skills.tools.join(', ')}`)
    }
    if (skills.soft.length > 0) {
      sections.push(`Soft Skills: ${skills.soft.join(', ')}`)
    }
    if (skills.certifications.length > 0) {
      sections.push(`Certifications & Licenses: ${skills.certifications.join(', ')}`)
    }
    if (skills.frameworks.length > 0) {
      sections.push(`Industry Knowledge: ${skills.frameworks.join(', ')}`)
    }
    if (skills.databases.length > 0) {
      sections.push(`Languages: ${skills.databases.join(', ')}`)
    }
    
    return sections.join('\n')
  }

  const convertEducationToLegacy = (education: Education[]): string => {
    if (!education || education.length === 0) return ''
    
    return education.map(edu => {
      const header = `${edu.degree} in ${edu.field} - ${edu.institution} (${edu.graduationYear})`
      const gpa = edu.gpa ? `\nGPA: ${edu.gpa}` : ''
      const honors = edu.honors && edu.honors.length > 0 
        ? `\nHonors: ${edu.honors.join(', ')}`
        : ''
      const coursework = edu.relevantCoursework && edu.relevantCoursework.length > 0 
        ? `\nRelevant Coursework: ${edu.relevantCoursework.join(', ')}`
        : ''
      
      return header + gpa + honors + coursework
    }).join('\n\n')
  }

  const convertProfessionalSummaryToLegacy = (professionalSummary: ProfessionalSummary): string => {
    if (!professionalSummary) return ''
    
    return professionalSummary.summary
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

  // Handler for structured education data
  const handleEducationChange = (education: Education[]) => {
    setStructuredData(prev => ({
      ...prev,
      education: education
    }))
    
    // Update legacy format for backward compatibility
    const legacyEducation = convertEducationToLegacy(education)
    setEditedSections(prev => ({
      ...prev,
      education: legacyEducation
    }))
    
    setHasChanges(true)
  }

  // Handler for structured professional summary data
  const handleProfessionalSummaryChange = (professionalSummary: ProfessionalSummary) => {
    setStructuredData(prev => ({
      ...prev,
      professionalSummary: professionalSummary
    }))
    
    // Update legacy format for backward compatibility
    const legacySummary = convertProfessionalSummaryToLegacy(professionalSummary)
    setEditedSections(prev => ({
      ...prev,
      summary: legacySummary
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

    // Convert summary to structured format
    if (convertedSections.summary) {
      const structuredSummary: ProfessionalSummary = {
        summary: convertedSections.summary,
        targetRole: '',
        keyStrengths: [],
        careerLevel: 'mid'
      }
      setStructuredData(prev => ({
        ...prev,
        professionalSummary: structuredSummary
      }))
    }
    
    // Mark as having changes so user can save
    setHasChanges(true)
    
    // Optionally switch to edit tab to show the populated data
    setActiveTab('edit')
  }

  // ✅ FIXED: Simple fetch without competing loading logic
  const fetchResume = async () => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error('Resume not found')
      }
      
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

        // Load structured education
        if (data.resume.education) {
          newStructuredData.education = data.resume.education
        }

        // Load structured professional summary
        if (data.resume.professionalSummary) {
          newStructuredData.professionalSummary = data.resume.professionalSummary
        } else if (sections.summary) {
          // Convert legacy summary to structured format
          const structuredSummary: ProfessionalSummary = {
            summary: sections.summary,
            targetRole: '',
            keyStrengths: [],
            careerLevel: 'mid'
          }
          newStructuredData.professionalSummary = structuredSummary
        }

        setStructuredData(newStructuredData)
      } else {
        console.error('Failed to fetch resume:', data.error)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching resume:', error)
      router.push('/dashboard')
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
        education: structuredData.education,
        professionalSummary: structuredData.professionalSummary,
        // Add other structured fields as needed:
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
          skills: structuredData.skills,
          education: structuredData.education,
          professionalSummary: structuredData.professionalSummary
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
    const hasSummary = (structuredData.professionalSummary?.summary?.length ?? 0) > 20 || editedSections.summary?.trim().length > 20
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
      structuredSummary: structuredData.professionalSummary,
      experience: editedSections.experience,
      workExperience: structuredData.workExperience,
      education: editedSections.education,
      structuredEducation: structuredData.education,
      skills: editedSections.skills,
      structuredSkills: structuredData.skills
    }
  }

  useEffect(() => {
    if (status === "authenticated" && resumeId) {
      fetchResume()
    }
  }, [status, resumeId])

  // Not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  // ✅ ADDED: Early return for loading state - let loading.tsx show the beautiful animation
  if (!shouldShowContent) {
    return <ResumeLoader title="Loading your resume" subtitle="Preparing the editor..." />
  }

  // ✅ FIXED: Only show error after loading screen is done
  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="circuit-bg min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">
              <span className="gradient-text">resume not found</span>
            </h1>
            <p className="text-slate-400 mb-8">the resume you're looking for doesn't exist or has been deleted</p>
            <Link href="/dashboard">
              <button className="px-6 py-3 btn-gradient text-white rounded-lg font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <div className="relative z-10 flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  back to dashboard
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Premium Background Effects */}
      {isMounted && (
        <>
          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-pulse"
                style={{
                  left: `${(i * 13 + 10) % 90 + 5}%`,
                  top: `${(i * 17 + 15) % 80 + 10}%`,
                  animationDelay: `${(i * 0.3) % 3}s`,
                  animationDuration: `${3 + (i % 3)}s`
                }}
              />
            ))}
          </div>

          {/* Dynamic Gradient Mesh */}
          <div 
            className="absolute inset-0 opacity-30 transition-all duration-1000"
            style={{
              backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)`
            }}
          />
        </>
      )}

      {/* Circuit Background */}
      <div className="circuit-bg absolute inset-0"></div>

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="circuit-bg min-h-screen relative z-10">
        {/* Premium Header with Enhanced Glassmorphism */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-slate-900/30 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                  <Logo size="medium" className="w-8 h-8 group-hover:scale-110 transition-all duration-300" />
                  <span className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">rework</span>
                </Link>
                
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    dashboard
                  </Button>
                </Link>
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                {/* Enhanced Step Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center animate-glow">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                    <span className="text-white font-medium gradient-text">edit resume</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-400">2</span>
                    </div>
                    <span className="text-slate-400">job description</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-400">3</span>
                    </div>
                    <span className="text-slate-400">ai analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {hasChanges && (
                  <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition-colors animate-pulse">
                    <Clock className="w-3 h-3 mr-1" />
                    unsaved changes
                  </Badge>
                )}
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'saving...' : 'save'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Resume Title with Auto-Fill - Enhanced */}
              <Card className={`glass-card border-white/10 hover:scale-[1.01] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                          <Edit3 className="w-4 h-4 text-white" />
                        </div>
                        <span className="gradient-text">resume title</span>
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        give your resume a clear, descriptive title
                      </CardDescription>
                    </div>
                    
                    {/* Enhanced Auto-Fill Button */}
                    {resume?.s3Key && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-slate-300 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            speed up editing!
                          </p>
                          <p className="text-xs text-slate-400">auto-fill from your uploaded pdf</p>
                        </div>
                        <AutoFillButton
                          resumeId={resumeId}
                          onAutoFillComplete={handleAutoFillComplete}
                          disabled={false}
                          className="shrink-0 hover:scale-105 transition-all duration-300"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Input
                    value={editedTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white text-lg font-medium placeholder:text-slate-400 hover:border-cyan-400/50 focus:border-cyan-400 transition-all duration-300 focus:scale-[1.01]"
                    placeholder="e.g. John Smith - Software Engineer Resume"
                  />
                  
                  {/* Enhanced auto-fill help text */}
                  {resume?.s3Key && !editedSections?.contact && !editedSections?.summary && (
                    <div className="mt-4 p-4 glass border border-cyan-400/20 rounded-lg hover:border-cyan-400/30 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-cyan-300" />
                        </div>
                        <div>
                          <h4 className="text-cyan-300 font-medium text-sm mb-1">✨ pro tip: auto-fill your resume!</h4>
                          <p className="text-cyan-200/80 text-sm">
                            click the "auto-fill from pdf" button above to automatically populate all sections with information from your uploaded resume. 
                            you can then edit and refine the content as needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className={`glass-card border-white/10 rounded-xl hover:scale-[1.005] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
                  <div className="p-6 pb-0">
                    <TabsList className="glass-dark border-white/10 p-1">
                      <TabsTrigger 
                        value="edit" 
                        className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-300 hover:bg-white/5 transition-all duration-300"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        edit sections
                      </TabsTrigger>
                      <TabsTrigger 
                        value="preview" 
                        className="data-[state=active]:bg-purple-400/20 data-[state=active]:text-purple-300 hover:bg-white/5 transition-all duration-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        preview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="raw" 
                        className="data-[state=active]:bg-emerald-400/20 data-[state=active]:text-emerald-300 hover:bg-white/5 transition-all duration-300"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        raw text
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="edit" className="space-y-6 mt-0">
                      {/* Contact Information */}
                      <CollapsibleSectionWrapper
                        title="Contact Information"
                        icon={<User className="w-5 h-5 text-cyan-300" />}
                        isComplete={!!(structuredData.contactInfo?.email || editedSections.contact?.trim().length > 20)}
                        defaultOpen={true}
                      >
                        <ContactInfoSection
                          contactInfo={structuredData.contactInfo}
                          onChange={handleContactInfoChange}
                          className="mb-0"
                        />
                      </CollapsibleSectionWrapper>

                      {/* Professional Summary */}
                      <CollapsibleSectionWrapper
                        title="Professional Summary"
                        icon={<FileText className="w-5 h-5 text-purple-300" />}
                        isComplete={!!((structuredData.professionalSummary?.summary?.length ?? 0) > 20 || editedSections.summary?.length > 20)}
                        defaultOpen={false}
                      >
                        <ProfessionalSummarySection
                          professionalSummary={structuredData.professionalSummary}
                          onChange={handleProfessionalSummaryChange}
                          className="mb-0"
                        />
                      </CollapsibleSectionWrapper>

                      {/* Work Experience */}
                      <CollapsibleSectionWrapper
                        title="Work Experience"
                        icon={<Briefcase className="w-5 h-5 text-emerald-300" />}
                        isComplete={!!((structuredData.workExperience && structuredData.workExperience.length > 0) || editedSections.experience?.length > 20)}
                        defaultOpen={false}
                      >
                        <WorkExperienceSection
                          workExperience={structuredData.workExperience}
                          onChange={handleWorkExperienceChange}
                          className="mb-0"
                        />
                      </CollapsibleSectionWrapper>

                      {/* Education */}
                      <CollapsibleSectionWrapper
                        title="Education"
                        icon={<GraduationCap className="w-5 h-5 text-blue-300" />}
                        isComplete={!!((structuredData.education && structuredData.education.length > 0) || editedSections.education?.length > 5)}
                        defaultOpen={false}
                      >
                        <EducationSection
                          education={structuredData.education}
                          onChange={handleEducationChange}
                          className="mb-0"
                        />
                      </CollapsibleSectionWrapper>

                      {/* Skills */}
                      <CollapsibleSectionWrapper
                        title="Skills & Expertise"
                        icon={<Zap className="w-5 h-5 text-amber-300" />}
                        isComplete={!!((structuredData.skills && Object.values(structuredData.skills).some(arr => arr.length > 0)) || editedSections.skills?.length > 5)}
                        defaultOpen={false}
                      >
                        <SkillsSection
                          skills={structuredData.skills}
                          onChange={handleSkillsChange}
                          className="mb-0"
                        />
                      </CollapsibleSectionWrapper>

                      {/* Additional Information */}
                      <CollapsibleSectionWrapper
                        title="Additional Information"
                        icon={<Edit3 className="w-5 h-5 text-slate-300" />}
                        isComplete={!!(editedSections.other && editedSections.other.length > 0)}
                        defaultOpen={false}
                      >
                        <div className="space-y-3">
                          <Label className="text-white font-medium">
                            Additional Information
                          </Label>
                          <Textarea
                            value={editedSections.other}
                            onChange={(e) => handleSectionChange('other', e.target.value)}
                            placeholder="Awards, certifications, volunteer work, projects, publications, languages, or other relevant information..."
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 hover:border-cyan-400/50 focus:border-cyan-400 transition-all duration-300 focus:scale-[1.01] min-h-[120px]"
                          />
                        </div>
                      </CollapsibleSectionWrapper>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-0">
                      <div className="space-y-6 text-white">
                        {editedTitle && (
                          <div className="text-center">
                            <h1 className="text-3xl font-bold gradient-text mb-2">{editedTitle}</h1>
                          </div>
                        )}
                        
                        {(editedSections.contact || structuredData.contactInfo) && (
                          <div className="glass-card p-4 border-cyan-400/20">
                            <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                              <User className="w-5 h-5" />
                              Contact Information
                            </h3>
                            {structuredData.contactInfo ? (
                              <div className="space-y-1 text-slate-300">
                                <div className="font-medium">{`${structuredData.contactInfo.firstName} ${structuredData.contactInfo.lastName}`.trim()}</div>
                                <div>{structuredData.contactInfo.email}</div>
                                <div>{structuredData.contactInfo.phone}</div>
                                <div>{structuredData.contactInfo.location}</div>
                                {structuredData.contactInfo.linkedin && <div className="text-cyan-300">{structuredData.contactInfo.linkedin}</div>}
                                {structuredData.contactInfo.website && <div className="text-cyan-300">{structuredData.contactInfo.website}</div>}
                                {structuredData.contactInfo.githubUrl && <div className="text-cyan-300">{structuredData.contactInfo.githubUrl}</div>}
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-slate-300">{editedSections.contact}</div>
                            )}
                          </div>
                        )}

                        {(editedSections.summary || structuredData.professionalSummary) && (
                          <div className="glass-card p-4 border-purple-400/20">
                            <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              Professional Summary
                            </h3>
                            {structuredData.professionalSummary ? (
                              <div className="space-y-2 text-slate-300">
                                <div className="whitespace-pre-wrap leading-relaxed">{structuredData.professionalSummary.summary}</div>
                                {structuredData.professionalSummary.targetRole && (
                                  <p className="text-slate-400 text-sm">
                                    <strong className="text-purple-300">Target Role:</strong> {structuredData.professionalSummary.targetRole}
                                  </p>
                                )}
                                {structuredData.professionalSummary.keyStrengths.length > 0 && (
                                  <p className="text-slate-400 text-sm">
                                    <strong className="text-purple-300">Key Strengths:</strong> {structuredData.professionalSummary.keyStrengths.join(', ')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{editedSections.summary}</div>
                            )}
                          </div>
                        )}

                        {(editedSections.experience || structuredData.workExperience?.length) && (
                          <div className="glass-card p-4 border-emerald-400/20">
                            <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                              <Briefcase className="w-5 h-5" />
                              Work Experience
                            </h3>
                            {structuredData.workExperience && structuredData.workExperience.length > 0 ? (
                              <div className="space-y-4">
                                {structuredData.workExperience.map((job, index) => (
                                  <div key={job.id} className="border-l border-emerald-600 pl-4 hover:border-emerald-400 transition-colors duration-300">
                                    <h4 className="font-semibold text-white text-lg">
                                      {job.jobTitle} - {job.company}
                                    </h4>
                                    <p className="text-slate-400 text-sm mb-2">
                                      {job.startDate} - {job.endDate === 'present' ? 'Present' : job.endDate}
                                      {job.location && ` • ${job.location}`}
                                    </p>
                                    {job.achievements && job.achievements.length > 0 && job.achievements[0]?.trim() && (
                                      <ul className="mt-2 space-y-1 text-slate-300">
                                        {job.achievements.filter(a => a.trim()).map((achievement, i) => (
                                          <li key={i} className="text-sm flex items-start gap-2">
                                            <span className="text-emerald-400 mt-1">•</span>
                                            <span>{achievement}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    {job.technologies && job.technologies.length > 0 && (
                                      <p className="mt-2 text-slate-400 text-sm">
                                        <strong className="text-emerald-300">Tools/Software:</strong> {job.technologies.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{editedSections.experience}</div>
                            )}
                          </div>
                        )}

                        {(editedSections.education || structuredData.education?.length) && (
                          <div className="glass-card p-4 border-blue-400/20">
                            <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                              <GraduationCap className="w-5 h-5" />
                              Education
                            </h3>
                            {structuredData.education && structuredData.education.length > 0 ? (
                              <div className="space-y-3">
                                {structuredData.education.map((edu, index) => (
                                  <div key={edu.id} className="border-l border-blue-600 pl-4 hover:border-blue-400 transition-colors duration-300">
                                    <h4 className="font-semibold text-white">
                                      {edu.degree} in {edu.field}
                                    </h4>
                                    <p className="text-slate-400 text-sm">
                                      {edu.institution} • {edu.graduationYear}
                                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                                    </p>
                                    {edu.honors && edu.honors.length > 0 && (
                                      <p className="text-slate-300 text-sm mt-1">
                                        <strong className="text-blue-300">Honors:</strong> {edu.honors.join(', ')}
                                      </p>
                                    )}
                                    {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                                      <p className="text-slate-300 text-sm mt-1">
                                        <strong className="text-blue-300">Relevant Coursework:</strong> {edu.relevantCoursework.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{editedSections.education}</div>
                            )}
                          </div>
                        )}

                        {(editedSections.skills || structuredData.skills) && (
                          <div className="glass-card p-4 border-amber-400/20">
                            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                              <Zap className="w-5 h-5" />
                              Skills & Abilities
                            </h3>
                            {structuredData.skills ? (
                              <div className="space-y-3">
                                {structuredData.skills.technical.length > 0 && (
                                  <div><strong className="text-amber-300">Core Job Skills:</strong> <span className="text-slate-300">{structuredData.skills.technical.join(', ')}</span></div>
                                )}
                                {structuredData.skills.tools.length > 0 && (
                                  <div><strong className="text-amber-300">Software & Tools:</strong> <span className="text-slate-300">{structuredData.skills.tools.join(', ')}</span></div>
                                )}
                                {structuredData.skills.soft.length > 0 && (
                                  <div><strong className="text-amber-300">Soft Skills:</strong> <span className="text-slate-300">{structuredData.skills.soft.join(', ')}</span></div>
                                )}
                                {structuredData.skills.certifications.length > 0 && (
                                  <div><strong className="text-amber-300">Certifications & Licenses:</strong> <span className="text-slate-300">{structuredData.skills.certifications.join(', ')}</span></div>
                                )}
                                {structuredData.skills.frameworks.length > 0 && (
                                  <div><strong className="text-amber-300">Industry Knowledge:</strong> <span className="text-slate-300">{structuredData.skills.frameworks.join(', ')}</span></div>
                                )}
                                {structuredData.skills.databases.length > 0 && (
                                  <div><strong className="text-amber-300">Languages:</strong> <span className="text-slate-300">{structuredData.skills.databases.join(', ')}</span></div>
                                )}
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{editedSections.skills}</div>
                            )}
                          </div>
                        )}

                        {editedSections.other && (
                          <div className="glass-card p-4 border-slate-400/20">
                            <h3 className="text-lg font-semibold text-slate-400 mb-3">
                              Additional Information
                            </h3>
                            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{editedSections.other}</div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="raw" className="mt-0">
                      <div className="glass-card p-4 border-emerald-400/20">
                        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span className="gradient-text">original extracted text</span>
                        </h3>
                        <div className="text-slate-300 text-sm whitespace-pre-wrap font-mono bg-black/20 p-4 rounded-lg border border-white/10 max-h-96 overflow-y-auto">
                          {resume?.originalContent?.rawText || 'No raw text available'}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </div>
              </Tabs>

              {/* Enhanced Next Step Button */}
              <Card className={`glass-card border-white/10 hover:scale-[1.01] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                        <span className="gradient-text">ready for the next step?</span>
                        {isResumeComplete() && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {isResumeComplete() 
                          ? "your resume looks great! let's add a job description to optimize it."
                          : "complete the required sections (contact, summary, experience) to continue."
                        }
                      </p>
                    </div>
                    <button 
                      onClick={handleNext}
                      disabled={!isResumeComplete()}
                      className="px-8 py-3 btn-gradient text-white rounded-lg font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                      <div className="relative z-10 flex items-center gap-2">
                        next: job description
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Resume Preview */}
              <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
                <SimpleResumePreview 
                  resumeData={getPreviewData()}
                  className="sticky top-6"
                />
              </div>

              {/* Enhanced Progress Indicator */}
              <Card className={`glass-card border-white/10 hover:scale-[1.02] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '700ms' }}>
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="gradient-text">completion progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { 
                      label: 'contact info', 
                      completed: (structuredData.contactInfo?.email || editedSections.contact?.length > 20),
                      icon: User,
                      color: 'text-cyan-400'
                    },
                    { 
                      label: 'summary', 
                      completed: (structuredData.professionalSummary?.summary?.length ?? 0) > 20 || editedSections.summary.length > 20,
                      icon: FileText,
                      color: 'text-purple-400'
                    },
                    { 
                      label: 'experience', 
                      completed: (structuredData.workExperience && structuredData.workExperience.length > 0) || editedSections.experience.length > 20,
                      icon: Briefcase,
                      color: 'text-emerald-400'
                    },
                    { 
                      label: 'education', 
                      completed: (structuredData.education && structuredData.education.length > 0) || editedSections.education.length > 5,
                      icon: GraduationCap,
                      color: 'text-blue-400'
                    },
                    { 
                      label: 'skills', 
                      completed: (structuredData.skills && Object.values(structuredData.skills).some(arr => arr.length > 0)) || editedSections.skills.length > 5,
                      icon: Zap,
                      color: 'text-amber-400'
                    }
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between group hover:bg-white/5 p-2 rounded-lg transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{item.label}</span>
                      </div>
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-slate-500 transition-colors"></div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Enhanced File Info */}
              <Card className={`glass-card border-white/10 hover:scale-[1.02] transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '800ms' }}>
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    <span className="gradient-text">file information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[
                    { label: 'original file', value: resume?.originalContent?.metadata?.originalFileName || 'Unknown' },
                    { label: 'file size', value: resume?.originalContent?.metadata?.fileSize ? `${(resume.originalContent.metadata.fileSize / 1024).toFixed(1)} KB` : 'Unknown' },
                    { label: 'type', value: resume?.originalContent?.metadata?.fileType?.split('/')[1]?.toUpperCase() || 'Unknown' },
                    { label: 'last modified', value: resume?.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'Unknown' }
                  ].map((item, index) => (
                    <div key={item.label} className="flex justify-between hover:bg-white/5 p-2 rounded-lg transition-all duration-300 group">
                      <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{item.label}:</span>
                      <span className="text-white group-hover:text-cyan-300 transition-colors font-medium">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Premium CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes glow {
          from {
            box-shadow: 0 0 20px rgba(44, 199, 208, 0.2);
          }
          to {
            box-shadow: 0 0 30px rgba(44, 199, 208, 0.4), 0 0 40px rgba(139, 92, 246, 0.2);
          }
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  )
}