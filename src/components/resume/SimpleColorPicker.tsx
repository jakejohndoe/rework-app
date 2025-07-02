'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

// Simple color options - just 6 good choices
const colorOptions = [
  { name: 'Professional Blue', primary: '#2563eb', accent: '#3b82f6' },
  { name: 'Success Green', primary: '#059669', accent: '#10b981' },
  { name: 'Creative Purple', primary: '#7c3aed', accent: '#8b5cf6' },
  { name: 'Bold Red', primary: '#dc2626', accent: '#ef4444' },
  { name: 'Modern Teal', primary: '#0891b2', accent: '#06b6d4' },
  { name: 'Executive Gray', primary: '#374151', accent: '#6b7280' }
]

interface SimpleColorPickerProps {
  selectedColors: { primary: string; accent: string }
  onColorChange: (colors: { primary: string; accent: string }) => void
}

export default function SimpleColorPicker({ selectedColors, onColorChange }: SimpleColorPickerProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-slate-900">Choose Your Color</h4>
      <div className="grid grid-cols-3 gap-2">
        {colorOptions.map((option) => {
          const isSelected = selectedColors.primary === option.primary
          
          return (
            <Button
              key={option.name}
              variant="outline"
              className={`h-auto p-3 flex flex-col items-center space-y-2 relative ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onColorChange({ primary: option.primary, accent: option.accent })}
            >
              {isSelected && (
                <Check className="absolute top-1 right-1 w-4 h-4 text-green-500" />
              )}
              
              <div className="flex space-x-1">
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: option.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: option.accent }}
                />
              </div>
              
              <span className="text-xs text-center leading-tight">
                {option.name}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}