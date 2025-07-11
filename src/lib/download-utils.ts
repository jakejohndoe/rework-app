// src/lib/download-utils.ts
import { toast } from 'sonner';
import { useState } from 'react';

export interface DownloadOptions {
  resumeId: string;
  version?: 'original' | 'optimized';
  filename?: string;
}

// Global debounce tracker to prevent duplicate downloads
const downloadInProgress = new Set<string>();
// ✅ NEW: Global toast tracking to prevent duplicate toasts
const activeToasts = new Map<string, string>();

/**
 * Download a resume as PDF
 */
export async function downloadResumePDF({ 
  resumeId, 
  version = 'optimized' 
}: DownloadOptions): Promise<void> {
  
  // Create unique key for this download
  const downloadKey = `${resumeId}-${version}`;
  
  // ✅ ATOMIC: Check and set in one operation to prevent race conditions
  if (downloadInProgress.has(downloadKey)) {
    return;
  }
  
  // ✅ IMMEDIATELY mark as in progress before any async operations
  downloadInProgress.add(downloadKey);
  
  try {
    // ✅ NEW: Only show toast if no toast is already active for this download
    let loadingToast: string | number | undefined;
    if (!activeToasts.has(downloadKey)) {
      loadingToast = toast.loading('Generating PDF download...');
      activeToasts.set(downloadKey, String(loadingToast));
    }

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

    // ✅ NEW: Dismiss loading toast, let browser handle download notification
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }

  } catch (error) {
    console.error('❌ Download error for', downloadKey, ':', error);
    
    // ✅ NEW: Only show error toast once
    const existingToastId = activeToasts.get(downloadKey);
    if (existingToastId) {
      toast.dismiss(existingToastId);
    }
    toast.error(`❌ Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Always clean up trackers
    setTimeout(() => {
      downloadInProgress.delete(downloadKey);
      activeToasts.delete(downloadKey);
    }, 1000);
  }
}

/**
 * Preview a resume PDF in a new tab
 */
export async function previewResumePDF({ 
  resumeId, 
  version = 'optimized' 
}: DownloadOptions): Promise<void> {
  
  // Create unique key for this preview
  const previewKey = `preview-${resumeId}-${version}`;
  
  // ✅ ATOMIC: Check and set in one operation
  if (downloadInProgress.has(previewKey)) {
    return;
  }
  
  // ✅ IMMEDIATELY mark as in progress
  downloadInProgress.add(previewKey);
  
  try {
    // ✅ NEW: Centralized toast for preview too
    let loadingToast: string | number | undefined;
    if (!activeToasts.has(previewKey)) {
      loadingToast = toast.loading('Opening PDF preview...');
      activeToasts.set(previewKey, String(loadingToast));
    }

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
    
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }

  } catch (error) {
    console.error('Preview error:', error);
    
    const existingToastId = activeToasts.get(previewKey);
    if (existingToastId) {
      toast.dismiss(existingToastId);
    }
    toast.error(`❌ Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Remove from progress tracker
    setTimeout(() => {
      downloadInProgress.delete(previewKey);
      activeToasts.delete(previewKey);
    }, 500);
  }
}

// React hook for download functionality
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
    const downloadKey = `${options.resumeId}-${options.version || 'optimized'}`;
    
    // ✅ NEW: Check global state first
    if (downloadInProgress.has(downloadKey)) {
      return;
    }
    
    if (isDownloading) {
      return;
    }
    
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
    const previewKey = `preview-${options.resumeId}-${options.version || 'optimized'}`;
    
    // ✅ NEW: Check global state first
    if (downloadInProgress.has(previewKey)) {
      return;
    }
    
    if (isDownloading) {
      return;
    }
    
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