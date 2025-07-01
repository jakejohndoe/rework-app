// Enhanced AI Suggestions Component with Swap/Preview Functionality
// src/components/resume/EnhancedAISuggestionsTab.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  CheckCircle,
  ArrowLeftRight,
  Undo2,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Target,
  Star,
  RefreshCw,
  Download,
  FileText,
  Eye
} from "lucide-react"

// Enhanced suggestion interface
interface EnhancedSuggestion {
  section: string
  type: 'improve' | 'add'
  current: string
  suggested: string
  impact: 'high' | 'medium' | 'low'
  reason: string
}

interface SwappedSuggestion extends EnhancedSuggestion {
  id: string
  isSwapped: boolean
}

interface EnhancedAISuggestionsTabProps {
  suggestions: EnhancedSuggestion[]
  resumeId: string
  onApplyChanges?: () => void
}

export function EnhancedAISuggestionsTab({ 
  suggestions, 
  resumeId, 
  onApplyChanges 
}: EnhancedAISuggestionsTabProps) {
  // Preview state management
  const [swappedSuggestions, setSwappedSuggestions] = useState<SwappedSuggestion[]>(
    suggestions.map((suggestion, index) => ({
      ...suggestion,
      id: `suggestion-${index}`,
      isSwapped: false
    }))
  )
  
  const [isApplying, setIsApplying] = useState(false)

  // Count swapped suggestions
  const swappedCount = swappedSuggestions.filter(s => s.isSwapped).length
  const totalSuggestions = swappedSuggestions.length

  // Toggle individual suggestion swap
  const handleSwapSuggestion = (id: string) => {
    setSwappedSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, isSwapped: !suggestion.isSwapped }
          : suggestion
      )
    )
    
    const suggestion = swappedSuggestions.find(s => s.id === id)
    if (suggestion) {
      toast.success(
        suggestion.isSwapped 
          ? `✅ Swapped back to original ${suggestion.section.toLowerCase()}`
          : `🔄 Applied AI suggestion for ${suggestion.section.toLowerCase()}`, 
        { duration: 2000 }
      )
    }
  }

  // Swap all suggestions
  const handleSwapAll = () => {
    const allSwapped = swappedCount === totalSuggestions
    setSwappedSuggestions(prev => 
      prev.map(suggestion => ({ ...suggestion, isSwapped: !allSwapped }))
    )
    
    toast.success(
      allSwapped 
        ? "↩️ Reverted all suggestions to original content"
        : `✨ Applied all ${totalSuggestions} AI suggestions!`,
      { duration: 3000 }
    )
  }

  // Apply changes to resume data
  const handleApplyChanges = async () => {
    if (swappedCount === 0) {
      toast.error("No suggestions have been swapped. Please swap some suggestions first.")
      return
    }

    setIsApplying(true)
    
    try {
      toast.loading("💾 Applying changes to your resume...", { id: 'apply-changes' })
      
      // Get only swapped suggestions
      const swappedOnly = swappedSuggestions.filter(s => s.isSwapped)
      
      // Apply changes via API
      const response = await fetch(`/api/resumes/${resumeId}/apply-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestions: swappedOnly.map(s => ({
            section: s.section,
            type: s.type,
            current: s.current,
            suggested: s.suggested,
            impact: s.impact,
            reason: s.reason
          }))
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to apply changes')
      }

      const result = await response.json()
      
      toast.success(`🎉 Successfully applied ${swappedCount} optimizations!`, { id: 'apply-changes' })
      
      // Call parent callback if provided
      if (onApplyChanges) {
        onApplyChanges()
      }
      
      // Navigate to finalize/template selection page
      window.location.href = `/dashboard/resume/${resumeId}/finalize`
      
    } catch (error) {
      console.error('Error applying changes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply changes'
      toast.error(`Failed to apply changes: ${errorMessage}`, { id: 'apply-changes' })
    } finally {
      setIsApplying(false)
    }
  }

  // Get section icon
  const getSectionIcon = (section: string) => {
    const sectionLower = section.toLowerCase()
    if (sectionLower.includes('contact')) return <User className="w-4 h-4" />
    if (sectionLower.includes('experience')) return <Briefcase className="w-4 h-4" />
    if (sectionLower.includes('skill')) return <Zap className="w-4 h-4" />
    if (sectionLower.includes('education')) return <GraduationCap className="w-4 h-4" />
    if (sectionLower.includes('summary')) return <FileText className="w-4 h-4" />
    return <Star className="w-4 h-4" />
  }

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Master Controls */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-medium text-lg mb-1">
                🤖 AI-Powered Resume Optimization
              </h3>
              <p className="text-slate-400 text-sm">
                {swappedCount > 0 
                  ? `${swappedCount} of ${totalSuggestions} optimizations applied in preview mode`
                  : `${totalSuggestions} AI suggestions ready for optimization`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSwapAll}
                variant="outline"
                className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 gap-2"
                disabled={totalSuggestions === 0}
              >
                {swappedCount === totalSuggestions ? (
                  <>
                    <Undo2 className="w-4 h-4" />
                    Revert All
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4" />
                    Swap All ({totalSuggestions})
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleApplyChanges}
                disabled={swappedCount === 0 || isApplying}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 gap-2"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Apply Changes ({swappedCount})
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Progress Indicator */}
          {swappedCount > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-300">Optimization Progress</span>
                <span className="text-cyan-300">{Math.round((swappedCount / totalSuggestions) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(swappedCount / totalSuggestions) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Suggestion Cards */}
      <div className="space-y-4">
        {swappedSuggestions.map((suggestion) => (
          <Card 
            key={suggestion.id} 
            className={`glass-card border-white/10 transition-all duration-300 ${
              suggestion.isSwapped 
                ? 'ring-2 ring-green-500/50 bg-green-900/10' 
                : 'hover:border-white/20'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  {getSectionIcon(suggestion.section)}
                  {suggestion.section}
                  {suggestion.isSwapped && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-2">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Applied
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getImpactColor(suggestion.impact)}>
                    {suggestion.impact} impact
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-400/30 text-cyan-300">
                    AI Generated
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-slate-400">
                {suggestion.reason}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Current vs Suggested Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Current Content */}
                <div className={`space-y-2 transition-opacity duration-300 ${
                  suggestion.isSwapped ? 'opacity-50' : ''
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 text-sm font-medium">
                      {suggestion.isSwapped ? 'Previous:' : 'Current:'}
                    </span>
                    {!suggestion.isSwapped && (
                      <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                        Original
                      </Badge>
                    )}
                  </div>
                  <div className="text-slate-400 text-sm bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    {suggestion.current || "No current content"}
                  </div>
                </div>

                {/* Suggested Content */}
                <div className={`space-y-2 transition-all duration-300 ${
                  suggestion.isSwapped ? 'ring-1 ring-green-500/30' : ''
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 text-sm font-medium">
                      {suggestion.isSwapped ? 'Applied:' : 'AI Suggestion:'}
                    </span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Optimized
                    </Badge>
                  </div>
                  <div className={`text-slate-200 text-sm rounded-lg p-3 border transition-all duration-300 ${
                    suggestion.isSwapped 
                      ? 'bg-green-900/30 border-green-700' 
                      : 'bg-green-900/20 border-green-800'
                  }`}>
                    {suggestion.suggested}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2 border-t border-white/10">
                <Button
                  onClick={() => handleSwapSuggestion(suggestion.id)}
                  variant={suggestion.isSwapped ? "outline" : "default"}
                  className={
                    suggestion.isSwapped
                      ? "border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/10 gap-2"
                      : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 gap-2"
                  }
                >
                  {suggestion.isSwapped ? (
                    <>
                      <Undo2 className="w-4 h-4" />
                      Undo Swap
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-4 h-4" />
                      Swap to AI Version
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No more template modal - we navigate to dedicated finalize page */}
    </div>
  )
}

export default EnhancedAISuggestionsTab