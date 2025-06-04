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
