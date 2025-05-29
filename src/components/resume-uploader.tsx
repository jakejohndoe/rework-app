"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cloud, Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'processing' | 'complete' | 'error'
  progress: number
  error?: string
}

interface ResumeUploaderProps {
  onUploadComplete?: (file: File, resumeId: string) => void
  onError?: (error: string) => void
  maxFileSize?: number // in MB
  className?: string
}

export default function ResumeUploader({ 
  onUploadComplete, 
  onError, 
  maxFileSize = 10,
  className = "" 
}: ResumeUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [resumeTitle, setResumeTitle] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
  const acceptedExtensions = ['.pdf', '.docx', '.doc']

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return "Please upload a PDF or Word document (.pdf, .docx, .doc)"
    }

    // Check file size (convert MB to bytes)
    const maxSizeBytes = maxFileSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxFileSize}MB`
    }

    return null
  }

  const generateFileId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const uploadFileToServer = async (fileId: string, file: File) => {
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', resumeTitle || file.name.replace(/\.[^/.]+$/, ""))

      // Upload with progress tracking
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update to complete status
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'complete', progress: 100 }
          : f
      ))

      // Call success callback
      if (onUploadComplete) {
        onUploadComplete(file, result.resume.id)
      }

      console.log('✅ Upload successful:', result.resume)

    } catch (error) {
      console.error('Upload error:', error)
      
      // Update to error status
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ))

      if (onError) {
        onError(error instanceof Error ? error.message : 'Upload failed')
      }
    }
  }

  const simulateUploadProgress = (fileId: string, file: File) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 90) {
        progress = 90
        clearInterval(interval)
        
        // Switch to processing phase
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'processing', progress: 90 }
            : f
        ))

        // Start actual upload
        uploadFileToServer(fileId, file)
      } else {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: Math.round(progress) }
            : f
        ))
      }
    }, 200)
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    fileArray.forEach(file => {
      const error = validateFile(file)
      const fileId = generateFileId()
      
      if (error) {
        setUploadedFiles(prev => [...prev, {
          file,
          id: fileId,
          status: 'error',
          progress: 0,
          error
        }])
        onError?.(error)
        return
      }

      // Add file to upload queue
      setUploadedFiles(prev => [...prev, {
        file,
        id: fileId,
        status: 'uploading',
        progress: 0
      }])

      // Auto-generate title from filename if not set
      if (!resumeTitle) {
        const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
        setResumeTitle(title)
      }

      // Start upload simulation
      simulateUploadProgress(fileId, file)
    })
  }, [resumeTitle, onError, onUploadComplete, uploadedFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
  }, [handleFiles])

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const clearAll = () => {
    setUploadedFiles([])
    setResumeTitle("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Zone */}
      <Card className={`glass-card transition-all duration-300 ${
        isDragOver 
          ? 'border-primary-400/50 bg-primary-400/5' 
          : 'border-white/10 hover:border-primary-400/30'
      }`}>
        <CardContent className="p-8">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="text-center"
          >
            <div className={`mx-auto mb-4 transition-all duration-300 ${
              isDragOver ? 'scale-110' : 'scale-100'
            }`}>
              <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-float">
                <Cloud className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragOver ? "Drop your resume here" : "Upload your resume"}
            </h3>
            
            <p className="text-slate-300 mb-6">
              Drag and drop your PDF or Word document, or click to browse
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-gradient"
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose File
              </Button>
              
              <div className="text-sm text-slate-400">
                Supports PDF, DOC, DOCX up to {maxFileSize}MB
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedExtensions.join(',')}
              onChange={handleFileInput}
              className="hidden"
              multiple
            />
          </div>
        </CardContent>
      </Card>

      {/* Resume Title Input */}
      {uploadedFiles.length > 0 && (
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume-title" className="text-white mb-2 block">
                  Resume Title
                </Label>
                <Input
                  id="resume-title"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="e.g., Software Engineer Resume"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Give your resume a descriptive name for easy identification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Upload Progress</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        uploadedFile.status === 'complete' ? 'bg-green-400/20' :
                        uploadedFile.status === 'error' ? 'bg-red-400/20' :
                        'bg-primary-400/20'
                      }`}>
                        {uploadedFile.status === 'uploading' && (
                          <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                        )}
                        {uploadedFile.status === 'processing' && (
                          <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                        )}
                        {uploadedFile.status === 'complete' && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        {uploadedFile.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {uploadedFile.file.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB</span>
                          <span>•</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              uploadedFile.status === 'complete' ? 'bg-green-400/20 text-green-300' :
                              uploadedFile.status === 'error' ? 'bg-red-400/20 text-red-300' :
                              uploadedFile.status === 'processing' ? 'bg-yellow-400/20 text-yellow-300' :
                              'bg-blue-400/20 text-blue-300'
                            }`}
                          >
                            {uploadedFile.status === 'uploading' && 'Uploading'}
                            {uploadedFile.status === 'processing' && 'Processing'}
                            {uploadedFile.status === 'complete' && 'Complete'}
                            {uploadedFile.status === 'error' && 'Error'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-slate-400 hover:text-white hover:bg-white/10 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {uploadedFile.status !== 'complete' && uploadedFile.status !== 'error' && (
                    <Progress 
                      value={uploadedFile.progress} 
                      className="h-2"
                    />
                  )}
                  
                  {uploadedFile.error && (
                    <p className="text-red-400 text-xs">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}