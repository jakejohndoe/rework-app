// src/components/resume/DynamicResumeTemplate.tsx
'use client';

import React from 'react';

interface DynamicResumeTemplateProps {
  resumeData: any;
  template: 'professional' | 'modern' | 'minimal' | 'creative';
  colors?: {
    primary: string;
    accent: string;
  };
  resumeTitle?: string;
  maxHeight?: number;
}

interface ProcessedResumeData {
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

// Smart content prioritization functions
const calculateContentScore = (content: string): number => {
  let score = 0;
  
  // Technical keywords boost score
  const techKeywords = ['react', 'node', 'javascript', 'python', 'aws', 'api', 'database', 'led', 'managed', 'built', 'created', 'developed', 'improved', 'increased'];
  techKeywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) score += 2;
  });
  
  // Metrics and numbers boost score
  if (/\d+%|\$\d+|[0-9]+ users|[0-9]+k|[0-9]+m/i.test(content)) score += 3;
  
  // Action verbs boost score
  const actionVerbs = ['achieved', 'delivered', 'exceeded', 'optimized', 'streamlined'];
  actionVerbs.forEach(verb => {
    if (content.toLowerCase().includes(verb)) score += 1;
  });
  
  return score;
};

const prioritizeAchievements = (achievements: string[], maxCount: number = 4): string[] => {
  if (!achievements || !Array.isArray(achievements)) return [];
  
  return achievements
    .map(achievement => ({
      text: achievement,
      score: calculateContentScore(achievement)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .map(item => item.text);
};

const smartTruncate = (text: string, maxLength: number, preserveKeywords: boolean = true): string => {
  if (!text || text.length <= maxLength) return text;
  
  if (preserveKeywords) {
    // Find complete sentences that fit
    const sentences = text.split('. ');
    let result = '';
    
    for (const sentence of sentences) {
      const testResult = result + (result ? '. ' : '') + sentence;
      if (testResult.length <= maxLength) {
        result = testResult;
      } else {
        break;
      }
    }
    
    if (result) return result + (result.endsWith('.') ? '' : '.');
  }
  
  // Fallback: find last complete word
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.8 ? truncated.substring(0, lastSpace) : truncated) + '...';
};

// Dynamic font sizing based on content density
const calculateFontSizes = (contentLength: number, baseSize: number = 12): {
  title: number;
  content: number;
  small: number;
} => {
  let scaleFactor = 1;
  
  if (contentLength > 2000) scaleFactor = 0.75;
  else if (contentLength > 1500) scaleFactor = 0.85;
  else if (contentLength > 1000) scaleFactor = 0.9;
  
  return {
    title: Math.max(baseSize * 1.2 * scaleFactor, 10),
    content: Math.max(baseSize * scaleFactor, 8),
    small: Math.max(baseSize * 0.8 * scaleFactor, 7)
  };
};

// Enhanced data extraction with AI suggestion preservation
const extractEnhancedResumeData = (resumeData: any, resumeTitle?: string): ProcessedResumeData => {
  let contactInfo: any = {};
  let professionalSummary = '';
  let workExperience: any[] = [];
  let education: any[] = [];
  let skills: string[] = [];

  try {
    // Extract contact info
    if (resumeData.contactInfo || resumeData.contact) {
      const contact = resumeData.contactInfo || resumeData.contact;
      contactInfo = typeof contact === 'string' ? JSON.parse(contact) : contact;
    }

    // Extract professional summary with AI enhancement preservation
    if (resumeData.professionalSummary) {
      if (typeof resumeData.professionalSummary === 'string') {
        try {
          const parsed = JSON.parse(resumeData.professionalSummary);
          professionalSummary = parsed.summary || parsed.optimized || parsed.text || resumeData.professionalSummary;
        } catch {
          professionalSummary = resumeData.professionalSummary;
        }
      } else {
        professionalSummary = resumeData.professionalSummary.summary || 
                             resumeData.professionalSummary.optimized || 
                             resumeData.professionalSummary.text || '';
      }
    }

    // Extract work experience with achievement prioritization
    if (resumeData.workExperience) {
      const workExp = typeof resumeData.workExperience === 'string' 
        ? JSON.parse(resumeData.workExperience) 
        : resumeData.workExperience;
      
      workExperience = Array.isArray(workExp) ? workExp : [];
    }

    // Extract education
    if (resumeData.education) {
      const edu = typeof resumeData.education === 'string' 
        ? JSON.parse(resumeData.education) 
        : resumeData.education;
      
      education = Array.isArray(edu) ? edu : [];
    }

    // Extract skills with deduplication
    if (resumeData.skills) {
      let skillsData = resumeData.skills;
      
      if (typeof skillsData === 'string') {
        try {
          skillsData = JSON.parse(skillsData);
        } catch {
          skills = skillsData.split(',').map((s: string) => s.trim());
        }
      }
      
      if (typeof skillsData === 'object' && skillsData !== null) {
        const allSkills: string[] = [];
        ['technical', 'frameworks', 'tools', 'cloud', 'databases', 'soft'].forEach(category => {
          if (Array.isArray(skillsData[category])) {
            allSkills.push(...skillsData[category]);
          }
        });
        skills = [...new Set(allSkills)].filter(skill => skill && skill.trim());
      } else if (Array.isArray(skillsData)) {
        skills = [...new Set(skillsData)].filter(skill => skill && skill.trim());
      }
    }

  } catch (error) {
    console.error('Error extracting enhanced resume data:', error);
  }

  return {
    fullName: contactInfo?.name || 
              contactInfo?.fullName || 
              (contactInfo?.firstName && contactInfo?.lastName ? 
                `${contactInfo.firstName} ${contactInfo.lastName}` : '') ||
              resumeTitle || 
              'Professional Resume',
    email: contactInfo?.email || '',
    phone: contactInfo?.phone || '',
    location: contactInfo?.location || '',
    linkedin: contactInfo?.linkedin || '',
    professionalSummary,
    workExperience,
    education,
    skills
  };
};

// Template-specific configurations with enhanced limits
const getTemplateConfig = (template: string, customColors?: { primary: string; accent: string }) => {
  const configs = {
    professional: {
      colors: {
        primary: customColors?.primary || '#1e40af',
        secondary: '#64748b',
        accent: customColors?.accent || '#3b82f6',
        text: '#1f2937'
      },
      limits: {
        summary: 525,        // Increased from 350
        jobDescription: 1125, // Increased from 750
        achievements: 4,      // Increased from 3
        skills: 18           // Increased from 15
      },
      layout: 'single-column'
    },
    modern: {
      colors: {
        primary: customColors?.primary || '#7c3aed',
        secondary: '#6b7280',
        accent: customColors?.accent || '#a855f7',
        text: '#111827'
      },
      limits: {
        summary: 450,
        jobDescription: 950,
        achievements: 4,
        skills: 16
      },
      layout: 'two-column'
    },
    minimal: {
      colors: {
        primary: customColors?.primary || '#059669',
        secondary: '#6b7280',
        accent: customColors?.accent || '#10b981',
        text: '#374151'
      },
      limits: {
        summary: 495,
        jobDescription: 1050,
        achievements: 3,
        skills: 15
      },
      layout: 'minimal'
    },
    creative: {
      colors: {
        primary: customColors?.primary || '#ea580c',
        secondary: '#6b7280',
        accent: customColors?.accent || '#f97316',
        text: '#1f2937'
      },
      limits: {
        summary: 480,
        jobDescription: 975,
        achievements: 4,
        skills: 20
      },
      layout: 'creative'
    }
  };

  return configs[template as keyof typeof configs] || configs.professional;
};

export default function DynamicResumeTemplate({ 
  resumeData, 
  template, 
  colors, 
  resumeTitle,
  maxHeight = 1100 
}: DynamicResumeTemplateProps) {
  const data = extractEnhancedResumeData(resumeData, resumeTitle);
  const config = getTemplateConfig(template, colors);
  
  // Calculate total content length for dynamic sizing
  const totalContentLength = 
    data.professionalSummary.length +
    data.workExperience.reduce((sum, job) => sum + (job.description || '').length, 0) +
    data.skills.join(', ').length;
  
  const fontSizes = calculateFontSizes(totalContentLength);
  
  // Dynamic height calculation
  const estimatedHeight = Math.min(
    800 + (totalContentLength / 8), // Base height + content scaling
    maxHeight
  );

  const renderProfessionalTemplate = () => (
    <svg
      width="612"
      height={estimatedHeight}
      viewBox={`0 0 612 ${estimatedHeight}`}
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Header */}
      <rect x="0" y="0" width="612" height="80" fill={config.colors.primary} />
      
      {/* Name */}
      <text
        x="306"
        y="35"
        textAnchor="middle"
        fill="white"
        fontSize={fontSizes.title + 4}
        fontWeight="bold"
      >
        {data.fullName}
      </text>
      
      {/* Contact Info */}
      <text
        x="306"
        y="60"
        textAnchor="middle"
        fill="white"
        fontSize={fontSizes.small}
      >
        {[data.email, data.phone, data.location].filter(Boolean).join(' • ')}
      </text>

      {/* Professional Summary */}
      {data.professionalSummary && (
        <g>
          <text x="40" y="120" fill={config.colors.primary} fontSize={fontSizes.title} fontWeight="bold">
            Professional Summary
          </text>
          <line x1="40" y1="125" x2="250" y2="125" stroke={config.colors.accent} strokeWidth="2" />
          
          <foreignObject x="40" y="135" width="532" height="100">
            <div style={{ 
              fontSize: `${fontSizes.content}px`, 
              lineHeight: '1.5',
              color: config.colors.text,
              fontFamily: 'Arial, sans-serif'
            }}>
              {smartTruncate(data.professionalSummary, config.limits.summary, true)}
            </div>
          </foreignObject>
        </g>
      )}

      {/* Work Experience */}
      {data.workExperience.length > 0 && (
        <g>
          <text x="40" y="260" fill={config.colors.primary} fontSize={fontSizes.title} fontWeight="bold">
            Professional Experience
          </text>
          <line x1="40" y1="265" x2="300" y2="265" stroke={config.colors.accent} strokeWidth="2" />
          
          {data.workExperience.slice(0, 4).map((job, index) => {
            const yPos = 285 + (index * 140);
            const prioritizedAchievements = prioritizeAchievements(
              job.achievements || [], 
              config.limits.achievements
            );
            
            return (
              <g key={index}>
                {/* Job Title and Date */}
                <text x="40" y={yPos} fill={config.colors.primary} fontSize={fontSizes.content + 1} fontWeight="bold">
                  {job.jobTitle || job.title || job.position || 'Position'}
                </text>
                <text x="572" y={yPos} textAnchor="end" fill={config.colors.secondary} fontSize={fontSizes.small}>
                  {job.startDate || '2020'} - {job.endDate || 'Present'}
                </text>
                
                {/* Company */}
                <text x="40" y={yPos + 18} fill={config.colors.secondary} fontSize={fontSizes.content}>
                  {job.company || 'Company Name'}
                </text>
                
                {/* Description/Achievements */}
                <foreignObject x="40" y={yPos + 30} width="532" height="90">
                  <div style={{ 
                    fontSize: `${fontSizes.content}px`, 
                    lineHeight: '1.4',
                    color: config.colors.text,
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    {prioritizedAchievements.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {prioritizedAchievements.map((achievement, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            {smartTruncate(achievement, 200, true)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      smartTruncate(
                        job.description || job.responsibilities || 'Responsible for key initiatives and strategic projects.',
                        config.limits.jobDescription,
                        true
                      )
                    )}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <g>
          <text x="40" y={285 + (data.workExperience.length * 140) + 40} fill={config.colors.primary} fontSize={fontSizes.title} fontWeight="bold">
            Core Skills
          </text>
          <line x1="40" y1={285 + (data.workExperience.length * 140) + 45} x2="150" y2={285 + (data.workExperience.length * 140) + 45} stroke={config.colors.accent} strokeWidth="2" />
          
          <foreignObject x="40" y={285 + (data.workExperience.length * 140) + 55} width="532" height="60">
            <div style={{ 
              fontSize: `${fontSizes.content}px`, 
              lineHeight: '1.5',
              color: config.colors.text,
              fontFamily: 'Arial, sans-serif'
            }}>
              {data.skills.slice(0, config.limits.skills).join(' • ')}
            </div>
          </foreignObject>
        </g>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <g>
          <text x="40" y={285 + (data.workExperience.length * 140) + 140} fill={config.colors.primary} fontSize={fontSizes.title} fontWeight="bold">
            Education
          </text>
          <line x1="40" y1={285 + (data.workExperience.length * 140) + 145} x2="150" y2={285 + (data.workExperience.length * 140) + 145} stroke={config.colors.accent} strokeWidth="2" />
          
          {data.education.slice(0, 3).map((edu, index) => {
            const yPos = 285 + (data.workExperience.length * 140) + 165 + (index * 30);
            return (
              <g key={index}>
                <text x="40" y={yPos} fill={config.colors.text} fontSize={fontSizes.content} fontWeight="bold">
                  {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
                </text>
                <text x="572" y={yPos} textAnchor="end" fill={config.colors.secondary} fontSize={fontSizes.small}>
                  {edu.graduationYear || edu.year || edu.endDate || '2020'}
                </text>
                <text x="40" y={yPos + 15} fill={config.colors.secondary} fontSize={fontSizes.small}>
                  {edu.institution || edu.school || 'University'}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );

  const renderModernTemplate = () => (
    <svg
      width="612"
      height={estimatedHeight}
      viewBox={`0 0 612 ${estimatedHeight}`}
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Sidebar */}
      <rect x="0" y="0" width="214" height={estimatedHeight} fill="#f8fafc" />
      
      {/* Main Content Area */}
      <rect x="214" y="0" width="398" height={estimatedHeight} fill="#ffffff" />
      
      {/* Sidebar Content */}
      <g>
        {/* Name */}
        <text x="20" y="40" fill={config.colors.primary} fontSize={fontSizes.title} fontWeight="bold">
          {data.fullName}
        </text>
        
        {/* Contact */}
        <text x="20" y="80" fill={config.colors.primary} fontSize={fontSizes.content} fontWeight="bold">
          CONTACT
        </text>
        {[
          { label: 'Email', value: data.email },
          { label: 'Phone', value: data.phone },
          { label: 'Location', value: data.location }
        ].filter(item => item.value).map((item, index) => (
          <text key={index} x="20" y={100 + (index * 20)} fill={config.colors.secondary} fontSize={fontSizes.small}>
            {item.value}
          </text>
        ))}
        
        {/* Skills */}
        {data.skills.length > 0 && (
          <g>
            <text x="20" y="200" fill={config.colors.primary} fontSize={fontSizes.content} fontWeight="bold">
              SKILLS
            </text>
            {data.skills.slice(0, config.limits.skills).map((skill, index) => (
              <g key={index}>
                <text x="20" y={220 + (index * 25)} fill={config.colors.text} fontSize={fontSizes.small}>
                  {skill}
                </text>
                <rect x="20" y={225 + (index * 25)} width="150" height="4" fill="#e5e7eb" />
                <rect x="20" y={225 + (index * 25)} width={Math.random() * 120 + 30} height="4" fill={config.colors.accent} />
              </g>
            ))}
          </g>
        )}
      </g>
      
      {/* Main Content */}
      <g>
        {/* Professional Summary */}
        {data.professionalSummary && (
          <g>
            <text x="234" y="40" fill={config.colors.primary} fontSize={fontSizes.title} fontWeight="bold">
              About Me
            </text>
            <foreignObject x="234" y="50" width="358" height="120">
              <div style={{ 
                fontSize: `${fontSizes.content}px`, 
                lineHeight: '1.5',
                color: config.colors.text,
                fontFamily: 'Arial, sans-serif'
              }}>
                {smartTruncate(data.professionalSummary, config.limits.summary, true)}
              </div>
            </foreignObject>
          </g>
        )}
        
        {/* Work Experience */}
        {data.workExperience.length > 0 && (
          <g>
            <text x="234" y="200" fill={config.colors.primary} fontSize={fontSizes.title} fontWeight="bold">
              Experience
            </text>
            
            {data.workExperience.slice(0, 3).map((job, index) => {
              const yPos = 220 + (index * 120);
              const prioritizedAchievements = prioritizeAchievements(
                job.achievements || [], 
                3
              );
              
              return (
                <g key={index}>
                  <text x="234" y={yPos} fill={config.colors.primary} fontSize={fontSizes.content} fontWeight="bold">
                    {job.jobTitle || job.title || job.position || 'Position'}
                  </text>
                  <text x="234" y={yPos + 15} fill={config.colors.secondary} fontSize={fontSizes.small}>
                    {job.company || 'Company Name'} • {job.startDate || '2020'} - {job.endDate || 'Present'}
                  </text>
                  
                  <foreignObject x="234" y={yPos + 25} width="358" height="80">
                    <div style={{ 
                      fontSize: `${fontSizes.small}px`, 
                      lineHeight: '1.4',
                      color: config.colors.text,
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {prioritizedAchievements.length > 0 ? (
                        prioritizedAchievements.map((achievement, i) => (
                          <div key={i} style={{ marginBottom: '4px' }}>
                            • {smartTruncate(achievement, 180, true)}
                          </div>
                        ))
                      ) : (
                        smartTruncate(
                          job.description || job.responsibilities || 'Responsible for key initiatives.',
                          config.limits.jobDescription * 0.8,
                          true
                        )
                      )}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        )}
      </g>
    </svg>
  );

  // Template renderer
  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return renderModernTemplate();
      case 'professional':
      default:
        return renderProfessionalTemplate();
    }
  };

  return (
    <div className={`w-full bg-white shadow-lg rounded-lg overflow-hidden`}>
      {renderTemplate()}
    </div>
  );
}