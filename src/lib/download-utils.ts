// src/lib/download-utils.ts
import { toast } from 'sonner';

export interface DownloadOptions {
  resumeId: string;
  version?: 'original' | 'optimized';
  filename?: string;
}

/**
 * Download a resume as PDF
 */
export async function downloadResumePDF({ 
  resumeId, 
  version = 'optimized' 
}: DownloadOptions): Promise<void> {
  try {
    // Show loading toast
    const loadingToast = toast.loading('Generating PDF download...');

    // Make request to download endpoint
    const response = await fetch(`/api/resumes/${resumeId}/download?version=${version}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to download PDF');
    }

    // Get the blob and filename
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] || `resume_${version}_${Date.now()}.pdf`;

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Success feedback
    toast.dismiss(loadingToast);
    toast.success(`✅ Downloaded ${filename}`);

  } catch (error) {
    console.error('Download error:', error);
    toast.error(`❌ Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Preview a resume PDF in a new tab
 */
export async function previewResumePDF({ 
  resumeId, 
  version = 'optimized' 
}: DownloadOptions): Promise<void> {
  try {
    toast.loading('Opening PDF preview...');

    const response = await fetch(`/api/resumes/${resumeId}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ version }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF preview');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Open in new tab
    window.open(url, '_blank');
    
    toast.success('📄 PDF preview opened');

  } catch (error) {
    console.error('Preview error:', error);
    toast.error(`❌ Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// React hook for download functionality
import { useState } from 'react';

export interface UseDownloadResult {
  downloadPDF: (options: DownloadOptions) => Promise<void>;
  previewPDF: (options: DownloadOptions) => Promise<void>;
  isDownloading: boolean;
  error: string | null;
}

export function useResumeDownload(): UseDownloadResult {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPDF = async (options: DownloadOptions) => {
    setIsDownloading(true);
    setError(null);
    
    try {
      await downloadResumePDF(options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const previewPDF = async (options: DownloadOptions) => {
    setIsDownloading(true);
    setError(null);
    
    try {
      await previewResumePDF(options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Preview failed';
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadPDF,
    previewPDF,
    isDownloading,
    error,
  };
}