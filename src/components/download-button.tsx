// src/components/download-button.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, Eye, FileDown, ChevronDown } from 'lucide-react';
import { useResumeDownload } from '@/lib/download-utils';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
  resumeId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  showPreview?: boolean;
  showVersions?: boolean;
}

export function DownloadButton({
  resumeId,
  className,
  variant = 'default',
  size = 'default',
  showPreview = true,
  showVersions = true,
}: DownloadButtonProps) {
  const { downloadPDF, previewPDF, isDownloading } = useResumeDownload();

  // Simple download button (no dropdown)
  if (!showPreview && !showVersions) {
    return (
      <Button
        onClick={() => downloadPDF({ resumeId })}
        disabled={isDownloading}
        variant={variant}
        size={size}
        className={cn('gap-2', className)}
      >
        {isDownloading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download PDF
          </>
        )}
      </Button>
    );
  }

  // Dropdown menu with options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isDownloading}
          variant={variant}
          size={size}
          className={cn('gap-2', className)}
        >
          {isDownloading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Download
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48 bg-slate-900/95 backdrop-blur-sm border-2 border-slate-700 shadow-xl">
        {/* Download Options */}
        <DropdownMenuItem
          onClick={() => downloadPDF({ resumeId, version: 'optimized' })}
          disabled={isDownloading}
          className="gap-2 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download Optimized PDF
        </DropdownMenuItem>
        
        {showVersions && (
          <DropdownMenuItem
            onClick={() => downloadPDF({ resumeId, version: 'original' })}
            disabled={isDownloading}
            className="gap-2 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download Original PDF
          </DropdownMenuItem>
        )}

        {/* Preview Options */}
        {showPreview && (
          <>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => previewPDF({ resumeId, version: 'optimized' })}
              disabled={isDownloading}
              className="gap-2 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              Preview Optimized
            </DropdownMenuItem>
            
            {showVersions && (
              <DropdownMenuItem
                onClick={() => previewPDF({ resumeId, version: 'original' })}
                disabled={isDownloading}
                className="gap-2 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                Preview Original
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick action buttons for specific use cases
export function QuickDownloadButton({ resumeId, className }: { resumeId: string; className?: string }) {
  const { downloadPDF, isDownloading } = useResumeDownload();

  return (
    <Button
      onClick={() => downloadPDF({ resumeId })}
      disabled={isDownloading}
      size="sm"
      variant="outline"
      className={cn('gap-1', className)}
    >
      {isDownloading ? (
        <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      ) : (
        <Download className="h-3 w-3" />
      )}
      {isDownloading ? 'Generating...' : 'Download'}
    </Button>
  );
}

export function PreviewButton({ resumeId, className }: { resumeId: string; className?: string }) {
  const { previewPDF, isDownloading } = useResumeDownload();

  return (
    <Button
      onClick={() => previewPDF({ resumeId })}
      disabled={isDownloading}
      size="sm"
      variant="ghost"
      className={cn('gap-1', className)}
    >
      {isDownloading ? (
        <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      ) : (
        <Eye className="h-3 w-3" />
      )}
      {isDownloading ? 'Loading...' : 'Preview'}
    </Button>
  );
}

export default DownloadButton;