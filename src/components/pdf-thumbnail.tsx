// SSR-safe PDF thumbnail component
import { useEffect, useRef, useState } from 'react';

// Custom hook to dynamically load PDF.js only on client side
const usePdfJs = () => {
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPdfJs = async () => {
      if (typeof window !== 'undefined') {
        try {
          const pdfjs = await import('pdfjs-dist');
          setPdfjsLib(pdfjs);
          
          // Set worker
          if (!pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
          }
        } catch (error) {
          console.error('Failed to load PDF.js:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadPdfJs();
  }, []);
  
  return { pdfjsLib, isLoading };
};

interface PDFThumbnailProps {
  resumeId: string;
  className?: string;
}

export function PDFThumbnail({ resumeId, className = '' }: PDFThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { pdfjsLib, isLoading: pdfLibLoading } = usePdfJs();

  console.log('🏗️ PDFThumbnail component rendering for:', resumeId);

  useEffect(() => {
    // Don't start rendering until PDF.js is loaded
    if (pdfLibLoading || !pdfjsLib || !resumeId) {
      return;
    }

    console.log('🔥 useEffect triggered for resumeId:', resumeId);
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
  }, [resumeId, pdfjsLib, pdfLibLoading]);

  console.log('🎭 Rendering with status:', status, 'for resume:', resumeId);

  // Show loading state while PDF.js is loading
  if (pdfLibLoading) {
    return (
      <div className={`rounded-lg overflow-hidden relative ${className}`}>
        <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center min-h-[120px]">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
          <span className="ml-2 text-white text-xs">Loading PDF viewer...</span>
        </div>
      </div>
    );
  }

  // Show error if PDF.js failed to load
  if (!pdfjsLib) {
    return (
      <div className={`rounded-lg overflow-hidden relative ${className}`}>
        <div className="bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-lg flex flex-col items-center justify-center min-h-[120px]">
          <div className="text-red-400 text-xs text-center">
            📄 PDF Preview
          </div>
          <div className="text-red-300/60 text-xs mt-1 text-center">
            Viewer failed to load
          </div>
        </div>
      </div>
    );
  }

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