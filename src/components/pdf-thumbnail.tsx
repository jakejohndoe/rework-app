// SSR-safe PDF thumbnail component
import { useEffect, useRef, useState, useCallback } from 'react';

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
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { pdfjsLib, isLoading: pdfLibLoading } = usePdfJs();

  // Use callback ref to know exactly when canvas mounts
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    if (node) {
      console.log('✅ Canvas mounted in PDFThumbnail for resumeId:', resumeId);
      setCanvas(node);
    } else {
      console.log('❌ Canvas unmounted in PDFThumbnail for resumeId:', resumeId);
      setCanvas(null);
    }
  }, [resumeId]);

  // PDFThumbnail component rendering

  useEffect(() => {
    // Don't start rendering until PDF.js is loaded AND canvas is mounted
    if (pdfLibLoading || !pdfjsLib || !resumeId || !canvas) {
      console.log('⏳ PDF render waiting for:', {
        pdfLibLoading, 
        hasPdfjsLib: !!pdfjsLib, 
        hasResumeId: !!resumeId, 
        hasCanvas: !!canvas
      });
      return;
    }

    // useEffect triggered for PDF rendering
    
    const renderPdf = async () => {
      // Starting PDF rendering with mounted canvas...
      console.log('🎨 Starting PDF render with mounted canvas for resumeId:', resumeId);
      
      return renderToCanvas(canvas);
    };

    const renderToCanvas = async (canvas: HTMLCanvasElement) => {
      // Canvas found! Starting PDF generation...
      
        try {
          // Step 1: Load PDF directly from proxy endpoint (no CORS issues)
          console.log('📄 Loading PDF from proxy endpoint...');
          const pdfUrl = `/api/resumes/${resumeId}/pdf`;
          const loadingTask = pdfjsLib.getDocument(pdfUrl);
          const pdf = await loadingTask.promise;
          console.log('✅ PDF loaded successfully from proxy!');
          
          // Step 2: Get first page
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.3 }); // Smaller scale for faster rendering
          console.log('📑 Got page and viewport');
          
          // Step 3: Setup canvas
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Could not get canvas context');
          }
          
          console.log('🎨 Starting PDF render to canvas...');
          
          // Step 4: Render PDF to canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          const renderTask = (page as any).render(renderContext);
          await renderTask.promise;
          
          console.log('✅ PDF thumbnail rendered successfully!');
          setStatus('success');
          
        } catch (err) {
          console.error('❌ PDF rendering failed for resumeId:', resumeId, err);
          setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
          setStatus('error');
        }
      };

    renderPdf();
  }, [resumeId, pdfjsLib, pdfLibLoading, canvas]);

  // Rendering with status

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
            {errorMessage || 'Rendering failed'}
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