// Replace your existing pdf-thumbnail.tsx with this debugging version
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Use local worker file
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface PDFThumbnailProps {
  resumeId: string;
  className?: string;
}

export function PDFThumbnail({ resumeId, className = '' }: PDFThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  console.log('🏗️ PDFThumbnail component rendering for:', resumeId);

  useEffect(() => {
    console.log('🔥 useEffect triggered for resumeId:', resumeId);
    
    if (!resumeId) {
      console.log('❌ No resumeId provided');
      return;
    }

    console.log('⏱️ Setting timer for PDF rendering...');
    
    const timer = setTimeout(async () => {
      console.log('⏰ Timer fired! Starting PDF rendering...');
      
      const canvas = canvasRef.current;
      if (!canvas) {
        console.log('❌ Canvas not found');
        setStatus('error');
        return;
      }
      
      console.log('✅ Canvas found! Starting PDF generation...');
      
      try {
        // Step 1: Get PDF URL
        console.log('🔗 Fetching PDF URL...');
        const urlResponse = await fetch(`/api/resumes/${resumeId}/url`);
        if (!urlResponse.ok) {
          throw new Error(`Failed to get PDF URL: ${urlResponse.status}`);
        }
        
        const urlData = await urlResponse.json();
        console.log('✅ PDF URL fetched successfully');
        
        // Step 2: Load PDF
        console.log('📄 Loading PDF with PDF.js...');
        const loadingTask = pdfjsLib.getDocument(urlData.url);
        const pdf = await loadingTask.promise;
        console.log('✅ PDF loaded successfully! Pages:', pdf.numPages);
        
        // Step 3: Get first page
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        console.log('✅ Got page and viewport:', viewport.width, 'x', viewport.height);
        
        // Step 4: Setup canvas
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Could not get canvas context');
        }
        
        console.log('🎨 Starting PDF render to canvas...');
        
        // Step 5: Render PDF to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        const renderTask = (page as any).render(renderContext);
        await renderTask.promise;
        
        console.log('✅ PDF thumbnail rendered successfully!');
        setStatus('success');
        
      } catch (err) {
        console.error('❌ PDF rendering failed:', err);
        setStatus('error');
      }
    }, 500);

    return () => {
      console.log('🧹 Cleaning up timer for:', resumeId);
      clearTimeout(timer);
    };
  }, [resumeId]);

  console.log('🎭 Rendering with status:', status, 'for resume:', resumeId);

  // Always render canvas but overlay loading/error states
  return (
    <div className={`rounded-lg overflow-hidden relative ${className}`}>
      {/* Always render canvas first */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full object-cover rounded-lg"
        style={{ 
          display: 'block',
          maxWidth: '100%', 
          height: 'auto',
          backgroundColor: 'white',
          minHeight: '120px' // Ensure canvas has size
        }}
      />
      
      {/* Overlay loading state */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
          <span className="ml-2 text-white text-xs">Loading {resumeId.slice(-6)}...</span>
        </div>
      )}
      
      {/* Overlay error state */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-lg flex flex-col items-center justify-center">
          <div className="text-red-400 text-xs text-center">
            📄 PDF Preview
          </div>
          <div className="text-red-300/60 text-xs mt-1 text-center">
            Canvas not found
          </div>
        </div>
      )}
      
      {/* Success state - remove overlays to show the rendered PDF */}
      {status === 'success' && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded opacity-75">
          ✅ PDF
        </div>
      )}
    </div>
  );
}