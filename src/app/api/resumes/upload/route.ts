import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { uploadToS3, generateS3Key, getContentType } from '@/lib/s3'
// import pdfParse from 'pdf-parse' // TEMPORARILY COMMENTED OUT
// import mammoth from 'mammoth' // TEMPORARILY COMMENTED OUT

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { resumes: { where: { isActive: true } } }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Check plan limits
    if (user.plan === 'FREE' && user.resumes.length >= 3) {
      return NextResponse.json({ 
        success: false, 
        error: 'Free plan limit reached. Upgrade to upload more resumes.' 
      }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Generate S3 key
    const s3Key = generateS3Key(user.id, file.name)
    const contentType = getContentType(file.name)

    console.log('🔧 Uploading to S3:', { s3Key, contentType, fileSize: file.size })

    // Upload to S3
    const uploadResult = await uploadToS3(
      buffer,
      s3Key,
      contentType,
      {
        'user-id': user.id,
        'original-filename': file.name,
      }
    )

    console.log('📤 S3 Upload result:', uploadResult)

    if (!uploadResult.success) {
      return NextResponse.json({ success: false, error: 'Upload failed: ' + uploadResult.error }, { status: 500 })
    }

    // TEMPORARILY SKIP TEXT EXTRACTION
    const extractedText = 'PDF text extraction temporarily disabled for testing'
    const processingStatus = 'text_extraction_skipped'

    // Simple sections for now
    const sections = {
      contact: 'Contact information will be extracted once PDF parsing is fixed',
      summary: '',
      experience: '',
      education: '',
      skills: '',
      other: ''
    }
    
    // Generate title from filename
    const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
    
    // Simple word count
    const wordCount = 100 // Placeholder

    console.log('💾 Creating resume record in database...')

    // Create resume record
    const resume = await prisma.resume.create({
      data: {
        title,
        wordCount,
        userId: user.id,
        
        // S3 storage info
        s3Key,
        s3Bucket: process.env.AWS_S3_BUCKET_NAME,
        originalFileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        
        // Content
        originalContent: {
          rawText: extractedText,
          sections,
          metadata: {
            originalFileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadedAt: new Date().toISOString(),
            wordCount,
            processingStatus,
            s3Key,
            s3Bucket: process.env.AWS_S3_BUCKET_NAME,
          }
        },
        currentContent: {
          sections,
          lastModified: new Date().toISOString(),
        }
      }
    })

    console.log('✅ Resume created successfully:', resume.id)

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        wordCount: resume.wordCount,
        s3Key: resume.s3Key,
        createdAt: resume.createdAt,
      }
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}