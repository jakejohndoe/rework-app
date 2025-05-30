import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { uploadToS3, generateS3Key, getContentType } from '@/lib/s3'
// DYNAMIC IMPORTS - import only when needed
// import pdfParse from 'pdf-parse' // MOVED TO DYNAMIC IMPORT
// import mammoth from 'mammoth' // MOVED TO DYNAMIC IMPORT

// Enhanced parsing function with extensive debugging
function parseResumeText(rawText: string) {
  console.log('🔍 PARSING DEBUG - Raw text length:', rawText.length);
  console.log('🔍 PARSING DEBUG - First 200 chars:', rawText.substring(0, 200));
  console.log('🔍 PARSING DEBUG - Full raw text:', rawText);
  
  // Clean up the text
  const cleanText = rawText
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  console.log('🧹 PARSING DEBUG - Cleaned text length:', cleanText.length);
  console.log('🧹 PARSING DEBUG - Cleaned text preview:', cleanText.substring(0, 300));

  // Extract contact info
  const contact = extractContactInfo(cleanText);
  console.log('📞 PARSING DEBUG - Contact extracted:', contact);

  // Extract sections
  const summary = extractSection(cleanText, ['OBJECTIVE', 'SUMMARY', 'PROFILE']);
  const experience = extractSection(cleanText, ['EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT']);
  const education = extractSection(cleanText, ['EDUCATION', 'ACADEMIC', 'QUALIFICATIONS']);
  const skills = extractSection(cleanText, ['SKILLS', 'TECHNICAL SKILLS', 'COMPETENCIES', 'ABILITIES']);

  console.log('📝 PARSING DEBUG - Sections extracted:');
  console.log('  Summary:', summary.substring(0, 100));
  console.log('  Experience:', experience.substring(0, 100));
  console.log('  Education:', education.substring(0, 100));
  console.log('  Skills:', skills.substring(0, 100));

  const result = {
    contactInfo: contact.name + '\n' + contact.email + '\n' + contact.phone, // Convert to string
    summary,
    experience,
    education,
    skills,
    other: ''
  };

  console.log('📊 PARSING DEBUG - Final result:', result);
  return result;
}

function extractContactInfo(text: string) {
  console.log('📞 CONTACT DEBUG - Starting contact extraction...');
  
  // Extract name (usually first line or largest text)
  const nameRegex = /^([A-Z][A-Z\s]+[A-Z])/;
  const nameMatch = text.match(nameRegex);
  const name = nameMatch ? nameMatch[1].trim() : '';
  console.log('📞 CONTACT DEBUG - Name found:', name);

  // Extract email
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : '';
  console.log('📞 CONTACT DEBUG - Email found:', email);

  // Extract phone
  const phoneRegex = /(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[1] : '';
  console.log('📞 CONTACT DEBUG - Phone found:', phone);

  // Extract location (after contact info, before sections)
  const locationRegex = /([A-Z][a-z]+,?\s+[A-Z]{2}|[A-Z][a-z\s]+,\s+[A-Z]{2})/;
  const locationMatch = text.match(locationRegex);
  const location = locationMatch ? locationMatch[1] : '';
  console.log('📞 CONTACT DEBUG - Location found:', location);

  return { name, email, phone, location };
}

function extractSection(text: string, sectionHeaders: string[]): string {
  console.log(`📝 SECTION DEBUG - Looking for: ${sectionHeaders.join(', ')}`);
  
  // Create a regex pattern for any of the section headers
  const headerPattern = sectionHeaders.join('|');
  const sectionRegex = new RegExp(`(${headerPattern})([\\s\\S]*?)(?=(OBJECTIVE|SUMMARY|EXPERIENCE|EDUCATION|SKILLS|$))`, 'i');
  
  const match = text.match(sectionRegex);
  if (match && match[2]) {
    const content = match[2]
      .replace(/^\s*:?\s*/, '') // Remove leading colons and spaces
      .trim();
    
    console.log(`📝 SECTION DEBUG - Found ${sectionHeaders[0]}:`, content.substring(0, 100));
    return content;
  }
  
  console.log(`❌ SECTION DEBUG - No section found for: ${sectionHeaders.join(', ')}`);
  return '';
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 UPLOAD DEBUG - Starting upload process...');
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('❌ UPLOAD DEBUG - No session found');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 UPLOAD DEBUG - User email:', session.user.email);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { resumes: { where: { isActive: true } } }
    })

    if (!user) {
      console.log('❌ UPLOAD DEBUG - User not found in database');
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    console.log('👤 UPLOAD DEBUG - User found:', user.id, 'Active resumes:', user.resumes.length);

    // Check plan limits
    if (user.plan === 'FREE' && user.resumes.length >= 3) {
      console.log('❌ UPLOAD DEBUG - Plan limit reached');
      return NextResponse.json({ 
        success: false, 
        error: 'Free plan limit reached. Upgrade to upload more resumes.' 
      }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('❌ UPLOAD DEBUG - No file in form data');
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    console.log('📁 UPLOAD DEBUG - File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log('❌ UPLOAD DEBUG - File too large:', file.size);
      return NextResponse.json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ UPLOAD DEBUG - Invalid file type:', file.type);
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('📄 UPLOAD DEBUG - Buffer created, size:', buffer.length);
    
    // Generate S3 key
    const s3Key = generateS3Key(user.id, file.name)
    const contentType = getContentType(file.name)

    console.log('🔧 UPLOAD DEBUG - S3 Upload starting:', { s3Key, contentType, fileSize: file.size })

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

    console.log('📤 UPLOAD DEBUG - S3 Upload result:', uploadResult)

    if (!uploadResult.success) {
      console.log('❌ UPLOAD DEBUG - S3 upload failed:', uploadResult.error);
      return NextResponse.json({ success: false, error: 'Upload failed: ' + uploadResult.error }, { status: 500 })
    }

    // RE-ENABLED TEXT EXTRACTION WITH DEBUGGING
    let extractedText = '';
    let processingStatus = 'unknown';

    console.log('📖 UPLOAD DEBUG - Starting text extraction for file type:', file.type);

    try {
      if (file.type === 'application/pdf') {
        console.log('📖 UPLOAD DEBUG - Processing PDF...');
        
        // Dynamic import to avoid import-time errors
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(buffer);
        
        extractedText = pdfData.text;
        processingStatus = 'pdf_success';
        
        console.log('📖 UPLOAD DEBUG - PDF parsing complete:');
        console.log('  - Text length:', extractedText.length);
        console.log('  - Number of pages:', pdfData.numpages);
        console.log('  - Text preview:', extractedText.substring(0, 200));
        console.log('  - Full text:', extractedText);
        
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('📖 UPLOAD DEBUG - Processing DOCX...');
        
        // Dynamic import to avoid import-time errors
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        
        extractedText = result.value;
        processingStatus = 'docx_success';
        
        console.log('📖 UPLOAD DEBUG - DOCX parsing complete:');
        console.log('  - Text length:', extractedText.length);
        console.log('  - Text preview:', extractedText.substring(0, 200));
        
      } else {
        console.log('❌ UPLOAD DEBUG - Unsupported file type for parsing:', file.type);
        extractedText = 'Unsupported file type for text extraction';
        processingStatus = 'unsupported_type';
      }
    } catch (parseError) {
      console.error('❌ UPLOAD DEBUG - Text extraction failed:', parseError);
      extractedText = 'Text extraction failed: ' + (parseError instanceof Error ? parseError.message : 'Unknown error');
      processingStatus = 'extraction_failed';
    }

    // Parse the extracted text into sections
    let sections;
    try {
      console.log('🔍 UPLOAD DEBUG - Starting section parsing...');
      sections = parseResumeText(extractedText);
      console.log('✅ UPLOAD DEBUG - Section parsing complete:', sections);
    } catch (sectionError) {
      console.error('❌ UPLOAD DEBUG - Section parsing failed:', sectionError);
      sections = {
        contact: { name: '', email: '', phone: '', location: '' },
        summary: '',
        experience: '',
        education: '',
        skills: '',
        other: extractedText.substring(0, 500) // Fallback: show raw text
      };
    }
    
    // Generate title from filename
    const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
    
    // Calculate word count
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length

    console.log('💾 UPLOAD DEBUG - Creating resume record in database...');
    console.log('💾 UPLOAD DEBUG - Final data:', {
      title,
      wordCount,
      processingStatus,
      sectionsKeys: Object.keys(sections)
    });

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

    console.log('✅ UPLOAD DEBUG - Resume created successfully:', resume.id)

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
    console.error('❌ UPLOAD DEBUG - Fatal error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}