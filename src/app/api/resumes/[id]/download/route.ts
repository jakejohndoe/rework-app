// src/app/api/resumes/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import PDFResumeDocument from '@/lib/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🚀 Starting PDF download for resume:', id);

    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        user: { email: session.user.email }
      }
    });

    if (!resume) {
      return new NextResponse('Resume not found', { status: 404 });
    }

    console.log('✅ Resume found:', resume.title);

    // Get content
    const content = resume.currentContent || resume.originalContent;
    if (!content) {
      return new NextResponse('No resume content', { status: 404 });
    }

    // Parse content (with proper type handling)
    let data: any = {};
    try {
      // Cast to string to handle Prisma JsonValue type
      const contentString = String(content);
      data = JSON.parse(contentString);
    } catch (e) {
      console.log('⚠️ JSON parse failed, using raw content');
      // Handle case where content might already be an object
      if (typeof content === 'object') {
        data = content;
      } else {
        data = { summary: String(content) };
      }
    }

    console.log('📄 Creating PDF...');

    // Create React element using createElement (no JSX)
    const element = React.createElement(PDFResumeDocument, {
      resumeData: data,
      isOptimized: true
    });

    // Generate PDF
    const buffer = await renderToBuffer(element);
    
    console.log('✅ PDF generated, size:', buffer.length);

    // Return file
    const filename = `resume_${Date.now()}.pdf`;
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('❌ PDF generation failed:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}