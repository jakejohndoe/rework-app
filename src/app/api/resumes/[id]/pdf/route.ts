// src/app/api/resumes/[id]/pdf/route.ts - PDF Proxy for CORS-free access
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

// Create S3 client directly
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📄 Proxying PDF content for resume:', id);
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get resume and verify ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        userId: user.id,
        isActive: true
      },
      select: {
        id: true,
        s3Key: true,
        s3Bucket: true,
        contentType: true,
        originalFileName: true
      }
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    if (!resume.s3Key || !resume.s3Bucket) {
      return NextResponse.json({ error: 'Resume file not found in storage' }, { status: 404 })
    }

    console.log('📥 Fetching PDF from S3:', resume.s3Key);

    // Get PDF content from S3
    const command = new GetObjectCommand({
      Bucket: resume.s3Bucket,
      Key: resume.s3Key,
    })

    const response = await s3Client.send(command)
    
    if (!response.Body) {
      return NextResponse.json({ error: 'PDF content not found' }, { status: 404 })
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    const buffer = Buffer.concat(chunks)
    console.log('✅ PDF content loaded, size:', buffer.length);

    // Return PDF with proper CORS headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="${resume.originalFileName || 'resume.pdf'}"`,
        // CORS headers for PDF.js
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
        // Caching headers
        'Cache-Control': 'public, max-age=3600',
        'ETag': `"${resume.id}"`,
      }
    })

  } catch (error) {
    console.error('❌ Error proxying PDF:', error)
    return NextResponse.json(
      { error: 'Failed to load PDF' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    },
  })
}