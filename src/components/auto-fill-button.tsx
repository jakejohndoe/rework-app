// src/components/auto-fill-button.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

interface AutoFillButtonProps {
  resumeId: string;
  onAutoFillComplete?: (data: any) => void;
  disabled?: boolean;
  className?: string;
}

interface AutoFillResponse {
  success: boolean;
  message?: string;
  data?: any;
  stats?: {
    contactFields: number;
    experienceEntries: number;
    educationEntries: number;
    skillsFound: number;
    wordCount: number;
    hasEmail: boolean;
    hasPhone: boolean;
    hasSummary: boolean;
  };
  error?: string;
  details?: string;
}

export default function AutoFillButton({ 
  resumeId, 
  onAutoFillComplete, 
  disabled = false,
  className = ""
}: AutoFillButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAutoFill = async () => {
    if (!resumeId) {
      toast.error('No resume selected');
      return;
    }

    setIsLoading(true);
    const toastId = 'autofill-toast';
    
    try {
      // Show loading toast
      toast.loading('🔍 Reading your PDF and extracting information...', { 
        id: toastId,
        duration: 0 // Don't auto-dismiss
      });


      const response = await fetch(`/api/resumes/${resumeId}/autofill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: AutoFillResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Auto-fill failed');
      }


      // Create success message with stats
      const stats = result.stats;
      const successParts = [];
      
      if (stats?.contactFields) {
        successParts.push(`${stats.contactFields} contact fields`);
      }
      if (stats?.experienceEntries) {
        successParts.push(`${stats.experienceEntries} job${stats.experienceEntries > 1 ? 's' : ''}`);
      }
      if (stats?.educationEntries) {
        successParts.push(`${stats.educationEntries} education entr${stats.educationEntries > 1 ? 'ies' : 'y'}`);
      }
      if (stats?.skillsFound) {
        successParts.push(`${stats.skillsFound} skills`);
      }

      const successMessage = successParts.length > 0 
        ? `✨ Auto-filled: ${successParts.join(', ')}!`
        : '✨ Resume auto-filled successfully!';

      // Show success toast
      toast.success(successMessage, { 
        id: toastId,
        duration: 5000
      });

      // Call the callback with the extracted data
      if (onAutoFillComplete && result.data) {
        onAutoFillComplete(result.data);
      }

      // Additional success details
      if (stats?.wordCount) {
        setTimeout(() => {
          toast.info(`📊 Processed ${stats.wordCount} words from your resume`, {
            duration: 3000
          });
        }, 1000);
      }

    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Show error toast with helpful message
      toast.error(`Failed to auto-fill: ${errorMessage}`, { 
        id: toastId,
        duration: 5000,
        description: "Try uploading your resume again or contact support if the issue persists."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAutoFill}
      disabled={disabled || isLoading || !resumeId}
      className={`
        relative inline-flex items-center justify-center px-6 py-3
        bg-gradient-to-r from-cyan-500 to-purple-600 
        text-white font-medium rounded-lg
        hover:from-cyan-600 hover:to-purple-700
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        shadow-lg hover:shadow-xl
        ${className}
      `}
      title={isLoading ? "Processing your PDF..." : "Automatically fill form from uploaded PDF"}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Auto-filling...</span>
        </>
      ) : (
        <>
          <svg 
            className="mr-2 h-5 w-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <span>✨ Auto-fill from PDF</span>
        </>
      )}
    </button>
  );
}

// Optional: Export types for use in parent components
export type { AutoFillResponse };