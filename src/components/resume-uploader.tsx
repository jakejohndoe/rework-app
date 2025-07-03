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
    setDragDepth(0)
    setIsDragActive(false)
    
    const newUploadingFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      id: Math.random().toString(36).substring(7)
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    for (const uploadingFile of newUploadingFiles) {
      try {
        const formData = new FormData()
        formData.append('file', uploadingFile.file)

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
    maxSize: 10 * 1024 * 1024,
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
      {/* Revolutionary Morphing Upload Zone */}
      <div
        {...getRootProps()}
        ref={dropzoneRef}
        className={`
          relative overflow-hidden min-h-[300px] p-8 
          border-2 border-dashed rounded-2xl cursor-pointer
          transition-all duration-500 ease-out
          ${isDragActive 
            ? 'scale-[1.03] border-transparent bg-gradient-to-br from-cyan-500/15 via-purple-500/8 to-emerald-500/15' 
            : 'hover:scale-[1.01] border-slate-700/50 hover:border-slate-600/70 bg-slate-800/30'
          }
          ${isDragReject ? 'border-red-400/70 bg-red-500/10' : ''}
        `}
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform, border-color, background',
        }}
      >
        <input {...getInputProps()} />
        
        {/* Radar Sweep Effect - More Subtle */}
        {isDragActive && (
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 rounded-2xl opacity-60"
              style={{
                background: 'conic-gradient(from 0deg, transparent 80%, rgba(44, 199, 208, 0.2) 90%, transparent 100%)',
                animation: 'radar-sweep 2s linear infinite',
                transform: 'translateZ(0)'
              }}
            />
          </div>
        )}

        {/* Grid Pattern Background - Lighter */}
        <div className={`
          absolute inset-0 opacity-0 transition-opacity duration-500
          ${isDragActive ? 'opacity-20' : ''}
        `}>
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(44, 199, 208, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(44, 199, 208, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              animation: 'grid-slide 3s ease-in-out infinite',
              transform: 'translateZ(0)'
            }}
          />
        </div>

        {/* Morphing Central Hub */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
          
          {/* Multi-layered Icon Container */}
          <div className="relative mb-8">
            
            {/* Outer Ring - More Subtle Morph */}
            <div className={`
              absolute inset-0 w-24 h-24 rounded-full
              transition-all duration-700 ease-out
              ${isDragActive 
                ? 'scale-125 opacity-20 bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400' 
                : 'scale-100 opacity-15 bg-slate-600'
              }
            `}
            style={{
              transform: 'translateZ(0)',
              animation: isDragActive ? 'outer-ring-pulse 2s ease-in-out infinite' : 'none'
            }} />
            
            {/* Middle Ring - Gentler Counter Rotation */}
            <div className={`
              absolute inset-2 w-20 h-20 rounded-full border-2
              transition-all duration-500 ease-out
              ${isDragActive 
                ? 'border-cyan-300/40 scale-110' 
                : 'border-slate-500/25 scale-100'
              }
            `}
            style={{
              transform: 'translateZ(0)',
              animation: isDragActive ? 'counter-rotate 4s linear infinite' : 'none'
            }} />
            
            {/* Inner Core - Gentler Glow */}
            <div className={`
              relative w-24 h-24 rounded-full flex items-center justify-center
              transition-all duration-400 ease-out
              ${isDragActive 
                ? 'bg-gradient-to-br from-cyan-500/25 to-purple-500/25 scale-105' 
                : 'bg-slate-800/80 scale-100'
              }
            `}
            style={{
              transform: 'translateZ(0)',
              backdropFilter: 'blur(10px)',
              boxShadow: isDragActive 
                ? '0 0 30px rgba(44, 199, 208, 0.3), inset 0 0 15px rgba(147, 51, 234, 0.2)' 
                : '0 0 10px rgba(0, 0, 0, 0.3)'
            }}>
              
              {/* Morphing Upload Icon - Gentler Glow */}
              <Upload 
                className={`
                  w-10 h-10 transition-all duration-400
                  ${isDragActive 
                    ? 'text-white scale-105' 
                    : 'text-slate-400 scale-100'
                  }
                `}
                style={{
                  transform: 'translateZ(0)',
                  filter: isDragActive ? 'drop-shadow(0 0 6px rgba(44, 199, 208, 0.4))' : 'none'
                }}
              />
              
              {/* Energy Pulses Around Icon */}
              {isDragActive && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full border border-cyan-400/20"
                      style={{
                        animation: `energy-pulse 2.5s ease-out infinite ${i * 0.6}s`,
                        transform: 'translateZ(0)'
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Dynamic Text with Typewriter Effect */}
          <div className="space-y-4 max-w-md">
            <h3 className={`
              text-xl font-semibold transition-all duration-500
              ${isDragActive 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300' 
                : 'text-slate-200'
              }
            `}>
              {isDragActive 
                ? 'SCANNING FILES...' 
                : 'Drag & Drop Your Resume'
              }
            </h3>
            
            <p className={`
              text-sm transition-all duration-500
              ${isDragActive 
                ? 'text-cyan-300 animate-pulse' 
                : 'text-slate-400'
              }
            `}>
              {isDragActive 
                ? 'AI processing ready • Release to upload'
                : 'Advanced AI-powered resume optimization awaits'
              }
            </p>
            
            {/* Tech Specs Bar */}
            <div className={`
              flex justify-center space-x-6 text-xs transition-all duration-500
              ${isDragActive ? 'text-purple-300' : 'text-slate-500'}
            `}>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isDragActive ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                PDF • DOCX
              </span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isDragActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                Max {maxFiles} files
              </span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isDragActive ? 'bg-purple-400 animate-pulse' : 'bg-slate-500'}`} />
                10MB each
              </span>
            </div>
          </div>
        </div>

        {/* Gentler Holographic Edge Effect */}
        <div className={`
          absolute inset-0 rounded-2xl pointer-events-none
          transition-all duration-500
          ${isDragActive 
            ? 'shadow-[0_0_60px_rgba(44,199,208,0.2),inset_0_0_30px_rgba(139,92,246,0.15)]' 
            : 'shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]'
          }
        `}
        style={{
          background: isDragActive 
            ? 'linear-gradient(45deg, transparent 40%, rgba(44, 199, 208, 0.08) 50%, transparent 60%)'
            : 'none'
        }} />
      </div>

      {/* Upload Progress Section */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-slate-300 mb-3">
            Processing Files ({uploadingFiles.length})
          </h4>
          
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.id} className="glass-card p-4 border border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {uploadingFile.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : uploadingFile.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <div className="relative">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <div className="absolute inset-0 animate-ping">
                        <FileText className="w-5 h-5 text-cyan-400 opacity-30" />
                      </div>
                    </div>
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
                      ✓ Complete
                    </span>
                  )}
                  {uploadingFile.status === 'error' && (
                    <span className="text-xs text-red-400 font-medium">
                      ✗ Failed
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

      {/* Advanced CSS Animations */}
      <style jsx>{`
        @keyframes radar-sweep {
          0% { 
            transform: translateZ(0) rotate(0deg);
          }
          100% { 
            transform: translateZ(0) rotate(360deg);
          }
        }

        @keyframes grid-slide {
          0%, 100% { 
            transform: translateZ(0) translate(0, 0);
            opacity: 0.3;
          }
          50% { 
            transform: translateZ(0) translate(5px, 5px);
            opacity: 0.6;
          }
        }

        @keyframes outer-ring-pulse {
          0%, 100% { 
            transform: translateZ(0) scale(1.5);
            opacity: 0.2;
          }
          50% { 
            transform: translateZ(0) scale(1.7);
            opacity: 0.4;
          }
        }

        @keyframes counter-rotate {
          0% { 
            transform: translateZ(0) rotate(0deg);
          }
          100% { 
            transform: translateZ(0) rotate(-360deg);
          }
        }

        @keyframes energy-pulse {
          0% { 
            transform: translateZ(0) scale(1);
            opacity: 0.8;
          }
          100% { 
            transform: translateZ(0) scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}