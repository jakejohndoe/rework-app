import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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

    // Get resume with S3 fields
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

    // Get user first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update resume
    const updatedResume = await prisma.resume.update({
      where: {
        id: resumeId,
        userId: user.id
      },
      data: {
        title: body.title,
        currentContent: body.content,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      resume: updatedResume
    })

  } catch (error) {
    console.error('Resume update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update resume' 
    }, { status: 500 })
  }
}

// ADD THIS DELETE FUNCTION
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
    const deletedResume = await prisma.resume.update({
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