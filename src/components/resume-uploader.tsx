'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'

interface ResumeUploaderProps {
  onUploadComplete?: (resumes: any[]) => void
  maxFiles?: number
  className?: string
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  id: string
}

export default function ResumeUploader({ 
  onUploadComplete, 
  maxFiles = 5,
  className = '' 
}: ResumeUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [dragDepth, setDragDepth] = useState(0)
  const [isDragActive, setIsDragActive] = useState(false)
  const dropzoneRef = useRef<HTMLDivElement>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Reset drag state
    setDragDepth(0)
    setIsDragActive(false)
    
    // Create uploading file objects
    const newUploadingFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      id: Math.random().toString(36).substring(7)
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    // Upload each file
    for (const uploadingFile of newUploadingFiles) {
      try {
        const formData = new FormData()
        formData.append('file', uploadingFile.file)

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map(f => 
              f.id === uploadingFile.id 
                ? { ...f, progress: Math.min(f.progress + Math.random() * 30, 90) }
                : f
            )
          )
        }, 200)

        const response = await fetch('/api/resumes/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (response.ok) {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === uploadingFile.id
                ? { ...f, progress: 100, status: 'completed' }
                : f
            )
          )
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadingFile.id
              ? { ...f, status: 'error' }
              : f
          )
        )
      }
    }

    // Call completion callback after a delay
    setTimeout(() => {
      if (onUploadComplete) {
        onUploadComplete([])
      }
    }, 1000)
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDragEnter: () => {
      setDragDepth(prev => prev + 1)
      setIsDragActive(true)
    },
    onDragLeave: () => {
      setDragDepth(prev => {
        const newDepth = prev - 1
        if (newDepth === 0) {
          setIsDragActive(false)
        }
        return newDepth
      })
    },
    onDropAccepted: () => {
      setDragDepth(0)
      setIsDragActive(false)
    },
    onDropRejected: () => {
      setDragDepth(0)
      setIsDragActive(false)
    }
  })

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Enhanced Drag & Drop Zone */}
      <div
        {...getRootProps()}
        ref={dropzoneRef}
        className={`
          relative overflow-hidden
          min-h-[300px] p-8 
          border-2 border-dashed border-slate-700/50
          rounded-2xl cursor-pointer
          transition-all duration-500 ease-out
          transform-gpu
          ${isDragActive ? 'scale-[1.02] border-cyan-400/70' : 'hover:scale-[1.01] hover:border-slate-600/70'}
          ${isDragReject ? 'border-red-400/70' : ''}
        `}
        style={{
          background: isDragActive 
            ? 'radial-gradient(circle at center, rgba(44, 199, 208, 0.1) 0%, rgba(139, 92, 246, 0.05) 70%, transparent 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <input {...getInputProps()} />
        
        {/* Animated Background Effects */}
        <div className={`
          absolute inset-0 opacity-0 transition-opacity duration-500
          ${isDragActive ? 'opacity-100' : ''}
        `}>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent animate-pulse" />
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`
                  absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full
                  animate-bounce opacity-60
                `}
                style={{
                  left: `${20 + (i * 7)}%`,
                  top: `${20 + (i % 3) * 20}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${2 + (i % 3) * 0.5}s`
                }}
              />
            ))}
          </div>
          
          {/* Glow Ring */}
          <div className="absolute inset-4 rounded-xl border border-cyan-400/30 animate-pulse" />
          <div className="absolute inset-8 rounded-lg border border-purple-400/20 animate-pulse delay-300" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
          {/* Icon with enhanced effects */}
          <div className={`
            relative mb-6 p-6 rounded-full
            transition-all duration-500 transform-gpu
            ${isDragActive 
              ? 'scale-110 shadow-[0_0_40px_rgba(44,199,208,0.4)] bg-gradient-to-br from-cyan-500/20 to-purple-500/20' 
              : 'scale-100 shadow-[0_0_20px_rgba(44,199,208,0.1)] bg-gradient-to-br from-slate-800/50 to-slate-700/30'
            }
          `}>
            <Upload 
              className={`
                w-12 h-12 transition-all duration-500
                ${isDragActive 
                  ? 'text-cyan-300 animate-bounce' 
                  : 'text-slate-400 group-hover:text-cyan-400'
                }
              `} 
            />
            
            {/* Rotating ring around icon */}
            <div className={`
              absolute inset-0 rounded-full border-2 border-transparent
              transition-all duration-500
              ${isDragActive 
                ? 'border-t-cyan-400 border-r-purple-400 animate-spin' 
                : ''
              }
            `} />
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <h3 className={`
              text-xl font-semibold transition-all duration-300
              ${isDragActive 
                ? 'text-cyan-300 animate-pulse' 
                : 'text-slate-200'
              }
            `}>
              {isDragActive 
                ? '✨ Drop your files here!' 
                : 'Upload Your Resume'
              }
            </h3>
            
            <p className={`
              text-sm transition-all duration-300
              ${isDragActive 
                ? 'text-purple-300' 
                : 'text-slate-400'
              }
            `}>
              {isDragActive 
                ? 'Release to upload your resume files'
                : 'Drag & drop your PDF or Word documents here, or click to browse'
              }
            </p>
            
            <p className="text-xs text-slate-500 mt-2">
              Supports PDF, DOCX, DOC • Max {maxFiles} files • 10MB each
            </p>
          </div>

          {/* Enhanced Browse Button */}
          <Button 
            className={`
              mt-6 px-8 py-3 font-medium
              bg-gradient-to-r from-cyan-600 to-purple-600 
              hover:from-cyan-500 hover:to-purple-500
              border-0 shadow-lg transition-all duration-300 transform-gpu
              ${isDragActive ? 'scale-105 shadow-[0_0_30px_rgba(44,199,208,0.3)]' : 'hover:scale-105'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            Choose Files
          </Button>
        </div>

        {/* Edge Glow Effect */}
        <div className={`
          absolute inset-0 rounded-2xl pointer-events-none
          transition-all duration-500
          ${isDragActive 
            ? 'shadow-[inset_0_0_50px_rgba(44,199,208,0.2),0_0_100px_rgba(139,92,246,0.1)]' 
            : 'shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]'
          }
        `} />
      </div>

      {/* Upload Progress Section */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-slate-300 mb-3">
            Uploading Files ({uploadingFiles.length})
          </h4>
          
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.id} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {uploadingFile.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : uploadingFile.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-cyan-400 animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(uploadingFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                
                <div className="flex-shrink-0 w-24">
                  {uploadingFile.status === 'uploading' && (
                    <Progress 
                      value={uploadingFile.progress} 
                      className="h-2 bg-slate-700"
                    />
                  )}
                  {uploadingFile.status === 'completed' && (
                    <span className="text-xs text-green-400 font-medium">
                      Complete
                    </span>
                  )}
                  {uploadingFile.status === 'error' && (
                    <span className="text-xs text-red-400 font-medium">
                      Failed
                    </span>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeUploadingFile(uploadingFile.id)}
                  className="flex-shrink-0 h-8 w-8 p-0 hover:bg-slate-700/50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}