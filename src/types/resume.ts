// TypeScript interfaces for structured resume data
// src/types/resume.ts

export interface ContactInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string // "City, State" format
  linkedin?: string
  website?: string
  githubUrl?: string
}

export interface ProfessionalSummary {
  summary: string
  targetRole?: string
  keyStrengths: string[]
  careerLevel: 'entry' | 'mid' | 'senior' | 'executive'
}

export interface WorkExperience {
  id: string
  jobTitle: string
  company: string
  startDate: string // YYYY-MM format
  endDate: string | 'present'
  location: string
  achievements: string[] // Bullet points of accomplishments
  technologies: string[] // Tech stack used in this role
  isCurrentRole: boolean
}

export interface Education {
  id: string
  degree: string // "Bachelor of Science", "Master of Arts", etc.
  field: string // "Computer Science", "Business Administration"
  institution: string
  graduationYear: string // YYYY format
  gpa?: string // "3.8", "3.85"
  honors?: string[] // ["Magna Cum Laude", "Dean's List"]
  relevantCoursework?: string[]
}

export interface SkillsStructure {
  technical: string[] // Programming languages
  frameworks: string[] // React, Angular, etc.
  tools: string[] // Git, Docker, Jira, etc.
  cloud: string[] // AWS, Azure, GCP
  databases: string[] // PostgreSQL, MongoDB, etc.
  soft: string[] // Leadership, Communication, etc.
  certifications: string[] // AWS Certified, PMP, etc.
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string // GitHub, live demo, etc.
  achievements: string[] // Key accomplishments from project
  startDate?: string // YYYY-MM format
  endDate?: string // YYYY-MM format or 'ongoing'
}

export interface AdditionalSections {
  certifications?: Array<{
    name: string
    issuer: string
    date: string // YYYY-MM format
    expirationDate?: string
    credentialId?: string
  }>
  awards?: Array<{
    name: string
    issuer: string
    date: string
    description?: string
  }>
  publications?: Array<{
    title: string
    publisher: string
    date: string
    url?: string
  }>
  languages?: Array<{
    language: string
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
  }>
  volunteer?: Array<{
    organization: string
    role: string
    startDate: string
    endDate?: string
    description: string
  }>
}

// Main structured resume data interface
export interface StructuredResumeData {
  contactInfo?: ContactInfo
  professionalSummary?: ProfessionalSummary
  workExperience?: WorkExperience[]
  education?: Education[]
  skills?: SkillsStructure
  projects?: Project[]
  additionalSections?: AdditionalSections
}

// Enhanced analysis result with category scoring
export interface EnhancedAnalysisResult {
  // Overall scores
  matchScore: number // 0-100
  atsScore: number
  readabilityScore: number
  completenessScore: number
  
  // Category-specific scores  
  categoryScores: {
    technical: number // How well technical skills match
    experience: number // Work experience relevance
    education: number // Education alignment
    skills: number // Overall skills match
    keywords: number // Keyword optimization
  }
  
  // Keyword analysis
  matchedKeywords: string[]
  missingKeywords: string[]
  keywordDensity: { [keyword: string]: number }
  
  // Section-specific suggestions
  suggestions: Array<{
    section: 'contactInfo' | 'summary' | 'experience' | 'education' | 'skills' | 'projects'
    type: 'improve' | 'add' | 'remove' | 'restructure'
    current: string
    suggested: string
    impact: 'high' | 'medium' | 'low'
    reason: string
    examples?: string[]
  }>
  
  // Optimized content suggestions
  optimizedContent?: {
    contactInfo?: Partial<ContactInfo>
    professionalSummary?: Partial<ProfessionalSummary>
    workExperience?: Array<Partial<WorkExperience>>
    skills?: Partial<SkillsStructure>
    // Only include sections with suggested improvements
  }
  
  // ATS-specific feedback
  atsOptimization: {
    keywordPlacement: 'excellent' | 'good' | 'needs_improvement'
    formatting: 'ats_friendly' | 'minor_issues' | 'major_issues'
    sectionsOptimized: string[]
    sectionsNeedingWork: string[]
  }
}

// Migration helper - convert legacy data to structured format
export interface LegacyResumeData {
  sections: {
    contact: string
    summary: string
    experience: string
    education: string
    skills: string
    other: string
  }
}

// Data completion tracking
export interface ResumeCompletionStatus {
  overall: number // 0-100
  sections: {
    contactInfo: number
    summary: number
    experience: number
    education: number
    skills: number
    projects: number
  }
  missingFields: string[]
  recommendedNext: string[] // What to fill out next
}

// Form validation interfaces
export interface ValidationError {
  field: string
  message: string
  type: 'required' | 'format' | 'length'
}

export interface FormValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

// Data transformation utilities type
export interface DataMigrationResult {
  success: boolean
  structuredData: StructuredResumeData
  migrationWarnings: string[]
  unmappedData: any // Data that couldn't be automatically migrated
}