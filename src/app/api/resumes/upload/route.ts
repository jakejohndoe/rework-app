import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { uploadToS3, generateS3Key, getContentType } from '@/lib/s3'
import { generatePDFThumbnail } from '@/lib/pdf-thumbnail-generator'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting upload process...');
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('❌ No session found');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 User email:', session.user.email);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { resumes: { where: { isActive: true } } }
    })

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    console.log('👤 User found:', user.id, 'Active resumes:', user.resumes.length);

    // Check plan limits
    if (user.plan === 'FREE' && user.resumes.length >= 3) {
      console.log('❌ Plan limit reached');
      return NextResponse.json({ 
        success: false, 
        error: 'Free plan limit reached. Upgrade to upload more resumes.' 
      }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('❌ No file in form data');
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    console.log('📁 File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('📄 Buffer created, size:', buffer.length);
    
    // Generate S3 key
    const s3Key = generateS3Key(user.id, file.name)
    const contentType = getContentType(file.name)

    console.log('🔧 S3 Upload starting:', { s3Key, contentType, fileSize: file.size })

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
      console.log('❌ S3 upload failed:', uploadResult.error);
      return NextResponse.json({ success: false, error: 'Upload failed: ' + uploadResult.error }, { status: 500 })
    }

    // Generate PDF thumbnail if it's a PDF
    let thumbnailUrl: string | null = null;
    if (file.type === 'application/pdf') {
      console.log('🖼️ Generating PDF thumbnail...');
      thumbnailUrl = await generatePDFThumbnail(buffer);
      if (thumbnailUrl) {
        console.log('✅ Thumbnail generated successfully');
      } else {
        console.log('⚠️ Thumbnail generation failed, continuing without thumbnail');
      }
    }

    // Generate title from filename
    const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')

    console.log('💾 Creating resume record in database...');

    // Create resume record
    const resume = await prisma.resume.create({
      data: {
        title,
        userId: user.id,
        
        // S3 storage info
        s3Key,
        s3Bucket: process.env.AWS_S3_BUCKET_NAME,
        originalFileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        thumbnailUrl: thumbnailUrl,
        
        // Empty content - will be filled by auto-fill feature
        originalContent: {
          rawText: '',
          metadata: {
            originalFileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadedAt: new Date().toISOString(),
            s3Key,
            s3Bucket: process.env.AWS_S3_BUCKET_NAME,
            extractionStatus: 'pending',
          }
        },
        currentContent: {
          contact: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
          },
          summary: '',
          experience: [],
          education: [],
          skills: [],
          lastModified: new Date().toISOString(),
        },
        wordCount: 0,
      }
    })

    console.log('✅ Resume created successfully:', resume.id)

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        s3Key: resume.s3Key,
        thumbnailUrl: resume.thumbnailUrl,
        createdAt: resume.createdAt,
        needsAutoFill: true,
      }
    })

  } catch (error) {
    console.error('❌ Fatal error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}