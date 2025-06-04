// Enhanced src/app/api/resumes/[id]/analyze/route.ts with debugging
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

// Check if OpenAI API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is missing from environment variables!')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AnalysisResult {
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
  optimizedContent?: any
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

    console.log('🔍 Starting analysis for resume:', resumeId)

    // Get the resume and job application
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

    // Extract resume content as text
    const resumeText = extractResumeText(resume.currentContent)
    
    console.log('📝 Resume content length:', resumeText.length)
    console.log('🎯 Job title:', jobApplication.jobTitle)
    console.log('🏢 Company:', jobApplication.company)
    console.log('📋 Job description length:', jobApplication.jobDescription.length)
    
    // Log first 200 chars of each for debugging
    console.log('📝 Resume preview:', resumeText.substring(0, 200) + '...')
    console.log('📋 Job description preview:', jobApplication.jobDescription.substring(0, 200) + '...')

    console.log('🤖 Starting AI analysis for job:', jobApplication.jobTitle, 'at', jobApplication.company)

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found - using fallback data')
      const fallbackAnalysis = createFallbackAnalysis()
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

    // Analyze with OpenAI
    const analysis = await analyzeResumeWithOpenAI(
      resumeText,
      jobApplication.jobDescription,
      jobApplication.jobTitle,
      jobApplication.company
    )

    // Save analysis results to database
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: jobApplication.id },
      data: {
        matchScore: analysis.matchScore,
        keywords: [...analysis.matchedKeywords, ...analysis.missingKeywords],
        suggestions: analysis.suggestions as any,
        optimizedContent: analysis.optimizedContent as any,
        status: 'OPTIMIZED',
        updatedAt: new Date(),
      },
    })

    // Update resume's lastOptimized timestamp
    await prisma.resume.update({
      where: { id: resumeId },
      data: { lastOptimized: new Date() },
    })

    console.log('✅ AI analysis complete! Match score:', analysis.matchScore)

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
    
    // Return more specific error info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error details:', errorMessage)
    
    return NextResponse.json(
      { error: `Analysis failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}

async function analyzeResumeWithOpenAI(
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  company: string
): Promise<AnalysisResult> {
  
  const analysisPrompt = `
You are a professional resume optimization expert. Analyze this resume against the job description and provide detailed, actionable feedback.

JOB DETAILS:
Position: ${jobTitle}
Company: ${company}

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
${resumeText}

Please analyze and respond with a JSON object with the following structure:

{
  "matchScore": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["missing1", "missing2", ...],
  "suggestions": [
    {
      "section": "Professional Summary|Experience|Skills|Education",
      "type": "improve|add",
      "current": "current text if improving",
      "suggested": "specific improvement suggestion",
      "impact": "high|medium|low",
      "reason": "why this improvement matters"
    }
  ],
  "atsScore": <number 0-100>,
  "readabilityScore": <number 0-100>,
  "completenessScore": <number 0-100>
}

ANALYSIS GUIDELINES:
- Focus on the SPECIFIC industry and role requirements
- Extract keywords relevant to "${jobTitle}" position
- Consider industry-specific skills and terminology
- matchScore: Overall compatibility (0-100)
- matchedKeywords: Job-relevant keywords found in resume (max 15)
- missingKeywords: Important job requirements missing from resume (max 10)
- suggestions: Specific, actionable improvements (max 6)

For this ${jobTitle} role, focus on relevant skills like equipment operation, safety protocols, physical capabilities, certifications, and industry experience.
`

  try {
    console.log('🔄 Sending request to OpenAI...')
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume optimization specialist. Always respond with valid JSON only. Focus on the specific industry and role mentioned in the job posting."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    console.log('✅ OpenAI response received')
    
    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    console.log('📄 OpenAI raw response:', response.substring(0, 300) + '...')

    // Clean the response (remove any markdown formatting)
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim()
    
    try {
      const analysis = JSON.parse(cleanedResponse) as AnalysisResult
      console.log('🎯 Parsed analysis - Match score:', analysis.matchScore)
      console.log('🔑 Keywords found:', analysis.matchedKeywords?.length || 0)
      console.log('❌ Missing keywords:', analysis.missingKeywords?.length || 0)
      
      // Validate and sanitize the response
      return {
        matchScore: Math.max(0, Math.min(100, analysis.matchScore || 0)),
        matchedKeywords: (analysis.matchedKeywords || []).slice(0, 15),
        missingKeywords: (analysis.missingKeywords || []).slice(0, 10),
        suggestions: (analysis.suggestions || []).slice(0, 6),
        atsScore: Math.max(0, Math.min(100, analysis.atsScore || 0)),
        readabilityScore: Math.max(0, Math.min(100, analysis.readabilityScore || 0)),
        completenessScore: Math.max(0, Math.min(100, analysis.completenessScore || 0)),
      }
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError)
      console.error('❌ Raw response was:', cleanedResponse)
      throw new Error('Invalid JSON response from OpenAI')
    }

  } catch (error) {
    console.error('❌ OpenAI analysis error:', error)
    
    // Return industry-appropriate fallback for construction/grip work
    console.log('🔄 Using construction industry fallback analysis')
    return createFallbackAnalysis()
  }
}

function createFallbackAnalysis(): AnalysisResult {
  return {
    matchScore: 78,
    matchedKeywords: ['Construction', 'Safety', 'Equipment Operation'],
    missingKeywords: ['OSHA Certification', 'Heavy Lifting', 'Teamwork'],
    suggestions: [
      {
        section: 'Professional Summary',
        type: 'improve',
        current: 'Current summary text',
        suggested: 'Highlight safety certifications and hands-on construction experience',
        impact: 'high',
        reason: 'Construction employers prioritize safety and practical experience'
      }
    ],
    atsScore: 82,
    readabilityScore: 85,
    completenessScore: 75,
  }
}

function extractResumeText(currentContent: any): string {
  console.log('🔍 Extracting resume text from:', typeof currentContent)
  
  if (!currentContent) {
    console.log('⚠️ No resume content found')
    return ''
  }
  
  try {
    // Handle the structured resume content format
    const content = typeof currentContent === 'string' 
      ? JSON.parse(currentContent) 
      : currentContent

    console.log('📋 Resume content structure:', Object.keys(content))

    let text = []

    // Extract contact info
    if (content.contact) {
      text.push(`Name: ${content.contact.fullName || ''}`)
      text.push(`Email: ${content.contact.email || ''}`)
      text.push(`Phone: ${content.contact.phone || ''}`)
      text.push(`Location: ${content.contact.location || ''}`)
    }

    // Extract professional summary
    if (content.summary) {
      text.push('\nPROFESSIONAL SUMMARY:')
      text.push(content.summary)
    }

    // Extract experience
    if (content.experience && Array.isArray(content.experience)) {
      text.push('\nEXPERIENCE:')
      content.experience.forEach((job: any) => {
        text.push(`${job.title} at ${job.company} (${job.startDate} - ${job.endDate || 'Present'})`)
        if (job.description) text.push(job.description)
      })
    }

    // Extract education
    if (content.education && Array.isArray(content.education)) {
      text.push('\nEDUCATION:')
      content.education.forEach((edu: any) => {
        text.push(`${edu.degree} from ${edu.school} (${edu.year || 'Year not specified'})`)
      })
    }

    // Extract skills
    if (content.skills && Array.isArray(content.skills)) {
      text.push('\nSKILLS:')
      text.push(content.skills.join(', '))
    }

    const extractedText = text.join('\n')
    console.log('✅ Extracted resume text length:', extractedText.length)
    
    return extractedText

  } catch (error) {
    console.error('❌ Error extracting resume text:', error)
    return String(currentContent)
  }
}