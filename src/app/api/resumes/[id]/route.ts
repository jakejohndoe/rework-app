import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// GET single resume
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resumeId } = await params

    // Get resume by ID (only if it belongs to the user)
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        originalContent: true,
        currentContent: true,
        wordCount: true,
        lastOptimized: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!resume) {
      return NextResponse.json({ 
        error: 'Resume not found or access denied' 
      }, { status: 404 })
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

// PATCH update resume
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resumeId } = await params
    const body = await request.json()
    const { title, content } = body

    // Validate input
    if (!title && !content) {
      return NextResponse.json({ 
        error: 'Title or content is required' 
      }, { status: 400 })
    }

    // Check if resume exists and belongs to user
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
        isActive: true
      }
    })

    if (!existingResume) {
      return NextResponse.json({ 
        error: 'Resume not found or access denied' 
      }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (title) {
      updateData.title = title
    }

    if (content) {
      updateData.currentContent = content
      
      // Update word count if content changed
      if (content.sections) {
        const allText = Object.values(content.sections).join(' ')
        updateData.wordCount = allText.split(/\s+/).filter(word => word.trim().length > 0).length
      }
    }

    // Update resume
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: updateData,
      select: {
        id: true,
        title: true,
        currentContent: true,
        wordCount: true,
        updatedAt: true
      }
    })

    // Update user's last active time
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() }
    })

    console.log(`✅ Resume updated: ${updatedResume.title}`)

    return NextResponse.json({
      success: true,
      resume: updatedResume,
      message: 'Resume updated successfully'
    })

  } catch (error) {
    console.error('Resume update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update resume' 
    }, { status: 500 })
  }
}

// DELETE resume (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resumeId } = await params

    // Check if resume exists and belongs to user
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
        isActive: true
      }
    })

    if (!existingResume) {
      return NextResponse.json({ 
        error: 'Resume not found or access denied' 
      }, { status: 404 })
    }

    // Soft delete (set isActive to false)
    await prisma.resume.update({
      where: { id: resumeId },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    })

    console.log(`🗑️ Resume deleted: ${existingResume.title}`)

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