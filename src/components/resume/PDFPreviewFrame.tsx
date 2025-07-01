// src/components/resume/PDFPreviewFrame.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, FileText } from 'lucide-react';

interface PDFPreviewFrameProps {
  resumeId: string;
  version: 'original' | 'optimized';
  template: string;
  title: string;
  subtitle: string;
  className?: string;
}

export function PDFPreviewFrame({ 
  resumeId, 
  version, 
  template, 
  title, 
  subtitle,
  className = '' 
}: PDFPreviewFrameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [renderMethod, setRenderMethod] = useState<'canvas' | 'svg' | 'iframe'>('canvas');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Unique ID for this component instance to avoid canvas conflicts
  const instanceId = useRef(`pdf-preview-${Math.random().toString(36).substr(2, 9)}`);

  const loadPreview = useCallback(async () => {
    console.log(`🔍 Loading preview for ${version} resume with ${template} template`);
    setIsLoading(true);
    setError(null);
    setPreviewUrl(null);

    try {
      // Get preview from API
      const previewResponse = await fetch(
        `/api/resumes/${resumeId}/preview?version=${version}&template=${template}&instance=${instanceId.current}`
      );

      console.log(`📡 Preview response status: ${previewResponse.status}`);

      if (!previewResponse.ok) {
        throw new Error(`Failed to generate preview: ${previewResponse.status}`);
      }

      const contentType = previewResponse.headers.get('content-type');
      console.log(`📄 Content type: ${contentType}`);
      
      if (contentType?.includes('application/pdf')) {
        // Try to render PDF to canvas for clean preview
        await handlePDFPreview(previewResponse);
      } else if (contentType?.includes('image/svg+xml')) {
        // Handle SVG fallback with real data
        const svgText = await previewResponse.text();
        console.log(`🎨 Received SVG preview, length: ${svgText.length}`);
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        setPreviewUrl(url);
        setRenderMethod('svg');
        setIsLoading(false);
      } else {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

    } catch (err) {
      console.error('❌ Preview loading failed:', err);
      setError(`Failed to load preview: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [resumeId, version, template]);

  const handlePDFPreview = async (response: Response) => {
    try {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      console.log(`📄 PDF blob created, size: ${blob.size} bytes`);
      
      // Try to render PDF to canvas using PDF.js
      if (typeof window !== 'undefined') {
        try {
          // Dynamically import PDF.js
          const pdfjsLib = await import('pdfjs-dist');
          
          // Set worker source if not already set
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
          }

          console.log(`🔧 Loading PDF with PDF.js...`);

          // Load PDF
          const pdf = await pdfjsLib.getDocument({ url: url }).promise;
          const page = await pdf.getPage(1);
          
          console.log(`📑 PDF loaded, rendering page 1...`);
          
          // Use higher scale for better quality
          const viewport = page.getViewport({ scale: 1.0 });

          const canvas = canvasRef.current;
          if (!canvas) {
            throw new Error('Canvas not found');
          }

          // Clear any existing content
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Could not get canvas context');
          }

          // Set canvas size
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          // Clear canvas with white background
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          console.log(`🎨 Canvas prepared: ${canvas.width}x${canvas.height}`);
          
          // Render PDF page
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          await (page as any).render(renderContext).promise;
          
          console.log(`✅ PDF rendered to canvas successfully`);
          
          // Clean up blob URL
          URL.revokeObjectURL(url);
          
          setRenderMethod('canvas');
          setIsLoading(false);
          return;
          
        } catch (pdfError) {
          console.warn('⚠️ PDF.js rendering failed, falling back to iframe:', pdfError);
          // Fallback to iframe with PDF controls
          setPreviewUrl(url);
          setRenderMethod('iframe');
          setIsLoading(false);
          return;
        }
      } else {
        // Server-side fallback
        setPreviewUrl(url);
        setRenderMethod('iframe');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('❌ PDF processing failed:', err);
      throw new Error('Failed to process PDF preview');
    }
  };

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-white/60" />
          <div className="text-white/60 text-sm">Generating {version} preview...</div>
          <div className="text-white/40 text-xs">Loading real resume data...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          <FileText className="w-8 h-8 text-red-400" />
          <div className="text-red-400 text-sm text-center">
            {error}
            <button 
              onClick={loadPreview}
              className="block mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Retry Loading
            </button>
          </div>
        </div>
      );
    }

    // Show canvas if PDF was rendered successfully
    if (renderMethod === 'canvas') {
      const canvas = canvasRef.current;
      if (canvas && canvas.width > 0) {
        return (
          <div className="flex items-center justify-center h-full bg-white rounded-lg overflow-hidden">
            <canvas 
              ref={canvasRef}
              className="max-w-full max-h-full object-contain shadow-sm"
              style={{ 
                maxHeight: '350px',
                width: 'auto',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        );
      }
    }

    // Show SVG or iframe preview
    if (previewUrl) {
      if (renderMethod === 'svg') {
        return (
          <div className="flex items-center justify-center h-full bg-white rounded-lg overflow-hidden">
            <img 
              src={previewUrl}
              alt={`${version} resume preview`}
              className="max-w-full max-h-full object-contain shadow-sm"
              style={{ 
                maxHeight: '350px',
                width: 'auto',
                height: 'auto'
              }}
              onLoad={() => console.log(`✅ SVG preview loaded for ${version}`)}
              onError={() => console.error(`❌ SVG preview failed for ${version}`)}
            />
          </div>
        );
      } else if (renderMethod === 'iframe') {
        return (
          <div className="w-full h-full bg-white rounded-lg overflow-hidden">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title={`${version} resume preview`}
              onLoad={() => console.log(`✅ PDF iframe loaded for ${version}`)}
            />
          </div>
        );
      }
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60 text-sm">No preview available</div>
      </div>
    );
  };

  return (
    <div className={`relative h-full min-h-[400px] ${className}`} ref={containerRef}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/70">{subtitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            {version === 'optimized' && (
              <div className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
                ✨ AI Enhanced
              </div>
            )}
            {renderMethod === 'canvas' && !isLoading && !error && (
              <div className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                📄 Live Preview
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-4 h-[400px] relative overflow-hidden">
        {/* Hidden canvas for PDF rendering */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Content display */}
        {renderContent()}
        
        {/* Template badge */}
        {!isLoading && !error && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            <span>{template.charAt(0).toUpperCase() + template.slice(1)} Template</span>
            {renderMethod === 'canvas' && <span className="text-green-400">●</span>}
            {renderMethod === 'svg' && <span className="text-blue-400">●</span>}
            {renderMethod === 'iframe' && <span className="text-yellow-400">●</span>}
          </div>
        )}
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && !isLoading && !error && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {instanceId.current.slice(-4)} • {renderMethod}
          </div>
        )}
      </div>
    </div>
  );
}