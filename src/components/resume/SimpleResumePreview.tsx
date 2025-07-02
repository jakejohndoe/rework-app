// src/components/resume/SimpleResumePreview.tsx
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleResumePreviewProps {
  resumeId: string;
  version: 'original' | 'optimized';
  template: string;
  title?: string;
  subtitle?: string;
  className?: string;
  showDownload?: boolean;
  onDownload?: () => void;
}

export function SimpleResumePreview({ 
  resumeId, 
  version, 
  template, 
  title, 
  subtitle,
  className = '',
  showDownload = false,
  onDownload
}: SimpleResumePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const previewUrl = `/api/resumes/${resumeId}/preview?version=${version}&template=${template}&format=image`;

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const getTemplateColor = (template: string) => {
    const colors = {
      professional: 'from-blue-500 to-blue-600',
      modern: 'from-purple-500 to-purple-600', 
      minimal: 'from-green-500 to-green-600',
      creative: 'from-orange-500 to-orange-600'
    };
    return colors[template as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className={`bg-white/5 rounded-xl border border-white/20 overflow-hidden hover:bg-white/10 transition-all duration-200 ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-white font-medium mb-1">{title}</h3>}
              {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {version === 'optimized' && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
              {showDownload && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDownload}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Content */}
      <div className="relative">
        {/* Template Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`bg-gradient-to-r ${getTemplateColor(template)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
            {template.charAt(0).toUpperCase() + template.slice(1)} Template
          </div>
        </div>

        {/* Resume Preview */}
        <div className="aspect-[8.5/11] bg-gradient-to-br from-slate-50 to-white p-6 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="text-sm">Loading preview...</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <FileText className="w-12 h-12" />
                <p className="text-sm">Preview unavailable</p>
                <p className="text-xs text-center">PDF ready for download</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mock Resume Content - This would be replaced with actual preview */}
              <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden">
                <iframe
                  src={`/api/resumes/${resumeId}/preview?version=${version}&template=${template}`}
                  className="w-full h-full border-0"
                  style={{ 
                    transform: 'scale(0.9)',
                    transformOrigin: 'top left',
                    width: '111%',
                    height: '111%'
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            </>
          )}
        </div>

        {/* Template Info */}
        <div className="p-4 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getTemplateColor(template)}`}></div>
              <span>{template.charAt(0).toUpperCase() + template.slice(1)} Template</span>
            </div>
            {version === 'optimized' && (
              <div className="text-xs text-green-300">✨ AI Enhanced</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}