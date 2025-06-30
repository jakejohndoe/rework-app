import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Code, 
  Cpu, 
  Wrench, 
  Cloud, 
  Database, 
  Users, 
  Award, 
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
}

const skillCategories: SkillCategory[] = [
  {
    key: 'technical',
    label: 'Programming Languages',
    icon: Code,
    color: 'text-blue-400',
    placeholder: 'JavaScript, Python, Java, TypeScript, Go',
    description: 'Programming languages you use regularly'
  },
  {
    key: 'frameworks',
    label: 'Frameworks & Libraries',
    icon: Cpu,
    color: 'text-green-400',
    placeholder: 'React, Angular, Vue.js, Express.js, Django',
    description: 'Web frameworks and libraries you\'re proficient with'
  },
  {
    key: 'tools',
    label: 'Development Tools',
    icon: Wrench,
    color: 'text-orange-400',
    placeholder: 'Git, Docker, Kubernetes, Jenkins, Jira',
    description: 'Development and project management tools'
  },
  {
    key: 'cloud',
    label: 'Cloud Platforms',
    icon: Cloud,
    color: 'text-cyan-400',
    placeholder: 'AWS, Azure, Google Cloud, Heroku, Vercel',
    description: 'Cloud services and deployment platforms'
  },
  {
    key: 'databases',
    label: 'Databases',
    icon: Database,
    color: 'text-purple-400',
    placeholder: 'PostgreSQL, MongoDB, MySQL, Redis, Elasticsearch',
    description: 'Database technologies and data storage solutions'
  },
  {
    key: 'soft',
    label: 'Soft Skills',
    icon: Users,
    color: 'text-pink-400',
    placeholder: 'Leadership, Communication, Problem Solving, Team Collaboration',
    description: 'Interpersonal and leadership abilities'
  },
  {
    key: 'certifications',
    label: 'Certifications',
    icon: Award,
    color: 'text-yellow-400',
    placeholder: 'AWS Certified Solutions Architect, PMP, Scrum Master',
    description: 'Professional certifications and credentials'
  }
]

export default function SkillsSection({ skills, onChange, className = "" }: SkillsSectionProps) {
  const [formData, setFormData] = useState<SkillsStructure>({
    technical: [],
    frameworks: [],
    tools: [],
    cloud: [],
    databases: [],
    soft: [],
    certifications: []
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
    const coreCategories = ['technical', 'frameworks', 'tools'] // Most important for ATS
    const optionalCategories = ['cloud', 'databases', 'soft', 'certifications']
    
    const coreComplete = coreCategories.filter(cat => 
      formData[cat as keyof SkillsStructure].length > 0
    ).length
    
    const optionalComplete = optionalCategories.filter(cat => 
      formData[cat as keyof SkillsStructure].length > 0
    ).length
    
    // Core categories worth 70%, optional worth 30%
    const coreScore = (coreComplete / coreCategories.length) * 70
    const optionalScore = (optionalComplete / optionalCategories.length) * 30
    
    setCompletionScore(Math.round(coreScore + optionalScore))
  }, [formData])

  const addSkill = (category: keyof SkillsStructure, skill: string) => {
    if (!skill.trim()) return
    
    const updatedData = {
      ...formData,
      [category]: [...formData[category], skill.trim()]
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
      addSkill(category, skill)
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
    }
  }

  const getCompletionColor = (): string => {
    if (completionScore >= 90) return 'text-green-400'
    if (completionScore >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getCategoryPriority = (categoryKey: keyof SkillsStructure): 'high' | 'medium' | 'optional' => {
    if (['technical', 'frameworks'].includes(categoryKey)) return 'high'
    if (['tools', 'databases'].includes(categoryKey)) return 'medium'
    return 'optional'
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
        return <Badge variant="outline" className="text-xs text-green-400 border-green-400/50">High Impact</Badge>
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
            <Code className="w-5 h-5 text-primary-400" />
            Skills & Technologies
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
          const priority = getCategoryPriority(category.key)
          const IconComponent = category.icon
          
          return (
            <div 
              key={category.key} 
              className={`p-4 rounded-lg border ${getPriorityColor(priority)} space-y-3`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${category.color}`} />
                  <Label className="text-white font-medium">
                    {category.label}
                  </Label>
                  {getPriorityBadge(priority)}
                </div>
                <span className="text-xs text-slate-400">
                  {formData[category.key].length} skills
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
                    onKeyPress={(e) => handleKeyPress(category.key, e)}
                    placeholder={category.placeholder}
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                  />
                  <Button
                    onClick={() => addSkill(category.key, newSkillInputs[category.key] || '')}
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
                    Tip: Add one skill at a time, or paste multiple skills separated by commas
                  </span>
                  {newSkillInputs[category.key]?.includes(',') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        addMultipleSkills(category.key, newSkillInputs[category.key] || '')
                        setNewSkillInputs(prev => ({ ...prev, [category.key]: '' }))
                      }}
                      className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 p-1 h-auto"
                    >
                      Add All
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* ATS Optimization Tips */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg space-y-2">
          <h4 className="text-blue-300 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            ATS Optimization Tips
          </h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Use exact skill names from job descriptions (e.g., "React.js" not just "React")</li>
            <li>• Include both abbreviations and full names (e.g., "AI" and "Artificial Intelligence")</li>
            <li>• Focus on high-impact categories first: Programming Languages and Frameworks</li>
            <li>• Include skill variations (e.g., "JavaScript", "ES6", "Node.js")</li>
          </ul>
        </div>

        {/* Completion Guidance */}
        {completionScore < 100 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
            <p className="text-green-300 text-sm">
              <strong>Next Steps:</strong> 
              {completionScore < 40 && " Start with Programming Languages and Frameworks - these have the highest ATS impact."}
              {completionScore >= 40 && completionScore < 70 && " Add Development Tools and Databases to round out your technical profile."}
              {completionScore >= 70 && " Consider adding Cloud Platforms and Certifications to stand out from other candidates."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}