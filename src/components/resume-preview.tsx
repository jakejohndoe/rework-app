// src/components/resume-preview.tsx (FIXED WITH MISSING EXPORT)

import React from 'react'

interface ResumePreviewProps {
  resumeUrl?: string
  className?: string
}

export default function ResumePreview({ resumeUrl, className }: ResumePreviewProps) {
  if (!resumeUrl) {
    return (
      <div className={`flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
        <p className="text-gray-500">No resume uploaded</p>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <div className="bg-gray-50 p-4 border-b">
        <h3 className="text-sm font-medium text-gray-700">Resume Preview</h3>
      </div>
      <div className="p-4">
        <a 
          href={resumeUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📄 View PDF Resume
        </a>
      </div>
    </div>
  )
}

// ADD THE MISSING EXPORT for the dashboard
interface ResumePreviewThumbnailProps {
  resume: any
  className?: string
}

export function ResumePreviewThumbnail({ resume, className = "" }: ResumePreviewThumbnailProps) {
  // Handle undefined/null resume
  if (!resume) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-500 truncate mb-1">
              No Resume
            </h3>
            <p className="text-xs text-gray-400">
              0 words
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
            {resume.title || 'Untitled Resume'}
          </h3>
          <p className="text-xs text-gray-500">
            {resume.wordCount || 0} words
          </p>
          <p className="text-xs text-gray-400">
            {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'No date'}
          </p>
        </div>
      </div>
    </div>
  )
}