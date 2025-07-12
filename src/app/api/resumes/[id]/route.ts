import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resumeId } = await params

    // Get user first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get resume with S3 fields and new structured fields
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
        isActive: true
      }
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      resume
    })

  } catch (error) {
    console.error('Resume fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch resume' 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resumeId } = await params
    const body = await request.json()

    // Extract all possible fields from the request body
    const {
      title,
      currentContent,
      content, // Legacy field name
      // NEW: Structured fields
      contactInfo,
      professionalSummary,
      workExperience,
      education,
      skills,
      projects,
      additionalSections
    } = body

    // Get user first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build the update data object
    interface UpdateData {
      updatedAt: Date;
      title?: string;
      currentContent?: unknown;
      contactInfo?: unknown;
      professionalSummary?: unknown;
      workExperience?: unknown;
      education?: unknown;
      skills?: unknown;
      projects?: unknown;
      additionalSections?: unknown;
      dataCompletionScore?: number;
      lastStructuredUpdate?: Date;
    }
    
    const updateData: UpdateData = {
      updatedAt: new Date()
    }

    // Handle title
    if (title !== undefined) {
      updateData.title = title
    }

    // Handle legacy content field (backward compatibility)
    if (currentContent !== undefined) {
      updateData.currentContent = currentContent
    } else if (content !== undefined) {
      updateData.currentContent = content
    }

    // Handle new structured fields - only update if provided
    if (contactInfo !== undefined) {
      updateData.contactInfo = contactInfo
    }

    if (professionalSummary !== undefined) {
      updateData.professionalSummary = professionalSummary
    }

    if (workExperience !== undefined) {
      updateData.workExperience = workExperience
    }

    if (education !== undefined) {
      updateData.education = education
    }

    if (skills !== undefined) {
      updateData.skills = skills
    }

    if (projects !== undefined) {
      updateData.projects = projects
    }

    if (additionalSections !== undefined) {
      updateData.additionalSections = additionalSections
    }

    // Update completion tracking
    if (contactInfo || workExperience || skills || education) {
      // Calculate completion score based on structured data
      let completionScore = 0
      
      if (contactInfo?.firstName && contactInfo?.email) completionScore += 25
      if (workExperience && Array.isArray(workExperience) && workExperience.length > 0) completionScore += 25
      if (skills && Object.keys(skills).length > 0) completionScore += 25
      if (education && Array.isArray(education) && education.length > 0) completionScore += 25

      updateData.dataCompletionScore = completionScore
      updateData.lastStructuredUpdate = new Date()
    }

    console.log('📝 Updating resume with data:', updateData)

    // Update resume
    const updatedResume = await prisma.resume.update({
      where: {
        id: resumeId,
        userId: user.id
      },
      data: updateData as any
    })

    console.log('✅ Resume updated successfully')

    return NextResponse.json({
      success: true,
      resume: updatedResume
    })

  } catch (error) {
    console.error('❌ Resume update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resumeId } = await params

    // Get user first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Soft delete - mark as inactive instead of hard delete
    await prisma.resume.update({
      where: {
        id: resumeId,
        userId: user.id
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully'
    })

  } catch (error) {
    console.error('Resume delete error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete resume' 
    }, { status: 500 })
  }
}