// src/lib/pdf-thumbnail-generator.ts
import pdf from 'pdf-poppler';
import sharp from 'sharp';
import { writeFileSync, readFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export async function generatePDFThumbnail(pdfBuffer: Buffer): Promise<string | null> {
  // Skip thumbnail generation on Linux (Vercel) for now
  if (process.platform === 'linux') {
    console.log('⚠️ Skipping thumbnail generation on Linux platform (Vercel)')
    return null
  }

  let tempPdfPath: string | null = null;
  const outputFiles: string[] = [];

  try {
    console.log('📄 Starting PDF thumbnail generation...');
    
    // Create temp directory if it doesn't exist
    const tempDir = join(tmpdir(), 'rework-thumbnails');
    try {
      mkdirSync(tempDir, { recursive: true });
    } catch (_e) {
      // Directory might already exist
    }

    // Write PDF buffer to temporary file
    const timestamp = Date.now();
    tempPdfPath = join(tempDir, `temp-${timestamp}.pdf`);
    writeFileSync(tempPdfPath, pdfBuffer);
    console.log('💾 PDF written to temp file');

    // Convert first page to image using pdf-poppler with timeout
    const options = {
      format: 'jpeg' as const,
      out_dir: tempDir,
      out_prefix: `thumb-${timestamp}`,
      page: 1,
      scale: 800 // Reduced scale for faster processing
    };

    console.log('🔄 Converting PDF to image...');
    
    // Add timeout wrapper
    const convertWithTimeout = () => {
      return new Promise<void>((resolve, reject) => {
        // Set timeout to 10 seconds
        const timeout = setTimeout(() => {
          reject(new Error('PDF conversion timeout after 10 seconds'));
        }, 10000);

        pdf.convert(tempPdfPath!, options)
          .then(() => {
            clearTimeout(timeout);
            resolve();
          })
          .catch((error) => {
            clearTimeout(timeout);
            reject(error);
          });
      });
    };

    await convertWithTimeout();
    
    // The output file will be named: thumb-{timestamp}-1.jpg
    const outputImagePath = join(tempDir, `thumb-${timestamp}-1.jpg`);
    outputFiles.push(outputImagePath);

    // Check if the output file exists
    try {
      const imageBuffer = readFileSync(outputImagePath);
      console.log('📸 Image file read successfully, size:', imageBuffer.length);

      // Optimize and resize the image using Sharp
      console.log('🎨 Optimizing image with Sharp...');
      const optimizedBuffer = await sharp(imageBuffer)
        .resize(200, 260, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();

      // Convert to base64 data URL
      const base64 = optimizedBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      
      console.log('✅ PDF thumbnail generated successfully');
      return dataUrl;

    } catch (readError) {
      console.error('❌ Failed to read generated image:', readError);
      return null;
    }

  } catch (error) {
    console.error('❌ PDF thumbnail generation failed:', error);
    
    // Check if it's a timeout error
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('⏰ PDF conversion timed out - this can happen with complex PDFs');
    }
    
    return null;
  } finally {
    // Cleanup temporary files
    try {
      if (tempPdfPath) {
        unlinkSync(tempPdfPath);
      }
      outputFiles.forEach(file => {
        try {
          unlinkSync(file);
        } catch (_e) {
          // File might not exist
        }
      });
      console.log('🧹 Temporary files cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️  Cleanup warning:', cleanupError);
    }
  }
}