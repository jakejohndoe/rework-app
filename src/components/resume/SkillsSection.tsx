import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  Cpu, 
  Wrench, 
  Users, 
  Award, 
  Globe,
  Plus, 
  X,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from "lucide-react"
import { SkillsStructure } from "@/types/resume"

interface SkillsSectionProps {
  skills: SkillsStructure | null | undefined
  onChange: (skills: SkillsStructure) => void
  className?: string
}

interface SkillCategory {
  key: keyof SkillsStructure
  label: string
  icon: React.ElementType
  color: string
  placeholder: string
  description: string
  priority: 'high' | 'medium' | 'optional'
}

const skillCategories: SkillCategory[] = [
  {
    key: 'technical',
    label: 'Core Job Skills',
    icon: Zap,
    color: 'text-blue-400',
    placeholder: 'Customer Service, Sales, Project Management, Data Analysis, Marketing',
    description: 'Main skills required for your target role',
    priority: 'high'
  },
  {
    key: 'tools',
    label: 'Software & Tools',
    icon: Wrench,
    color: 'text-orange-400',
    placeholder: 'Microsoft Office, Salesforce, Excel, SAP, QuickBooks, Photoshop',
    description: 'Software, tools, and systems you use',
    priority: 'high'
  },
  {
    key: 'soft',
    label: 'Soft Skills',
    icon: Users,
    color: 'text-pink-400',
    placeholder: 'Leadership, Communication, Problem Solving, Team Collaboration, Time Management',
    description: 'Interpersonal and personal effectiveness skills',
    priority: 'medium'
  },
  {
    key: 'certifications',
    label: 'Certifications & Licenses',
    icon: Award,
    color: 'text-yellow-400',
    placeholder: 'PMP, Real Estate License, CPA, First Aid, Forklift Certified',
    description: 'Professional certifications, licenses, and credentials',
    priority: 'medium'
  },
  {
    key: 'frameworks',
    label: 'Industry Knowledge',
    icon: Cpu,
    color: 'text-green-400',
    placeholder: 'Healthcare Regulations, OSHA Safety, Retail Operations, Financial Planning',
    description: 'Industry-specific knowledge and methodologies',
    priority: 'optional'
  },
  {
    key: 'databases',
    label: 'Languages',
    icon: Globe,
    color: 'text-purple-400',
    placeholder: 'English, Spanish, French, Mandarin, American Sign Language',
    description: 'Languages you speak (include proficiency level)',
    priority: 'optional'
  }
]

export default function SkillsSection({ skills, onChange, className = "" }: SkillsSectionProps) {
  const [formData, setFormData] = useState<SkillsStructure>({
    technical: [],    // Core Job Skills
    frameworks: [],   // Industry Knowledge  
    tools: [],        // Software & Tools
    cloud: [],        // Not used in generic version
    databases: [],    // Languages
    soft: [],         // Soft Skills
    certifications: [] // Certifications & Licenses
  })
  
  const [newSkillInputs, setNewSkillInputs] = useState<{ [key: string]: string }>({})
  const [completionScore, setCompletionScore] = useState(0)

  // Initialize form data when skills prop changes
  useEffect(() => {
    if (skills) {
      setFormData(skills)
    }
  }, [skills])

  // Calculate completion score
  useEffect(() => {
    const coreCategories = ['technical', 'tools'] // Most important for any job
    const recommendedCategories = ['soft', 'certifications']
    const optionalCategories = ['frameworks', 'databases']
    
    const coreComplete = coreCategories.filter(cat => 
      formData[cat as keyof SkillsStructure].length > 0
    ).length
    
    const recommendedComplete = recommendedCategories.filter(cat => 
      formData[cat as keyof SkillsStructure].length > 0
    ).length
    
    const optionalComplete = optionalCategories.filter(cat => 
      formData[cat as keyof SkillsStructure].length > 0
    ).length
    
    // Core worth 50%, recommended 30%, optional 20%
    const coreScore = (coreComplete / coreCategories.length) * 50
    const recommendedScore = (recommendedComplete / recommendedCategories.length) * 30
    const optionalScore = (optionalComplete / optionalCategories.length) * 20
    
    setCompletionScore(Math.round(coreScore + recommendedScore + optionalScore))
  }, [formData])

  const addSkill = (category: keyof SkillsStructure, skill: string) => {
    if (!skill.trim()) return
    
    // Clean up the skill text
    const cleanSkill = skill.trim()
    
    // Avoid duplicates
    if (formData[category].includes(cleanSkill)) {
      setNewSkillInputs(prev => ({ ...prev, [category]: '' }))
      return
    }
    
    const updatedData = {
      ...formData,
      [category]: [...formData[category], cleanSkill]
    }
    
    setFormData(updatedData)
    onChange(updatedData)
    
    // Clear input
    setNewSkillInputs(prev => ({ ...prev, [category]: '' }))
  }

  const removeSkill = (category: keyof SkillsStructure, index: number) => {
    const updatedData = {
      ...formData,
      [category]: formData[category].filter((_, i) => i !== index)
    }
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  const handleInputChange = (category: keyof SkillsStructure, value: string) => {
    setNewSkillInputs(prev => ({ ...prev, [category]: value }))
  }

  const handleKeyPress = (category: keyof SkillsStructure, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const skill = newSkillInputs[category] || ''
      if (skill.trim()) {
        addSkill(category, skill)
      }
    }
  }

  const addMultipleSkills = (category: keyof SkillsStructure, skillsString: string) => {
    const skills = skillsString
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .filter(skill => !formData[category].includes(skill)) // Avoid duplicates
    
    if (skills.length > 0) {
      const updatedData = {
        ...formData,
        [category]: [...formData[category], ...skills]
      }
      
      setFormData(updatedData)
      onChange(updatedData)
      setNewSkillInputs(prev => ({ ...prev, [category]: '' }))
    }
  }

  const getCompletionColor = (): string => {
    if (completionScore >= 90) return 'text-green-400'
    if (completionScore >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'optional'): string => {
    switch (priority) {
      case 'high': return 'border-green-400/30 bg-green-500/5'
      case 'medium': return 'border-yellow-400/30 bg-yellow-500/5'
      default: return 'border-white/10 bg-white/5'
    }
  }

  const getPriorityBadge = (priority: 'high' | 'medium' | 'optional') => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="text-xs text-green-400 border-green-400/50">Essential</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/50">Recommended</Badge>
      default:
        return null
    }
  }

  return (
    <Card className={`glass-card border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-400" />
            Skills & Abilities
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
        {skillCategories.map((category) => {
          const IconComponent = category.icon
          
          return (
            <div 
              key={category.key} 
              className={`p-4 rounded-lg border ${getPriorityColor(category.priority)} space-y-3`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${category.color}`} />
                  <Label className="text-white font-medium">
                    {category.label}
                  </Label>
                  {getPriorityBadge(category.priority)}
                </div>
                <span className="text-xs text-slate-400">
                  {formData[category.key].length} {formData[category.key].length === 1 ? 'skill' : 'skills'}
                </span>
              </div>

              {/* Category Description */}
              <p className="text-xs text-slate-400">{category.description}</p>

              {/* Skills Display */}
              {formData[category.key].length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData[category.key].map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-white/10 text-white hover:bg-white/15 group cursor-pointer"
                    >
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(category.key, index)}
                        className="ml-1 p-0 h-auto w-auto text-white/60 hover:text-red-400 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add Skills Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newSkillInputs[category.key] || ''}
                    onChange={(e) => handleInputChange(category.key, e.target.value)}
                    onKeyDown={(e) => handleKeyPress(category.key, e)}
                    placeholder={category.placeholder}
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                  />
                  <Button
                    onClick={() => {
                      const skill = newSkillInputs[category.key] || ''
                      if (skill.trim()) {
                        if (skill.includes(',')) {
                          addMultipleSkills(category.key, skill)
                        } else {
                          addSkill(category.key, skill)
                        }
                      }
                    }}
                    disabled={!newSkillInputs[category.key]?.trim()}
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Bulk Add Helper */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Lightbulb className="w-3 h-3" />
                  <span>
                    Press Enter to add a skill, or separate multiple skills with commas
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* General Tips */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg space-y-2">
          <h4 className="text-blue-300 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Tips for All Job Types
          </h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Use keywords from the job description (copy exact terms when possible)</li>
            <li>• Include both technical and soft skills relevant to your field</li>
            <li>• Be specific (e.g., "Microsoft Excel Advanced" not just "Excel")</li>
            <li>• Include industry-standard certifications and licenses</li>
          </ul>
        </div>

        {/* Completion Guidance */}
        {completionScore < 100 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
            <p className="text-green-300 text-sm">
              <strong>Next Steps:</strong> 
              {completionScore < 30 && " Start with Core Job Skills and Software & Tools - these are essential for any role."}
              {completionScore >= 30 && completionScore < 60 && " Add your Soft Skills and any Certifications to strengthen your profile."}
              {completionScore >= 60 && " Consider adding Industry Knowledge and Languages if relevant to your target role."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}