// FIXED: src/app/api/resumes/[id]/autofill/route.ts - Proper firstName/lastName handling
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { extractAndParseResume } from '@/lib/pdf-extractor';
import { getSignedDownloadUrl } from '@/lib/s3';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const resumeId = id;

    console.log('🔄 Starting auto-fill for resume:', resumeId);

    // Get resume from database
    const resume = await prisma.resume.findUnique({
      where: { 
        id: resumeId,
      },
      include: {
        user: true
      }
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Verify user ownership
    if (resume.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📄 Resume found:', {
      id: resume.id,
      title: resume.title,
      s3Key: resume.s3Key,
      contentType: resume.contentType
    });

    // Only process PDFs for now
    if (resume.contentType !== 'application/pdf') {
      return NextResponse.json({ 
        error: 'Auto-fill currently only supports PDF files' 
      }, { status: 400 });
    }

    if (!resume.s3Key) {
      return NextResponse.json({ 
        error: 'No file found for this resume' 
      }, { status: 400 });
    }

    // Get signed URL using your existing S3 function
    console.log('🔗 Getting signed URL for S3 key:', resume.s3Key);
    const signedUrlResult = await getSignedDownloadUrl(resume.s3Key);
    
    // ✅ FIXED: Properly check the result and handle the URL
    if (!signedUrlResult.success || !signedUrlResult.url) {
      throw new Error(`Failed to get signed URL: ${signedUrlResult.error || 'Unknown error'}`);
    }

    const downloadUrl = signedUrlResult.url;
    
    // Fetch the PDF file from S3
    console.log('📥 Downloading PDF from S3...');
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch PDF from S3:', response.status, response.statusText);
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    // Convert to buffer
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    
    console.log('📄 PDF downloaded successfully:', {
      size: pdfBuffer.length,
      sizeKB: Math.round(pdfBuffer.length / 1024)
    });
    
    // Extract and parse resume data using PDF.js
    console.log('🔍 Starting PDF text extraction and parsing...');
    const extractedData = await extractAndParseResume(pdfBuffer);
    
    // 🔍 DEBUG: Log the extracted data to see what we actually got
    console.log('🔍 DEBUGGING: Raw extracted contact data:', {
      fullName: extractedData.contact.fullName,
      email: extractedData.contact.email,
      phone: extractedData.contact.phone,
      location: extractedData.contact.location,
      linkedin: extractedData.contact.linkedin,
      website: extractedData.contact.website
    });
    
    console.log('✅ PDF parsing complete:', {
      hasContact: !!extractedData.contact.email,
      contactFields: Object.keys(extractedData.contact).length,
      experienceCount: extractedData.experience.length,
      educationCount: extractedData.education.length,
      skillsCount: extractedData.skills.length,
      textLength: extractedData.rawText.length,
      summaryLength: extractedData.summary?.length || 0
    });

    // Calculate word count
    const wordCount = extractedData.rawText
      .split(/\s+/)
      .filter(word => word.length > 0).length;

    // 🔧 FIXED: Properly handle firstName/lastName split
    let firstName = '';
    let lastName = '';
    
    if (extractedData.contact.fullName && extractedData.contact.fullName.trim()) {
      const nameParts = extractedData.contact.fullName.trim().split(/\s+/);
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
      
      console.log('👤 Name split:', {
        fullName: extractedData.contact.fullName,
        firstName,
        lastName,
        nameParts
      });
    } else {
      console.log('⚠️ No fullName extracted, leaving firstName/lastName empty');
    }

    // 🔧 FIXED: Transform extracted data to match database schema with proper firstName/lastName
    const structuredContent = {
      contact: {
        // Store both formats for compatibility
        fullName: extractedData.contact.fullName || '',
        firstName: firstName,
        lastName: lastName,
        email: extractedData.contact.email || '',
        phone: extractedData.contact.phone || '',
        location: extractedData.contact.location || '',
        linkedin: extractedData.contact.linkedin || '',
        website: extractedData.contact.website || '',
      },
      summary: extractedData.summary || '',
      experience: extractedData.experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
        location: '',
        current: exp.endDate.toLowerCase().includes('present')
      })),
      education: extractedData.education.map(edu => ({
        degree: edu.degree,
        school: edu.school,
        year: edu.year,
        gpa: edu.gpa || '',
        location: '',
      })),
      skills: extractedData.skills,
      lastModified: new Date().toISOString(),
    };

    // 🔍 DEBUG: Log the final structured content
    console.log('💾 Final structured contact data being saved:', structuredContent.contact);

    // Create JSON-safe metadata
    const originalContentData = {
      rawText: extractedData.rawText,
      metadata: {
        originalFileName: resume.originalFileName || '',
        fileSize: resume.fileSize || 0,
        fileType: resume.contentType || '',
        uploadedAt: new Date().toISOString(),
        s3Key: resume.s3Key,
        s3Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        extractionStatus: 'completed',
        extractedAt: new Date().toISOString(),
        autoFillVersion: '1.1', // Updated version
        wordCount: wordCount,
      }
    };

    console.log('💾 Updating resume in database...');

    // Update resume with auto-filled data
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        currentContent: structuredContent as any,
        originalContent: originalContentData as any,
        wordCount: wordCount,
        lastOptimized: null,
      },
    });

    console.log('🎉 Auto-fill completed successfully!');

    // Calculate stats for response
    const stats = {
      contactFields: Object.values(extractedData.contact).filter(val => val && val.length > 0).length,
      experienceEntries: extractedData.experience.length,
      educationEntries: extractedData.education.length,
      skillsFound: extractedData.skills.length,
      wordCount: wordCount,
      hasEmail: !!extractedData.contact.email,
      hasPhone: !!extractedData.contact.phone,
      hasSummary: !!extractedData.summary,
      hasFirstName: !!firstName,
      hasLastName: !!lastName,
    };

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Resume auto-filled successfully!',
      data: structuredContent,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Auto-fill error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('❌ Error details:', {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to auto-fill resume',
        details: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
}