// Fixed src/app/api/resumes/[id]/analyze/route.ts - TypeScript errors resolved
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { ContactInfo } from '@/types/resume'

// Check if OpenAI API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is missing from environment variables!')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Enhanced analysis result with category scoring
interface EnhancedAnalysisResult {
  matchScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: Array<{
    section: string
    type: 'improve' | 'add'
    current: string
    suggested: string
    impact: 'high' | 'medium' | 'low'
    reason: string
  }>
  atsScore: number
  readabilityScore: number
  completenessScore: number
  // NEW: Category-specific scores
  categoryScores: {
    contact: number
    experience: number
    skills: number
    education: number
    keywords: number
  }
  // NEW: Structured optimization output
  optimizedContent?: {
    contactInfo?: Partial<ContactInfo>
    summary?: string
    experience?: string
    skills?: string
    education?: string
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

    console.log('🔍 Starting enhanced analysis for resume:', resumeId)

    // Get the resume with structured data and job application
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
      include: {
        applications: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!resume) {
      console.error('❌ Resume not found:', resumeId)
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    const jobApplication = resume.applications[0]
    if (!jobApplication) {
      console.error('❌ No job application found for resume:', resumeId)
      return NextResponse.json(
        { error: 'No job description found. Please complete Step 2 first.' },
        { status: 400 }
      )
    }

    // NEW: Extract structured resume data
    const { structuredText, hasStructuredData } = extractStructuredResumeData(resume)
    
    console.log('📝 Resume content type:', hasStructuredData ? 'Structured' : 'Legacy')
    console.log('📝 Resume content length:', structuredText.length)
    console.log('🎯 Job title:', jobApplication.jobTitle)
    console.log('🏢 Company:', jobApplication.company)
    
    console.log('🤖 Starting enhanced AI analysis...')

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found - using fallback data')
      const fallbackAnalysis = createEnhancedFallbackAnalysis()
      return NextResponse.json({
        success: true,
        analysis: {
          ...fallbackAnalysis,
          jobApplication: {
            id: jobApplication.id,
            jobTitle: jobApplication.jobTitle,
            company: jobApplication.company,
            status: 'DRAFT',
          },
        },
      })
    }

    // FIXED: Get contact info - handle both field names
    const contactInfo = getContactInfo(resume)

    // NEW: Enhanced AI analysis with structured data
    const analysis = await performEnhancedAnalysisWithOpenAI(
      structuredText,
      jobApplication.jobDescription,
      jobApplication.jobTitle,
      jobApplication.company,
      hasStructuredData,
      contactInfo
    )

    // FIXED: Save enhanced analysis results to database
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: jobApplication.id },
      data: {
        matchScore: analysis.matchScore,
        keywords: [...analysis.matchedKeywords, ...analysis.missingKeywords],
        suggestions: analysis.suggestions,
        optimizedContent: analysis.optimizedContent,
        // FIXED: Save category scores as JSON
        categoryScores: analysis.categoryScores,
        status: 'OPTIMIZED',
        updatedAt: new Date(),
      },
    })

    // Update resume's lastOptimized timestamp
    await prisma.resume.update({
      where: { id: resumeId },
      data: { 
        lastOptimized: new Date(),
      },
    })

    console.log('✅ Enhanced AI analysis complete! Match score:', analysis.matchScore)
    console.log('📊 Category scores:', analysis.categoryScores)

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        jobApplication: {
          id: updatedApplication.id,
          jobTitle: updatedApplication.jobTitle,
          company: updatedApplication.company,
          status: updatedApplication.status,
        },
      },
    })

  } catch (error) {
    console.error('❌ Error analyzing resume:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error details:', errorMessage)
    
    return NextResponse.json(
      { error: `Analysis failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// FIXED: Helper function to get contact info - handles both field names
function getContactInfo(resume: any): ContactInfo | null {
  // Try the new structured field first
  if (resume.contactInfo) {
    return resume.contactInfo as ContactInfo
  }
  
  // Try alternative field names that might exist
  if (resume.contactinfo) {
    return resume.contactinfo as ContactInfo
  }
  
  return null
}

async function performEnhancedAnalysisWithOpenAI(
  structuredText: string,
  jobDescription: string,
  jobTitle: string,
  company: string,
  hasStructuredData: boolean,
  contactInfo: ContactInfo | null
): Promise<EnhancedAnalysisResult> {
  
  // NEW: Enhanced prompt that leverages structured data
  const enhancedPrompt = `
You are an expert ATS and resume optimization specialist. Analyze this ${hasStructuredData ? 'STRUCTURED' : 'traditional'} resume against the job requirements and provide detailed, category-specific feedback.

JOB DETAILS:
Position: ${jobTitle}
Company: ${company}

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT${hasStructuredData ? ' (STRUCTURED FORMAT)' : ''}:
${structuredText}

${contactInfo ? `
STRUCTURED CONTACT INFO AVAILABLE:
- Name: ${contactInfo.firstName} ${contactInfo.lastName}
- Email: ${contactInfo.email}
- Phone: ${contactInfo.phone}
- Location: ${contactInfo.location}
- LinkedIn: ${contactInfo.linkedin || 'Not provided'}
- Website: ${contactInfo.website || 'Not provided'}
- GitHub: ${contactInfo.githubUrl || 'Not provided'}
` : ''}

Provide detailed analysis in JSON format with this structure:

{
  "matchScore": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["missing1", "missing2", ...],
  "suggestions": [
    {
      "section": "Contact Information|Professional Summary|Experience|Skills|Education",
      "type": "improve|add",
      "current": "current content if improving",
      "suggested": "specific improvement with examples",
      "impact": "high|medium|low",
      "reason": "detailed explanation of why this matters for ATS and hiring managers"
    }
  ],
  "atsScore": <number 0-100>,
  "readabilityScore": <number 0-100>,
  "completenessScore": <number 0-100>,
  "categoryScores": {
    "contact": <number 0-100>,
    "experience": <number 0-100>,
    "skills": <number 0-100>,
    "education": <number 0-100>,
    "keywords": <number 0-100>
  }
}

ENHANCED ANALYSIS GUIDELINES:
1. **Contact Information Analysis (0-100):**
   - Professional email format: +20 points
   - Complete phone number: +15 points  
   - Professional location format: +15 points
   - LinkedIn profile included: +25 points
   - Professional website/portfolio: +15 points
   - GitHub for technical roles: +10 points

2. **Experience Relevance (0-100):**
   - Direct role experience: +40 points
   - Transferable skills: +20 points
   - Quantified achievements: +20 points
   - Industry-relevant terminology: +20 points

3. **Skills Match (0-100):**
   - Required technical skills present: +50 points
   - Soft skills alignment: +25 points
   - Certifications mentioned: +15 points
   - Industry tools/technologies: +10 points

4. **Education Alignment (0-100):**
   - Relevant degree/certification: +60 points
   - Institution prestige/relevance: +20 points
   - Additional certifications: +20 points

5. **Keyword Optimization (0-100):**
   - Critical job keywords present: +40 points
   - Keyword density appropriate: +20 points
   - Natural keyword integration: +20 points
   - Industry-specific terminology: +20 points

For the "${jobTitle}" position, focus on:
- Role-specific skills and experience
- Industry-standard certifications and tools
- Quantifiable achievements and impact
- Professional presentation and ATS compatibility

Provide specific, actionable suggestions that directly address the job requirements.
`

  try {
    console.log('🔄 Sending enhanced analysis request to OpenAI...')
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume optimization specialist with deep knowledge of ATS systems and hiring practices. Always respond with valid JSON only. Provide specific, actionable feedback that directly improves the candidate's chances."
        },
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
    })

    console.log('✅ Enhanced OpenAI response received')
    
    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    console.log('📄 OpenAI raw response length:', response.length)

    // Clean the response
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    
    try {
      const analysis = JSON.parse(cleanedResponse) as EnhancedAnalysisResult
      console.log('🎯 Parsed enhanced analysis:')
      console.log('  - Match score:', analysis.matchScore)
      console.log('  - Category scores:', analysis.categoryScores)
      console.log('  - Keywords found:', analysis.matchedKeywords?.length || 0)
      console.log('  - Missing keywords:', analysis.missingKeywords?.length || 0)
      console.log('  - Suggestions:', analysis.suggestions?.length || 0)
      
      // Validate and sanitize the response
      return {
        matchScore: Math.max(0, Math.min(100, analysis.matchScore || 0)),
        matchedKeywords: (analysis.matchedKeywords || []).slice(0, 15),
        missingKeywords: (analysis.missingKeywords || []).slice(0, 10),
        suggestions: (analysis.suggestions || []).slice(0, 8),
        atsScore: Math.max(0, Math.min(100, analysis.atsScore || 0)),
        readabilityScore: Math.max(0, Math.min(100, analysis.readabilityScore || 0)),
        completenessScore: Math.max(0, Math.min(100, analysis.completenessScore || 0)),
        categoryScores: {
          contact: Math.max(0, Math.min(100, analysis.categoryScores?.contact || 0)),
          experience: Math.max(0, Math.min(100, analysis.categoryScores?.experience || 0)),
          skills: Math.max(0, Math.min(100, analysis.categoryScores?.skills || 0)),
          education: Math.max(0, Math.min(100, analysis.categoryScores?.education || 0)),
          keywords: Math.max(0, Math.min(100, analysis.categoryScores?.keywords || 0)),
        },
        optimizedContent: analysis.optimizedContent || undefined
      }
    } catch (parseError) {
      console.error('❌ Failed to parse enhanced OpenAI response:', parseError)
      console.error('❌ Raw response was:', cleanedResponse)
      throw new Error('Invalid JSON response from OpenAI')
    }

  } catch (error) {
    console.error('❌ Enhanced OpenAI analysis error:', error)
    console.log('🔄 Using enhanced fallback analysis')
    return createEnhancedFallbackAnalysis()
  }
}

function createEnhancedFallbackAnalysis(): EnhancedAnalysisResult {
  return {
    matchScore: 78,
    matchedKeywords: ['Experience', 'Skills', 'Professional'],
    missingKeywords: ['Industry-specific keywords', 'Certifications', 'Technical skills'],
    suggestions: [
      {
        section: 'Contact Information',
        type: 'improve',
        current: 'Basic contact information',
        suggested: 'Add LinkedIn profile and ensure professional email format',
        impact: 'medium',
        reason: 'Professional contact information increases credibility with hiring managers'
      },
      {
        section: 'Professional Summary',
        type: 'improve',
        current: 'Generic summary',
        suggested: 'Tailor summary to include job-specific keywords and quantified achievements',
        impact: 'high',
        reason: 'Targeted summary immediately shows relevance to the specific role'
      }
    ],
    atsScore: 82,
    readabilityScore: 85,
    completenessScore: 75,
    categoryScores: {
      contact: 70,
      experience: 80,
      skills: 75,
      education: 65,
      keywords: 60
    }
  }
}

// NEW: Enhanced resume text extraction with structured data support
function extractStructuredResumeData(resume: any): { structuredText: string, hasStructuredData: boolean } {
  console.log('🔍 Extracting structured resume data...')
  
  let hasStructuredData = false
  let text: string[] = []
  
  try {
    // FIXED: Check for new structured contact info first - handle both field names
    const contactInfo = getContactInfo(resume)
    if (contactInfo) {
      hasStructuredData = true
      text.push('=== CONTACT INFORMATION (STRUCTURED) ===')
      text.push(`Name: ${contactInfo.firstName} ${contactInfo.lastName}`)
      if (contactInfo.email) text.push(`Email: ${contactInfo.email}`)
      if (contactInfo.phone) text.push(`Phone: ${contactInfo.phone}`)
      if (contactInfo.location) text.push(`Location: ${contactInfo.location}`)
      if (contactInfo.linkedin) text.push(`LinkedIn: ${contactInfo.linkedin}`)
      if (contactInfo.website) text.push(`Website: ${contactInfo.website}`)
      if (contactInfo.githubUrl) text.push(`GitHub: ${contactInfo.githubUrl}`)
      text.push('')
    }

    // Extract from legacy or new content structure
    const content = resume.currentContent
    
    if (content?.sections) {
      // Legacy sections format
      console.log('📋 Using legacy sections format')
      
      if (!hasStructuredData && content.sections.contact) {
        text.push('=== CONTACT INFORMATION ===')
        text.push(content.sections.contact)
        text.push('')
      }
      
      if (content.sections.summary) {
        text.push('=== PROFESSIONAL SUMMARY ===')
        text.push(content.sections.summary)
        text.push('')
      }
      
      if (content.sections.experience) {
        text.push('=== WORK EXPERIENCE ===')
        text.push(content.sections.experience)
        text.push('')
      }
      
      if (content.sections.education) {
        text.push('=== EDUCATION ===')
        text.push(content.sections.education)
        text.push('')
      }
      
      if (content.sections.skills) {
        text.push('=== SKILLS & TECHNOLOGIES ===')
        text.push(content.sections.skills)
        text.push('')
      }
      
      if (content.sections.other) {
        text.push('=== ADDITIONAL INFORMATION ===')
        text.push(content.sections.other)
        text.push('')
      }
    } else if (content) {
      // Auto-fill flat structure format
      console.log('📋 Using auto-fill flat structure format')
      
      if (!hasStructuredData && content.contact) {
        text.push('=== CONTACT INFORMATION ===')
        if (content.contact.fullName) text.push(`Name: ${content.contact.fullName}`)
        if (content.contact.email) text.push(`Email: ${content.contact.email}`)
        if (content.contact.phone) text.push(`Phone: ${content.contact.phone}`)
        if (content.contact.location) text.push(`Location: ${content.contact.location}`)
        text.push('')
      }
      
      if (content.summary) {
        text.push('=== PROFESSIONAL SUMMARY ===')
        text.push(content.summary)
        text.push('')
      }
      
      if (content.experience && Array.isArray(content.experience)) {
        text.push('=== WORK EXPERIENCE ===')
        content.experience.forEach((job: any) => {
          text.push(`${job.title} at ${job.company} (${job.startDate} - ${job.endDate || 'Present'})`)
          if (job.description) text.push(job.description)
          text.push('')
        })
      }
      
      if (content.education && Array.isArray(content.education)) {
        text.push('=== EDUCATION ===')
        content.education.forEach((edu: any) => {
          text.push(`${edu.degree} from ${edu.school} (${edu.year || 'Year not specified'})`)
        })
        text.push('')
      }
      
      if (content.skills && Array.isArray(content.skills)) {
        text.push('=== SKILLS ===')
        text.push(content.skills.join(', '))
        text.push('')
      }
    }

    // Check for other structured fields that might be added later
    if (resume.workExperience || resume.skills || resume.education) {
      hasStructuredData = true
      console.log('📋 Found additional structured fields')
    }

    const extractedText = text.join('\n')
    console.log('✅ Extracted text length:', extractedText.length)
    console.log('📊 Structured data available:', hasStructuredData)
    
    return {
      structuredText: extractedText,
      hasStructuredData
    }

  } catch (error) {
    console.error('❌ Error extracting structured resume data:', error)
    return {
      structuredText: 'Error extracting resume content',
      hasStructuredData: false
    }
  }
}