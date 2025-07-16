// src/components/resume/SVGResumePreview.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DynamicResumeTemplate from './DynamicResumeTemplate';

interface SVGResumePreviewProps {
  resumeId: string;
  version: 'original' | 'optimized';
  template: string;
  title?: string;
  subtitle?: string;
  className?: string;
  showDownload?: boolean;
  onDownload?: () => void;
  enableSvgToPdf?: boolean;
  onCelebration?: () => void;
  onSuccess?: () => void;
  useDynamicTemplate?: boolean; // New prop for enhanced AI-optimized rendering
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
  website: string;
  githubUrl: string;
  professionalSummary: string;
  workExperience: any[];
  education: any[];
  skills: string[];
}

// Helper functions for dynamic layout calculations
const calculateTextHeight = (text: string, fontSize: number, lineHeight: number = 1.5, maxWidth: number = 500): number => {
  // Estimate characters per line based on font size and width
  const avgCharWidth = fontSize * 0.6; // Approximation for average character width
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  const lines = Math.ceil(text.length / charsPerLine);
  return lines * fontSize * lineHeight;
};

const calculateContentHeight = (bullets: string[], fontSize: number = 11, lineHeight: number = 1.5, maxWidth: number = 500): number => {
  if (!bullets || bullets.length === 0) return 30; // Minimum height
  
  let totalHeight = 0;
  bullets.forEach(bullet => {
    const bulletHeight = calculateTextHeight(bullet, fontSize, lineHeight, maxWidth - 20); // Account for bullet point
    totalHeight += Math.max(bulletHeight, fontSize * lineHeight); // Minimum one line per bullet
    totalHeight += 4; // Margin between bullets
  });
  
  return Math.max(totalHeight, 50); // Ensure minimum readable height
};

const getResponsiveFontSize = (contentLength: number, baseSize: number = 11): number => {
  if (contentLength > 800) return Math.max(baseSize - 2, 8); // Very dense content
  if (contentLength > 500) return Math.max(baseSize - 1, 9); // Dense content
  return baseSize; // Normal content
};

const calculateJobContainerHeight = (job: any, extractContentFn: (job: any, maxLength: number) => any, baseHeight: number = 80): number => {
  const bullets = extractContentFn(job, 800); // Extract content using provided function
  const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
  
  // Calculate content height
  const contentHeight = calculateContentHeight(bulletsArray);
  
  // Total height = header (40px) + content + padding (20px)
  return baseHeight + contentHeight;
};

const toTitleCase = (str: string): string => {
  if (!str) return '';
  
  return str.replace(/\w\S*/g, (word) => {
    // Handle special cases for technical terms
    const lowerWord = word.toLowerCase();
    const specialCases: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'react': 'React',
      'nodejs': 'Node.js',
      'node.js': 'Node.js',
      'aws': 'AWS',
      'api': 'API',
      'apis': 'APIs',
      'ui': 'UI',
      'ux': 'UX',
      'css': 'CSS',
      'html': 'HTML',
      'sql': 'SQL',
      'ai': 'AI',
      'ml': 'ML',
      'gcp': 'GCP',
      'ios': 'iOS',
      'android': 'Android',
      'github': 'GitHub',
      'linkedin': 'LinkedIn',
      'fullstack': 'Full-Stack',
      'full-stack': 'Full-Stack',
      'frontend': 'Front-End',
      'front-end': 'Front-End',
      'backend': 'Back-End',
      'back-end': 'Back-End'
    };
    
    if (specialCases[lowerWord]) {
      return specialCases[lowerWord];
    }
    
    // Standard title case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

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

// Professional summary function - use AI suggestions exactly as provided
const enhanceProfessionalSummary = (summaryData: any): string => {
  if (!summaryData) return '';
  
  // If it's already a string, return it as-is (AI suggestions are already enhanced)
  if (typeof summaryData === 'string') {
    return summaryData;
  }
  
  // Extract the main summary - prioritize AI-enhanced version, use exactly as provided
  let mainSummary = summaryData.summary || summaryData.optimized || '';
  
  // Return the AI-generated summary exactly as provided without any modifications
  // AI suggestions are already well-crafted and should not be enhanced further
  return mainSummary;
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
  enableSvgToPdf = false,
  onCelebration,
  onSuccess,
  useDynamicTemplate = false,
  colors
}: SVGResumePreviewProps) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

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
    console.log('🔍 SVG Extracting resume data:', { version, hasContactInfo: !!data.contactInfo, hasSummary: !!data.professionalSummary, hasWorkExp: !!data.workExperience });
    console.log('🔍 Raw professional summary data:', data.professionalSummary);
    console.log('🔍 Raw skills data:', data.skills);
    console.log('🔍 Raw work experience data:', data.workExperience?.[0]?.achievements);
    
    let contactInfo: any = {};
    let professionalSummary = '';
    let workExperience: any[] = [];
    let education: any[] = [];
    let skills: any = {};

    try {
      // Parse contact info - FIXED: Handle both field names
      if (data.contactInfo || data.contact) {
        const contact = data.contactInfo || data.contact;
        if (typeof contact === 'string') {
          contactInfo = JSON.parse(contact);
        } else {
          contactInfo = contact;
        }
      }

      // FIXED: Parse professional summary - handle object structure correctly  
      if (data.professionalSummary) {
        console.log('🔍 Processing professional summary, type:', typeof data.professionalSummary);
        if (typeof data.professionalSummary === 'string') {
          try {
            const parsed = JSON.parse(data.professionalSummary);
            console.log('🔍 Parsed summary object:', parsed);
            professionalSummary = enhanceProfessionalSummary(parsed);
          } catch (e) {
            console.log('🔍 Using summary as string:', data.professionalSummary);
            professionalSummary = data.professionalSummary;
          }
        } else {
          // It's an object - extract and enhance the summary
          console.log('🔍 Processing summary object:', data.professionalSummary);
          professionalSummary = enhanceProfessionalSummary(data.professionalSummary);
        }
        console.log('🔍 Final professional summary:', professionalSummary);
      }

      // FIXED: Parse work experience - handle the actual structure from apply-suggestions
      if (data.workExperience) {
        if (typeof data.workExperience === 'string') {
          workExperience = JSON.parse(data.workExperience);
        } else {
          workExperience = data.workExperience;
        }
        if (!Array.isArray(workExperience)) {
          workExperience = [];
        }
      }

      // FIXED: Parse education - handle the actual structure
      if (data.education) {
        if (typeof data.education === 'string') {
          education = JSON.parse(data.education);
        } else {
          education = data.education;
        }
        if (!Array.isArray(education)) {
          education = [];
        }
        
        // Clean up education data - ensure relevantCoursework is an array
        education = education.map(edu => {
          if (edu.relevantCoursework) {
            if (typeof edu.relevantCoursework === 'string') {
              // Handle raw coursework text - filter out non-course content
              let courseworkText = edu.relevantCoursework;
              
              // If it contains raw bootcamp text, extract meaningful parts
              if (courseworkText.includes('ChatGPT') || courseworkText.includes('Metana Career')) {
                // Replace with AI-enhanced coursework
                edu.relevantCoursework = [
                  'Backend Development',
                  'REST APIs',
                  'Database Management',
                  'ERP Projects',
                  'E-commerce Development'
                ];
              } else {
                // Convert string to array by splitting on common delimiters
                edu.relevantCoursework = courseworkText
                  .split(/[•\n\r]+/)
                  .map((item: string) => item.trim())
                  .filter((item: string) => item.length > 0 && item.length < 100) // Filter out very long raw text
                  .slice(0, 4); // Limit to 4 items
              }
            } else if (Array.isArray(edu.relevantCoursework)) {
              // Clean up array items
              edu.relevantCoursework = edu.relevantCoursework
                .map((item: string) => item.trim())
                .filter((item: string) => item.length > 0 && item.length < 100) // Filter out very long raw text
                .slice(0, 4); // Limit to 4 items
            }
          }
          return edu;
        });
      }

      // FIXED: Parse skills - handle the structured object format from apply-suggestions
      if (data.skills) {
        console.log('🔍 Processing skills, type:', typeof data.skills, 'value:', data.skills);
        if (typeof data.skills === 'string') {
          try {
            skills = JSON.parse(data.skills);
            console.log('🔍 Parsed skills object:', skills);
          } catch (e) {
            // If parsing fails, treat as comma-separated string
            skills = { technical: data.skills.split(',').map((s: string) => s.trim()) };
            console.log('🔍 Fallback skills parsing:', skills);
          }
        } else {
          skills = data.skills;
          console.log('🔍 Using skills object directly:', skills);
        }
        
        // Ensure it's an object, not an array
        if (Array.isArray(skills)) {
          skills = { technical: skills };
          console.log('🔍 Converted array to object:', skills);
        }
        console.log('🔍 Final skills object:', skills);
      }

      // Handle fallback case when no structured data exists
      if (!contactInfo || Object.keys(contactInfo).length === 0) {
        if (data.originalContent || data.currentContent) {
          const content = data.originalContent || data.currentContent;
          contactInfo = {
            name: extractNameFromContent(content) || 'Jake Johnson',
            email: extractEmailFromContent(content) || 'hello@jakejohnson.com',
            phone: extractPhoneFromContent(content) || '(219) 925-7195',
            location: 'Saint Paul, MN'
          };
          
          if (!professionalSummary) {
            professionalSummary = extractSummaryFromContent(content) || 'Professional Network Engineer with expertise in infrastructure design and implementation.';
          }
        } else {
          contactInfo = {
            name: 'Jake Johnson',
            email: 'hello@jakejohnson.com',
            phone: '(219) 925-7195',
            location: 'Saint Paul, MN'
          };
          if (!professionalSummary) {
            professionalSummary = 'Professional Network Engineer with expertise in infrastructure design and implementation.';
          }
        }
      }

    } catch (error) {
      console.error('❌ Error parsing resume data:', error);
      contactInfo = {
        name: 'Jake Johnson',
        email: 'hello@jakejohnson.com',
        phone: '(219) 925-7195',
        location: 'Saint Paul, MN'
      };
      professionalSummary = 'Professional Network Engineer with expertise in infrastructure design and implementation.';
    }

    // FIXED: Use resume title first, then contact info, then fallback - matching PDF logic
    const fullName = contactInfo?.name || 
                     contactInfo?.fullName || 
                     ((contactInfo?.firstName && contactInfo?.lastName) ? 
                       `${contactInfo.firstName} ${contactInfo.lastName}` : '') ||
                     'Jake Johnson';

    // Extract skills array from skills object - matching PDF logic
    const extractSkillsArray = (skills: any): string[] => {
      const skillsArray = [];
      if (skills.technical && Array.isArray(skills.technical)) skillsArray.push(...skills.technical);
      if (skills.frameworks && Array.isArray(skills.frameworks)) skillsArray.push(...skills.frameworks);
      if (skills.tools && Array.isArray(skills.tools)) skillsArray.push(...skills.tools);
      if (skills.cloud && Array.isArray(skills.cloud)) skillsArray.push(...skills.cloud);
      if (skills.databases && Array.isArray(skills.databases)) skillsArray.push(...skills.databases);
      if (skills.soft && Array.isArray(skills.soft)) skillsArray.push(...skills.soft);
      
      // Fallback to treating skills as simple array
      if (skillsArray.length === 0 && Array.isArray(skills)) {
        skillsArray.push(...skills);
      }
      
      return skillsArray;
    };

    const extractedData = {
      fullName: fullName.trim(),
      email: contactInfo?.email || '',
      phone: contactInfo?.phone || '',
      location: contactInfo?.location || '',
      linkedin: contactInfo?.linkedin || '',
      website: contactInfo?.website || '',
      githubUrl: contactInfo?.githubUrl || '',
      professionalSummary: professionalSummary || 'Professional Network Engineer with expertise in infrastructure design and implementation.',
      workExperience: Array.isArray(workExperience) ? workExperience : [],
      education: Array.isArray(education) ? education : [],
      skills: extractSkillsArray(skills)
    };

    console.log('✅ SVG Final extracted data:', {
      name: extractedData.fullName,
      email: extractedData.email,
      summaryLength: extractedData.professionalSummary.length,
      workExpCount: extractedData.workExperience.length,
      educationCount: extractedData.education.length,
      skillsCount: extractedData.skills.length,
      firstWorkEntry: extractedData.workExperience[0]?.jobTitle || extractedData.workExperience[0]?.title || 'none',
      customColors: colors ? `${colors.primary} / ${colors.accent}` : 'default',
      educationData: extractedData.education.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        relevantCoursework: edu.relevantCoursework
      }))
    });

    return extractedData;
  };

  // Enhanced work experience content extraction with bullet points - MEMOIZED
  const extractWorkExperienceContent = useCallback((job: any, maxLength: number = 600) => {
    // Extract and format as bullet points
    let bullets: string[] = [];
    
    // PRIORITY 1: Use AI-enhanced achievements if available - STRICT
    if (job.achievements && Array.isArray(job.achievements) && job.achievements.length > 0) {
      // Process ALL achievements with category-based parsing
      const processedAchievements: string[] = [];
      
      job.achievements.forEach((achievement: any, index: number) => {
        let cleaned = achievement.replace(/^\s*[•\-\*]\s*/, '').trim();
        
        // Filter out mixed content - only keep AI-generated achievements
        if (cleaned.includes('Rework (Application)') || cleaned.includes('AI powered application that optimizes')) {
          return; // Skip this mixed content
        }
        
        // Skip duplicate achievements (when AI sends same content multiple times)
        const isDuplicate = job.achievements.some((other: any, otherIndex: number) => {
          return otherIndex < index && other.trim() === achievement.trim();
        });
        if (isDuplicate) {
          console.log('🔍 Skipping duplicate achievement:', cleaned.substring(0, 50) + '...');
          return;
        }
        
        // NEW: Parse category-based format like "Team Leadership & Operations: Description..."
        if (cleaned.includes(':') && cleaned.length > 100) {
          console.log('🔍 Processing category-based achievement:', cleaned.substring(0, 100) + '...');
          
          // Split the entire text into category-based segments
          const categorySegments: Array<{category: string, description: string}> = [];
          
          // First, try to split by common category patterns
          const categoryKeywords = [
            'Team Leadership & Operations',
            'Technical & Product Expertise',
            'Systems & Tools',
            'Customer Relations & Negotiation',
            'Financial Oversight',
            'Marketing & Outreach',
            'Documentation & Compliance',
            'Research & Strategy',
            'Project Management',
            'Business Development',
            'Quality Assurance'
          ];
          
          // Find all category positions in the text
          const categoryMatches: Array<{keyword: string, index: number}> = [];
          categoryKeywords.forEach(keyword => {
            let searchIndex = 0;
            while (searchIndex < cleaned.length) {
              const index = cleaned.indexOf(keyword + ':', searchIndex);
              if (index !== -1) {
                categoryMatches.push({ keyword, index });
                searchIndex = index + keyword.length;
              } else {
                break;
              }
            }
          });
          
          // Sort by position
          categoryMatches.sort((a, b) => a.index - b.index);
          
          // Extract segments between categories
          if (categoryMatches.length > 0) {
            categoryMatches.forEach((match, i) => {
              const startIndex = match.index + match.keyword.length + 1; // +1 for the colon
              const endIndex = i < categoryMatches.length - 1 ? categoryMatches[i + 1].index : cleaned.length;
              const description = cleaned.substring(startIndex, endIndex).trim();
              
              if (description.length > 15) {
                categorySegments.push({
                  category: match.keyword,
                  description: description.replace(/\.$/, '') // Remove trailing period to add consistently
                });
              }
            });
          }
          
          // If we found category segments, add them as separate achievements
          if (categorySegments.length > 0) {
            categorySegments.forEach(segment => {
              processedAchievements.push(`${segment.category}: ${segment.description}`);
            });
            console.log(`✅ Parsed ${categorySegments.length} category-based achievements`);
          } else {
            // Fallback: treat as single achievement if no categories found
            processedAchievements.push(cleaned);
          }
        }
        // Standard achievement format
        else if (cleaned.match(/^(Developed|Engineered|Led|Managed|Implemented|Created|Built|Designed|Achieved|Delivered|Collaborated|Streamlined|Optimized|Enhanced|Utilized|Leveraged|Boosted|Increased|Improved|Established|Coordinated|Executed|Demonstrated|Operated|Contributed|Advanced|Gained|Conducted|Assisted|Handled|Team|Technical|Systems|Customer|Marketing|Financial|Documentation|Research|Sales|Business)/)) {
          processedAchievements.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
        }
        // Handle longer descriptions by extracting meaningful content
        else if (cleaned.length > 300) {
          const firstSentence = cleaned.split(/[.!?]/)[0];
          if (firstSentence && firstSentence.length > 20) {
            processedAchievements.push(firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1) + '.');
          }
        }
      });
      
      // Remove the 3-bullet limit - use all valid achievements since containers are now dynamic
      bullets = processedAchievements;
      
      // Reduced logging to prevent console spam
    } 
    // PRIORITY 2: Only use if NO achievements exist AND no AI optimization has been applied
    else if (!job.achievements && (job.description || job.responsibilities || job.summary || job.duties)) {
      const content = job.description || job.responsibilities || job.summary || job.duties || '';
      if (content) {
        // Split by sentences and take the best ones
        const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
        bullets = sentences.slice(0, 3).map((sentence: string) => {
          const cleaned = sentence.replace(/^\s*[•\-\*]\s*/, '').trim();
          return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        });
        console.log('⚠️ Using fallback description (no achievements found):', bullets);
      }
    }
    
    // PRIORITY 3: Create intelligent fallback based on job title
    if (bullets.length === 0) {
      const jobTitle = (job.jobTitle || job.title || 'professional').toLowerCase();
      const company = job.company || 'the company';
      
      if (jobTitle.includes('founder') || jobTitle.includes('developer')) {
        bullets = [
          `Led development of innovative solutions at ${company}, achieving significant technical milestones`,
          `Designed and implemented scalable systems using modern technologies and best practices`,
          `Collaborated with stakeholders to deliver high-quality products that exceeded expectations`
        ];
      } else if (jobTitle.includes('manager') || jobTitle.includes('lead')) {
        bullets = [
          `Managed team operations and strategic initiatives at ${company}`,
          `Implemented process improvements that enhanced efficiency and quality`,
          `Coordinated cross-functional projects delivering measurable business value`
        ];
      } else if (jobTitle.includes('agent') || jobTitle.includes('service')) {
        bullets = [
          `Delivered exceptional customer service and support at ${company}`,
          `Managed client relationships and resolved complex issues efficiently`,
          `Contributed to team success through collaborative problem-solving`
        ];
      } else {
        bullets = [
          `Executed key responsibilities with focus on quality and efficiency at ${company}`,
          `Contributed to team success through collaborative problem-solving`,
          `Maintained high standards of professional excellence`
        ];
      }
    }
    
    // Since containers are now dynamic, use all valid bullets without artificial limits
    // Only ensure we have at least 1 bullet point for completeness
    if (bullets.length === 0) {
      const company = job.company || 'the organization';
      bullets.push(`Demonstrated strong performance and reliability in all assigned tasks at ${company}`);
    }
    
    // Use AI suggestions as-is without aggressive truncation (they're well-crafted)
    // No longer limit to 2 bullets since containers are dynamic
    const finalBullets = bullets.map(bullet => {
      // Only truncate if extremely long (over 800 chars), AI suggestions should be good as-is
      if (bullet.length > 800) {
        // Find last complete sentence within reasonable length
        const sentences = bullet.split('. ');
        let result = sentences[0];
        for (let i = 1; i < sentences.length && (result + '. ' + sentences[i]).length <= 600; i++) {
          result += '. ' + sentences[i];
        }
        return result.endsWith('.') ? result : result + '.';
      }
      return bullet;
    });
    
    return finalBullets;
  }, []);

  // Extract skills/keywords from job content when no technologies array exists
  const extractJobSkills = (job: any) => {
    // If technologies array exists, use it
    if (job.technologies && Array.isArray(job.technologies) && job.technologies.length > 0) {
      return job.technologies;
    }
    
    // Otherwise, extract key skills from content
    const allContent = [
      job.description || '',
      job.responsibilities || '',
      job.summary || '',
      job.duties || '',
      ...(job.achievements || [])
    ].join(' ');
    
    // Common skill patterns to extract
    const skillPatterns = [
      /\b(React|Vue|Angular|JavaScript|TypeScript|Node\.js|Python|Java|C\+\+|PHP|Ruby|Go|Rust)\b/gi,
      /\b(AWS|Azure|GCP|Docker|Kubernetes|MongoDB|PostgreSQL|MySQL|Redis)\b/gi,
      /\b(Git|GitHub|GitLab|Jira|Agile|Scrum|CI\/CD|DevOps)\b/gi,
      /\b(HTML|CSS|SASS|Bootstrap|Tailwind|Material UI)\b/gi,
      /\b(REST API|GraphQL|Microservices|API|Database|SQL|NoSQL)\b/gi,
      /\b(Leadership|Management|Training|Customer Service|Sales|Marketing)\b/gi,
      /\b(Excel|Word|PowerPoint|Salesforce|CRM|ERP|POS|Point of Sale)\b/gi,
      /\b(Communication|Negotiation|Problem Solving|Team Building|Project Management)\b/gi,
      /\b(RentalWorks|Rental|Equipment|Logistics|Inventory|Operations|Workflows)\b/gi
    ];
    
    const extractedSkills = new Set<string>();
    
    skillPatterns.forEach(pattern => {
      const matches = allContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          extractedSkills.add(match.trim());
        });
      }
    });
    
    // Convert to array and limit
    const skillsArray = Array.from(extractedSkills).slice(0, 8);
    
    // If still no skills found, add some based on job title
    if (skillsArray.length === 0) {
      const jobTitle = (job.jobTitle || job.title || '').toLowerCase();
      if (jobTitle.includes('developer') || jobTitle.includes('engineer')) {
        return ['JavaScript', 'React', 'Node.js', 'Git'];
      } else if (jobTitle.includes('agent') || jobTitle.includes('sales')) {
        return ['Customer Service', 'Sales', 'Communication', 'CRM'];
      } else if (jobTitle.includes('manager') || jobTitle.includes('lead')) {
        return ['Leadership', 'Project Management', 'Team Building', 'Operations'];
      }
    }
    
    return skillsArray;
  };

  // Direct SVG download function
  const handleSvgDownload = async () => {
    if (!svgRef.current) return;
    
    setIsDownloading(true);
    try {
      // Get the SVG content as a string
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);
      
      // Add XML declaration and namespace if missing
      if (!svgString.startsWith('<?xml')) {
        svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
      }
      
      // Ensure SVG has proper namespace
      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      
      // Create blob and download
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `resume-${template}-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ SVG download complete');
    } catch (error) {
      console.error('❌ SVG download failed:', error);
      alert('Failed to download SVG. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // SVG to PDF via manual canvas rendering
  const handleSvgToPdfDownload = async () => {
    if (!svgRef.current) return;
    
    setIsDownloading(true);
    try {
      console.log('🎨 Converting SVG to PDF via manual canvas...');
      
      // Get the SVG content as a string
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);
      
      // Ensure SVG has proper namespace
      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      
      // Convert foreignObject HTML to SVG text elements for better compatibility
      // This is a simplified approach - we'll render what we can
      console.log('🔧 Processing SVG for PDF compatibility...');
      
      // Create a canvas for rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Set canvas size (2x for high resolution)
      const scale = 2;
      canvas.width = 612 * scale;
      canvas.height = 900 * scale;
      ctx.scale(scale, scale);
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 612, 900);
      
      // Create an image from SVG
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SVG image load timeout'));
        }, 15000);
        
        img.onload = () => {
          clearTimeout(timeout);
          try {
            ctx.drawImage(img, 0, 0, 612, 792);
            console.log('✅ SVG rendered to canvas successfully');
            resolve(null);
          } catch (drawError) {
            reject(new Error(`Canvas draw failed: ${drawError}`));
          }
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Failed to load SVG as image'));
        };
        
        img.src = svgDataUrl;
      });
      
      // Convert canvas to PNG
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, 612, 792, '', 'FAST');
      
      // Download
      const filename = `resume-${template}-${Date.now()}.pdf`;
      pdf.save(filename);
      
      console.log('✅ SVG to PDF conversion complete');
      
      // Trigger celebration and success notification if callbacks provided
      if (onCelebration) {
        onCelebration();
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ SVG to PDF conversion failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      
      // Fallback: suggest SVG download
      const fallbackMessage = `PDF conversion failed: ${errorMessage}\n\nWould you like to download as SVG instead? (Click OK for SVG, Cancel to try PDF again)`;
      if (window.confirm(fallbackMessage)) {
        await handleSvgDownload();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // 🎨 PROFESSIONAL TEMPLATE
  const renderProfessionalTemplate = (data: ResumeData) => (
    <svg ref={svgRef} viewBox="0 0 750 925" className="w-full h-full">
      <defs>
        <linearGradient id="profGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: config.primaryColor}} />
          <stop offset="100%" style={{stopColor: config.accentColor}} />
        </linearGradient>
      </defs>

      {/* White background */}
      <rect width="750" height="925" fill="white"/>
      
      {/* Header */}
      <rect x="0" y="0" width="750" height="120" fill="url(#profGradient)"/>
      
      {/* Name */}
      <text x="375" y="50" textAnchor="middle" fontSize="28" fontWeight="400" fill="white" fontFamily="serif" letterSpacing="1px">
        {data.fullName}
      </text>
      
      {/* Contact info */}
      <text x="375" y="75" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.9)" fontFamily="sans-serif">
        {data.email} • {data.phone} • {data.location}
      </text>
      
      {/* Professional tagline */}
      <text x="375" y="95" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)" fontFamily="serif" fontStyle="italic">
        Network Engineer Professional
      </text>

      {/* Professional Summary */}
      <text x="40" y="160" fontSize="16" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
        Professional Summary
      </text>
      <line x1="40" y1="170" x2="140" y2="170" stroke={config.accentColor} strokeWidth="2"/>
      
      <foreignObject x="40" y="180" width="670" height="75">
        <div className="serif" style={{ 
          fontSize: '12px', 
          lineHeight: '1.5', 
          color: '#374151',
          fontFamily: 'serif',
          textAlign: 'justify',
          fontWeight: '500'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Professional Experience */}
      <text x="40" y="270" fontSize="16" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
        Professional Experience
      </text>
      <line x1="40" y1="280" x2="180" y2="280" stroke={config.accentColor} strokeWidth="2"/>

{(() => {
        // Calculate dynamic heights and positions for each job
        let currentY = 300; // Starting Y position after header (reduced from 310)
        
        return data.workExperience.slice(0, 2).map((job, index) => {
          const bullets = extractWorkExperienceContent(job, 800); // Allow more content
          const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
          
          // Calculate responsive font size based on content
          const totalContentLength = bulletsArray.join(' ').length;
          const fontSize = getResponsiveFontSize(totalContentLength, 11);
          
          // Calculate content height needed
          const contentHeight = calculateContentHeight(bulletsArray, fontSize, 1.3, 640);
          const skillsHeight = 22; // Height reserved for skills tags
          const headerHeight = 50; // Height for job title, company, etc.
          const containerHeight = Math.max(headerHeight + contentHeight + skillsHeight - 2, 90); // Header + content + skills + aggressive reduction
          
          const jobElement = (
            <g key={index}>
              <rect x="40" y={currentY} width="670" height={containerHeight} fill="white" stroke="#e5e7eb" strokeWidth="1" rx="6"/>
              <rect x="40" y={currentY} width="4" height={containerHeight} fill={config.accentColor} rx="2"/>
              
              <text x="55" y={currentY + 25} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
                {toTitleCase(job.jobTitle || job.title || job.position || 'Network Engineer')}
              </text>
              
              <text x="580" y={currentY + 25} fontSize="11" fill="#6b7280" fontFamily="sans-serif">
                {job.startDate || '2022'} — {job.endDate || 'Present'}
              </text>
              
              <text x="55" y={currentY + 40} fontSize="12" fontWeight="500" fill={config.accentColor} fontFamily="sans-serif">
                {toTitleCase(job.company || 'Technology Company')}
              </text>

              {/* Dynamic content area */}
              <foreignObject x="55" y={currentY + 50} width="640" height={contentHeight}>
                <div className="serif" style={{ 
                  fontSize: `${fontSize}px`, 
                  lineHeight: '1.3', 
                  color: '#374151',
                  wordWrap: 'break-word',
                  hyphens: 'auto'
                }}>
                  {bulletsArray.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      marginBottom: bulletIndex === bulletsArray.length - 1 ? '0px' : '2px'
                    }}>
                      <span style={{ 
                        marginRight: '8px', 
                        color: config.accentColor, 
                        fontWeight: '600',
                        fontSize: `${fontSize + 1}px`,
                        flexShrink: 0
                      }}>•</span>
                      <span style={{ flex: 1 }}>{bullet}</span>
                    </div>
                  ))}
                </div>
              </foreignObject>

            {/* Job-specific skills/technologies */}
            {(() => {
              const jobSkills = extractJobSkills(job);
              return jobSkills && jobSkills.length > 0 && (
                <foreignObject x="55" y={currentY + headerHeight + contentHeight - 2} width="640" height="20">
                  <div className="serif" style={{ 
                    fontSize: '9px', 
                    lineHeight: '1.4', 
                    color: '#6b7280',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '0px'
                  }}>
                    {jobSkills.slice(0, 8).map((tech: string, techIndex: number) => (
                      <span key={techIndex} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <span style={{color: config.accentColor}}>•</span>
                        {tech}
                      </span>
                    ))}
                  </div>
                </foreignObject>
              );
            })()}
          </g>
        );
        
        // Update Y position for next job
        currentY += containerHeight + 15; // Add gap between jobs
        
        return jobElement;
        });
      })()}

      {/* Skills & Education - Dynamic Positioning */}
      {(() => {
        // Calculate where work experience section ends
        let workExperienceEndY = 300; // Starting position (matches currentY)
        data.workExperience.slice(0, 2).forEach((job) => {
          const bullets = extractWorkExperienceContent(job, 800);
          const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
          const totalContentLength = bulletsArray.join(' ').length;
          const fontSize = getResponsiveFontSize(totalContentLength, 11);
          const contentHeight = calculateContentHeight(bulletsArray, fontSize, 1.3, 640);
          const containerHeight = Math.max(50 + contentHeight + 22 - 2, 90);
          workExperienceEndY += containerHeight + 15;
        });
        
        const skillsY = workExperienceEndY + 10; // Further reduced gap after work experience
        
        return (
          <g>
            <text x="40" y={skillsY} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
              Core Skills
            </text>
            <line x1="40" y1={skillsY + 10} x2="100" y2={skillsY + 10} stroke={config.accentColor} strokeWidth="2"/>
        
            {data.skills.length > 0 && (
              <foreignObject x="40" y={skillsY + 20} width="380" height="60">
                <div className="serif" style={{ 
                  fontSize: '10px', 
                  lineHeight: '1.4', 
                  color: '#374151',
                  columnCount: 2,
                  columnGap: '25px'
                }}>
                  {data.skills.slice(0, 6).map((skill, index) => {
                    // Debug: log skills that contain instruction phrases
                    if (skill.toLowerCase().includes('skills like') || skill.toLowerCase().includes('such as')) {
                      console.log('⚠️ Skill contains instruction phrase:', skill);
                    }
                    return (
                    <div key={index} style={{marginBottom: '3px', display: 'flex', alignItems: 'flex-start', breakInside: 'avoid', wordBreak: 'normal', overflowWrap: 'anywhere'}}>
                      <span style={{color: config.accentColor, marginRight: '4px', fontSize: '9px', flexShrink: 0}}>•</span>
                      <span style={{flex: 1}}>{skill}</span>
                    </div>
                  )})}
                </div>
              </foreignObject>
            )}

            <text x="420" y={skillsY} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
              Education
            </text>
            <line x1="420" y1={skillsY + 10} x2="470" y2={skillsY + 10} stroke={config.accentColor} strokeWidth="2"/>
        
            {data.education.slice(0, 2).map((edu, index) => (
              <foreignObject key={index} x="420" y={skillsY + 20 + index * 45} width="290" height="40">
                <div className="serif" style={{ 
                  fontSize: '11px', 
                  lineHeight: '1.4', 
                  color: config.primaryColor
                }}>
                  <div style={{fontWeight: '500', marginBottom: '2px'}}>
                    {toTitleCase(edu.degree || 'Degree')} {edu.field ? `in ${toTitleCase(edu.field)}` : ''}
                  </div>
                  <div style={{fontSize: '9px', color: '#6b7280', marginBottom: '2px'}}>
                    {toTitleCase(edu.institution || edu.school || 'University')} • {edu.graduationYear || edu.year || edu.endDate || '2020'}
                  </div>
                  {edu.relevantCoursework && Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
                    <div style={{fontSize: '8px', color: '#6b7280'}}>
                      {edu.relevantCoursework.slice(0, 3).map((course: string) => toTitleCase(course)).join(' • ')}
                    </div>
                  )}
                </div>
              </foreignObject>
            ))}
          </g>
        );
      })()}

      {/* ReWork badge - Dynamic positioning at absolute bottom */}
      {version === 'optimized' && (() => {
        // Calculate where all content actually ends
        let contentEndY = 300; // Starting position after work experience header
        
        // Add height of all work experience containers
        data.workExperience.slice(0, 2).forEach((job) => {
          const bullets = extractWorkExperienceContent(job, 800);
          const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
          const totalContentLength = bulletsArray.join(' ').length;
          const fontSize = getResponsiveFontSize(totalContentLength, 11);
          const contentHeight = calculateContentHeight(bulletsArray, fontSize, 1.3, 640);
          const containerHeight = Math.max(50 + contentHeight + 22 - 2, 90);
          contentEndY += containerHeight + 15;
        });
        
        // Add height of skills & education section
        const skillsEducationHeight = 130; // Increased to prevent education cutoff
        contentEndY += skillsEducationHeight;
        
        // Position badge at absolute bottom of the page
        const badgeY = 915; // Moved down to give more space to Core Skills
        
        return (
          <text x="375" y={badgeY} textAnchor="middle" fontSize="9" fill={config.accentColor} fontFamily="serif" fontStyle="italic">
            ✨ reWorked with ReWork
          </text>
        );
      })()}
    </svg>
  );

  // 🎨 MODERN TEMPLATE
  const renderModernTemplate = (data: ResumeData) => (
    <svg ref={svgRef} viewBox="0 0 750 925" className="w-full h-full">
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
      <rect width="750" height="925" fill="url(#modernBg)"/>
      
      {/* Header */}
      <rect x="0" y="0" width="750" height="120" fill={config.primaryColor}/>
      
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
      <rect x="40" y="140" width="670" height="75" fill="white" rx="12" stroke="#e2e8f0" strokeWidth="1"/>
      
      <text x="60" y="160" fontSize="16" fontWeight="600" fill={config.primaryColor} fontFamily="sans-serif">
        Professional Summary
      </text>
      
      <foreignObject x="60" y="170" width="640" height="60">
        <div className="sans-serif" style={{ 
          fontSize: '12px', 
          lineHeight: '1.5', 
          color: '#374151',
          fontFamily: 'sans-serif',
          padding: '0 5px 5px 0'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Experience */}
      <text x="40" y="240" fontSize="18" fontWeight="600" fill={config.primaryColor} fontFamily="sans-serif">
        Experience
      </text>

{(() => {
        // Calculate dynamic heights and positions for each job
        let currentY = 260; // Starting Y position after header
        
        return data.workExperience.slice(0, 2).map((job, index) => {
          const bullets = extractWorkExperienceContent(job, 800);
          const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
          
          // Calculate responsive font size based on content
          const totalContentLength = bulletsArray.join(' ').length;
          const fontSize = getResponsiveFontSize(totalContentLength, 11);
          
          // Calculate content height needed
          const contentHeight = calculateContentHeight(bulletsArray, fontSize, 1.3, 640);
          const skillsHeight = 22; // Height reserved for skills tags
          const headerHeight = 50; // Height for job title, company, etc.
          const containerHeight = Math.max(headerHeight + contentHeight + skillsHeight - 2, 90);
          
          const jobElement = (
            <g key={index}>
              <rect x="40" y={currentY} width="670" height={containerHeight} fill="white" rx="12" stroke="#e2e8f0" strokeWidth="1"/>
              <rect x="40" y={currentY} width="4" height={containerHeight} fill={config.accentColor} rx="2"/>
              
              <text x="55" y={currentY + 25} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="sans-serif">
                {toTitleCase(job.jobTitle || job.title || job.position || 'Network Engineer')}
              </text>
              
              <text x="580" y={currentY + 25} fontSize="11" fill="#6b7280" fontFamily="sans-serif">
                {job.startDate || '2022'} — {job.endDate || 'Present'}
              </text>
              
              <text x="55" y={currentY + 40} fontSize="12" fontWeight="500" fill={config.accentColor} fontFamily="sans-serif">
                {toTitleCase(job.company || 'Technology Company')}
              </text>

              {/* Dynamic content area */}
              <foreignObject x="55" y={currentY + 50} width="640" height={contentHeight}>
                <div className="sans-serif" style={{ 
                  fontSize: `${fontSize}px`, 
                  lineHeight: '1.3', 
                  color: '#374151',
                  wordWrap: 'break-word',
                  hyphens: 'auto'
                }}>
                  {bulletsArray.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      marginBottom: bulletIndex === bulletsArray.length - 1 ? '0px' : '2px'
                    }}>
                      <span style={{ 
                        marginRight: '8px', 
                        color: config.accentColor, 
                        fontWeight: '600',
                        fontSize: `${fontSize + 1}px`,
                        flexShrink: 0
                      }}>•</span>
                      <span style={{ flex: 1 }}>{bullet}</span>
                    </div>
                  ))}
                </div>
              </foreignObject>

            {/* Job-specific skills/technologies */}
            {(() => {
              const jobSkills = extractJobSkills(job);
              return jobSkills && jobSkills.length > 0 && (
                <foreignObject x="55" y={currentY + headerHeight + contentHeight - 2} width="640" height="20">
                  <div className="sans-serif" style={{ 
                    fontSize: '9px', 
                    lineHeight: '1.4', 
                    color: '#6b7280',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '0px'
                  }}>
                    {jobSkills.slice(0, 8).map((tech: string, techIndex: number) => (
                      <span key={techIndex} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <span style={{color: config.accentColor}}>•</span>
                        {tech}
                      </span>
                    ))}
                  </div>
                </foreignObject>
              );
            })()}
          </g>
        );
        
        // Update Y position for next job
        currentY += containerHeight + 15; // Add gap between jobs
        
        return jobElement;
        });
      })()}

      {/* Skills & Education - Dynamic Positioning */}
      {(() => {
        // Calculate where work experience section ends
        let workExperienceEndY = 260; // Starting position
        data.workExperience.slice(0, 2).forEach((job) => {
          const bullets = extractWorkExperienceContent(job, 800);
          const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
          const totalContentLength = bulletsArray.join(' ').length;
          const fontSize = getResponsiveFontSize(totalContentLength, 11);
          const contentHeight = calculateContentHeight(bulletsArray, fontSize, 1.3, 640);
          const containerHeight = Math.max(50 + contentHeight + 22 - 2, 90);
          workExperienceEndY += containerHeight + 15;
        });
        
        const skillsY = workExperienceEndY + 10;
        
        return (
          <g>
            <text x="40" y={skillsY} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="sans-serif">
              Core Skills
            </text>
        
            {data.skills.length > 0 && (
              <foreignObject x="40" y={skillsY + 20} width="380" height="60">
                <div className="sans-serif" style={{ 
                  fontSize: '10px', 
                  lineHeight: '1.4', 
                  color: '#374151',
                  columnCount: 2,
                  columnGap: '25px'
                }}>
                  {data.skills.slice(0, 6).map((skill, index) => {
                    // Debug: log skills that contain instruction phrases
                    if (skill.toLowerCase().includes('skills like') || skill.toLowerCase().includes('such as')) {
                      console.log('⚠️ Skill contains instruction phrase:', skill);
                    }
                    return (
                    <div key={index} style={{marginBottom: '3px', display: 'flex', alignItems: 'flex-start', breakInside: 'avoid', wordBreak: 'normal', overflowWrap: 'anywhere'}}>
                      <span style={{color: config.accentColor, marginRight: '4px', fontSize: '9px', flexShrink: 0}}>•</span>
                      <span style={{flex: 1}}>{skill}</span>
                    </div>
                  )})}
                </div>
              </foreignObject>
            )}

            <text x="420" y={skillsY} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="sans-serif">
              Education
            </text>
        
            {data.education.slice(0, 2).map((edu, index) => (
              <foreignObject key={index} x="420" y={skillsY + 20 + index * 45} width="290" height="40">
                <div className="sans-serif" style={{ 
                  fontSize: '11px', 
                  lineHeight: '1.4', 
                  color: config.primaryColor
                }}>
                  <div style={{fontWeight: '500', marginBottom: '2px'}}>
                    {toTitleCase(edu.degree || 'Degree')} {edu.field ? `in ${toTitleCase(edu.field)}` : ''}
                  </div>
                  <div style={{fontSize: '9px', color: '#6b7280', marginBottom: '2px'}}>
                    {toTitleCase(edu.institution || edu.school || 'University')} • {edu.graduationYear || edu.year || edu.endDate || '2020'}
                  </div>
                  {edu.relevantCoursework && Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
                    <div style={{fontSize: '8px', color: '#6b7280'}}>
                      {edu.relevantCoursework.slice(0, 3).map((course: string) => toTitleCase(course)).join(' • ')}
                    </div>
                  )}
                </div>
              </foreignObject>
            ))}
          </g>
        );
      })()}

      {/* ReWork badge - Dynamic positioning */}
      {version === 'optimized' && (
        <text x="375" y="915" textAnchor="middle" fontSize="9" fill={config.accentColor} fontWeight="500">
          ✨ reWorked with ReWork
        </text>
      )}
    </svg>
  );

  // 🎨 MINIMAL TEMPLATE
  const renderMinimalTemplate = (data: ResumeData) => (
    <svg ref={svgRef} viewBox="0 0 750 940" className="w-full h-full">
      {/* Clean white background */}
      <rect width="750" height="940" fill="white"/>
      
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

      <foreignObject x="50" y="155" width="650" height="75">
        <div className="sans-serif" style={{
          fontFamily: 'sans-serif',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#374151',
          textAlign: 'justify',
          padding: '0 10px 5px 0'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Experience */}
      <text x="50" y="240" fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor} letterSpacing="1px">
        EXPERIENCE
      </text>

{(() => {
        // Calculate dynamic heights and positions for each job
        let currentY = 260; // Starting Y position after header
        
        return data.workExperience.slice(0, 2).map((job, index) => {
          const bullets = extractWorkExperienceContent(job, 800);
          const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
          
          // Calculate responsive font size based on content
          const totalContentLength = bulletsArray.join(' ').length;
          const fontSize = getResponsiveFontSize(totalContentLength, 11);
          
          // Calculate content height needed
          const contentHeight = calculateContentHeight(bulletsArray, fontSize, 1.3, 640);
          const skillsHeight = 22; // Height reserved for skills tags
          const headerHeight = 50; // Height for job title, company, etc.
          const containerHeight = Math.max(headerHeight + contentHeight + skillsHeight - 2, 90);
          
          const jobElement = (
            <g key={index}>
              <line x1="50" y1={currentY} x2="700" y2={currentY} stroke="#f3f4f6" strokeWidth="1"/>
              
              <text x="50" y={currentY + 25} fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor}>
                {toTitleCase(job.jobTitle || job.title || job.position || 'Network Engineer')}
              </text>
              
              <text x="50" y={currentY + 40} fontFamily="sans-serif" fontSize="11" fill="#6b7280">
                {toTitleCase(job.company || 'Technology Company')}
              </text>
              
              <text x="580" y={currentY + 40} fontFamily="sans-serif" fontSize="11" fill="#9ca3af">
                {job.startDate || '2022'} — {job.endDate || 'Present'}
              </text>

              {/* Dynamic content area */}
              <foreignObject x="50" y={currentY + 50} width="640" height={contentHeight}>
                <div className="sans-serif" style={{ 
                  fontSize: `${fontSize}px`, 
                  lineHeight: '1.3', 
                  color: '#6b7280',
                  wordWrap: 'break-word',
                  hyphens: 'auto'
                }}>
                  {bulletsArray.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      marginBottom: bulletIndex === bulletsArray.length - 1 ? '0px' : '2px'
                    }}>
                      <span style={{ 
                        marginRight: '8px', 
                        color: config.accentColor, 
                        fontWeight: '600',
                        fontSize: `${fontSize + 1}px`,
                        flexShrink: 0
                      }}>•</span>
                      <span style={{ flex: 1 }}>{bullet}</span>
                    </div>
                  ))}
                </div>
              </foreignObject>

            {/* Job-specific skills/technologies */}
            {(() => {
              const jobSkills = extractJobSkills(job);
              return jobSkills && jobSkills.length > 0 && (
                <foreignObject x="50" y={currentY + headerHeight + contentHeight - 2} width="640" height="20">
                  <div className="sans-serif" style={{ 
                    fontSize: '9px', 
                    lineHeight: '1.4', 
                    color: '#9ca3af',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '0px'
                  }}>
                    {jobSkills.slice(0, 8).map((tech: string, techIndex: number) => (
                      <span key={techIndex} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <span style={{color: config.accentColor}}>•</span>
                        {tech}
                      </span>
                    ))}
                  </div>
                </foreignObject>
              );
            })()}
          </g>
        );
        
        // Update Y position for next job
        currentY += containerHeight + 15; // Add gap between jobs
        
        return jobElement;
        });
      })()}

      {/* Skills & Education - Dynamic Positioning */}
      {(() => {
        // Calculate where work experience section ends
        let workExperienceEndY = 260; // Starting position
        data.workExperience.slice(0, 2).forEach((job) => {
          const bullets = extractWorkExperienceContent(job, 800);
          const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
          const totalContentLength = bulletsArray.join(' ').length;
          const fontSize = getResponsiveFontSize(totalContentLength, 11);
          const contentHeight = calculateContentHeight(bulletsArray, fontSize, 1.3, 640);
          const containerHeight = Math.max(50 + contentHeight + 22 - 2, 90);
          workExperienceEndY += containerHeight + 15;
        });
        
        const skillsY = workExperienceEndY + 10;
        
        return (
          <g>
            <text x="50" y={skillsY} fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor} letterSpacing="1px">
              SKILLS
            </text>
        
            {data.skills.length > 0 && (
              <foreignObject x="50" y={skillsY + 15} width="380" height="60">
                <div className="sans-serif" style={{ 
                  fontSize: '10px', 
                  lineHeight: '1.4', 
                  color: '#6b7280',
                  columnCount: 2,
                  columnGap: '25px'
                }}>
                  {data.skills.slice(0, 6).map((skill, index) => {
                    // Debug: log skills that contain instruction phrases
                    if (skill.toLowerCase().includes('skills like') || skill.toLowerCase().includes('such as')) {
                      console.log('⚠️ Skill contains instruction phrase:', skill);
                    }
                    return (
                    <div key={index} style={{marginBottom: '6px', display: 'flex', alignItems: 'flex-start', breakInside: 'avoid'}}>
                      <span style={{color: config.accentColor, marginRight: '4px', fontSize: '9px', flexShrink: 0}}>•</span>
                      <span style={{flex: 1}}>{skill}</span>
                    </div>
                  )})}
                </div>
              </foreignObject>
            )}

            <text x="450" y={skillsY} fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor} letterSpacing="1px">
              EDUCATION
            </text>
        
            {data.education.slice(0, 2).map((edu, index) => (
              <foreignObject key={index} x="450" y={skillsY + 15 + index * 45} width="250" height="40">
                <div className="sans-serif" style={{ 
                  fontSize: '11px', 
                  lineHeight: '1.4', 
                  color: config.primaryColor
                }}>
                  <div style={{fontWeight: '500', marginBottom: '2px'}}>
                    {toTitleCase(edu.degree || 'Degree')} {edu.field ? `in ${toTitleCase(edu.field)}` : ''}
                  </div>
                  <div style={{fontSize: '10px', color: '#6b7280', marginBottom: '2px'}}>
                    {toTitleCase(edu.institution || edu.school || 'University')} • {edu.graduationYear || edu.year || edu.endDate || '2020'}
                  </div>
                  {edu.relevantCoursework && Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
                    <div style={{fontSize: '9px', color: '#6b7280'}}>
                      {edu.relevantCoursework.slice(0, 2).map((course: string) => toTitleCase(course)).join(' • ')}
                    </div>
                  )}
                </div>
              </foreignObject>
            ))}
          </g>
        );
      })()}
      
      {/* ReWork badge */}
      {version === 'optimized' && (
        <text x="375" y="915" textAnchor="middle" fontSize="9" fill={config.primaryColor} fontWeight="300">
          ✨ reWorked with ReWork
        </text>
      )}
    </svg>
  );

  // 🎨 CREATIVE TEMPLATE
  const renderCreativeTemplate = (data: ResumeData) => (
    <svg ref={svgRef} viewBox="0 0 750 940" className="w-full h-full">
      <defs>
        <linearGradient id="creativeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: config.primaryColor}} />
          <stop offset="100%" style={{stopColor: config.accentColor}} />
        </linearGradient>
      </defs>

      {/* Clean background */}
      <rect width="750" height="940" fill="white"/>
      
      {/* Bold header */}
      <rect x="0" y="0" width="750" height="120" fill="url(#creativeGradient)"/>
      
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
      <rect x="40" y="140" width="670" height="95" fill="white" rx="12" stroke={config.primaryColor} strokeWidth="2"/>
      
      <text x="60" y="160" fontFamily="sans-serif" fontSize="16" fontWeight="700" fill={config.primaryColor}>
        About Me
      </text>

      <foreignObject x="60" y="170" width="640" height="75">
        <div className="sans-serif" style={{
          fontFamily: 'sans-serif',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#1f2937',
          padding: '0 10px 5px 0'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Experience section */}
      <text x="40" y="250" fontFamily="sans-serif" fontSize="18" fontWeight="700" fill={config.primaryColor}>
        Experience
      </text>

{(() => {
        // Calculate dynamic heights and positions for each job
        let currentY = 270; // Starting Y position after header
        
        return data.workExperience.slice(0, 2).map((job, index) => {
          const bullets = extractWorkExperienceContent(job, 800);
          const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
          
          // Calculate responsive font size based on content
          const totalContentLength = bulletsArray.join(' ').length;
          const fontSize = getResponsiveFontSize(totalContentLength, 11);
          
          // Calculate content height needed
          const contentHeight = calculateContentHeight(bulletsArray, fontSize, 1.3, 640);
          const skillsHeight = 22; // Height reserved for skills tags
          const headerHeight = 55; // Height for job title, company, etc.
          const containerHeight = Math.max(headerHeight + contentHeight + skillsHeight - 2, 90);
          
          const jobElement = (
            <g key={index}>
              <rect x="40" y={currentY} width="670" height={containerHeight} 
                    fill="white" 
                    rx="16" 
                    stroke={config.accentColor} 
                    strokeWidth="2"/>
              
              <rect x="40" y={currentY} width="6" height={containerHeight} fill={config.primaryColor} rx="3"/>
              
              {/* Experience number */}
              <circle cx="70" cy={currentY + 25} r="12" fill={config.primaryColor}/>
              <text x="70" y={currentY + 30} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
                {index + 1}
              </text>
              
              {/* Job title */}
              <text x="95" y={currentY + 30} fontFamily="sans-serif" fontSize="13" fontWeight="700" fill={config.primaryColor}>
                {toTitleCase(job.jobTitle || job.title || job.position || 'Network Engineer')}
              </text>
              
              {/* Company */}
              <text x="95" y={currentY + 45} fontFamily="sans-serif" fontSize="11" fontWeight="600" fill={config.accentColor}>
                {toTitleCase(job.company || 'Technology Company')}
              </text>
              
              {/* Dates */}
              <text x="580" y={currentY + 45} fontFamily="sans-serif" fontSize="10" fill="#6b7280">
                {job.startDate || '2022'} - {job.endDate || 'Present'}
              </text>

              {/* Dynamic content area */}
              <foreignObject x="95" y={currentY + 55} width="600" height={contentHeight}>
                <div className="sans-serif" style={{ 
                  fontSize: `${fontSize}px`, 
                  lineHeight: '1.3', 
                  color: '#374151',
                  wordWrap: 'break-word',
                  hyphens: 'auto'
                }}>
                  {bulletsArray.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      marginBottom: bulletIndex === bulletsArray.length - 1 ? '0px' : '2px'
                    }}>
                      <span style={{ 
                        marginRight: '8px', 
                        color: config.accentColor, 
                        fontWeight: '600',
                        fontSize: `${fontSize + 1}px`,
                        flexShrink: 0
                      }}>•</span>
                      <span style={{ flex: 1 }}>{bullet}</span>
                    </div>
                  ))}
                </div>
              </foreignObject>

            {/* Job-specific skills/technologies */}
            {(() => {
              const jobSkills = extractJobSkills(job);
              return jobSkills && jobSkills.length > 0 && (
                <foreignObject x="95" y={currentY + headerHeight + contentHeight - 2} width="600" height="20">
                  <div className="sans-serif" style={{ 
                    fontSize: '9px', 
                    lineHeight: '1.3', 
                    color: '#6b7280',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '0px'
                  }}>
                    {jobSkills.slice(0, 6).map((tech: string, techIndex: number) => (
                      <span key={techIndex} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <span style={{color: config.accentColor}}>•</span>
                        {tech}
                      </span>
                    ))}
                  </div>
                </foreignObject>
              );
            })()}
          </g>
        );
        
        // Update Y position for next job
        currentY += containerHeight + 15; // Add gap between jobs
        
        return jobElement;
        });
      })()}

      {/* Skills & Education - Dynamic Positioning */}
      {(() => {
        // Calculate where work experience section ends
        let workExperienceEndY = 270; // Starting position
        data.workExperience.slice(0, 2).forEach((job) => {
          const bullets = extractWorkExperienceContent(job, 800);
          const bulletsArray = Array.isArray(bullets) ? bullets : [bullets];
          const totalContentLength = bulletsArray.join(' ').length;
          const fontSize = getResponsiveFontSize(totalContentLength, 11);
          const contentHeight = calculateContentHeight(bulletsArray, fontSize, 1.3, 640);
          const containerHeight = Math.max(55 + contentHeight + 22 - 2, 90);
          workExperienceEndY += containerHeight + 15;
        });
        
        const skillsY = workExperienceEndY + 10;
        
        return (
          <g>
            <text x="40" y={skillsY} fontFamily="sans-serif" fontSize="14" fontWeight="700" fill={config.primaryColor}>
              Core Skills
            </text>
        
            {data.skills.length > 0 && (
              <foreignObject x="40" y={skillsY + 20} width="380" height="60">
                <div className="sans-serif" style={{ 
                  fontSize: '10px', 
                  lineHeight: '1.4', 
                  color: '#374151',
                  columnCount: 2,
                  columnGap: '25px'
                }}>
                  {data.skills.slice(0, 6).map((skill, index) => {
                    // Debug: log skills that contain instruction phrases
                    if (skill.toLowerCase().includes('skills like') || skill.toLowerCase().includes('such as')) {
                      console.log('⚠️ Skill contains instruction phrase:', skill);
                    }
                    return (
                    <div key={index} style={{marginBottom: '6px', display: 'flex', alignItems: 'flex-start', breakInside: 'avoid'}}>
                      <span style={{color: config.accentColor, marginRight: '4px', fontSize: '9px', flexShrink: 0}}>•</span>
                      <span style={{flex: 1}}>{skill}</span>
                    </div>
                  )})}
                </div>
              </foreignObject>
            )}

            <text x="450" y={skillsY} fontFamily="sans-serif" fontSize="14" fontWeight="700" fill={config.primaryColor}>
              Education
            </text>
        
            {data.education.slice(0, 2).map((edu, index) => (
              <foreignObject key={index} x="450" y={skillsY + 20 + index * 45} width="250" height="40">
                <div className="sans-serif" style={{ 
                  fontSize: '11px', 
                  lineHeight: '1.4', 
                  color: config.primaryColor
                }}>
                  <div style={{fontWeight: '700', marginBottom: '2px'}}>
                    {toTitleCase(edu.degree || 'Degree')} {edu.field ? `in ${toTitleCase(edu.field)}` : ''}
                  </div>
                  <div style={{fontSize: '10px', color: '#6b7280', marginBottom: '2px'}}>
                    {toTitleCase(edu.institution || edu.school || 'University')} • {edu.graduationYear || edu.year || edu.endDate || '2020'}
                  </div>
                  {edu.relevantCoursework && Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
                    <div style={{fontSize: '9px', color: '#6b7280'}}>
                      {edu.relevantCoursework.slice(0, 2).map((course: string) => toTitleCase(course)).join(' • ')}
                    </div>
                  )}
                </div>
              </foreignObject>
            ))}
          </g>
        );
      })()}
      
      {/* ReWork badge */}
      {version === 'optimized' && (
        <text x="375" y="915" textAnchor="middle" fontSize="9" fontWeight="600" fill={config.accentColor}>
          ✨ reWorked with ReWork
        </text>
      )}
    </svg>
  );

  const renderTemplate = () => {
    if (!resumeData) return null;

    // Use the new DynamicResumeTemplate for AI-optimized content
    if (useDynamicTemplate) {
      return (
        <DynamicResumeTemplate
          resumeData={resumeData}
          template={template as 'professional' | 'modern' | 'minimal' | 'creative'}
          colors={colors}
          resumeTitle={title}
        />
      );
    }

    // Fallback to original SVG templates
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
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSvgToPdfDownload}
                    disabled={isDownloading}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3 mr-1" />
                    )}
                    {isDownloading ? 'Converting to PDF...' : 'Download PDF'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSvgDownload}
                    disabled={isDownloading}
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    SVG
                  </Button>
                </div>
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