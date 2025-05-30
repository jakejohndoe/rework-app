import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getSignedDownloadUrl } from '@/lib/s3'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id: resumeId } = await params

    // Get user first
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Get the resume and verify ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
        isActive: true
      }
    })

    if (!resume) {
      return new NextResponse('Resume not found', { status: 404 })
    }

    // Check if resume has S3 key
    if (!resume.s3Key) {
      return new NextResponse('File not available', { status: 404 })
    }

    // Generate signed URL (valid for 1 hour)
    const result = await getSignedDownloadUrl(resume.s3Key, 3600)

    if (!result.success) {
      return new NextResponse('Failed to generate URL', { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      expiresIn: 3600
    })

  } catch (error) {
    console.error('Error generating signed URL:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}