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

        // Enhanced progress simulation that NEVER gets stuck
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map(f => {
              if (f.id === uploadingFile.id) {
                let increment;
                // Different increment rates for different stages
                if (f.progress < 30) {
                  increment = Math.random() * 15 + 5 // 5-20% increments (fast start)
                } else if (f.progress < 60) {
                  increment = Math.random() * 10 + 3 // 3-13% increments (steady)
                } else if (f.progress < 85) {
                  increment = Math.random() * 5 + 2 // 2-7% increments (slower)
                } else if (f.progress < 95) {
                  increment = Math.random() * 2 + 0.5 // 0.5-2.5% increments (realistic final processing)
                } else {
                  increment = Math.random() * 0.5 + 0.1 // 0.1-0.6% increments (almost done, but still moving!)
                }
                
                const newProgress = Math.min(f.progress + increment, 99.5) // Never quite reach 100 until server responds
                return { ...f, progress: newProgress }
              }
              return f
            })
          )
        }, 250) // Slightly faster updates for more responsiveness

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
            : 'hover:scale-[1.01] border-slate-700/50 hover:border-slate-600/70 glass-card'
          }
          ${isDragReject ? 'border-red-400/70 bg-red-500/10' : ''}
        `}
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform, border-color, background',
        }}
      >
        <input {...getInputProps()} />
        
        {/* Radar Sweep Effect */}
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

        {/* Grid Pattern Background */}
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
            
            {/* Outer Ring */}
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
            
            {/* Middle Ring */}
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
            
            {/* Inner Core */}
            <div className={`
              relative w-24 h-24 rounded-full flex items-center justify-center
              transition-all duration-400 ease-out glass-card
              ${isDragActive 
                ? 'bg-gradient-to-br from-cyan-500/25 to-purple-500/25 scale-105' 
                : 'scale-100'
              }
            `}
            style={{
              transform: 'translateZ(0)',
              boxShadow: isDragActive 
                ? '0 0 30px rgba(44, 199, 208, 0.3), inset 0 0 15px rgba(147, 51, 234, 0.2)' 
                : '0 0 10px rgba(0, 0, 0, 0.3)'
            }}>
              
              {/* Morphing Upload Icon */}
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
                : 'drag & drop your resume'
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
                ? 'ai processing ready • release to upload'
                : 'advanced ai-powered resume optimization awaits'
              }
            </p>
            
            {/* Tech Specs Bar */}
            <div className={`
              flex justify-center space-x-6 text-xs transition-all duration-500
              ${isDragActive ? 'text-purple-300' : 'text-slate-500'}
            `}>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isDragActive ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                pdf • docx
              </span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isDragActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                max {maxFiles} files
              </span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isDragActive ? 'bg-purple-400 animate-pulse' : 'bg-slate-500'}`} />
                10mb each
              </span>
            </div>
          </div>
        </div>

        {/* Holographic Edge Effect */}
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

      {/* Enhanced Upload Progress Section with Smart Movement */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            processing files ({uploadingFiles.length})
          </h4>
          
          {uploadingFiles.map((uploadingFile) => (
            <div key={uploadingFile.id} className="relative">
              <Card className="glass-card p-4 relative hover:scale-[1.01] transition-all duration-300">
                {/* Dynamic background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="flex-shrink-0">
                    {uploadingFile.status === 'completed' ? (
                      <div className="relative">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div className="absolute inset-0 animate-ping">
                          <CheckCircle className="w-5 h-5 text-green-400 opacity-30" />
                        </div>
                      </div>
                    ) : uploadingFile.status === 'error' ? (
                      <div className="relative">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div className="absolute inset-0 animate-pulse">
                          <AlertCircle className="w-5 h-5 text-red-400 opacity-50" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div className="absolute inset-0 animate-ping">
                          <FileText className="w-5 h-5 text-cyan-400 opacity-30" />
                        </div>
                        {/* Scanning animation around icon */}
                        <div className="absolute inset-0 rounded-full border border-cyan-400/30" style={{ animation: 'scanning-ring 2s linear infinite' }}></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate flex items-center gap-2">
                      {uploadingFile.file.name}
                      {uploadingFile.status === 'uploading' && (
                        <span className="text-xs text-cyan-400 animate-pulse">• processing...</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(uploadingFile.file.size / 1024 / 1024).toFixed(1)} mb
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 w-32">
                    {uploadingFile.status === 'uploading' && (
                      <div className="space-y-2">
                        {/* Enhanced Progress Bar with Smart Movement */}
                        <div className="relative">
                          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                            {/* Background shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse"></div>
                            
                            {/* Main progress bar with final-stage glow */}
                            <div 
                              className={`h-full btn-gradient rounded-full transition-all duration-300 ease-out relative overflow-hidden ${
                                uploadingFile.progress > 95 ? 'animate-pulse' : ''
                              }`}
                              style={{ 
                                width: `${uploadingFile.progress}%`,
                                animation: uploadingFile.progress > 95 ? 'final-stage-glow 1.5s ease-in-out infinite' : 'none'
                              }}
                            >
                              {/* Moving light effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                              
                              {/* Enhanced shimmer sweep effect that speeds up during final stages */}
                              <div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                                style={{
                                  animation: uploadingFile.progress > 90 
                                    ? 'shimmer-sweep 1s infinite linear' 
                                    : 'shimmer-sweep 2s infinite linear',
                                  transform: 'translateX(-100%)'
                                }}
                              ></div>
                            </div>
                            
                            {/* Smart movement when progress might be stuck - now works through 99% */}
                            {uploadingFile.progress > 10 && uploadingFile.progress < 99.5 && (
                              <div className="absolute inset-0">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-full w-6"
                                  style={{
                                    animation: 'smart-pulse 2s ease-in-out infinite',
                                    transform: `translateX(${Math.min(uploadingFile.progress * 0.8, 85)}%)`,
                                    transition: 'transform 1s ease-out'
                                  }}
                                ></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Enhanced AI Processing Status with Engaging Messages */}
                          <div className="flex items-center justify-between text-xs mt-1">
                            <div className="flex items-center gap-1">
                              {uploadingFile.progress < 20 && (
                                <span className="text-cyan-400 animate-pulse flex items-center gap-1">
                                  <span>🔍</span> scanning document...
                                </span>
                              )}
                              {uploadingFile.progress >= 20 && uploadingFile.progress < 40 && (
                                <span className="text-purple-400 animate-pulse flex items-center gap-1">
                                  <span>🧠</span> ai reading content...
                                </span>
                              )}
                              {uploadingFile.progress >= 40 && uploadingFile.progress < 60 && (
                                <span className="text-blue-400 animate-pulse flex items-center gap-1">
                                  <span>⚡</span> parsing experience...
                                </span>
                              )}
                              {uploadingFile.progress >= 60 && uploadingFile.progress < 75 && (
                                <span className="text-emerald-400 animate-pulse flex items-center gap-1">
                                  <span>✨</span> enhancing keywords...
                                </span>
                              )}
                              {uploadingFile.progress >= 75 && uploadingFile.progress < 85 && (
                                <span className="text-amber-400 animate-pulse flex items-center gap-1">
                                  <span>🎯</span> optimizing format...
                                </span>
                              )}
                              {uploadingFile.progress >= 85 && uploadingFile.progress < 92 && (
                                <span className="text-pink-400 animate-pulse flex items-center gap-1">
                                  <span>🔧</span> fine-tuning details...
                                </span>
                              )}
                              {uploadingFile.progress >= 92 && uploadingFile.progress < 96 && (
                                <span className="text-indigo-400 animate-pulse flex items-center gap-1">
                                  <span>🎨</span> polishing perfection...
                                </span>
                              )}
                              {uploadingFile.progress >= 96 && uploadingFile.progress < 99 && (
                                <span className="text-violet-400 animate-pulse flex items-center gap-1">
                                  <span>🚀</span> adding secret sauce...
                                </span>
                              )}
                              {uploadingFile.progress >= 99 && (
                                <span className="text-green-400 animate-bounce flex items-center gap-1">
                                  <span>🎉</span> almost perfect...
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 font-medium">
                              {Math.round(uploadingFile.progress)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {uploadingFile.status === 'completed' && (
                      <div className="text-center">
                        <span className="text-xs text-green-400 font-medium flex items-center gap-1 justify-center">
                          <CheckCircle className="w-3 h-3" />
                          complete
                        </span>
                        <p className="text-xs text-slate-500 mt-1">ready to edit</p>
                      </div>
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <div className="text-center">
                        <span className="text-xs text-red-400 font-medium flex items-center gap-1 justify-center">
                          <AlertCircle className="w-3 h-3" />
                          failed
                        </span>
                        <p className="text-xs text-slate-500 mt-1">try again</p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeUploadingFile(uploadingFile.id)}
                    className="flex-shrink-0 h-8 w-8 p-0 hover:bg-slate-700/50 hover:scale-110 transition-all text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
              
              {/* Success celebration animation - now outside the overflow container */}
              {uploadingFile.status === 'completed' && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(34,197,94,0.5)] z-20">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {/* Overall Progress Summary */}
          {uploadingFiles.length > 1 && (
            <div className="mt-4 p-3 glass-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">overall progress</span>
                <span className="text-sm font-medium text-cyan-400">
                  {Math.round((uploadingFiles.filter(f => f.status === 'completed').length / uploadingFiles.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                  className="h-full btn-gradient rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${(uploadingFiles.filter(f => f.status === 'completed').length / uploadingFiles.length) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                {uploadingFiles.filter(f => f.status === 'completed').length} of {uploadingFiles.length} files processed
              </p>
            </div>
          )}
        </div>
      )}

      {/* Complete CSS Animations */}
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

        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(300%) skewX(12deg); }
        }

        @keyframes smart-pulse {
          0%, 100% { 
            opacity: 0.4;
            transform: translateX(var(--tw-translate-x)) scale(0.8);
          }
          50% { 
            opacity: 0.8;
            transform: translateX(var(--tw-translate-x)) scale(1.1);
          }
        }

        @keyframes scanning-ring {
          0% { 
            transform: scale(0.8) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3) rotate(180deg);
            opacity: 0.3;
          }
          100% { 
            transform: scale(0.8) rotate(360deg);
            opacity: 0.8;
          }
        }

        @keyframes final-stage-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.6), 0 0 25px rgba(34, 197, 94, 0.4);
          }
        }
      `}</style>
    </div>
  )
}