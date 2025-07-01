// src/app/api/resumes/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import PDFResumeDocument from '@/lib/pdf-generator';

// Handle both GET and POST requests
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  return handleDownload(request, resolvedParams, {});
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  try {
    const body = await request.json();
    return handleDownload(request, resolvedParams, body);
  } catch (error) {
    console.error('❌ Failed to parse request body:', error);
    return handleDownload(request, resolvedParams, {});
  }
}

async function handleDownload(
  request: NextRequest,
  params: { id: string },
  options: { version?: 'original' | 'optimized'; template?: string } = {}
) {
  try {
    const { id } = params;
    console.log('🚀 Starting PDF download for resume:', id);
    console.log('📋 Download options:', options);

    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get resume with all structured data
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

    // Determine which version to use
    let resumeData: any = {};
    const isOptimized = options.version === 'optimized' || options.version === undefined;

    if (isOptimized && (resume.contactInfo || resume.professionalSummary || resume.workExperience)) {
      // Use structured data (optimized version)
      console.log('📊 Using structured (optimized) resume data');
      resumeData = {
        contact: resume.contactInfo as any,
        professionalSummary: resume.professionalSummary as any,
        workExperience: resume.workExperience as any,
        education: resume.education as any,
        skills: resume.skills as any,
        projects: resume.projects as any,
        isOptimized: true
      };
    } else {
      // Use original content
      console.log('📄 Using original resume content');
      const content = resume.originalContent || resume.currentContent;
      if (!content) {
        return new NextResponse('No resume content', { status: 404 });
      }

      try {
        const contentString = String(content);
        resumeData = JSON.parse(contentString);
        resumeData.isOptimized = false;
      } catch (e) {
        console.log('⚠️ JSON parse failed, using raw content');
        if (typeof content === 'object') {
          resumeData = content as any;
        } else {
          resumeData = { summary: String(content) };
        }
        resumeData.isOptimized = false;
      }
    }

    // Add template information
    const template = options.template || 'professional';
    resumeData.template = template;

    console.log('📄 Creating PDF with template:', template);
    console.log('🎯 Data keys:', Object.keys(resumeData));

    // Create React element
    const element = React.createElement(PDFResumeDocument, {
      resumeData,
      template,
      isOptimized
    });

    // Generate PDF
    const buffer = await renderToBuffer(element);
    
    console.log('✅ PDF generated, size:', buffer.length);

    // Create descriptive filename
    const versionText = isOptimized ? 'optimized' : 'original';
    const templateText = template || 'default';
    const filename = `${resume.title || 'resume'}-${versionText}-${templateText}-${Date.now()}.pdf`;
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      },
    });

  } catch (error: any) {
    console.error('❌ PDF generation failed:', error);
    console.error('❌ Error stack:', error.stack);
    return new NextResponse(`PDF Generation Error: ${error.message}`, { status: 500 });
  }
}