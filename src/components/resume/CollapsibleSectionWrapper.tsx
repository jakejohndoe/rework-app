// src/components/resume/CollapsibleSectionWrapper.tsx
"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface CollapsibleSectionWrapperProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  isComplete?: boolean
  defaultOpen?: boolean
  className?: string
}

export const CollapsibleSectionWrapper: React.FC<CollapsibleSectionWrapperProps> = ({
  title,
  icon,
  children,
  isComplete = false,
  defaultOpen = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className={`glass-card border-white/10 ${className}`}>
      <CardHeader 
        className="cursor-pointer hover:bg-white/5 transition-colors p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-500/20' : 'bg-slate-600/20'}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {isComplete && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-300">Complete</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isComplete && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0 pb-6 px-6">
          <div className="border-t border-white/10 pt-6">
            {children}
          </div>
        </CardContent>
      )}
    </Card>
  )
}