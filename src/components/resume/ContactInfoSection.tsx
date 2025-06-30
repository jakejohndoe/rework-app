import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Globe,
  Github,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

// Define the ContactInfo interface
interface ContactInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  linkedin?: string
  website?: string
  githubUrl?: string
}

interface ContactInfoSectionProps {
  contactInfo: ContactInfo | null | undefined
  onChange: (contactInfo: ContactInfo) => void
  className?: string
}

interface ValidationErrors {
  [key: string]: string
}

export default function ContactInfoSection({ contactInfo, onChange, className = "" }: ContactInfoSectionProps) {
  const [formData, setFormData] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    githubUrl: ''
  })
  
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [completionScore, setCompletionScore] = useState(0)

  // Initialize form data when contactInfo prop changes
  useEffect(() => {
    if (contactInfo) {
      setFormData(contactInfo)
    }
  }, [contactInfo])

  // Calculate completion score
  useEffect(() => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location']
    const optionalFields = ['linkedin', 'website', 'githubUrl']
    
    const requiredComplete = requiredFields.filter(field => formData[field as keyof ContactInfo]?.trim()).length
    const optionalComplete = optionalFields.filter(field => formData[field as keyof ContactInfo]?.trim()).length
    
    // Required fields worth 70%, optional worth 30%
    const score = Math.round((requiredComplete / requiredFields.length) * 70 + (optionalComplete / optionalFields.length) * 30)
    setCompletionScore(score)
  }, [formData])

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address'
        }
        break
      case 'phone':
        if (value && !/^[\+]?[\d\s\-\(\)\.]{10,}$/.test(value)) {
          return 'Please enter a valid phone number'
        }
        break
      case 'linkedin':
        if (value && !value.includes('linkedin.com')) {
          return 'Please enter a valid LinkedIn URL'
        }
        break
      case 'website':
        if (value && !/^https?:\/\/.+\..+/.test(value)) {
          return 'Please enter a valid website URL (include http:// or https://)'
        }
        break
      case 'githubUrl':
        if (value && !value.includes('github.com')) {
          return 'Please enter a valid GitHub URL'
        }
        break
    }
    return ''
  }

  const handleInputChange = (name: string, value: string) => {
    // Update form data
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)
    
    // Validate field
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
    
    // Call onChange to update parent component
    onChange(updatedData)
  }

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    } else if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    }
    return digits
  }

  const isFieldRequired = (field: string): boolean => {
    return ['firstName', 'lastName', 'email', 'phone', 'location'].includes(field)
  }

  const getCompletionColor = (): string => {
    if (completionScore >= 90) return 'text-green-400'
    if (completionScore >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <Card className={`glass-card border-white/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary-400" />
            Contact Information
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
      
      <CardContent className="space-y-4">
        {/* Name Fields - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white font-medium flex items-center gap-1">
              First Name
              {isFieldRequired('firstName') && <span className="text-red-400">*</span>}
            </Label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="John"
              className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
            />
            {errors.firstName && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.firstName}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-white font-medium flex items-center gap-1">
              Last Name
              {isFieldRequired('lastName') && <span className="text-red-400">*</span>}
            </Label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Smith"
              className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="text-white font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            Email Address
            {isFieldRequired('email') && <span className="text-red-400">*</span>}
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="john.smith@email.com"
            className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
          />
          {errors.email && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="text-white font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-400" />
            Phone Number
            {isFieldRequired('phone') && <span className="text-red-400">*</span>}
          </Label>
          <Input
            value={formData.phone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value)
              handleInputChange('phone', formatted)
            }}
            placeholder="(555) 123-4567"
            className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
          />
          {errors.phone && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-white font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            Location
            {isFieldRequired('location') && <span className="text-red-400">*</span>}
          </Label>
          <Input
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="San Francisco, CA"
            className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
          />
          {errors.location && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.location}
            </p>
          )}
        </div>

        {/* Optional Fields Header */}
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-white/80 text-sm font-medium mb-3">
            Optional Links (Recommended)
          </h4>
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label className="text-white font-medium flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-blue-500" />
            LinkedIn Profile
          </Label>
          <Input
            value={formData.linkedin || ''}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/johnsmith"
            className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
          />
          {errors.linkedin && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.linkedin}
            </p>
          )}
        </div>

        {/* Personal Website */}
        <div className="space-y-2">
          <Label className="text-white font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Personal Website
          </Label>
          <Input
            value={formData.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://johnsmith.dev"
            className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
          />
          {errors.website && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.website}
            </p>
          )}
        </div>

        {/* GitHub */}
        <div className="space-y-2">
          <Label className="text-white font-medium flex items-center gap-2">
            <Github className="w-4 h-4 text-gray-400" />
            GitHub Profile
          </Label>
          <Input
            value={formData.githubUrl || ''}
            onChange={(e) => handleInputChange('githubUrl', e.target.value)}
            placeholder="https://github.com/johnsmith"
            className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
          />
          {errors.githubUrl && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.githubUrl}
            </p>
          )}
        </div>

        {/* Completion Tips */}
        {completionScore < 100 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>Pro Tip:</strong> Complete all fields for the best ATS compatibility. 
              {completionScore < 70 && " Required fields are marked with red asterisks."}
              {completionScore >= 70 && completionScore < 90 && " Add optional links to stand out to employers."}
              {completionScore >= 90 && " Almost done! Add any remaining optional links."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}