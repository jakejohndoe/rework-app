import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// Configure for file uploads
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload PDF, DOC, or DOCX files only.' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Check user plan limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, resumesCreated: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check free plan limits
    if (user.plan === 'FREE') {
      const activeResumes = await prisma.resume.count({
        where: { 
          userId: session.user.id,
          isActive: true 
        }
      })

      if (activeResumes >= 3) {
        return NextResponse.json({ 
          error: 'Free plan limit reached. You can have maximum 3 active resumes. Upgrade to Premium for unlimited resumes.' 
        }, { status: 403 })
      }
    }

    // Convert file to buffer for parsing
    const buffer = Buffer.from(await file.arrayBuffer())
    
    let extractedText = ''
    let wordCount = 0

    try {
      // Try to parse file content based on type
      if (file.type === 'application/pdf') {
        console.log('🔍 Attempting to parse PDF file:', file.name)
        console.log('📊 File buffer size:', buffer.length, 'bytes')
        
        try {
          // Import pdf-parse with explicit default handling
          const pdfParseModule = await import('pdf-parse')
          const pdfParse = pdfParseModule.default || pdfParseModule
          
          console.log('📦 PDF parser loaded successfully')
          
          // Call parser with just the buffer - no options to avoid config issues
          const pdfData = await pdfParse(buffer)
          
          console.log('📄 PDF parsing result:', {
            pages: pdfData.numpages,
            textLength: pdfData.text?.length || 0,
            hasText: !!pdfData.text
          })
          
          extractedText = pdfData.text || ''
          wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length
          
          if (extractedText.trim()) {
            console.log('✅ PDF text extracted successfully:', wordCount, 'words')
            console.log('📝 First 200 characters:')
            console.log(extractedText.substring(0, 200))
          } else {
            console.log('⚠️ PDF parsed but no text extracted - might be image-based PDF')
            throw new Error('No text content found in PDF')
          }
        } catch (pdfError) {
          console.error('❌ PDF parsing failed with error:')
          
          // Handle unknown error type safely
          const errorMessage = pdfError instanceof Error ? pdfError.message : String(pdfError)
          const errorName = pdfError instanceof Error ? pdfError.name : 'Unknown Error'
          const errorStack = pdfError instanceof Error ? pdfError.stack?.substring(0, 500) : 'No stack trace available'
          
          console.error('Error name:', errorName)
          console.error('Error message:', errorMessage)
          console.error('Error stack:', errorStack)
          throw pdfError
        }
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        console.log('🔍 Attempting to parse Word document:', file.name)
        
        try {
          const mammoth = await import('mammoth')
          const docData = await mammoth.extractRawText({ buffer })
          extractedText = docData.value || ''
          wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length
          console.log('✅ Word document parsed:', wordCount, 'words')
          
          if (extractedText.trim()) {
            console.log('📝 First 200 characters:')
            console.log(extractedText.substring(0, 200))
          }
        } catch (docError) {
          console.error('❌ Word parsing failed:', docError instanceof Error ? docError.message : String(docError))
          throw docError
        }
      }
    } catch (parseError) {
      console.error('❌ File parsing error - will create manual editing template')
      
      // Handle unknown error type safely
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError)
      console.error('Parse error details:', errorMessage)
      
      // Create a helpful manual editing template
      extractedText = `RESUME TEMPLATE - ${file.name}

👋 Welcome! Your file was uploaded successfully. 

🔧 PDF text extraction encountered an issue, but no worries! 
   You can manually enter your information using the editor.

📝 INSTRUCTIONS:
Click "Edit" on your dashboard to fill in these sections:

📞 CONTACT INFORMATION
• Full Name
• Email Address  
• Phone Number
• Location (City, State)
• LinkedIn Profile
• Portfolio/Website

💼 PROFESSIONAL SUMMARY
• 2-3 sentences describing your career
• Key achievements or specializations
• Career goals or focus areas

🏢 WORK EXPERIENCE
For each job, include:
• Job Title
• Company Name
• Employment Dates (Month/Year - Month/Year)
• 3-5 bullet points of achievements
• Quantify results when possible

🎓 EDUCATION
• Degree Type & Major
• University/College Name
• Graduation Date
• GPA (if 3.5 or higher)
• Relevant Coursework

⚡ SKILLS & TECHNOLOGIES
• Programming Languages
• Frameworks & Tools
• Software & Platforms
• Certifications

🏆 ADDITIONAL INFORMATION
• Projects
• Awards & Recognition
• Volunteer Work
• Publications

💡 TIP: Your changes save automatically as you type!

File Details:
• Size: ${(file.size / 1024).toFixed(1)} KB
• Type: ${file.type.split('/')[1].toUpperCase()}
• Uploaded: ${new Date().toLocaleDateString()}`
      
      wordCount = 75
    }

    // Always ensure we have some content
    if (!extractedText.trim()) {
      extractedText = `Resume: ${file.name}\n\nFile uploaded successfully.\nPlease edit the sections below to add your resume content.`
      wordCount = 12
    }

    // Create resume title if not provided
    const resumeTitle = title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")

    // Parse content into sections (this will work even with placeholder text)
    const sections = parseResumeStructure(extractedText)
    
    // Structure the extracted content
    const structuredContent = {
      rawText: extractedText,
      sections,
      metadata: {
        originalFileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        wordCount,
        processingStatus: extractedText.includes('text extraction is currently unavailable') ? 'pending' : 'complete'
      }
    }

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: resumeTitle,
        originalContent: structuredContent,
        currentContent: structuredContent,
        wordCount,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Update user's resume count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        resumesCreated: { increment: 1 },
        lastActiveAt: new Date()
      }
    })

    console.log(`✅ Resume uploaded successfully: ${resume.title} (${wordCount} words)`)

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        wordCount: resume.wordCount,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      },
      message: 'Resume uploaded and processed successfully!'
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error. Please try again.' 
    }, { status: 500 })
  }
}

// Helper function to parse resume structure
function parseResumeStructure(text: string) {
  // Basic resume section detection
  const sections = {
    contact: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    other: ''
  }

  // Simple regex patterns to identify sections
  const patterns = {
    email: /[\w.-]+@[\w.-]+\.\w+/gi,
    phone: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/gi,
    experience: /(work experience|professional experience|employment|experience)/gi,
    education: /(education|academic|degree|university|college)/gi,
    skills: /(skills|technologies|technical skills|competencies)/gi
  }

  // Extract contact info
  const emails = text.match(patterns.email) || []
  const phones = text.match(patterns.phone) || []
  if (emails.length > 0 || phones.length > 0) {
    sections.contact = `${emails.join(', ')} ${phones.join(', ')}`.trim()
  }

  // Split text into paragraphs for section detection
  const paragraphs = text.split(/\n\s*\n/)
  
  for (const paragraph of paragraphs) {
    const lowerParagraph = paragraph.toLowerCase()
    
    if (patterns.experience.test(lowerParagraph)) {
      sections.experience += paragraph + '\n\n'
    } else if (patterns.education.test(lowerParagraph)) {
      sections.education += paragraph + '\n\n'
    } else if (patterns.skills.test(lowerParagraph)) {
      sections.skills += paragraph + '\n\n'
    } else if (!sections.summary && paragraph.length > 50 && paragraph.length < 500) {
      // Likely a summary/objective section
      sections.summary = paragraph
    } else {
      sections.other += paragraph + '\n\n'
    }
  }

  // Clean up sections
  Object.keys(sections).forEach(key => {
    sections[key as keyof typeof sections] = sections[key as keyof typeof sections].trim()
  })

  return sections
}