// src/app/api/resumes/[id]/url/route.ts (FIXED FOR NEXT.JS 15)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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
  { params }: { params: Promise<{ id: string }> }  // ✅ FIXED: Promise<{ id: string }>
) {
  try {
    const { id } = await params;  // ✅ FIXED: Await params
    console.log('🔗 Getting PDF URL for resume:', id);
    
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
        id: id,  // ✅ FIXED: Use awaited id
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

    console.log('📄 Generating signed URL for:', resume.s3Key);

    // Generate signed URL for PDF access
    const command = new GetObjectCommand({
      Bucket: resume.s3Bucket,
      Key: resume.s3Key,
    })

    // URL expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    console.log('✅ Signed URL generated successfully');

    return NextResponse.json({
      success: true,
      url: signedUrl,
      contentType: resume.contentType,
      filename: resume.originalFileName
    }, {
      headers: {
        // ✅ ADD CORS headers for PDF.js
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('❌ Error generating PDF URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF URL' },
      { status: 500 }
    )
  }
}