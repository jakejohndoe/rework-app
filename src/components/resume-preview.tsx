'use client'

import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { FileText, AlertCircle, Loader2, Eye, Code2 } from 'lucide-react'

// Use local worker file (most reliable approach)
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js'
}

interface ResumeData {
  contactInfo?: string
  summary?: string
  experience?: string
  education?: string
  skills?: string
  title?: string
}

interface ResumePreviewProps {
  resumeData?: ResumeData
  pdfUrl?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
  mode?: 'structured' | 'pdf'
  showToggle?: boolean // NEW: Show toggle button
}

export default function ResumePreview({ 
  resumeData, 
  pdfUrl,
  size = 'medium', 
  className = '',
  mode = 'structured',
  showToggle = false
}: ResumePreviewProps) {
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actualPdfUrl, setActualPdfUrl] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState(mode) // Local state for toggle

  // Fetch signed URL if needed
  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (!pdfUrl || currentMode !== 'pdf') {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // If pdfUrl is an API endpoint, fetch the signed URL
        if (pdfUrl.startsWith('/api/')) {
          const response = await fetch(pdfUrl)
          const data = await response.json()
          
          if (data.success && data.url) {
            setActualPdfUrl(data.url)
          } else {
            setError('Failed to load PDF URL')
          }
        } else {
          // Direct URL
          setActualPdfUrl(pdfUrl)
        }
      } catch (err) {
        console.error('Error fetching PDF URL:', err)
        setError('Failed to load PDF')
      }
    }

    fetchPdfUrl()
  }, [pdfUrl, currentMode])

  const sizeConfig = {
    small: {
      container: 'w-16 h-20',
      scale: 0.15,
      textFallback: 'text-[6px] p-1'
    },
    medium: {
      container: 'w-48 h-64',
      scale: 0.35,
      textFallback: 'text-[8px] p-2'
    },
    large: {
      container: 'w-64 h-80',
      scale: 0.45,
      textFallback: 'text-xs p-3'
    }
  }

  const config = sizeConfig[size]

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  function onDocumentLoadError(error: Error): void {
    console.error('PDF load error:', error)
    setError('Failed to load PDF')
    setLoading(false)
  }

  // Fallback to structured preview if no PDF URL or error
  const shouldShowStructuredPreview = currentMode === 'structured' || !actualPdfUrl || error

  // Structured preview (original functionality)
  const StructuredPreview = () => {
    const extractName = (contactInfo?: string) => {
      if (!contactInfo) return 'Resume Preview'
      const lines = contactInfo.split('\n').filter(line => line.trim())
      const nameLine = lines.find(line => 
        !line.includes('@') && 
        !line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/) &&
        line.length > 2
      )
      return nameLine || resumeData?.title || 'Resume Preview'
    }

    const truncateText = (text?: string, maxLength = 100) => {
      if (!text) return ''
      const cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
      return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned
    }

    const name = extractName(resumeData?.contactInfo)

    return (
      <div className={`
        w-full h-full bg-white rounded-sm shadow-lg
        border border-gray-200 overflow-hidden relative
        transition-all duration-300 transform-gpu
        group-hover:shadow-xl group-hover:scale-[1.02]
      `}>
        <div className={`${config.textFallback} space-y-0.5 h-full overflow-hidden`}>
          <div className="border-b border-gray-200 pb-1">
            <h1 className="font-bold text-gray-900 truncate text-[6px]">
              {name.toUpperCase()}
            </h1>
            {resumeData?.contactInfo && (
              <div className="text-gray-600 text-[5px]">
                {truncateText(resumeData.contactInfo.split('\n').slice(1).join(' '), 40)}
              </div>
            )}
          </div>
          {resumeData?.summary && (
            <div>
              <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-[5px]">Summary</h2>
              <p className="text-gray-700 text-[5px]">{truncateText(resumeData.summary, 30)}</p>
            </div>
          )}
          {resumeData?.experience && (
            <div>
              <h2 className="font-semibold text-gray-800 uppercase tracking-wide text-[5px]">Experience</h2>
              <div className="text-gray-700 text-[5px]">{truncateText(resumeData.experience, 40)}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const PDFPreview = () => (
    <div className={`
      w-full h-full rounded-sm shadow-lg overflow-hidden relative
      transition-all duration-300 transform-gpu
      group-hover:shadow-xl group-hover:scale-[1.02]
      bg-white
    `}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-center p-2">
          <AlertCircle className="w-6 h-6 text-red-400 mb-1" />
          <p className="text-xs text-gray-500">Preview unavailable</p>
          <p className="text-[10px] text-gray-400">PDF could not be loaded</p>
        </div>
      )}

      <Document
        file={actualPdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading=""
        error=""
        className="flex items-center justify-center h-full"
      >
        <Page
          pageNumber={pageNumber}
          scale={config.scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="max-w-full max-h-full"
        />
      </Document>
    </div>
  )

  return (
    <div className={`${className}`}>
      {/* Remove toggle completely - just show structured preview */}
      
      {/* Preview container */}
      <div className={`${config.container} relative group mx-auto`}>
        <StructuredPreview />

        {/* Glass overlay effect on hover */}
        <div className={`
          absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          bg-gradient-to-br from-cyan-500/10 to-purple-500/10
          backdrop-blur-[1px]
          pointer-events-none
        `} />
      </div>
    </div>
  )
}

// Updated usage components with toggle support

// Small thumbnail for dashboard - No toggle needed
export function ResumePreviewThumbnail({ 
  pdfUrl, 
  resumeData, 
  className 
}: { 
  pdfUrl?: string
  resumeData?: ResumeData
  className?: string 
}) {
  return (
    <ResumePreview 
      pdfUrl={pdfUrl}
      resumeData={resumeData}
      size="small" 
      mode="structured"
      className={`cursor-pointer ${className}`}
    />
  )
}

// Medium preview for editor sidebar - WITH TOGGLE!
export function ResumePreviewSidebar({ 
  pdfUrl, 
  resumeData, 
  className 
}: { 
  pdfUrl?: string
  resumeData?: ResumeData
  className?: string 
}) {
  return (
    <div className={`glass-card p-4 ${className}`}>
      <h3 className="text-sm font-medium text-slate-200 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Resume Preview
      </h3>
      <ResumePreview 
        pdfUrl={pdfUrl}
        resumeData={resumeData}
        size="medium"
        mode="structured" // Default to structured
        showToggle={!!pdfUrl} // Only show toggle if PDF URL exists
        className="shadow-2xl"
      />
    </div>
  )
}

// Large preview for full page - WITH TOGGLE!
export function ResumePreviewFull({ 
  pdfUrl, 
  resumeData, 
  className 
}: { 
  pdfUrl?: string
  resumeData?: ResumeData
  className?: string 
}) {
  return (
    <div className={`${className}`}>
      <ResumePreview 
        pdfUrl={pdfUrl}
        resumeData={resumeData}
        size="large"
        mode="structured"
        showToggle={!!pdfUrl}
      />
    </div>
  )
}