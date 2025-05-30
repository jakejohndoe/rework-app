import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's resumes with S3 fields
    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        wordCount: true,
        lastOptimized: true,
        createdAt: true,
        updatedAt: true,
        // S3 FIELDS for PDF preview
        s3Key: true,
        s3Bucket: true,
        originalFileName: true,
        fileSize: true,
        contentType: true,
        originalContent: true,
        currentContent: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transform data for frontend
    const transformedResumes = resumes.map(resume => ({
      id: resume.id,
      title: resume.title,
      wordCount: resume.wordCount,
      lastModified: getRelativeTime(resume.updatedAt),
      lastOptimized: resume.lastOptimized,
      status: resume.lastOptimized ? 'optimized' : 'draft',
      applications: 0, // Simplified for now
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      // Include S3 fields for PDF preview
      s3Key: resume.s3Key,
      s3Bucket: resume.s3Bucket,
      originalFileName: resume.originalFileName,
      fileSize: resume.fileSize,
      contentType: resume.contentType,
      originalContent: resume.originalContent,
      currentContent: resume.currentContent,
    }))

    return NextResponse.json({
      success: true,
      resumes: transformedResumes,
      total: transformedResumes.length
    })

  } catch (error) {
    console.error('Resumes fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch resumes' 
    }, { status: 500 })
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}