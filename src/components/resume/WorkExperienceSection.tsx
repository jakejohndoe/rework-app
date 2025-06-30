import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Code,
  Target
} from "lucide-react"
import { WorkExperience } from "@/types/resume"

interface WorkExperienceSectionProps {
  workExperience: WorkExperience[] | null | undefined
  onChange: (workExperience: WorkExperience[]) => void
  className?: string
}

interface ValidationErrors {
  [jobId: string]: {
    [field: string]: string
  }
}

export default function WorkExperienceSection({ workExperience, onChange, className = "" }: WorkExperienceSectionProps) {
  const [formData, setFormData] = useState<WorkExperience[]>([])
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [completionScore, setCompletionScore] = useState(0)

  // Initialize form data when workExperience prop changes
  useEffect(() => {
    if (workExperience && workExperience.length > 0) {
      setFormData(workExperience)
    } else {
      // Initialize with one empty job entry
      setFormData([createEmptyJob()])
    }
  }, [workExperience])

  // Calculate completion score
  useEffect(() => {
    if (formData.length === 0) {
      setCompletionScore(0)
      return
    }

    const requiredFields = ['jobTitle', 'company', 'startDate']
    const recommendedFields = ['location', 'achievements']
    
    let totalFieldsRequired = formData.length * requiredFields.length
    let totalFieldsRecommended = formData.length * recommendedFields.length
    
    let completedRequired = 0
    let completedRecommended = 0
    
    formData.forEach(job => {
      // Count required fields
      requiredFields.forEach(field => {
        if (job[field as keyof WorkExperience]?.toString().trim()) {
          completedRequired++
        }
      })
      
      // Count recommended fields
      if (job.location?.trim()) completedRecommended++
      if (job.achievements && job.achievements.length > 0 && job.achievements[0]?.trim()) {
        completedRecommended++
      }
    })
    
    // Required fields worth 70%, recommended worth 30%
    const requiredScore = totalFieldsRequired > 0 ? (completedRequired / totalFieldsRequired) * 70 : 0
    const recommendedScore = totalFieldsRecommended > 0 ? (completedRecommended / totalFieldsRecommended) * 30 : 0
    
    setCompletionScore(Math.round(requiredScore + recommendedScore))
  }, [formData])

  const createEmptyJob = (): WorkExperience => ({
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: '',
    location: '',
    achievements: [''],
    technologies: [],
    isCurrentRole: false
  })

  const validateJobField = (jobId: string, field: string, value: any): string => {
    switch (field) {
      case 'jobTitle':
      case 'company':
        if (!value?.toString().trim()) {
          return `${field === 'jobTitle' ? 'Job title' : 'Company'} is required`
        }
        break
      case 'startDate':
        if (!value?.toString().trim()) {
          return 'Start date is required'
        }
        if (value && !/^\d{4}-\d{2}$/.test(value)) {
          return 'Please use YYYY-MM format'
        }
        break
      case 'endDate':
        if (value && value !== 'present' && !/^\d{4}-\d{2}$/.test(value)) {
          return 'Please use YYYY-MM format or "present"'
        }
        // Validate end date is after start date
        const job = formData.find(j => j.id === jobId)
        if (job && job.startDate && value && value !== 'present') {
          const startDate = new Date(job.startDate + '-01')
          const endDate = new Date(value + '-01')
          if (endDate <= startDate) {
            return 'End date must be after start date'
          }
        }
        break
    }
    return ''
  }

  const handleJobChange = (jobId: string, field: string, value: any) => {
    const updatedData = formData.map(job => {
      if (job.id === jobId) {
        const updatedJob = { ...job, [field]: value }
        
        // Handle current role toggle
        if (field === 'isCurrentRole' && value) {
          updatedJob.endDate = 'present'
        } else if (field === 'isCurrentRole' && !value && job.endDate === 'present') {
          updatedJob.endDate = ''
        }
        
        return updatedJob
      }
      return job
    })
    
    setFormData(updatedData)
    
    // Validate field
    const error = validateJobField(jobId, field, value)
    setErrors(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [field]: error
      }
    }))
    
    onChange(updatedData)
  }

  const handleAchievementChange = (jobId: string, index: number, value: string) => {
    const updatedData = formData.map(job => {
      if (job.id === jobId) {
        const newAchievements = [...job.achievements]
        newAchievements[index] = value
        return { ...job, achievements: newAchievements }
      }
      return job
    })
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  const addAchievement = (jobId: string) => {
    handleJobChange(jobId, 'achievements', [...(formData.find(j => j.id === jobId)?.achievements || []), ''])
  }

  const removeAchievement = (jobId: string, index: number) => {
    const job = formData.find(j => j.id === jobId)
    if (job && job.achievements.length > 1) {
      const newAchievements = job.achievements.filter((_, i) => i !== index)
      handleJobChange(jobId, 'achievements', newAchievements)
    }
  }

  const addJob = () => {
    const newJob = createEmptyJob()
    const updatedData = [...formData, newJob]
    setFormData(updatedData)
    onChange(updatedData)
  }

  const removeJob = (jobId: string) => {
    if (formData.length > 1) {
      const updatedData = formData.filter(job => job.id !== jobId)
      setFormData(updatedData)
      onChange(updatedData)
      
      // Clean up errors for removed job
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[jobId]
        return newErrors
      })
    }
  }

  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr || dateStr === 'present') return ''
    // Ensure YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr
    if (/^\d{4}$/.test(dateStr)) return dateStr + '-01'
    return ''
  }

  const getCompletionColor = (): string => {
    if (completionScore >= 90) return 'text-green-400'
    if (completionScore >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const isFieldRequired = (field: string): boolean => {
    return ['jobTitle', 'company', 'startDate'].includes(field)
  }

  return (
    <Card className={`glass-card border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-400" />
            Work Experience
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${getCompletionColor()} border-current`}
            >
              {completionScore}% Complete
            </Badge>
            {completionScore >= 90 && (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {formData.map((job, jobIndex) => (
          <div key={job.id} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
            {/* Job Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Job {jobIndex + 1}
              </h4>
              {formData.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJob(job.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Job Title & Company - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-1">
                  Job Title
                  {isFieldRequired('jobTitle') && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  value={job.jobTitle}
                  onChange={(e) => handleJobChange(job.id, 'jobTitle', e.target.value)}
                  placeholder="Software Engineer"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                />
                {errors[job.id]?.jobTitle && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[job.id].jobTitle}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-1">
                  Company
                  {isFieldRequired('company') && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  value={job.company}
                  onChange={(e) => handleJobChange(job.id, 'company', e.target.value)}
                  placeholder="TechCorp Inc."
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                />
                {errors[job.id]?.company && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[job.id].company}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-white font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Location
              </Label>
              <Input
                value={job.location}
                onChange={(e) => handleJobChange(job.id, 'location', e.target.value)}
                placeholder="San Francisco, CA"
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
              />
            </div>

            {/* Dates & Current Role */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Start Date
                    {isFieldRequired('startDate') && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    type="month"
                    value={formatDateForInput(job.startDate)}
                    onChange={(e) => handleJobChange(job.id, 'startDate', e.target.value)}
                    className="bg-white/5 border-white/20 text-white focus:border-primary-400"
                  />
                  {errors[job.id]?.startDate && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors[job.id].startDate}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    End Date
                  </Label>
                  {job.isCurrentRole ? (
                    <div className="h-10 bg-white/5 border border-white/20 rounded-md flex items-center px-3">
                      <span className="text-green-400">Present</span>
                    </div>
                  ) : (
                    <Input
                      type="month"
                      value={formatDateForInput(job.endDate)}
                      onChange={(e) => handleJobChange(job.id, 'endDate', e.target.value)}
                      className="bg-white/5 border-white/20 text-white focus:border-primary-400"
                    />
                  )}
                  {errors[job.id]?.endDate && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors[job.id].endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Current Role Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`current-role-${job.id}`}
                  checked={job.isCurrentRole}
                  onChange={(e) => handleJobChange(job.id, 'isCurrentRole', e.target.checked)}
                  className="w-4 h-4 text-primary-400 bg-white/5 border-white/20 rounded focus:ring-primary-400"
                />
                <Label htmlFor={`current-role-${job.id}`} className="text-white text-sm">
                  This is my current role
                </Label>
              </div>
            </div>

            {/* Key Achievements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400" />
                  Key Achievements
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addAchievement(job.id)}
                  className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {job.achievements.map((achievement, achievementIndex) => (
                <div key={achievementIndex} className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={achievement}
                      onChange={(e) => handleAchievementChange(job.id, achievementIndex, e.target.value)}
                      placeholder="• Increased team productivity by 30% through implementation of automated testing workflows"
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[60px]"
                      rows={2}
                    />
                  </div>
                  {job.achievements.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAchievement(job.id, achievementIndex)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 self-start mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Technologies Used */}
            <div className="space-y-2">
              <Label className="text-white font-medium flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                Technologies & Tools Used
              </Label>
              <Input
                value={job.technologies.join(', ')}
                onChange={(e) => handleJobChange(job.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="React, TypeScript, Node.js, PostgreSQL, AWS"
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
              />
              <p className="text-xs text-slate-400">
                Separate technologies with commas. This helps with ATS keyword matching.
              </p>
            </div>
          </div>
        ))}

        {/* Add New Job Button */}
        <Button
          onClick={addJob}
          variant="outline"
          className="w-full border-dashed border-white/30 text-white hover:bg-white/5 hover:border-primary-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Job
        </Button>

        {/* Completion Tips */}
        {completionScore < 100 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>Pro Tip:</strong> 
              {completionScore < 50 && " Fill in all required fields (marked with red asterisks) for each job."}
              {completionScore >= 50 && completionScore < 80 && " Add specific achievements with metrics (numbers, percentages) to stand out."}
              {completionScore >= 80 && " Include technologies used to improve ATS keyword matching."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}