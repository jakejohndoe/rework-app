// src/app/api/resumes/[id]/preview/route.ts
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
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version') as 'original' | 'optimized' || 'optimized';
    const template = searchParams.get('template') || 'professional';

    console.log('🔍 Preview request for:', id, 'version:', version, 'template:', template);

    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get resume with ALL data
    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        user: { email: session.user.email }
      }
    });

    if (!resume) {
      return new NextResponse('Resume not found', { status: 404 });
    }

    // Determine which data to use and extract real content
    interface PreviewResumeData {
      contactInfo?: Record<string, unknown>;
      professionalSummary?: Record<string, unknown>;
      workExperience?: unknown[];
      education?: unknown[];
      skills?: unknown[];
      projects?: unknown[];
      isOptimized?: boolean;
      template?: string;
      summary?: string;
      experience?: unknown[];
    }
    
    let resumeData: PreviewResumeData = {};
    const isOptimized = version === 'optimized';

    if (isOptimized && (resume.contactInfo || resume.professionalSummary || resume.workExperience)) {
      // Use structured data (optimized version) - THE REAL DATA!
      console.log('📊 Using structured (optimized) resume data');
      
      resumeData = {
        contactInfo: resume.contactInfo ? (typeof resume.contactInfo === 'string' ? JSON.parse(resume.contactInfo) : resume.contactInfo) : {},
        professionalSummary: resume.professionalSummary ? (typeof resume.professionalSummary === 'string' ? JSON.parse(resume.professionalSummary) : resume.professionalSummary) : {},
        workExperience: resume.workExperience ? (typeof resume.workExperience === 'string' ? JSON.parse(resume.workExperience) : resume.workExperience) : [],
        education: resume.education ? (typeof resume.education === 'string' ? JSON.parse(resume.education) : resume.education) : [],
        skills: resume.skills ? (typeof resume.skills === 'string' ? JSON.parse(resume.skills) : resume.skills) : [],
        projects: resume.projects ? (typeof resume.projects === 'string' ? JSON.parse(resume.projects) : resume.projects) : [],
        isOptimized: true
      };

      console.log('📋 Optimized data extracted:', {
        hasContactInfo: !!resumeData.contactInfo,
        hasSummary: !!resumeData.professionalSummary,
        workExpCount: resumeData.workExperience?.length || 0,
        skillsCount: resumeData.skills?.length || 0,
        educationCount: resumeData.education?.length || 0
      });

    } else {
      // Use original content - parse from uploaded PDF
      console.log('📄 Using original resume content');
      const content = resume.originalContent || resume.currentContent;
      if (!content) {
        return generateDataBasedSVG({}, version, template, 'No original content available');
      }

      try {
        const contentString = String(content);
        resumeData = JSON.parse(contentString);
        resumeData.isOptimized = false;
        
        console.log('📋 Original data extracted:', {
          hasContactInfo: !!resumeData.contactInfo,
          hasSummary: !!resumeData.summary,
          dataKeys: Object.keys(resumeData)
        });
        
      } catch {
        console.log('⚠️ JSON parse failed, using raw content');
        if (typeof content === 'object') {
          resumeData = content as PreviewResumeData;
        } else {
          // If it's just text, create basic structure
          resumeData = { 
            contactInfo: { name: 'Resume Content' },
            summary: String(content).substring(0, 200) + '...',
            isOptimized: false
          };
        }
      }
    }

    resumeData.template = template;

    // Try to generate PDF with REAL data
    try {
      console.log('🎯 Creating PDF with real data...');
      const element = React.createElement(PDFResumeDocument, {
        resumeData,
        template,
        isOptimized,
        resumeTitle: resume.title,
        enableOnePageOptimization: true // For preview, we keep optimization enabled
      });

      const buffer = await renderToBuffer(element);
      
      console.log('✅ PDF generated successfully with real data, size:', buffer.length);
      
      // Return PDF for clean canvas rendering
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        },
      });

    } catch (error) {
      console.error('❌ PDF generation failed, falling back to SVG with real data:', error);
      return generateDataBasedSVG(resumeData, version, template);
    }

  } catch (error) {
    console.error('❌ Preview generation failed:', error);
    return generateDataBasedSVG({}, 'optimized', 'professional', 'Error loading data');
  }
}

interface SVGResumeData {
  contact?: Record<string, unknown>;
  contactInfo?: Record<string, unknown>;
  professionalSummary?: Record<string, unknown> | string;
  workExperience?: unknown[];
  education?: unknown[];
  skills?: unknown[];
  summary?: string;
  experience?: unknown[];
}

function generateDataBasedSVG(resumeData: SVGResumeData, version: string, template: string, errorMsg?: string) {
  const colors = {
    professional: { primary: '#1e40af', accent: '#3b82f6' },
    modern: { primary: '#7c3aed', accent: '#8b5cf6' },
    minimal: { primary: '#059669', accent: '#10b981' },
    creative: { primary: '#ea580c', accent: '#f97316' }
  };

  const color = colors[template as keyof typeof colors] || colors.professional;
  
  // Extract real data with fallbacks
  const contact = resumeData?.contactInfo || {};
  const summary = (resumeData as any)?.professionalSummary?.summary || (resumeData as any)?.summary || (resumeData as any)?.professionalSummary || '';
  const workExp = resumeData?.workExperience || resumeData?.experience || [];
  const skills = resumeData?.skills || [];
  const education = resumeData?.education || [];
  
  // Get real values or use placeholder
  const name = contact?.name || contact?.fullName || 'Professional Resume';
  const email = contact?.email || 'email@example.com';
  const phone = contact?.phone || '(555) 123-4567';
  const firstJob = workExp[0] || {};
  const firstEdu = education[0] || {};
  const displaySkills = Array.isArray(skills) ? skills.slice(0, 3) : [];
  
  console.log('🎨 Generating SVG with real data:', {
    name,
    email,
    hasPhone: !!phone,
    workExpCount: workExp.length,
    skillsCount: displaySkills.length,
    summaryLength: summary.length
  });
  
  const svg = `
    <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="500" fill="white" stroke="${color.primary}" stroke-width="2"/>
      
      ${errorMsg ? `
        <!-- Error message -->
        <text x="200" y="250" font-family="Arial" font-size="14" fill="red" text-anchor="middle">${errorMsg}</text>
      ` : `
        <!-- Header with REAL contact info -->
        <rect x="20" y="20" width="360" height="80" fill="${color.primary}" opacity="0.1"/>
        <text x="30" y="45" font-family="Arial" font-size="18" font-weight="bold" fill="${color.primary}">${name}</text>
        <text x="30" y="65" font-family="Arial" font-size="11" fill="#666">${email}</text>
        <text x="30" y="80" font-family="Arial" font-size="11" fill="#666">${phone}</text>
        
        <!-- Professional Summary with REAL content -->
        ${summary ? `
          <text x="30" y="125" font-family="Arial" font-size="14" font-weight="bold" fill="${color.primary}">Professional Summary</text>
          <line x1="30" y1="130" x2="370" y2="130" stroke="${color.accent}" stroke-width="2"/>
          <text x="30" y="150" font-family="Arial" font-size="10" fill="#333">${summary.substring(0, 50)}${summary.length > 50 ? '...' : ''}</text>
          <text x="30" y="165" font-family="Arial" font-size="10" fill="#333">${summary.substring(50, 100)}${summary.length > 100 ? '...' : ''}</text>
        ` : ''}
        
        <!-- Work Experience with REAL data -->
        <text x="30" y="195" font-family="Arial" font-size="14" font-weight="bold" fill="${color.primary}">Work Experience</text>
        <line x1="30" y1="200" x2="370" y2="200" stroke="${color.accent}" stroke-width="2"/>
        
        ${(firstJob as any)?.title || (firstJob as any)?.position ? `
          <text x="30" y="220" font-family="Arial" font-size="12" font-weight="bold" fill="#333">${(firstJob as any).title || (firstJob as any).position}</text>
          <text x="30" y="235" font-family="Arial" font-size="10" fill="#666">${(firstJob as any).company || 'Company'} • ${(firstJob as any).duration || (firstJob as any).dates || 'Duration'}</text>
          ${(firstJob as any).description ? `
            <text x="30" y="250" font-family="Arial" font-size="9" fill="#333">${(firstJob as any).description.substring(0, 60)}${(firstJob as any).description.length > 60 ? '...' : ''}</text>
          ` : ''}
        ` : `
          <text x="30" y="220" font-family="Arial" font-size="12" fill="#666">No work experience data available</text>
        `}
        
        <!-- Skills with REAL data -->
        <text x="30" y="285" font-family="Arial" font-size="14" font-weight="bold" fill="${color.primary}">Skills</text>
        <line x1="30" y1="290" x2="370" y2="290" stroke="${color.accent}" stroke-width="2"/>
        
        ${displaySkills.length > 0 ? 
          displaySkills.map((skill: unknown, index: number) => {
            const skillObj = skill as { name?: string; skill?: string } | string;
            const skillName = typeof skillObj === 'string' ? skillObj : skillObj?.name || skillObj?.skill || `Skill ${index + 1}`;
            const x = 30 + (index * 80);
            return `
              <rect x="${x}" y="300" width="${Math.min(skillName.length * 6 + 10, 70)}" height="18" fill="${color.accent}" rx="3"/>
              <text x="${x + 5}" y="311" font-family="Arial" font-size="9" fill="white">${skillName.substring(0, 10)}</text>
            `;
          }).join('') :
          `<text x="30" y="315" font-family="Arial" font-size="10" fill="#666">No skills data available</text>`
        }
        
        <!-- Education with REAL data -->
        <text x="30" y="350" font-family="Arial" font-size="14" font-weight="bold" fill="${color.primary}">Education</text>
        <line x1="30" y1="355" x2="370" y2="355" stroke="${color.accent}" stroke-width="2"/>
        
        ${(firstEdu as any)?.degree || (firstEdu as any)?.title ? `
          <text x="30" y="375" font-family="Arial" font-size="12" font-weight="bold" fill="#333">${(firstEdu as any).degree || (firstEdu as any).title}</text>
          <text x="30" y="390" font-family="Arial" font-size="10" fill="#666">${(firstEdu as any).school || (firstEdu as any).institution || 'Institution'} • ${(firstEdu as any).year || (firstEdu as any).dates || 'Year'}</text>
        ` : `
          <text x="30" y="375" font-family="Arial" font-size="10" fill="#666">No education data available</text>
        `}
        
        <!-- Version badge -->
        <rect x="300" y="450" width="90" height="20" fill="${color.accent}" rx="3"/>
        <text x="305" y="462" font-family="Arial" font-size="9" fill="white">
          ${version === 'optimized' ? '✨ AI Enhanced' : '📄 Original'}
        </text>
        
        <text x="30" y="475" font-family="Arial" font-size="10" fill="#999">${template.charAt(0).toUpperCase() + template.slice(1)} Template</text>
      `}
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}