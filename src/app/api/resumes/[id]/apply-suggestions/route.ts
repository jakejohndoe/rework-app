// Apply Suggestions API Endpoint
// src/app/api/resumes/[id]/apply-suggestions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StructuredResumeData, ContactInfo, ProfessionalSummary, WorkExperience, SkillsStructure, Education } from '@/types/resume'

interface ApplySuggestionRequest {
  suggestions: Array<{
    section: string
    type: 'improve' | 'add'
    current: string
    suggested: string
    impact: 'high' | 'medium' | 'low'
    reason: string
  }>
}

// Helper function to safely convert Prisma JsonValue to TypeScript types
function safeJsonParse<T>(jsonValue: unknown): T | undefined {
  if (!jsonValue) return undefined
  try {
    // If it's already an object, return it directly
    if (typeof jsonValue === 'object') return jsonValue as T
    // If it's a string, parse it
    if (typeof jsonValue === 'string') return JSON.parse(jsonValue) as T
    return jsonValue as T
  } catch (error) {
    console.warn('Failed to parse JSON value:', error)
    return undefined
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const resumeId = id

    console.log('🔄 Applying AI suggestions to resume:', resumeId)

    // Get the request body
    const body: ApplySuggestionRequest = await request.json()
    const { suggestions } = body

    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return NextResponse.json({ error: 'No suggestions provided' }, { status: 400 })
    }

    // Get the resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    })

    if (!resume) {
      console.error('❌ Resume not found:', resumeId)
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    console.log(`📝 Applying ${suggestions.length} suggestions to resume`)

    // Get current structured data with safe parsing
    const currentData: StructuredResumeData = {
      contactInfo: safeJsonParse<ContactInfo>(resume.contactInfo),
      professionalSummary: safeJsonParse<ProfessionalSummary>(resume.professionalSummary),
      workExperience: safeJsonParse<WorkExperience[]>(resume.workExperience),
      education: safeJsonParse<Education[]>(resume.education),
      skills: safeJsonParse<SkillsStructure>(resume.skills),
      projects: safeJsonParse<Array<Record<string, unknown>>>(resume.projects) as any,
      additionalSections: safeJsonParse<Record<string, unknown>>(resume.additionalSections),
    }

    // Apply each suggestion to the appropriate field
    const updatedData = await applySuggestionsToStructuredData(currentData, suggestions)

    // Save the updated resume data with explicit any casting for Prisma JSON fields
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        contactInfo: updatedData.contactInfo as any,
        professionalSummary: updatedData.professionalSummary as any,
        workExperience: updatedData.workExperience as any,
        education: updatedData.education as any,
        skills: updatedData.skills as any,
        projects: updatedData.projects as any,
        additionalSections: updatedData.additionalSections as any,
        lastOptimized: new Date(),
        updatedAt: new Date(),
      },
    })

    // Create a new resume version to track the optimization
    await prisma.resumeVersion.create({
      data: {
        resumeId: resumeId,
        versionNumber: await getNextVersionNumber(resumeId),
        content: resume.currentContent as any, // Store the pre-optimization version
        structuredContent: updatedData as any, // Store the optimized structured data
        changes: `Applied ${suggestions.length} AI optimization suggestions: ${suggestions.map(s => s.section).join(', ')}`,
      },
    })

    console.log('✅ Successfully applied suggestions and created version')

    return NextResponse.json({
      success: true,
      message: `Successfully applied ${suggestions.length} suggestions`,
      updatedFields: Object.keys(updatedData).filter(key => {
        const value = updatedData[key as keyof StructuredResumeData]
        return value !== undefined && value !== null
      }),
      appliedSuggestions: suggestions.map(s => ({
        section: s.section,
        type: s.type,
        impact: s.impact
      }))
    })

  } catch (error) {
    console.error('❌ Error applying suggestions:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error details:', errorMessage)
    
    return NextResponse.json(
      { error: `Failed to apply suggestions: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// Helper function to apply suggestions to structured data
async function applySuggestionsToStructuredData(
  currentData: StructuredResumeData,
  suggestions: Array<{
    section: string
    type: 'improve' | 'add'
    current: string
    suggested: string
    impact: 'high' | 'medium' | 'low'
    reason: string
  }>
): Promise<StructuredResumeData> {
  const updatedData = { ...currentData }

  for (const suggestion of suggestions) {
    const section = suggestion.section.toLowerCase()
    
    console.log(`🔧 Applying suggestion for ${suggestion.section}: ${suggestion.type}`)

    // Apply suggestion based on section
    if (section.includes('contact')) {
      updatedData.contactInfo = applyContactInfoSuggestion(updatedData.contactInfo, suggestion)
    } 
    else if (section.includes('summary') || section.includes('professional summary')) {
      updatedData.professionalSummary = applyProfessionalSummarySuggestion(updatedData.professionalSummary, suggestion)
    }
    else if (section.includes('experience') || section.includes('work experience')) {
      updatedData.workExperience = applyWorkExperienceSuggestion(updatedData.workExperience, suggestion)
    }
    else if (section.includes('skill')) {
      updatedData.skills = applySkillsSuggestion(updatedData.skills, suggestion)
    }
    else if (section.includes('education')) {
      updatedData.education = applyEducationSuggestion(updatedData.education, suggestion)
    }
    else {
      console.log(`⚠️ Unknown section type: ${suggestion.section}, applying as general improvement`)
      // For unknown sections, we could add to additionalSections
      if (!updatedData.additionalSections) {
        updatedData.additionalSections = {}
      }
      // Use bracket notation to avoid TypeScript indexing issues
      (updatedData.additionalSections as Record<string, unknown>)[suggestion.section] = suggestion.suggested
    }
  }

  return updatedData
}

// Section-specific suggestion application functions
function applyContactInfoSuggestion(
  currentContactInfo: ContactInfo | undefined,
  suggestion: { type: 'improve' | 'add', suggested: string }
): ContactInfo {
  const contactInfo = currentContactInfo || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: ''
  }

  // Parse the suggested improvement
  const suggested = suggestion.suggested.toLowerCase()
  
  // Extract contact information improvements
  if (suggested.includes('linkedin')) {
    const linkedinMatch = suggestion.suggested.match(/linkedin[:\s]*([^\s,]+)/i)
    if (linkedinMatch) {
      contactInfo.linkedin = linkedinMatch[1]
    }
  }
  
  if (suggested.includes('github')) {
    const githubMatch = suggestion.suggested.match(/github[:\s]*([^\s,]+)/i)
    if (githubMatch) {
      contactInfo.githubUrl = githubMatch[1]
    }
  }
  
  if (suggested.includes('website') || suggested.includes('portfolio')) {
    const websiteMatch = suggestion.suggested.match(/(?:website|portfolio)[:\s]*([^\s,]+)/i)
    if (websiteMatch) {
      contactInfo.website = websiteMatch[1]
    }
  }
  
  // If it's a general improvement, try to extract email, phone, location improvements
  if (suggested.includes('@')) {
    const emailMatch = suggestion.suggested.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
    if (emailMatch) {
      contactInfo.email = emailMatch[1]
    }
  }

  return contactInfo
}

function applyProfessionalSummarySuggestion(
  currentSummary: ProfessionalSummary | undefined,
  suggestion: { type: 'improve' | 'add', suggested: string }
): ProfessionalSummary {
  const summary = currentSummary || {
    summary: '',
    keyStrengths: [],
    careerLevel: 'mid' as const
  }

  if (suggestion.type === 'improve' || suggestion.type === 'add') {
    // Replace or set the summary text
    summary.summary = suggestion.suggested
    
    // Try to extract key strengths from the suggestion
    const strengthKeywords = [
      'experienced', 'skilled', 'proficient', 'expert', 'specialized',
      'leadership', 'management', 'communication', 'problem-solving',
      'analytical', 'creative', 'innovative', 'detail-oriented'
    ]
    
    const extractedStrengths = strengthKeywords.filter(keyword => 
      suggestion.suggested.toLowerCase().includes(keyword)
    )
    
    if (extractedStrengths.length > 0) {
      summary.keyStrengths = [...new Set([...summary.keyStrengths, ...extractedStrengths])]
    }
  }

  return summary
}

function applyWorkExperienceSuggestion(
  currentExperience: WorkExperience[] | undefined,
  suggestion: { type: 'improve' | 'add', suggested: string }
): WorkExperience[] {
  const experience = currentExperience || []

  if (suggestion.type === 'add') {
    // Try to parse a new work experience entry from the suggestion
    const newExperience: WorkExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: 'Position', // Default, should be extracted
      company: 'Company', // Default, should be extracted  
      startDate: new Date().getFullYear().toString(),
      endDate: 'present',
      location: '',
      achievements: [suggestion.suggested],
      technologies: [],
      isCurrentRole: false
    }

    experience.push(newExperience)
  } else {
    // Improve existing experience by adding achievements
    if (experience.length > 0) {
      // Add to the most recent experience
      const latestExp = experience[0]
      if (!latestExp.achievements.includes(suggestion.suggested)) {
        latestExp.achievements.push(suggestion.suggested)
      }
    } else {
      // Create first experience entry
      const newExperience: WorkExperience = {
        id: `exp-${Date.now()}`,
        jobTitle: 'Position',
        company: 'Company',
        startDate: new Date().getFullYear().toString(),
        endDate: 'present',
        location: '',
        achievements: [suggestion.suggested],
        technologies: [],
        isCurrentRole: true
      }
      experience.push(newExperience)
    }
  }

  return experience
}

function applySkillsSuggestion(
  currentSkills: SkillsStructure | undefined,
  suggestion: { type: 'improve' | 'add', suggested: string }
): SkillsStructure {
  const skills = currentSkills || {
    technical: [],
    frameworks: [],
    tools: [],
    cloud: [],
    databases: [],
    soft: [],
    certifications: []
  }

  // Parse skills from the suggestion text
  const extractedSkills = parseSkillsFromText(suggestion.suggested)

  // Add extracted skills to appropriate categories
  skills.technical = [...new Set([...skills.technical, ...extractedSkills.technical])]
  skills.frameworks = [...new Set([...skills.frameworks, ...extractedSkills.frameworks])]
  skills.tools = [...new Set([...skills.tools, ...extractedSkills.tools])]
  skills.cloud = [...new Set([...skills.cloud, ...extractedSkills.cloud])]
  skills.databases = [...new Set([...skills.databases, ...extractedSkills.databases])]
  skills.soft = [...new Set([...skills.soft, ...extractedSkills.soft])]
  skills.certifications = [...new Set([...skills.certifications, ...extractedSkills.certifications])]

  return skills
}

function applyEducationSuggestion(
  currentEducation: Education[] | undefined,
  suggestion: { type: 'improve' | 'add', suggested: string }
): Education[] {
  const education = currentEducation || []

  if (suggestion.type === 'add') {
    // Try to parse new education/certification from suggestion
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      degree: 'Certification', // Default
      field: 'Professional Development',
      institution: 'Professional Institution',
      graduationYear: new Date().getFullYear().toString(),
      relevantCoursework: [suggestion.suggested]
    }

    education.push(newEducation)
  } else {
    // Improve existing education by adding relevant coursework
    if (education.length > 0) {
      const latestEdu = education[0]
      if (!latestEdu.relevantCoursework) {
        latestEdu.relevantCoursework = []
      }
      if (!latestEdu.relevantCoursework.includes(suggestion.suggested)) {
        latestEdu.relevantCoursework.push(suggestion.suggested)
      }
    }
  }

  return education
}

// Helper function to parse skills from text
function parseSkillsFromText(text: string): {
  technical: string[]
  frameworks: string[]
  tools: string[]
  cloud: string[]
  databases: string[]
  soft: string[]
  certifications: string[]
} {
  const result = {
    technical: [] as string[],
    frameworks: [] as string[],
    tools: [] as string[],
    cloud: [] as string[],
    databases: [] as string[],
    soft: [] as string[],
    certifications: [] as string[]
  }

  const lowerText = text.toLowerCase()

  // Technical skills patterns
  const technicalSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'html', 'css', 'sql', 'nosql', 'rest api', 'graphql', 'tcp/ip', 'dns', 'networking'
  ]

  // Framework patterns
  const frameworks = [
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring boot',
    'laravel', 'rails', 'next.js', 'nuxt.js', '.net', 'bootstrap', 'tailwind'
  ]

  // Tools patterns
  const tools = [
    'git', 'docker', 'kubernetes', 'jenkins', 'jira', 'confluence', 'slack', 'teams',
    'figma', 'sketch', 'adobe', 'photoshop', 'vs code', 'intellij', 'eclipse',
    'windows', 'linux', 'macos', 'microsoft office'
  ]

  // Cloud platforms
  const cloudPlatforms = [
    'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digital ocean', 'cloudflare'
  ]

  // Databases
  const databases = [
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
    'sql server', 'cassandra', 'dynamodb'
  ]

  // Soft skills
  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
    'creative', 'innovative', 'detail-oriented', 'time management', 'project management'
  ]

  // Certifications
  const certifications = [
    'aws certified', 'azure certified', 'google certified', 'cisco', 'comptia',
    'pmp', 'scrum master', 'agile', 'itil', 'six sigma'
  ]

  // Extract skills based on patterns
  technicalSkills.forEach(skill => {
    if (lowerText.includes(skill)) result.technical.push(skill)
  })

  frameworks.forEach(framework => {
    if (lowerText.includes(framework)) result.frameworks.push(framework)
  })

  tools.forEach(tool => {
    if (lowerText.includes(tool)) result.tools.push(tool)
  })

  cloudPlatforms.forEach(platform => {
    if (lowerText.includes(platform)) result.cloud.push(platform)
  })

  databases.forEach(db => {
    if (lowerText.includes(db)) result.databases.push(db)
  })

  softSkills.forEach(skill => {
    if (lowerText.includes(skill)) result.soft.push(skill)
  })

  certifications.forEach(cert => {
    if (lowerText.includes(cert)) result.certifications.push(cert)
  })

  return result
}

// Helper function to get next version number
async function getNextVersionNumber(resumeId: string): Promise<number> {
  const latestVersion = await prisma.resumeVersion.findFirst({
    where: { resumeId },
    orderBy: { versionNumber: 'desc' },
  })

  return (latestVersion?.versionNumber || 0) + 1
}