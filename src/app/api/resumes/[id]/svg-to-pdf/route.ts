// SVG to PDF Conversion Route
// src/app/api/resumes/[id]/svg-to-pdf/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🎨 Starting SVG to PDF conversion for resume:', id);

    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { 
      svgContent, 
      template = 'professional',
      colors = { primary: '#1e40af', accent: '#3b82f6' }
    } = body;

    if (!svgContent) {
      return new NextResponse('SVG content is required', { status: 400 });
    }

    // Get resume info for filename
    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        user: { email: session.user.email }
      }
    });

    if (!resume) {
      return new NextResponse('Resume not found', { status: 404 });
    }

    console.log('🎨 Converting SVG to PDF for:', resume.title);

    // Create HTML wrapper for the SVG
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              width: 8.5in;
              height: 11in;
              font-family: system-ui, -apple-system, sans-serif;
              background-color: white;
            }
            .resume-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              background-color: white;
            }
            svg {
              width: 8.5in;
              height: 11in;
              background-color: white;
            }
            /* Ensure foreign objects render properly */
            foreignObject {
              font-family: system-ui, -apple-system, sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${svgContent}
          </div>
        </body>
      </html>
    `;

    // Launch Puppeteer to convert HTML to PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set page size to letter format
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: {
        top: '0.25in',
        right: '0.25in',
        bottom: '0.25in',
        left: '0.25in'
      }
    });

    await browser.close();

    console.log('✅ SVG to PDF conversion successful, size:', pdfBuffer.length);

    // Create descriptive filename
    const safeTitle = (resume.title || 'resume').replace(/[^a-zA-Z0-9-_]/g, '-');
    const filename = `${safeTitle}-${template}-${Date.now()}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      },
    });

  } catch (error) {
    console.error('❌ SVG to PDF conversion failed:', error);
    return new NextResponse(`SVG to PDF Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}