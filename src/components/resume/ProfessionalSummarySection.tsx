import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Target, 
  Zap, 
  TrendingUp,
  Plus, 
  X,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from "lucide-react"
import { ProfessionalSummary } from "@/types/resume"

interface ProfessionalSummarySectionProps {
  professionalSummary: ProfessionalSummary | null | undefined
  onChange: (summary: ProfessionalSummary) => void
  className?: string
}

interface ValidationErrors {
  [field: string]: string
}

const careerLevels = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-7 years)' },
  { value: 'senior', label: 'Senior Level (8-15 years)' },
  { value: 'executive', label: 'Executive Level (15+ years)' }
]

export default function ProfessionalSummarySection({ professionalSummary, onChange, className = "" }: ProfessionalSummarySectionProps) {
  const [formData, setFormData] = useState<ProfessionalSummary>({
    summary: '',
    targetRole: '',
    keyStrengths: [],
    careerLevel: 'mid'
  })
  
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [completionScore, setCompletionScore] = useState(0)

  // Initialize form data when professionalSummary prop changes
  useEffect(() => {
    if (professionalSummary) {
      setFormData(professionalSummary)
    }
  }, [professionalSummary])

  // Calculate completion score
  useEffect(() => {
    let score = 0
    
    // Summary text (most important) - 50%
    if (formData.summary.trim().length > 50) {
      score += 50
    } else if (formData.summary.trim().length > 20) {
      score += 25
    }
    
    // Target role - 25%
    if (formData.targetRole?.trim()) {
      score += 25
    }
    
    // Career level - 10% (should always be set)
    if (formData.careerLevel) {
      score += 10
    }
    
    // Key strengths - 15%
    if (formData.keyStrengths.length >= 3) {
      score += 15
    } else if (formData.keyStrengths.length >= 1) {
      score += 8
    }
    
    setCompletionScore(score)
  }, [formData])

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'summary':
        if (!value?.toString().trim()) {
          return 'Professional summary is required'
        }
        if (value.toString().trim().length < 20) {
          return 'Summary should be at least 20 characters'
        }
        break
      case 'targetRole':
        // Optional field, no validation needed
        break
    }
    return ''
  }

  const handleFieldChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    
    // Validate field
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
    
    onChange(updatedData)
  }

  const addStrength = (strength: string) => {
    if (!strength.trim()) return
    
    const cleanStrength = strength.trim()
    
    // Avoid duplicates
    if (formData.keyStrengths.includes(cleanStrength)) {
      return
    }
    
    const updatedData = {
      ...formData,
      keyStrengths: [...formData.keyStrengths, cleanStrength]
    }
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  const removeStrength = (index: number) => {
    const updatedData = {
      ...formData,
      keyStrengths: formData.keyStrengths.filter((_, i) => i !== index)
    }
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  const addMultipleStrengths = (strengthsString: string) => {
    const strengths = strengthsString
      .split(',')
      .map(strength => strength.trim())
      .filter(strength => strength.length > 0)
      .filter(strength => !formData.keyStrengths.includes(strength)) // Avoid duplicates
    
    if (strengths.length > 0) {
      const updatedData = {
        ...formData,
        keyStrengths: [...formData.keyStrengths, ...strengths]
      }
      
      setFormData(updatedData)
      onChange(updatedData)
    }
  }

  const getCompletionColor = (): string => {
    if (completionScore >= 90) return 'text-green-400'
    if (completionScore >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const isFieldRequired = (field: string): boolean => {
    return field === 'summary'
  }

  return (
    <Card className={`glass-card border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-400" />
            Professional Summary
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-red-400/30 text-red-300">Required</Badge>
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
        {/* Target Role & Career Level */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Target Role
            </Label>
            <Input
              value={formData.targetRole || ''}
              onChange={(e) => handleFieldChange('targetRole', e.target.value)}
              placeholder="Software Engineer, Marketing Manager, Nurse, etc."
              className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
            />
            <p className="text-xs text-slate-400">
              The specific role or position you're seeking
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Career Level
            </Label>
            <Select
              value={formData.careerLevel}
              onValueChange={(value: 'entry' | 'mid' | 'senior' | 'executive') => handleFieldChange('careerLevel', value)}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-primary-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {careerLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Strengths */}
        <div className="space-y-3">
          <Label className="text-white font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Key Strengths
          </Label>

          {/* Display existing strengths */}
          {formData.keyStrengths.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.keyStrengths.map((strength, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-white/10 text-white hover:bg-white/15 group cursor-pointer"
                >
                  {strength}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStrength(index)}
                    className="ml-1 p-0 h-auto w-auto text-white/60 hover:text-red-400 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add strengths input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Problem Solving, Team Leadership, Data Analysis, Customer Service"
                className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    const value = input.value.trim()
                    if (value) {
                      if (value.includes(',')) {
                        addMultipleStrengths(value)
                      } else {
                        addStrength(value)
                      }
                      input.value = ''
                    }
                  }
                }}
              />
              <Button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).closest('.flex')?.querySelector('input') as HTMLInputElement
                  const value = input?.value.trim()
                  if (value) {
                    if (value.includes(',')) {
                      addMultipleStrengths(value)
                    } else {
                      addStrength(value)
                    }
                    input.value = ''
                  }
                }}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lightbulb className="w-3 h-3" />
              <span>
                Add 3-5 core strengths that differentiate you. Press Enter or separate with commas.
              </span>
            </div>
          </div>
        </div>

        {/* Professional Summary Text */}
        <div className="space-y-3">
          <Label className="text-white font-medium flex items-center gap-1">
            Summary Statement
            {isFieldRequired('summary') && <span className="text-red-400">*</span>}
          </Label>
          <Textarea
            value={formData.summary}
            onChange={(e) => handleFieldChange('summary', e.target.value)}
            placeholder="Write a compelling 2-3 sentence summary that combines your target role, career level, and key strengths. Example: 'Experienced Marketing Manager with 8+ years driving digital campaigns and team leadership. Proven track record in data analysis and customer acquisition, with expertise in problem-solving and strategic planning. Seeking to leverage strong analytical skills and leadership experience in a Senior Marketing role.'"
            className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400 min-h-[120px]"
          />
          {errors.summary && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.summary}
            </p>
          )}
          <p className="text-xs text-slate-400">
            {formData.summary.length}/500 characters • Aim for 2-3 compelling sentences
          </p>
        </div>

        {/* Writing Tips */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg space-y-2">
          <h4 className="text-blue-300 font-medium flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Writing Tips
          </h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Start with your target role and experience level</li>
            <li>• Include 2-3 specific achievements or skills</li>
            <li>• End with what you're seeking or your career goal</li>
            <li>• Use active voice and strong action words</li>
            <li>• Avoid generic phrases like "hard worker" or "team player"</li>
          </ul>
        </div>

        {/* Completion Guidance */}
        {completionScore < 100 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
            <p className="text-green-300 text-sm">
              <strong>Next Steps:</strong> 
              {completionScore < 30 && " Write a compelling summary statement describing your professional background and goals."}
              {completionScore >= 30 && completionScore < 60 && " Add your target role and 3-5 key strengths to improve job matching."}
              {completionScore >= 60 && " Refine your summary to be more specific and compelling to stand out to employers."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}