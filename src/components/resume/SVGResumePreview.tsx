// src/components/resume/SVGResumePreview.tsx
'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SVGResumePreviewProps {
  resumeId: string;
  version: 'original' | 'optimized';
  template: string;
  title?: string;
  subtitle?: string;
  className?: string;
  showDownload?: boolean;
  onDownload?: () => void;
  colors?: {
    primary: string;
    accent: string;
  };
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  professionalSummary: string;
  workExperience: any[];
  education: any[];
  skills: string[];
}

// Helper functions for text extraction
const extractNameFromContent = (content: string): string | null => {
  const nameMatch = content.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/);
  return nameMatch ? nameMatch[1] : null;
};

const extractEmailFromContent = (content: string): string | null => {
  const emailMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return emailMatch ? emailMatch[1] : null;
};

const extractPhoneFromContent = (content: string): string | null => {
  const phoneMatch = content.match(/(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
  return phoneMatch ? phoneMatch[1] : null;
};

const extractSummaryFromContent = (content: string): string | null => {
  const summaryMatch = content.match(/(?:summary|objective|profile)[:\s]+([^.]+(?:\.[^.]+){0,3}\.)/i);
  return summaryMatch ? summaryMatch[1] : null;
};

export function SVGResumePreview({ 
  resumeId, 
  version, 
  template, 
  title, 
  subtitle,
  className = '',
  showDownload = false,
  onDownload,
  colors
}: SVGResumePreviewProps) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Template configurations - now uses custom colors if provided
  const getTemplateConfig = (template: string, customColors?: { primary: string; accent: string }) => {
    const defaultConfigs = {
      professional: {
        primaryColor: customColors?.primary || '#1e40af',
        secondaryColor: '#64748b',
        accentColor: customColors?.accent || '#3b82f6',
        backgroundColor: '#ffffff',
        fontFamily: 'serif'
      },
      modern: {
        primaryColor: customColors?.primary || '#4f46e5',
        secondaryColor: '#6b7280',
        accentColor: customColors?.accent || '#818cf8',
        backgroundColor: '#f8fafc',
        fontFamily: 'sans-serif'
      },
      minimal: {
        primaryColor: customColors?.primary || '#059669',
        secondaryColor: '#6b7280',
        accentColor: customColors?.accent || '#10b981',
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif'
      },
      creative: {
        primaryColor: customColors?.primary || '#dc2626',
        secondaryColor: '#6b7280',
        accentColor: customColors?.accent || '#ef4444',
        backgroundColor: '#fff7ed',
        fontFamily: 'sans-serif'
      }
    };

    return defaultConfigs[template as keyof typeof defaultConfigs] || defaultConfigs.professional;
  };

  const config = getTemplateConfig(template, colors);

  useEffect(() => {
    fetchResumeData();
  }, [resumeId, version]);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await fetch(`/api/resumes/${resumeId}`);
      if (!response.ok) throw new Error('Failed to fetch resume');

      const apiResponse = await response.json();
      console.log('🔍 Full API Response:', apiResponse);
      
      const data = apiResponse.resume || apiResponse;
      console.log('📋 Resume data object:', data);
      
      const extractedData = extractResumeData(data, version);
      setResumeData(extractedData);
    } catch (err) {
      console.error('Error fetching resume data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const extractResumeData = (data: any, version: string): ResumeData => {
    console.log('🔍 Extracting resume data:', { version, hasContactInfo: !!data.contactInfo, hasSummary: !!data.professionalSummary, hasWorkExp: !!data.workExperience });
    
    const hasOptimizedData = data.contactInfo || data.professionalSummary || data.workExperience || data.education;
    
    let contactInfo: any = {};
    let professionalSummary = '';
    let workExperience: any[] = [];
    let education: any[] = [];
    let skills: string[] = [];

    try {
      if (hasOptimizedData) {
        console.log('📊 Using structured data from database');
        
        if (data.contactInfo) {
          contactInfo = typeof data.contactInfo === 'string' ? JSON.parse(data.contactInfo) : data.contactInfo;
          console.log('📧 Contact info parsed:', contactInfo);
        }
        
        if (data.professionalSummary) {
          const parsed = typeof data.professionalSummary === 'string' ? JSON.parse(data.professionalSummary) : data.professionalSummary;
          professionalSummary = parsed.optimized || parsed.summary || parsed.content || parsed || '';
          console.log('📝 Professional summary length:', professionalSummary.length);
        }
        
        if (data.workExperience) {
          workExperience = typeof data.workExperience === 'string' ? JSON.parse(data.workExperience) : data.workExperience;
          if (!Array.isArray(workExperience)) workExperience = [];
          console.log('💼 Work experience entries:', workExperience.length);
          console.log('💼 First work entry:', workExperience[0]);
        }
        
        if (data.education) {
          education = typeof data.education === 'string' ? JSON.parse(data.education) : data.education;
          if (!Array.isArray(education)) education = [];
          console.log('🎓 Education entries:', education.length);
        }
        
        if (data.skills) {
          let parsedSkills = typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills;
          if (!Array.isArray(parsedSkills)) {
            if (typeof parsedSkills === 'string') {
              skills = parsedSkills.split(/[,•·|]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            } else {
              skills = [];
            }
          } else {
            skills = parsedSkills;
          }
          console.log('🔧 Skills parsed:', skills.length, 'items:', skills.slice(0, 3));
        }
      } else {
        console.log('📄 No structured data found, using fallback');
        
        if (data.originalContent || data.currentContent) {
          const content = data.originalContent || data.currentContent;
          console.log('📋 Extracting from original content:', content.substring(0, 100) + '...');
          
          contactInfo = {
            name: extractNameFromContent(content) || 'Jake Johnson',
            email: extractEmailFromContent(content) || 'hello@jakejohnson.com',
            phone: extractPhoneFromContent(content) || '(219) 925-7195',
            location: 'Saint Paul, MN'
          };
          
          professionalSummary = extractSummaryFromContent(content) || 'Professional Network Engineer with expertise in infrastructure design and implementation.';
        } else {
          console.log('❌ No content available, using complete fallback');
          contactInfo = {
            name: 'Jake Johnson',
            email: 'hello@jakejohnson.com',
            phone: '(219) 925-7195',
            location: 'Saint Paul, MN'
          };
          professionalSummary = 'Professional Network Engineer with expertise in infrastructure design and implementation.';
        }
      }
    } catch (e) {
      console.error('❌ Error parsing resume data:', e);
      contactInfo = {
        name: 'Jake Johnson',
        email: 'hello@jakejohnson.com',
        phone: '(219) 925-7195',
        location: 'Saint Paul, MN'
      };
      professionalSummary = 'Professional Network Engineer with expertise in infrastructure design and implementation.';
    }

    const extractedData = {
      fullName: contactInfo?.name || contactInfo?.fullName || 'Jake Johnson',
      email: contactInfo?.email || 'hello@jakejohnson.com',
      phone: contactInfo?.phone || '(219) 925-7195',
      location: contactInfo?.location || 'Saint Paul, MN',
      linkedin: contactInfo?.linkedin || '',
      professionalSummary: professionalSummary || 'Professional Network Engineer with expertise in infrastructure design and implementation.',
      workExperience: Array.isArray(workExperience) ? workExperience : [],
      education: Array.isArray(education) ? education : [],
      skills: Array.isArray(skills) ? skills : []
    };

    console.log('✅ Final extracted data:', {
      name: extractedData.fullName,
      email: extractedData.email,
      summaryLength: extractedData.professionalSummary.length,
      workExpCount: extractedData.workExperience.length,
      educationCount: extractedData.education.length,
      skillsCount: extractedData.skills.length,
      firstWorkEntry: extractedData.workExperience[0]?.title || 'none',
      customColors: colors ? `${colors.primary} / ${colors.accent}` : 'default'
    });

    return extractedData;
  };

  // 🎨 PROFESSIONAL TEMPLATE
  const renderProfessionalTemplate = (data: ResumeData) => (
    <svg viewBox="0 0 612 792" className="w-full h-full">
      <defs>
        <linearGradient id="profGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: config.primaryColor}} />
          <stop offset="100%" style={{stopColor: config.accentColor}} />
        </linearGradient>
      </defs>

      {/* White background */}
      <rect width="612" height="792" fill="white"/>
      
      {/* Header */}
      <rect x="0" y="0" width="612" height="120" fill="url(#profGradient)"/>
      
      {/* Name */}
      <text x="306" y="50" textAnchor="middle" fontSize="28" fontWeight="400" fill="white" fontFamily="serif" letterSpacing="1px">
        {data.fullName}
      </text>
      
      {/* Contact info */}
      <text x="306" y="75" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.9)" fontFamily="sans-serif">
        {data.email} • {data.phone} • {data.location}
      </text>
      
      {/* Professional tagline */}
      <text x="306" y="95" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)" fontFamily="serif" fontStyle="italic">
        Network Engineer Professional
      </text>

      {/* Professional Summary */}
      <text x="40" y="160" fontSize="16" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
        Professional Summary
      </text>
      <line x1="40" y1="170" x2="140" y2="170" stroke={config.accentColor} strokeWidth="2"/>
      
      <foreignObject x="40" y="180" width="532" height="70">
        <div style={{ 
          fontSize: '11px', 
          lineHeight: '1.6', 
          color: '#374151',
          fontFamily: 'serif',
          textAlign: 'justify'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Professional Experience */}
      <text x="40" y="280" fontSize="16" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
        Professional Experience
      </text>
      <line x1="40" y1="290" x2="180" y2="290" stroke={config.accentColor} strokeWidth="2"/>

      {data.workExperience.slice(0, 3).map((job, index) => (
        <g key={index}>
          <rect x="40" y={310 + index * 100} width="532" height="85" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="6"/>
          <rect x="40" y={310 + index * 100} width="4" height="85" fill={config.accentColor} rx="2"/>
          
          <text x="55" y={335 + index * 100} fontSize="13" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
            {job.title || job.position || 'Network Engineer'}
          </text>
          
          <text x="450" y={335 + index * 100} fontSize="10" fill="#6b7280" fontFamily="sans-serif">
            {job.startDate || '2022'} — {job.endDate || 'Present'}
          </text>
          
          <text x="55" y={350 + index * 100} fontSize="11" fontWeight="500" fill={config.accentColor} fontFamily="sans-serif">
            {job.company || 'Technology Company'}
          </text>

          <foreignObject x="55" y={360 + index * 100} width="500" height="30">
            <div style={{ 
              fontSize: '10px', 
              lineHeight: '1.4', 
              color: '#374151'
            }}>
              {(job.description || job.responsibilities || 'Led network infrastructure projects and implemented security protocols.').substring(0, 160)}...
            </div>
          </foreignObject>
        </g>
      ))}

      {/* Skills & Education */}
      <g>
        <text x="40" y={630} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
          Core Skills
        </text>
        <line x1="40" y1="640" x2="100" y2="640" stroke={config.accentColor} strokeWidth="2"/>
        
        {data.skills.length > 0 && (
          <foreignObject x="40" y="650" width="260" height="80">
            <div style={{ 
              fontSize: '10px', 
              lineHeight: '1.6', 
              color: '#374151',
              columnCount: 2,
              columnGap: '20px'
            }}>
              {data.skills.slice(0, 12).map((skill, index) => (
                <div key={index} style={{marginBottom: '4px', display: 'flex', alignItems: 'center'}}>
                  <span style={{color: config.accentColor, marginRight: '4px'}}>•</span>
                  {skill}
                </div>
              ))}
            </div>
          </foreignObject>
        )}

        <text x="320" y={630} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
          Education
        </text>
        <line x1="320" y1="640" x2="370" y2="640" stroke={config.accentColor} strokeWidth="2"/>
        
        {data.education.slice(0, 2).map((edu, index) => (
          <g key={index}>
            <text x="320" y={665 + index * 35} fontSize="11" fontWeight="500" fill={config.primaryColor} fontFamily="serif">
              {edu.degree || 'Bachelor of Science'}
            </text>
            <text x="320" y={680 + index * 35} fontSize="10" fill="#6b7280">
              {edu.institution || edu.school || 'University'} • {edu.year || edu.endDate || '2020'}
            </text>
          </g>
        ))}
      </g>

      {/* ReWork badge */}
      {version === 'optimized' && (
        <text x="306" y="770" textAnchor="middle" fontSize="9" fill={config.accentColor} fontFamily="serif" fontStyle="italic">
          ✨ reWorked with ReWork
        </text>
      )}
    </svg>
  );

  // 🎨 MODERN TEMPLATE
  const renderModernTemplate = (data: ResumeData) => (
    <svg viewBox="0 0 612 792" className="w-full h-full">
      <defs>
        <linearGradient id="modernBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#f8fafc'}} />
          <stop offset="100%" style={{stopColor: '#e2e8f0'}} />
        </linearGradient>
        
        <linearGradient id="modernAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: config.primaryColor}} />
          <stop offset="100%" style={{stopColor: config.accentColor}} />
        </linearGradient>
      </defs>

      {/* Light background */}
      <rect width="612" height="792" fill="url(#modernBg)"/>
      
      {/* Header */}
      <rect x="0" y="0" width="612" height="160" fill={config.primaryColor}/>
      
      {/* Name */}
      <text x="50" y="60" fontSize="32" fontWeight="300" fill="white" fontFamily="sans-serif" letterSpacing="1px">
        {data.fullName}
      </text>
      
      {/* Contact info */}
      <text x="50" y="85" fontSize="12" fill="rgba(255,255,255,0.9)" fontFamily="sans-serif">
        {data.email} • {data.phone}
      </text>
      
      <text x="50" y="105" fontSize="12" fill="rgba(255,255,255,0.9)" fontFamily="sans-serif">
        📍 {data.location}
      </text>
      
      {/* Professional tagline */}
      <text x="50" y="125" fontSize="11" fill="rgba(255,255,255,0.8)" fontFamily="sans-serif" fontStyle="italic">
        Network Infrastructure Professional
      </text>

      {/* About section */}
      <rect x="40" y="180" width="532" height="120" fill="white" rx="12" stroke="#e2e8f0" strokeWidth="1"/>
      
      <text x="60" y="205" fontSize="16" fontWeight="600" fill={config.primaryColor} fontFamily="sans-serif">
        Professional Summary
      </text>
      
      <foreignObject x="60" y="220" width="500" height="70">
        <div style={{ 
          fontSize: '11px', 
          lineHeight: '1.6', 
          color: '#374151',
          fontFamily: 'sans-serif'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Experience */}
      <text x="40" y="330" fontSize="18" fontWeight="600" fill={config.primaryColor} fontFamily="sans-serif">
        Experience
      </text>

      {data.workExperience.slice(0, 2).map((job, index) => (
        <g key={index}>
          <rect x="40" y={350 + index * 120} width="350" height="105" 
                fill="white" 
                rx="12" 
                stroke="#e2e8f0" 
                strokeWidth="1"/>
          
          <rect x="40" y={350 + index * 120} width="4" height="105" fill={config.accentColor} rx="2"/>
          
          <text x="60" y={375 + index * 120} fontSize="13" fontWeight="600" fill={config.primaryColor}>
            {job.title || job.position || 'Network Engineer'}
          </text>
          
          <text x="60" y={390 + index * 120} fontSize="11" fontWeight="500" fill={config.accentColor}>
            {job.company || 'Technology Company'}
          </text>
          
          <text x="310" y={390 + index * 120} fontSize="10" fill="#6b7280">
            {job.startDate || '2022'} — {job.endDate || 'Present'}
          </text>

          <foreignObject x="60" y={400 + index * 120} width="310" height="45">
            <div style={{ 
              fontSize: '10px', 
              lineHeight: '1.5', 
              color: '#374151'
            }}>
              {(job.description || 'Led network infrastructure projects and security implementations.').substring(0, 150)}...
            </div>
          </foreignObject>
        </g>
      ))}

      {/* Skills sidebar */}
      <rect x="410" y="350" width="162" height="220" 
            fill="white" 
            rx="12" 
            stroke="#e2e8f0" 
            strokeWidth="1"/>
      
      <text x="430" y="375" fontSize="14" fontWeight="600" fill={config.primaryColor}>
        Skills
      </text>

      {data.skills.slice(0, 8).map((skill, index) => (
        <g key={index}>
          <text x="430" y={395 + index * 24} fontSize="10" fontWeight="500" fill="#374151">
            {skill.substring(0, 15)}
          </text>
          
          <rect x="430" y={400 + index * 24} width="120" height="4" fill="#e5e7eb" rx="2"/>
          <rect x="430" y={400 + index * 24} width={60 + Math.random() * 60} height="4" fill={config.accentColor} rx="2"/>
        </g>
      ))}

      {/* ReWork badge */}
      {version === 'optimized' && (
        <text x="306" y="770" textAnchor="middle" fontSize="9" fill={config.accentColor} fontWeight="500">
          ✨ reWorked with ReWork
        </text>
      )}
    </svg>
  );

  // 🎨 MINIMAL TEMPLATE
  const renderMinimalTemplate = (data: ResumeData) => (
    <svg viewBox="0 0 612 792" className="w-full h-full">
      {/* Clean white background */}
      <rect width="612" height="792" fill="white"/>
      
      {/* Name */}
      <text x="50" y="60" fontFamily="sans-serif" fontSize="28" fontWeight="300" fill={config.primaryColor} letterSpacing="1px">
        {data.fullName}
      </text>
      
      {/* Accent line */}
      <line x1="50" y1="75" x2="200" y2="75" stroke={config.primaryColor} strokeWidth="1"/>
      
      {/* Contact info */}
      <text x="50" y="95" fontFamily="sans-serif" fontSize="11" fill="#6b7280">
        {data.email} • {data.phone} • {data.location}
      </text>

      {/* About */}
      <text x="50" y="140" fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor} letterSpacing="1px">
        ABOUT
      </text>

      <foreignObject x="50" y="155" width="500" height="80">
        <div style={{
          fontFamily: 'sans-serif',
          fontSize: '11px',
          lineHeight: '1.7',
          color: '#374151',
          textAlign: 'justify'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Experience */}
      <text x="50" y="270" fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor} letterSpacing="1px">
        EXPERIENCE
      </text>

      {data.workExperience.slice(0, 3).map((job, index) => (
        <g key={index}>
          <line x1="50" y1={285 + index * 90} x2="550" y2={285 + index * 90} stroke="#f3f4f6" strokeWidth="1"/>
          
          <text x="50" y={305 + index * 90} fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor}>
            {job.title || job.position || 'Network Engineer'}
          </text>
          
          <text x="50" y={320 + index * 90} fontFamily="sans-serif" fontSize="11" fill="#6b7280">
            {job.company || 'Technology Company'}
          </text>
          
          <text x="450" y={320 + index * 90} fontFamily="sans-serif" fontSize="11" fill="#9ca3af">
            {job.startDate || '2022'} — {job.endDate || 'Present'}
          </text>

          <foreignObject x="50" y={330 + index * 90} width="500" height="40">
            <div style={{ fontSize: '10px', lineHeight: '1.6', color: '#6b7280' }}>
              {(job.description || 'Led network infrastructure projects and security implementations.').substring(0, 180)}...
            </div>
          </foreignObject>
        </g>
      ))}

      {/* Skills & Education */}
      <g>
        <text x="50" y={570} fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor} letterSpacing="1px">
          SKILLS
        </text>

        {data.skills.length > 0 && (
          <foreignObject x="50" y="585" width="250" height="100">
            <div style={{ 
              fontSize: '10px', 
              lineHeight: '1.8', 
              color: '#6b7280',
              columnCount: 2,
              columnGap: '25px'
            }}>
              {data.skills.slice(0, 12).map((skill, index) => (
                <div key={index} style={{marginBottom: '6px'}}>
                  {skill}
                </div>
              ))}
            </div>
          </foreignObject>
        )}

        <text x="320" y={570} fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor} letterSpacing="1px">
          EDUCATION
        </text>

        {data.education.slice(0, 2).map((edu, index) => (
          <g key={index}>
            <text x="320" y={595 + index * 35} fontFamily="sans-serif" fontSize="11" fontWeight="500" fill={config.primaryColor}>
              {edu.degree || 'Bachelor of Science'}
            </text>
            <text x="320" y={610 + index * 35} fontFamily="sans-serif" fontSize="10" fill="#6b7280">
              {edu.institution || edu.school || 'University'} • {edu.year || edu.endDate || '2020'}
            </text>
          </g>
        ))}
      </g>
      
      {/* ReWork badge */}
      {version === 'optimized' && (
        <text x="306" y="750" textAnchor="middle" fontSize="9" fill={config.primaryColor} fontWeight="300">
          ✨ reWorked with ReWork
        </text>
      )}
    </svg>
  );

  // 🎨 CREATIVE TEMPLATE
  const renderCreativeTemplate = (data: ResumeData) => (
    <svg viewBox="0 0 612 792" className="w-full h-full">
      <defs>
        <linearGradient id="creativeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: config.primaryColor}} />
          <stop offset="100%" style={{stopColor: config.accentColor}} />
        </linearGradient>
      </defs>

      {/* Clean background */}
      <rect width="612" height="792" fill="white"/>
      
      {/* Bold header */}
      <rect x="0" y="0" width="612" height="160" fill="url(#creativeGradient)"/>
      
      {/* Name */}
      <text x="50" y="70" fontFamily="sans-serif" fontSize="28" fontWeight="700" fill="white">
        {data.fullName}
      </text>
      
      {/* Professional tagline */}
      <text x="50" y="95" fontFamily="sans-serif" fontSize="14" fill="rgba(255,255,255,0.9)">
        Network Infrastructure Professional
      </text>

      {/* Contact info */}
      <text x="50" y="115" fontSize="11" fill="rgba(255,255,255,0.8)">
        {data.email} • {data.phone} • {data.location}
      </text>

      {/* About section */}
      <rect x="40" y="180" width="532" height="120" fill="white" rx="12" stroke={config.primaryColor} strokeWidth="2"/>
      
      <text x="60" y="205" fontFamily="sans-serif" fontSize="16" fontWeight="700" fill={config.primaryColor}>
        About Me
      </text>

      <foreignObject x="60" y="220" width="500" height="70">
        <div style={{
          fontFamily: 'sans-serif',
          fontSize: '11px',
          lineHeight: '1.6',
          color: '#1f2937'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Experience section */}
      <text x="40" y="330" fontFamily="sans-serif" fontSize="18" fontWeight="700" fill={config.primaryColor}>
        Experience
      </text>

      {data.workExperience.slice(0, 2).map((job, index) => (
        <g key={index}>
          <rect x="40" y={350 + index * 130} width="350" height="110" 
                fill="white" 
                rx="16" 
                stroke={config.accentColor} 
                strokeWidth="2"/>
          
          <rect x="40" y={350 + index * 130} width="6" height="110" fill={config.primaryColor} rx="3"/>
          
          {/* Experience number */}
          <circle cx="70" cy={375 + index * 130} r="12" fill={config.primaryColor}/>
          <text x="70" y={380 + index * 130} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
            {index + 1}
          </text>
          
          {/* Job title */}
          <text x="95" y={380 + index * 130} fontFamily="sans-serif" fontSize="13" fontWeight="700" fill={config.primaryColor}>
            {job.title || job.position || 'Network Engineer'}
          </text>
          
          {/* Company */}
          <text x="95" y={395 + index * 130} fontFamily="sans-serif" fontSize="11" fontWeight="600" fill={config.accentColor}>
            {job.company || 'Technology Company'}
          </text>
          
          {/* Dates */}
          <text x="310" y={395 + index * 130} fontFamily="sans-serif" fontSize="10" fill="#6b7280">
            {job.startDate || '2022'} - {job.endDate || 'Present'}
          </text>

          <foreignObject x="95" y={405 + index * 130} width="280" height="45">
            <div style={{ 
              fontSize: '10px', 
              lineHeight: '1.5', 
              color: '#374151'
            }}>
              {(job.description || 'Led network infrastructure projects and security implementations.').substring(0, 140)}...
            </div>
          </foreignObject>
        </g>
      ))}

      {/* Skills section */}
      <rect x="410" y="350" width="162" height="240" fill="white" rx="16" stroke={config.primaryColor} strokeWidth="2"/>
      
      <text x="430" y="375" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill={config.primaryColor}>
        Skills
      </text>

      {data.skills.slice(0, 6).map((skill, skillIndex) => (
        <g key={skillIndex}>
          <text x="430" y={400 + skillIndex * 32} fontFamily="sans-serif" fontSize="11" fontWeight="500" fill="#374151">
            {skill}
          </text>
          
          {/* Skill progress circle */}
          <circle cx="550" cy={395 + skillIndex * 32} r="8" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
          <circle cx="550" cy={395 + skillIndex * 32} r="8" fill="none" stroke={config.accentColor} strokeWidth="2"
                  strokeDasharray={`${12 + Math.random() * 8} 50`}
                  transform={`rotate(-90 550 ${395 + skillIndex * 32})`}/>
          
          <text x="550" y={400 + skillIndex * 32} textAnchor="middle" fontSize="7" fill={config.primaryColor} fontWeight="600">
            {Math.floor(Math.random() * 20) + 80}%
          </text>
        </g>
      ))}

      {/* Education section */}
      <rect x="40" y="650" width="280" height="80" fill={config.primaryColor} rx="12"/>
      
      <text x="60" y="675" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="white">
        Education
      </text>
      
      {data.education.slice(0, 1).map((edu, index) => (
        <g key={index}>
          <text x="60" y="695" fontFamily="sans-serif" fontSize="11" fontWeight="500" fill="white" opacity="0.9">
            {edu.degree || 'Bachelor of Science'}
          </text>
          
          <text x="60" y="710" fontFamily="sans-serif" fontSize="10" fill="white" opacity="0.8">
            {edu.institution || edu.school || 'University'} • {edu.year || edu.endDate || '2020'}
          </text>
        </g>
      ))}

      {/* Technology chips */}
      <text x="340" y="675" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill={config.primaryColor}>
        Technologies
      </text>
      
      {data.skills.slice(6, 12).map((skill, index) => (
        <g key={index}>
          <rect 
            x={340 + (index % 3) * 70} 
            y={685 + Math.floor(index / 3) * 25} 
            width="65" 
            height="18" 
            fill="white" 
            stroke={config.accentColor} 
            strokeWidth="1" 
            rx="9"
          />
          <text 
            x={372 + (index % 3) * 70} 
            y={697 + Math.floor(index / 3) * 25} 
            textAnchor="middle" 
            fontSize="8" 
            fontWeight="600"
            fill={config.primaryColor}
          >
            {skill.substring(0, 10)}
          </text>
        </g>
      ))}
      
      {/* ReWork badge */}
      {version === 'optimized' && (
        <g>
          <rect x="240" y="750" width="132" height="18" fill={config.accentColor} rx="9"/>
          <text x="306" y="762" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">
            ✨ reWorked with ReWork
          </text>
        </g>
      )}
    </svg>
  );

  const renderTemplate = () => {
    if (!resumeData) return null;

    switch (template) {
      case 'modern':
        return renderModernTemplate(resumeData);
      case 'minimal':
        return renderMinimalTemplate(resumeData);
      case 'creative':
        return renderCreativeTemplate(resumeData);
      default:
        return renderProfessionalTemplate(resumeData);
    }
  };

  const getTemplateGradient = (template: string) => {
    const gradients = {
      professional: 'from-blue-500 to-blue-600',
      modern: 'from-indigo-500 to-indigo-600', 
      minimal: 'from-green-500 to-green-600',
      creative: 'from-red-500 to-red-600'
    };
    return gradients[template as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/20 ${className}`}>
        {(title || subtitle) && (
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                {title && <h3 className="text-white font-medium mb-1">{title}</h3>}
                {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
              </div>
            </div>
          </div>
        )}
        <div className="aspect-[8.5/11] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Loading resume data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/20 ${className}`}>
        {(title || subtitle) && (
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                {title && <h3 className="text-white font-medium mb-1">{title}</h3>}
                {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
              </div>
            </div>
          </div>
        )}
        <div className="aspect-[8.5/11] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <FileText className="w-12 h-12" />
            <p className="text-sm">Unable to load preview</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Template Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`bg-gradient-to-r ${getTemplateGradient(template)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
          {template.charAt(0).toUpperCase() + template.slice(1)} Template
        </div>
      </div>

      {/* SVG Resume Preview */}
      <div className="aspect-[8.5/11] bg-white p-4 relative">
        <div className="w-full h-full rounded-lg shadow-xl overflow-hidden bg-white">
          {renderTemplate()}
        </div>
      </div>

      {/* Template Info Footer */}
      <div className="p-4 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getTemplateGradient(template)}`}></div>
            <span>{template.charAt(0).toUpperCase() + template.slice(1)} Template</span>
            {colors && (
              <span className="text-xs opacity-75">• Custom Colors</span>
            )}
          </div>
          {version === 'optimized' && (
            <div className="text-xs text-green-300">✨ AI Enhanced</div>
          )}
        </div>
      </div>
    </div>
  );
}