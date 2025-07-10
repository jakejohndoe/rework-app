import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  GraduationCap, 
  School, 
  Calendar, 
  Award, 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  X,
  Lightbulb
} from "lucide-react"
import { Education } from "@/types/resume"

interface EducationSectionProps {
  education: Education[] | null | undefined
  onChange: (education: Education[]) => void
  className?: string
}

interface ValidationErrors {
  [educationId: string]: {
    [field: string]: string
  }
}

const degreeOptions = [
  "High School Diploma",
  "GED",
  "Certificate",
  "Associate Degree",
  "Bachelor's Degree", 
  "Bachelor of Arts",
  "Bachelor of Science",
  "Master's Degree",
  "Master of Arts", 
  "Master of Science",
  "MBA",
  "Doctorate",
  "PhD",
  "Professional Degree",
  "Trade Certification",
  "Other"
]

export default function EducationSection({ education, onChange, className = "" }: EducationSectionProps) {
  const [formData, setFormData] = useState<Education[]>([])
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [completionScore, setCompletionScore] = useState(0)

  // Initialize form data when education prop changes
  useEffect(() => {
    if (education && education.length > 0) {
      setFormData(education)
    } else {
      // Initialize with one empty education entry
      setFormData([createEmptyEducation()])
    }
  }, [education])

  // Calculate completion score
  useEffect(() => {
    if (formData.length === 0) {
      setCompletionScore(0)
      return
    }

    const requiredFields = ['degree', 'field', 'institution', 'graduationYear']
    const recommendedFields = ['gpa', 'honors']
    
    let totalFieldsRequired = formData.length * requiredFields.length
    let totalFieldsRecommended = formData.length * recommendedFields.length
    
    let completedRequired = 0
    let completedRecommended = 0
    
    formData.forEach(edu => {
      // Count required fields
      requiredFields.forEach(field => {
        if (edu[field as keyof Education]?.toString().trim()) {
          completedRequired++
        }
      })
      
      // Count recommended fields
      if (edu.gpa?.trim()) completedRecommended++
      if (edu.honors && edu.honors.length > 0 && edu.honors[0]?.trim()) {
        completedRecommended++
      }
    })
    
    // Required fields worth 80%, recommended worth 20%
    const requiredScore = totalFieldsRequired > 0 ? (completedRequired / totalFieldsRequired) * 80 : 0
    const recommendedScore = totalFieldsRecommended > 0 ? (completedRecommended / totalFieldsRecommended) * 20 : 0
    
    setCompletionScore(Math.round(requiredScore + recommendedScore))
  }, [formData])

  const createEmptyEducation = (): Education => ({
    id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    degree: '',
    field: '',
    institution: '',
    graduationYear: '',
    gpa: '',
    honors: [],
    relevantCoursework: []
  })

  const validateEducationField = (eduId: string, field: string, value: any): string => {
    switch (field) {
      case 'degree':
      case 'field':
      case 'institution':
        if (!value?.toString().trim()) {
          const fieldName = field === 'field' ? 'Field of study' : field.charAt(0).toUpperCase() + field.slice(1)
          return `${fieldName} is required`
        }
        break
      case 'graduationYear':
        if (!value?.toString().trim()) {
          return 'Graduation year is required'
        }
        const year = parseInt(value.toString())
        const currentYear = new Date().getFullYear()
        if (isNaN(year) || year < 1950 || year > currentYear + 10) {
          return 'Please enter a valid year'
        }
        break
      case 'gpa':
        if (value?.toString().trim()) {
          const gpa = parseFloat(value.toString())
          if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
            return 'GPA must be between 0.0 and 4.0'
          }
        }
        break
    }
    return ''
  }

  const handleEducationChange = (eduId: string, field: string, value: any) => {
    const updatedData = formData.map(edu => {
      if (edu.id === eduId) {
        return { ...edu, [field]: value }
      }
      return edu
    })
    
    setFormData(updatedData)
    
    // Validate field
    const error = validateEducationField(eduId, field, value)
    setErrors(prev => ({
      ...prev,
      [eduId]: {
        ...prev[eduId],
        [field]: error
      }
    }))
    
    onChange(updatedData)
  }

  const addHonor = (eduId: string, honor: string) => {
    if (!honor.trim()) return
    
    const updatedData = formData.map(edu => {
      if (edu.id === eduId) {
        const cleanHonor = honor.trim()
        if (!edu.honors?.includes(cleanHonor)) {
          return { ...edu, honors: [...(edu.honors || []), cleanHonor] }
        }
      }
      return edu
    })
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  // 🔧 NEW: Fixed function for multiple honors (single state update)
  const addMultipleHonors = (eduId: string, honorsString: string) => {
    const honors = honorsString
      .split(',')
      .map(honor => honor.trim())
      .filter(honor => honor.length > 0)
    
    if (honors.length === 0) return
    
    const updatedData = formData.map(edu => {
      if (edu.id === eduId) {
        const existingHonors = edu.honors || []
        const newHonors = honors.filter(honor => !existingHonors.includes(honor))
        
        if (newHonors.length > 0) {
          return { 
            ...edu, 
            honors: [...existingHonors, ...newHonors] // 🔧 Single state update
          }
        }
      }
      return edu
    })
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  const removeHonor = (eduId: string, index: number) => {
    const updatedData = formData.map(edu => {
      if (edu.id === eduId) {
        return { ...edu, honors: edu.honors?.filter((_, i) => i !== index) || [] }
      }
      return edu
    })
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  const addCoursework = (eduId: string, course: string) => {
    if (!course.trim()) return
    
    const updatedData = formData.map(edu => {
      if (edu.id === eduId) {
        const cleanCourse = course.trim()
        if (!edu.relevantCoursework?.includes(cleanCourse)) {
          return { ...edu, relevantCoursework: [...(edu.relevantCoursework || []), cleanCourse] }
        }
      }
      return edu
    })
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  // 🔧 NEW: Fixed function for multiple coursework (single state update)
  const addMultipleCoursework = (eduId: string, courseworkString: string) => {
    const courses = courseworkString
      .split(',')
      .map(course => course.trim())
      .filter(course => course.length > 0)
    
    if (courses.length === 0) return
    
    const updatedData = formData.map(edu => {
      if (edu.id === eduId) {
        const existingCoursework = edu.relevantCoursework || []
        const newCoursework = courses.filter(course => !existingCoursework.includes(course))
        
        if (newCoursework.length > 0) {
          return { 
            ...edu, 
            relevantCoursework: [...existingCoursework, ...newCoursework] // 🔧 Single state update
          }
        }
      }
      return edu
    })
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  const removeCoursework = (eduId: string, index: number) => {
    const updatedData = formData.map(edu => {
      if (edu.id === eduId) {
        return { ...edu, relevantCoursework: edu.relevantCoursework?.filter((_, i) => i !== index) || [] }
      }
      return edu
    })
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  const addEducation = () => {
    const newEducation = createEmptyEducation()
    const updatedData = [...formData, newEducation]
    setFormData(updatedData)
    onChange(updatedData)
  }

  const removeEducation = (eduId: string) => {
    if (formData.length > 1) {
      const updatedData = formData.filter(edu => edu.id !== eduId)
      setFormData(updatedData)
      onChange(updatedData)
      
      // Clean up errors for removed education
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[eduId]
        return newErrors
      })
    }
  }

  const getCompletionColor = (): string => {
    if (completionScore >= 90) return 'text-green-400'
    if (completionScore >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const isFieldRequired = (field: string): boolean => {
    return ['degree', 'field', 'institution', 'graduationYear'].includes(field)
  }

  return (
    <Card className={`glass-card border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-400" />
            Education
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
        {formData.map((edu, eduIndex) => (
          <div key={edu.id} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
            {/* Education Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium flex items-center gap-2">
                <School className="w-4 h-4 text-blue-400" />
                Education {eduIndex + 1}
              </h4>
              {formData.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(edu.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Degree & Field of Study */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-1">
                  Degree
                  {isFieldRequired('degree') && <span className="text-red-400">*</span>}
                </Label>
                <Select
                  value={edu.degree}
                  onValueChange={(value) => handleEducationChange(edu.id, 'degree', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-primary-400">
                    <SelectValue placeholder="Select degree type" />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeOptions.map((degree) => (
                      <SelectItem key={degree} value={degree}>
                        {degree}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[edu.id]?.degree && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[edu.id].degree}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-1">
                  Field of Study
                  {isFieldRequired('field') && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  value={edu.field}
                  onChange={(e) => handleEducationChange(edu.id, 'field', e.target.value)}
                  placeholder="Computer Science, Business, Nursing, etc."
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                />
                {errors[edu.id]?.field && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[edu.id].field}
                  </p>
                )}
              </div>
            </div>

            {/* Institution */}
            <div className="space-y-2">
              <Label className="text-white font-medium flex items-center gap-1">
                Institution
                {isFieldRequired('institution') && <span className="text-red-400">*</span>}
              </Label>
              <Input
                value={edu.institution}
                onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                placeholder="University of California, Community College, Trade School, etc."
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
              />
              {errors[edu.id]?.institution && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors[edu.id].institution}
                </p>
              )}
            </div>

            {/* Graduation Year & GPA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  Graduation Year
                  {isFieldRequired('graduationYear') && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  type="number"
                  value={edu.graduationYear}
                  onChange={(e) => handleEducationChange(edu.id, 'graduationYear', e.target.value)}
                  placeholder="2024"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                />
                {errors[edu.id]?.graduationYear && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[edu.id].graduationYear}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  GPA (Optional)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={edu.gpa}
                  onChange={(e) => handleEducationChange(edu.id, 'gpa', e.target.value)}
                  placeholder="3.8"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                />
                <p className="text-xs text-slate-400">
                  Only include if 3.5+ and relevant to the role
                </p>
                {errors[edu.id]?.gpa && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[edu.id].gpa}
                  </p>
                )}
              </div>
            </div>

            {/* Honors & Awards */}
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Honors & Awards
              </Label>

              {/* Display existing honors */}
              {edu.honors && edu.honors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {edu.honors.map((honor, honorIndex) => (
                    <Badge
                      key={honorIndex}
                      variant="secondary"
                      className="bg-white/10 text-white hover:bg-white/15 group cursor-pointer"
                    >
                      {honor}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHonor(edu.id, honorIndex)}
                        className="ml-1 p-0 h-auto w-auto text-white/60 hover:text-red-400 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add honors input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Magna Cum Laude, Dean's List, Phi Beta Kappa, Scholarship Recipient"
                  className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      const value = input.value.trim()
                      if (value) {
                        // 🔧 FIXED: Use single state update for multiple honors
                        if (value.includes(',')) {
                          addMultipleHonors(edu.id, value)
                        } else {
                          addHonor(edu.id, value)
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
                      // 🔧 FIXED: Use single state update for multiple honors
                      if (value.includes(',')) {
                        addMultipleHonors(edu.id, value)
                      } else {
                        addHonor(edu.id, value)
                      }
                      input.value = ''
                    }
                  }}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Relevant Coursework */}
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Relevant Coursework (Optional)
              </Label>

              {/* Display existing coursework */}
              {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {edu.relevantCoursework.map((course, courseIndex) => (
                    <Badge
                      key={courseIndex}
                      variant="secondary"
                      className="bg-white/10 text-white hover:bg-white/15 group cursor-pointer"
                    >
                      {course}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCoursework(edu.id, courseIndex)}
                        className="ml-1 p-0 h-auto w-auto text-white/60 hover:text-red-400 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add coursework input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Data Structures, Marketing Strategy, Human Anatomy, Financial Accounting"
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        const value = input.value.trim()
                        if (value) {
                          // 🔧 FIXED: Use single state update for multiple courses
                          if (value.includes(',')) {
                            addMultipleCoursework(edu.id, value)
                          } else {
                            addCoursework(edu.id, value)
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
                        // 🔧 FIXED: Use single state update for multiple courses
                        if (value.includes(',')) {
                          addMultipleCoursework(edu.id, value)
                        } else {
                          addCoursework(edu.id, value)
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
                    Include courses relevant to your target job. Press Enter or separate with commas.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Education Button */}
        <Button
          onClick={addEducation}
          variant="outline"
          className="w-full border-dashed border-white/30 text-white hover:bg-white/5 hover:border-primary-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Education
        </Button>

        {/* Completion Tips */}
        {completionScore < 100 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>Pro Tip:</strong> 
              {completionScore < 50 && " Fill in all required fields for each education entry to get started."}
              {completionScore >= 50 && completionScore < 80 && " Add your GPA if it's 3.5+ and relevant honors to strengthen your profile."}
              {completionScore >= 80 && " Consider adding relevant coursework that matches your target job requirements."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}