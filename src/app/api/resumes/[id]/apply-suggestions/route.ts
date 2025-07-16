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
    console.log('📊 Session user ID:', session.user.id)

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

    console.log(`📝 Applying ${suggestions.length} suggestions to resume:`)
    suggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. [${suggestion.section}] ${suggestion.type}: "${suggestion.suggested.substring(0, 100)}..."`)
    })

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
    console.log('💾 Final work experience data saved to database:', JSON.stringify(updatedData.workExperience, null, 2))

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
    // Use the AI suggestion as-is - it's already well-crafted
    summary.summary = suggestion.suggested;
    
    // Try to extract key strengths from the suggestion
    const strengthKeywords = [
      'experienced', 'skilled', 'proficient', 'expert', 'specialized',
      'leadership', 'management', 'communication', 'problem-solving',
      'analytical', 'creative', 'innovative', 'detail-oriented', 'strategic',
      'collaborative', 'results-driven', 'technical', 'business-focused'
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
  suggestion: { type: 'improve' | 'add', suggested: string, current: string }
): WorkExperience[] {
  console.log('🔧 applyWorkExperienceSuggestion called:')
  console.log('  Current experience count:', currentExperience?.length || 0)
  console.log('  Suggestion type:', suggestion.type)
  console.log('  Suggestion content:', suggestion.suggested.substring(0, 200))
  
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
    // FIXED: For "improve" type, replace the current content with suggested content
    if (experience.length > 0) {
      const latestExp = experience[0]
      
      // Replace the job description with the AI suggestion
      // This ensures the suggested content replaces the current content
      latestExp.description = suggestion.suggested
      
      // Clear achievements to avoid duplication - the description now contains the improved content
      latestExp.achievements = []
      
      console.log('✅ Replaced job description with AI suggestion')
    } else {
      // Create first experience entry with the suggested content as description
      const newExperience: WorkExperience = {
        id: `exp-${Date.now()}`,
        jobTitle: 'Position',
        company: 'Company',
        startDate: new Date().getFullYear().toString(),
        endDate: 'present',
        location: '',
        description: suggestion.suggested, // Put AI suggestion as main description
        achievements: [],
        technologies: [],
        isCurrentRole: true
      }
      experience.push(newExperience)
    }
  }

  console.log('✅ Work experience result:')
  console.log('  Final experience count:', experience.length)
  experience.forEach((exp, index) => {
    console.log(`  ${index + 1}. ${exp.jobTitle} at ${exp.company} (${exp.achievements?.length || 0} achievements)`)
    if (exp.achievements) {
      exp.achievements.forEach((achievement, i) => {
        console.log(`     Achievement ${i + 1}: ${achievement.substring(0, 100)}...`)
      })
    }
  })

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
  let skillsToAdd: string[] = [];
  
  // Handle instruction-style suggestions like "Add Go, SQL, and AWS integration to your skills list"
  if (suggestion.suggested.toLowerCase().includes('add ') || suggestion.suggested.toLowerCase().includes('skills like')) {
    // Extract skills more carefully to avoid instruction words
    const patterns = [
      /skills?\s+like\s+([^.]+)/i,  // Handle "skills like API integration"
      /add\s+skills?\s+like\s+([^.]+)/i,  // Handle "add skills like API integration"
      /add\s+([^.]*?)(?:\s+to\s+)/i,
      /skills?[^:]*:\s*([^.]+)/i,
      /'([^']+)'/g  // Extract quoted skills like 'Go', 'SQL', 'AWS Integration'
    ];
    
    for (const pattern of patterns) {
      const matches = suggestion.suggested.match(pattern);
      if (matches) {
        if (pattern.global) {
          // Handle quoted skills
          skillsToAdd = matches.map(match => match.replace(/'/g, '').trim());
        } else {
          // Handle comma-separated skills
          let skillsText = matches[1].trim();
          skillsText = skillsText.replace(/\s+and\s+/g, ', ');
          skillsToAdd = skillsText.split(/[,]+/)
            .map(skill => skill.trim().replace(/'/g, ''))
            .filter(skill => 
              skill.length > 1 && 
              // More comprehensive filter for instruction words
              !skill.match(/^(to|your|skills?|list|these|are|the|with|for|and|or|add|include|like|such|as|align|requirements|highlight|proficiency|key|job|try|adding|consider|also|should|would|could|might|may|will|can|ensure|make|sure|help|improve|enhance|boost|increase|demonstrate|show|display|reflect|indicate|suggest|recommend|advise)$/i) &&
              // Must look like a real skill (not random words)
              skill.match(/^[A-Za-z][A-Za-z0-9\s\-\.+#]*$/) &&
              // Additional cleaning for common instruction phrases
              !skill.toLowerCase().includes('skills like') &&
              !skill.toLowerCase().includes('add to') &&
              !skill.toLowerCase().includes('your resume')
            );
        }
        if (skillsToAdd.length > 0) break;
      }
    }
    console.log('🔧 Parsed skills from Add instruction:', skillsToAdd);
  } else {
    // Regular skill parsing
    const extractedSkills = parseSkillsFromText(suggestion.suggested);
    skillsToAdd = [
      ...extractedSkills.technical,
      ...extractedSkills.frameworks, 
      ...extractedSkills.tools,
      ...extractedSkills.cloud,
      ...extractedSkills.databases
    ];
  }
  
  // CLEAR accumulated skills mess and use only clean AI suggestions
  if (skills.technical && skills.technical.length > 20) {
    // Too many accumulated skills - start fresh with AI suggestions only
    skills.technical = [...new Set(skillsToAdd)];
  } else {
    // Add AI suggestions to existing clean skills
    skills.technical = [...new Set([...skills.technical, ...skillsToAdd])];
  }
  
  // Don't parse instruction text as additional skills - only use clean AI suggestions
  // The parseSkillsFromText function is adding instruction words as skills

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
    // Improve existing education by enhancing descriptions and adding relevant coursework
    if (education.length > 0) {
      education.forEach(eduItem => {
        // Initialize relevantCoursework if it doesn't exist
        if (!eduItem.relevantCoursework) {
          eduItem.relevantCoursework = []
        }
        
        // Parse instruction-style suggestions like "Highlight backend-focused courses like 'REST APIs' and 'Database Management'..."
        if (suggestion.suggested.toLowerCase().includes('highlight') || suggestion.suggested.toLowerCase().includes('courses')) {
          // Extract courses mentioned in quotes
          const courseMatches = suggestion.suggested.match(/'([^']+)'/g);
          if (courseMatches) {
            courseMatches.forEach(match => {
              const course = match.replace(/'/g, '');
              if (!eduItem.relevantCoursework) eduItem.relevantCoursework = [];
              eduItem.relevantCoursework.push(course);
            });
          }
          
          // Extract specific technologies/skills mentioned
          if (suggestion.suggested.toLowerCase().includes('backend')) {
            if (!eduItem.relevantCoursework) eduItem.relevantCoursework = [];
            eduItem.relevantCoursework.push('Backend Development');
          }
          if (suggestion.suggested.toLowerCase().includes('rest api')) {
            if (!eduItem.relevantCoursework) eduItem.relevantCoursework = [];
            eduItem.relevantCoursework.push('REST APIs');
          }
          if (suggestion.suggested.toLowerCase().includes('database')) {
            if (!eduItem.relevantCoursework) eduItem.relevantCoursework = [];
            eduItem.relevantCoursework.push('Database Management');
          }
        }
        
        // Extract relevant project work from the suggestion
        if (suggestion.suggested.toLowerCase().includes('project')) {
          const projectMatch = suggestion.suggested.match(/projects?\s+related\s+to\s+([^,]+)/i)
          if (projectMatch) {
            const projectArea = projectMatch[1].trim()
            if (!eduItem.relevantCoursework) eduItem.relevantCoursework = [];
            eduItem.relevantCoursework.push(`Hands-on projects in ${projectArea}`)
          } else {
            if (!eduItem.relevantCoursework) eduItem.relevantCoursework = [];
            eduItem.relevantCoursework.push('Hands-on project development')
          }
        }
        
        // Extract specific skills/technologies mentioned
        if (suggestion.suggested.toLowerCase().includes('erp')) {
          if (!eduItem.relevantCoursework) eduItem.relevantCoursework = [];
          eduItem.relevantCoursework.push('ERP system integration projects')
        }
        if (suggestion.suggested.toLowerCase().includes('ecommerce')) {
          if (!eduItem.relevantCoursework) eduItem.relevantCoursework = [];
          eduItem.relevantCoursework.push('E-commerce platform development')
        }
        
        // Enhance the degree description if it's generic
        if (eduItem.field === 'Professional Development' || eduItem.field === 'General Studies') {
          if (suggestion.suggested.toLowerCase().includes('web development')) {
            eduItem.field = 'Web Development'
          } else if (suggestion.suggested.toLowerCase().includes('full stack')) {
            eduItem.field = 'Full Stack Development'
          } else if (suggestion.suggested.toLowerCase().includes('software')) {
            eduItem.field = 'Software Development'
          }
        }
      })
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
    'html', 'css', 'sql', 'nosql', 'rest api', 'api integration', 'graphql', 'tcp/ip', 'dns', 'networking',
    'microservices', 'web services', 'soap', 'json', 'xml', 'oauth', 'authentication', 'authorization'
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
    'windows', 'linux', 'macos', 'microsoft office', 'warehouse management', 'inventory management',
    'erp systems', 'crm systems', 'data analysis', 'reporting', 'dashboard creation'
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

  // Fallback: Parse comma-separated skills that weren't matched
  const words = text.split(/[,\s]+/).map(word => word.trim()).filter(word => word.length > 1)
  for (const word of words) {
    const cleanWord = word.toLowerCase()
    // Skip if already matched in any category
    const alreadyMatched = [
      ...result.technical, ...result.frameworks, ...result.tools, 
      ...result.cloud, ...result.databases, ...result.soft, ...result.certifications
    ].some(skill => skill.toLowerCase().includes(cleanWord) || cleanWord.includes(skill.toLowerCase()))
    
    if (!alreadyMatched && cleanWord.length > 2) {
      // Try to categorize unknown skills
      if (cleanWord.includes('manage') || cleanWord.includes('leader') || cleanWord.includes('team')) {
        result.soft.push(word)
      } else if (cleanWord.includes('system') || cleanWord.includes('platform') || cleanWord.includes('server')) {
        result.tools.push(word)
      } else if (cleanWord.includes('develop') || cleanWord.includes('program') || cleanWord.includes('code')) {
        result.technical.push(word)
      } else {
        // Default to technical skills for unknown items
        result.technical.push(word)
      }
    }
  }

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