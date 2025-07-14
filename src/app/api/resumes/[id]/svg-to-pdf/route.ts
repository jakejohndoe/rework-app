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
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              margin: 0;
              size: 8.5in 11in;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              margin: 0; 
              padding: 0; 
              width: 8.5in;
              height: 11in;
              background-color: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            /* Font definitions to match SVG */
            .serif { font-family: 'Crimson Text', Georgia, serif; }
            .sans-serif { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
            
            .resume-container {
              width: 8.5in;
              height: 11in;
              margin: 0;
              padding: 0;
              background-color: white;
              position: relative;
            }
            
            svg {
              width: 100%;
              height: 100%;
              display: block;
              background-color: white;
            }
            
            /* Ensure foreign objects render with correct fonts */
            foreignObject {
              overflow: visible;
            }
            
            foreignObject div {
              font-family: inherit;
              margin: 0;
              padding: 0;
            }
            
            /* Match SVG text styles */
            foreignObject .serif {
              font-family: 'Crimson Text', Georgia, serif;
            }
            
            foreignObject .sans-serif {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            
            /* Ensure proper text rendering */
            text {
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
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
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
    });

    const page = await browser.newPage();
    
    // Set viewport to match letter size exactly
    await page.setViewport({
      width: 816,  // 8.5 inches * 96 DPI
      height: 1056, // 11 inches * 96 DPI
      deviceScaleFactor: 1
    });
    
    // Set page content and wait for fonts to load
    await page.setContent(htmlContent, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });
    
    // Wait a bit more for fonts to fully render
    await page.evaluateHandle('document.fonts.ready');
    
    // Additional wait to ensure all fonts are loaded
    await page.waitForTimeout(500);

    // Generate PDF with exact dimensions
    const pdfBuffer = await page.pdf({
      width: '8.5in',
      height: '11in',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false
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