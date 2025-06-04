"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  ArrowRight,
  Target,
  Download,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Users,
  FileText,
  Save
} from "lucide-react"

export default function JobDescriptionPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const resumeId = params.id as string

  // Job Description State
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [jobLocation, setJobLocation] = useState("")
  const [jobUrl, setJobUrl] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [jobRequirements, setJobRequirements] = useState("")
  const [jobBenefits, setJobBenefits] = useState("")
  const [hasJobDescription, setHasJobDescription] = useState(false)
  const [isFetchingJob, setIsFetchingJob] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [existingJobId, setExistingJobId] = useState<string | null>(null)

  // Check if we have enough job info for next step
  const isJobComplete = () => {
    return jobTitle.trim().length > 3 && 
           companyName.trim().length > 2 && 
           jobDescription.trim().length > 100
  }

  // Load existing job description on page load
  useEffect(() => {
    const loadExistingJobDescription = async () => {
      if (!resumeId) return
      
      try {
        const response = await fetch(`/api/resumes/${resumeId}/job-description`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.jobApplication) {
            const job = data.jobApplication
            setJobTitle(job.jobTitle || '')
            setCompanyName(job.company || '')
            setJobDescription(job.jobDescription || '')
            setJobUrl(job.jobUrl || '')
            setJobLocation('') // Not stored in current schema, keeping for UI
            setJobRequirements('') // Not stored in current schema, keeping for UI  
            setJobBenefits('') // Not stored in current schema, keeping for UI
            setExistingJobId(job.id)
            setHasJobDescription(job.jobDescription?.length > 100)
            
            console.log('✅ Loaded existing job description')
          }
        }
      } catch (error) {
        console.error('Error loading job description:', error)
        // Silently fail - user can still enter new data
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      loadExistingJobDescription()
    }
  }, [resumeId, status])

  const handleFetchJobDescription = async () => {
    if (!jobUrl.trim()) return

    try {
      setIsFetchingJob(true)
      
      console.log('🔗 Fetching job description from URL:', jobUrl)
      toast.loading('Fetching job details...', { id: 'fetch-job' })
      
      // TODO: Replace with real scraping API when implemented
      // For now, keeping the mock functionality
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock response - replace with actual scraping logic later
      const mockJobData = {
        title: "Senior Software Engineer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA (Remote)",
        description: `We are seeking a talented Senior Software Engineer to join our growing engineering team. You will be responsible for designing, developing, and maintaining scalable web applications that serve millions of users worldwide.

In this role, you will work closely with product managers, designers, and other engineers to deliver high-quality software solutions. You'll have the opportunity to work on cutting-edge technologies and contribute to architectural decisions that shape our platform.`,
        requirements: `• 5+ years of experience in full-stack software development
• Proficiency in modern JavaScript frameworks (React, Vue.js, or Angular)
• Strong backend development skills with Node.js, Python, or Java
• Experience with cloud platforms (AWS, Azure, or GCP)
• Solid understanding of database design and optimization (SQL and NoSQL)
• Familiarity with DevOps practices and CI/CD pipelines
• Strong problem-solving skills and attention to detail
• Excellent communication and collaboration abilities
• Bachelor's degree in Computer Science or equivalent experience`,
        benefits: `• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible remote work options
• Professional development budget ($2,000/year)
• Unlimited PTO policy
• 401(k) with company matching
• Modern equipment and home office stipend
• Team retreats and company events`
      }
      
      // Auto-populate fields
      setJobTitle(mockJobData.title)
      setCompanyName(mockJobData.company)
      setJobLocation(mockJobData.location)
      setJobDescription(mockJobData.description)
      setJobRequirements(mockJobData.requirements)
      setJobBenefits(mockJobData.benefits)
      setHasJobDescription(true)
      
      toast.success('Job details fetched successfully!', { id: 'fetch-job' })
      console.log('✅ Job description fetched successfully')
      
    } catch (error) {
      console.error('❌ Failed to fetch job description:', error)
      toast.error('Failed to fetch job details. Please enter manually.', { id: 'fetch-job' })
    } finally {
      setIsFetchingJob(false)
    }
  }

  const handleSaveJobDescription = async () => {
    if (!isJobComplete()) {
      toast.error('Please fill in all required fields (Job Title, Company, and Job Description)')
      return
    }

    setIsSaving(true)
    toast.loading('Saving job description...', { id: 'save-job' })

    try {
      const response = await fetch(`/api/resumes/${resumeId}/job-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          company: companyName.trim(),
          jobDescription: jobDescription.trim(),
          jobUrl: jobUrl.trim() || undefined,
          location: jobLocation.trim() || undefined,
          requirements: jobRequirements.trim() || undefined,
          benefits: jobBenefits.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save job description')
      }

      const data = await response.json()
      setExistingJobId(data.jobApplication.id)
      
      toast.success('Job description saved successfully!', { id: 'save-job' })
      console.log('✅ Job description saved:', data)
      
      return true
    } catch (error) {
      console.error('❌ Failed to save job description:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save job description', { id: 'save-job' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    // Save job description before proceeding
    const saved = await handleSaveJobDescription()
    
    if (saved) {
      // Navigate to AI analysis page
      router.push(`/dashboard/resume/${resumeId}/analysis`)
    }
  }

  const handleBack = () => {
    router.push(`/dashboard/resume/${resumeId}`)
  }

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="circuit-bg min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading job description...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 glass-dark">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={handleBack} variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                {/* Step Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-green-400 font-medium">Edit Resume</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                    <span className="text-white font-medium">Job Description</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-400">3</span>
                    </div>
                    <span className="text-slate-400">AI Analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {existingJobId && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Saved
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  <Target className="w-3 h-3 mr-1" />
                  Step 2 of 3
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Add Job Description</h1>
                <p className="text-slate-400 text-lg">
                  Paste the job description you're applying for so we can optimize your resume to match
                </p>
              </div>
            </div>

            {/* Quick Import Section */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🔗 Quick Import from Job URL
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">
                    Coming Soon
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Paste a job URL from Indeed, LinkedIn, Glassdoor, or company career pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://www.indeed.com/viewjob?jk=... or any job posting URL"
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400"
                  />
                  <Button 
                    onClick={handleFetchJobDescription}
                    disabled={!jobUrl.trim() || isFetchingJob}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shrink-0 px-8"
                  >
                    {isFetchingJob ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Fetch Job
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Currently shows demo data - real URL scraping coming soon!
                </p>
              </CardContent>
            </Card>

            {/* Manual Entry Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Job Details */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-400" />
                    Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Job Title *</Label>
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Company *</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. TechCorp Inc."
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Location</Label>
                    <Input
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA (Remote)"
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-primary-400"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Progress & Tips */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Progress & Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Job Title</span>
                      {jobTitle.length > 3 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Company</span>
                      {companyName.length > 2 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Job Description</span>
                      {jobDescription.length > 100 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-white text-sm font-medium mb-2">💡 Pro Tips:</h4>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>• Include the complete job description for best results</li>
                      <li>• Copy requirements, responsibilities, and qualifications</li>
                      <li>• Don't forget company culture and benefits info</li>
                    </ul>
                  </div>

                  {/* Save Progress Button */}
                  {isJobComplete() && (
                    <div className="border-t border-white/10 pt-4">
                      <Button 
                        onClick={handleSaveJobDescription}
                        disabled={isSaving}
                        variant="outline"
                        className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                        size="sm"
                      >
                        {isSaving ? (
                          <div className="w-3 h-3 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <Save className="w-3 h-3 mr-2" />
                        )}
                        Save Progress
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Job Description Content */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Job Description Content
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Paste the complete job description, including responsibilities, requirements, and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Full Job Description *</Label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value)
                      setHasJobDescription(e.target.value.length > 100)
                    }}
                    placeholder="Paste the complete job description here, including:&#10;&#10;• Job overview and responsibilities&#10;• Required qualifications and skills&#10;• Preferred experience&#10;• Company information&#10;• Benefits and compensation details&#10;&#10;The more complete the description, the better we can optimize your resume!"
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 min-h-[200px]"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {jobDescription.length} characters
                      {jobDescription.length > 100 && (
                        <span className="text-green-400 ml-2">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Ready for analysis
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optional Additional Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Requirements & Qualifications</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Optional: Separate requirements section for better analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={jobRequirements}
                    onChange={(e) => setJobRequirements(e.target.value)}
                    placeholder="• 5+ years of experience&#10;• Bachelor's degree in CS&#10;• Proficiency in React, Node.js&#10;• Experience with AWS..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 min-h-[120px]"
                  />
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Benefits & Compensation</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Optional: Helps understand company culture and values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={jobBenefits}
                    onChange={(e) => setJobBenefits(e.target.value)}
                    placeholder="• Competitive salary&#10;• Health insurance&#10;• Remote work options&#10;• Professional development budget..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400 min-h-[120px]"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Next Step Button */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium mb-1">Ready for AI Analysis?</h3>
                    <p className="text-slate-400 text-sm">
                      {isJobComplete() 
                        ? "Perfect! We have everything needed to analyze and optimize your resume."
                        : "Please fill in the required fields (Job Title, Company, and Job Description) to continue."
                      }
                    </p>
                  </div>
                  <Button 
                    onClick={handleNext}
                    disabled={!isJobComplete() || isSaving}
                    className="btn-gradient"
                    size="lg"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      isJobComplete() && <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Start AI Analysis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}