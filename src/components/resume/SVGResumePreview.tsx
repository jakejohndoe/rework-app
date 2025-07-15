// src/components/resume/SVGResumePreview.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
      // Process ALL achievements, not just first 3, to find the best ones
      const processedAchievements = job.achievements.map((achievement: any) => {
        // Clean and format each achievement
        let cleaned = achievement.replace(/^\s*[•\-\*]\s*/, '').trim();
        
        // Filter out mixed content - only keep AI-generated achievements
        if (cleaned.includes('Rework (Application)') || cleaned.includes('AI powered application that optimizes')) {
          // Skip this mixed content, it's not a clean AI achievement
          return null;
        }
        
        // Only keep achievements that start with action verbs (AI-generated format) - EXPANDED LIST
        // Also allow achievements that start with descriptive terms like "Team Leadership"
        if (cleaned.match(/^(Developed|Engineered|Led|Managed|Implemented|Created|Built|Designed|Achieved|Delivered|Collaborated|Streamlined|Optimized|Enhanced|Utilized|Leveraged|Boosted|Increased|Improved|Established|Coordinated|Executed|Demonstrated|Operated|Contributed|Advanced|Gained|Conducted|Assisted|Handled|Team|Technical|Systems|Customer|Marketing|Financial|Documentation|Research|Sales|Business)/)) {
          return {
            text: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
            priority: cleaned.startsWith('Led') ? 1 : 2  // Prioritize "Led" achievements
          };
        }
        
        // For very long achievements (likely raw data), try to extract the first sentence
        if (cleaned.length > 300) {
          const firstSentence = cleaned.split(/[.!?]/)[0];
          if (firstSentence && firstSentence.length > 20) {
            return {
              text: firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1) + '.',
              priority: 3
            };
          }
        }
        
        return null;
      }).filter(Boolean); // Remove null values
      
      // Sort by priority (1 = highest) and take the best 3
      bullets = processedAchievements
        .sort((a: any, b: any) => a.priority - b.priority)
        .slice(0, 3)
        .map((item: any) => item.text);
      
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
    
    // Ensure we have at least 2 bullet points, maximum 3
    if (bullets.length < 2) {
      const company = job.company || 'the organization';
      bullets.push(`Demonstrated strong performance and reliability in all assigned tasks at ${company}`);
    }
    
    // Ensure proper length without truncation (increased maxLength)
    const finalBullets = bullets.slice(0, 3).map(bullet => {
      if (bullet.length > maxLength / 2) {
        return bullet.substring(0, maxLength / 2 - 10) + '...';
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
    <svg ref={svgRef} viewBox="0 0 612 900" className="w-full h-full">
      <defs>
        <linearGradient id="profGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: config.primaryColor}} />
          <stop offset="100%" style={{stopColor: config.accentColor}} />
        </linearGradient>
      </defs>

      {/* White background */}
      <rect width="612" height="900" fill="white"/>
      
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
      
      <foreignObject x="40" y="180" width="532" height="85">
        <div className="serif" style={{ 
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

      {data.workExperience.slice(0, 2).map((job, index) => {
        const bullets = extractWorkExperienceContent(job, 500);
        return (
          <g key={index}>
            <rect x="40" y={310 + index * 180} width="532" height="170" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="6"/>
            <rect x="40" y={310 + index * 180} width="4" height="170" fill={config.accentColor} rx="2"/>
            
            <text x="55" y={335 + index * 180} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
{job.jobTitle || job.title || job.position || 'Network Engineer'}
            </text>
            
            <text x="450" y={335 + index * 180} fontSize="11" fill="#6b7280" fontFamily="sans-serif">
              {job.startDate || '2022'} — {job.endDate || 'Present'}
            </text>
            
            <text x="55" y={350 + index * 180} fontSize="12" fontWeight="500" fill={config.accentColor} fontFamily="sans-serif">
              {job.company || 'Technology Company'}
            </text>

            {/* Render bullet points */}
            <foreignObject x="55" y={365 + index * 180} width="500" height="80">
              <div className="serif" style={{ 
                fontSize: '11px', 
                lineHeight: '1.5', 
                color: '#374151'
              }}>
                {Array.isArray(bullets) ? bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    marginBottom: '4px'
                  }}>
                    <span style={{ 
                      marginRight: '8px', 
                      color: config.accentColor, 
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>•</span>
                    <span>{bullet}</span>
                  </div>
                )) : (
                  <span>{bullets}</span>
                )}
              </div>
            </foreignObject>

            {/* Job-specific skills/technologies */}
            {(() => {
              const jobSkills = extractJobSkills(job);
              return jobSkills && jobSkills.length > 0 && (
                <foreignObject x="55" y={450 + index * 180} width="500" height="25">
                  <div className="serif" style={{ 
                    fontSize: '10px', 
                    lineHeight: '1.4', 
                    color: '#6b7280',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '4px'
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
      })}

      {/* Skills & Education */}
      <g>
        <text x="40" y={710} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
          Core Skills
        </text>
        <line x1="40" y1="720" x2="100" y2="720" stroke={config.accentColor} strokeWidth="2"/>
        
        {data.skills.length > 0 && (
          <foreignObject x="40" y="730" width="260" height="80">
            <div className="serif" style={{ 
              fontSize: '11px', 
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

        <text x="320" y={710} fontSize="14" fontWeight="600" fill={config.primaryColor} fontFamily="serif">
          Education
        </text>
        <line x1="320" y1="720" x2="370" y2="720" stroke={config.accentColor} strokeWidth="2"/>
        
        {data.education.slice(0, 2).map((edu, index) => (
          <g key={index}>
            <text x="320" y={745 + index * 45} fontSize="12" fontWeight="500" fill={config.primaryColor} fontFamily="serif">
{edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
            </text>
            <text x="320" y={760 + index * 45} fontSize="11" fill="#6b7280">
{edu.institution || edu.school || 'University'} • {edu.graduationYear || edu.year || edu.endDate || '2020'}
            </text>
            
            {/* AI-enhanced relevant coursework */}
            {edu.relevantCoursework && Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
              <text x="320" y={775 + index * 45} fontSize="10" fill="#6b7280" fontFamily="serif">
                {edu.relevantCoursework.slice(0, 2).join(' • ')}
              </text>
            )}
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
    <svg ref={svgRef} viewBox="0 0 612 900" className="w-full h-full">
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
      <rect x="40" y="180" width="532" height="150" fill="white" rx="12" stroke="#e2e8f0" strokeWidth="1"/>
      
      <text x="60" y="205" fontSize="16" fontWeight="600" fill={config.primaryColor} fontFamily="sans-serif">
        Professional Summary
      </text>
      
      <foreignObject x="60" y="220" width="500" height="105">
        <div className="sans-serif" style={{ 
          fontSize: '11px', 
          lineHeight: '1.6', 
          color: '#374151',
          fontFamily: 'sans-serif',
          padding: '0 5px 5px 0'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Experience */}
      <text x="40" y="355" fontSize="18" fontWeight="600" fill={config.primaryColor} fontFamily="sans-serif">
        Experience
      </text>

      {data.workExperience.slice(0, 2).map((job, index) => {
        const bullets = extractWorkExperienceContent(job, 500);
        return (
          <g key={index}>
            <rect x="40" y={375 + index * 200} width="350" height="185" 
                  fill="white" 
                  rx="12" 
                  stroke="#e2e8f0" 
                  strokeWidth="1"/>
            
            <rect x="40" y={375 + index * 200} width="4" height="185" fill={config.accentColor} rx="2"/>
            
            <text x="60" y={400 + index * 200} fontSize="14" fontWeight="600" fill={config.primaryColor}>
{job.jobTitle || job.title || job.position || 'Network Engineer'}
            </text>
            
            <text x="60" y={415 + index * 200} fontSize="12" fontWeight="500" fill={config.accentColor}>
              {job.company || 'Technology Company'}
            </text>
            
            <text x="310" y={415 + index * 200} fontSize="11" fill="#6b7280">
              {job.startDate || '2022'} — {job.endDate || 'Present'}
            </text>

            {/* Render bullet points */}
            <foreignObject x="60" y={430 + index * 200} width="310" height="80">
              <div className="sans-serif" style={{ 
                fontSize: '11px', 
                lineHeight: '1.5', 
                color: '#374151'
              }}>
                {Array.isArray(bullets) ? bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    marginBottom: '4px'
                  }}>
                    <span style={{ 
                      marginRight: '8px', 
                      color: config.accentColor, 
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>•</span>
                    <span>{bullet}</span>
                  </div>
                )) : (
                  <span>{bullets}</span>
                )}
              </div>
            </foreignObject>

            {/* Job-specific skills/technologies */}
            {(() => {
              const jobSkills = extractJobSkills(job);
              return jobSkills && jobSkills.length > 0 && (
                <foreignObject x="60" y={515 + index * 200} width="310" height="35">
                  <div className="sans-serif" style={{ 
                    fontSize: '10px', 
                    lineHeight: '1.4', 
                    color: '#6b7280',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '2px'
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
      })}

      {/* Skills sidebar */}
      <rect x="410" y="375" width="162" height="470" 
            fill="white" 
            rx="12" 
            stroke="#e2e8f0" 
            strokeWidth="1"/>
      
      <text x="430" y="400" fontSize="14" fontWeight="600" fill={config.primaryColor}>
        Skills
      </text>

      {data.skills.slice(0, 8).map((skill, index) => {
        const percentage = 75 + (index * 3); // Static percentages: 75%, 78%, 81%, etc.
        const barWidth = (percentage / 100) * 100; // Width out of 100px max
        
        return (
          <g key={index}>
            <text x="430" y={420 + index * 24} fontSize="10" fontWeight="500" fill="#374151">
              {skill.substring(0, 15)}
            </text>
            
            {/* Percentage text */}
            <text x="555" y={420 + index * 24} fontSize="9" fill="#6b7280" textAnchor="end">
              {percentage}%
            </text>
            
            {/* Progress bar */}
            <rect x="430" y={425 + index * 24} width="100" height="4" fill="#e5e7eb" rx="2"/>
            <rect x="430" y={425 + index * 24} width={barWidth} height="4" fill={config.accentColor} rx="2"/>
          </g>
        );
      })}

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
    <svg ref={svgRef} viewBox="0 0 612 900" className="w-full h-full">
      {/* Clean white background */}
      <rect width="612" height="900" fill="white"/>
      
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

      <foreignObject x="50" y="155" width="500" height="100">
        <div className="sans-serif" style={{
          fontFamily: 'sans-serif',
          fontSize: '11px',
          lineHeight: '1.6',
          color: '#374151',
          textAlign: 'justify',
          padding: '0 10px 5px 0'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Experience */}
      <text x="50" y="280" fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor} letterSpacing="1px">
        EXPERIENCE
      </text>

      {data.workExperience.slice(0, 2).map((job, index) => (
        <g key={index}>
          <line x1="50" y1={285 + index * 110} x2="550" y2={285 + index * 110} stroke="#f3f4f6" strokeWidth="1"/>
          
          <text x="50" y={305 + index * 110} fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor}>
{job.jobTitle || job.title || job.position || 'Network Engineer'}
          </text>
          
          <text x="50" y={320 + index * 110} fontFamily="sans-serif" fontSize="11" fill="#6b7280">
            {job.company || 'Technology Company'}
          </text>
          
          <text x="450" y={320 + index * 110} fontFamily="sans-serif" fontSize="11" fill="#9ca3af">
            {job.startDate || '2022'} — {job.endDate || 'Present'}
          </text>

          <foreignObject x="50" y={330 + index * 110} width="500" height="30">
            <div className="sans-serif" style={{ fontSize: '10px', lineHeight: '1.6', color: '#6b7280' }}>
{extractWorkExperienceContent(job, 180)}
            </div>
          </foreignObject>

          {/* Job-specific skills/technologies */}
          {(() => {
            const jobSkills = extractJobSkills(job);
            return jobSkills && jobSkills.length > 0 && (
              <foreignObject x="50" y={365 + index * 110} width="500" height="25">
                <div className="sans-serif" style={{ 
                  fontSize: '9px', 
                  lineHeight: '1.4', 
                  color: '#9ca3af',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '2px'
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
      ))}

      {/* Skills & Education */}
      <g>
        <text x="50" y={570} fontFamily="sans-serif" fontSize="12" fontWeight="500" fill={config.primaryColor} letterSpacing="1px">
          SKILLS
        </text>

        {data.skills.length > 0 && (
          <foreignObject x="50" y="585" width="250" height="100">
            <div className="sans-serif" style={{ 
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
            <text x="320" y={595 + index * 45} fontFamily="sans-serif" fontSize="11" fontWeight="500" fill={config.primaryColor}>
{edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
            </text>
            <text x="320" y={610 + index * 45} fontFamily="sans-serif" fontSize="10" fill="#6b7280">
{edu.institution || edu.school || 'University'} • {edu.graduationYear || edu.year || edu.endDate || '2020'}
            </text>
            
            {/* AI-enhanced relevant coursework */}
            {edu.relevantCoursework && Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
              <text x="320" y={625 + index * 45} fontFamily="sans-serif" fontSize="9" fill="#6b7280">
                {edu.relevantCoursework.slice(0, 2).join(' • ')}
              </text>
            )}
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
    <svg ref={svgRef} viewBox="0 0 612 900" className="w-full h-full">
      <defs>
        <linearGradient id="creativeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: config.primaryColor}} />
          <stop offset="100%" style={{stopColor: config.accentColor}} />
        </linearGradient>
      </defs>

      {/* Clean background */}
      <rect width="612" height="900" fill="white"/>
      
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
      <rect x="40" y="180" width="532" height="160" fill="white" rx="12" stroke={config.primaryColor} strokeWidth="2"/>
      
      <text x="60" y="205" fontFamily="sans-serif" fontSize="16" fontWeight="700" fill={config.primaryColor}>
        About Me
      </text>

      <foreignObject x="60" y="220" width="500" height="110">
        <div className="sans-serif" style={{
          fontFamily: 'sans-serif',
          fontSize: '11px',
          lineHeight: '1.4',
          color: '#1f2937',
          padding: '0 10px 5px 0'
        }}>
          {data.professionalSummary}
        </div>
      </foreignObject>

      {/* Experience section */}
      <text x="40" y="360" fontFamily="sans-serif" fontSize="18" fontWeight="700" fill={config.primaryColor}>
        Experience
      </text>

      {data.workExperience.slice(0, 2).map((job, index) => (
        <g key={index}>
          <rect x="40" y={375 + index * 170} width="350" height="155" 
                fill="white" 
                rx="16" 
                stroke={config.accentColor} 
                strokeWidth="2"/>
          
          <rect x="40" y={375 + index * 170} width="6" height="155" fill={config.primaryColor} rx="3"/>
          
          {/* Experience number */}
          <circle cx="70" cy={400 + index * 170} r="12" fill={config.primaryColor}/>
          <text x="70" y={405 + index * 170} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
            {index + 1}
          </text>
          
          {/* Job title */}
          <text x="95" y={405 + index * 170} fontFamily="sans-serif" fontSize="13" fontWeight="700" fill={config.primaryColor}>
{job.jobTitle || job.title || job.position || 'Network Engineer'}
          </text>
          
          {/* Company */}
          <text x="95" y={420 + index * 170} fontFamily="sans-serif" fontSize="11" fontWeight="600" fill={config.accentColor}>
            {job.company || 'Technology Company'}
          </text>
          
          {/* Dates */}
          <text x="310" y={420 + index * 170} fontFamily="sans-serif" fontSize="10" fill="#6b7280">
            {job.startDate || '2022'} - {job.endDate || 'Present'}
          </text>

          <foreignObject x="95" y={430 + index * 170} width="280" height="50">
            <div className="sans-serif" style={{ 
              fontSize: '10px', 
              lineHeight: '1.4', 
              color: '#374151'
            }}>
{extractWorkExperienceContent(job, 160)}
            </div>
          </foreignObject>

          {/* Job-specific skills/technologies */}
          {(() => {
            const jobSkills = extractJobSkills(job);
            return jobSkills && jobSkills.length > 0 && (
              <foreignObject x="95" y={485 + index * 170} width="280" height="35">
                <div className="sans-serif" style={{ 
                  fontSize: '9px', 
                  lineHeight: '1.3', 
                  color: '#6b7280',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '2px'
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
      ))}

      {/* Skills section */}
      <rect x="410" y="375" width="162" height="270" fill="white" rx="16" stroke={config.primaryColor} strokeWidth="2"/>
      
      <text x="430" y="400" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill={config.primaryColor}>
        Skills
      </text>

      {data.skills.slice(0, 6).map((skill, skillIndex) => (
        <g key={skillIndex}>
          <text x="430" y={425 + skillIndex * 30} fontFamily="sans-serif" fontSize="11" fontWeight="500" fill="#374151">
            {skill}
          </text>
          
          {/* Skill progress circle */}
          <circle cx="550" cy={420 + skillIndex * 30} r="8" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
          <circle cx="550" cy={420 + skillIndex * 30} r="8" fill="none" stroke={config.accentColor} strokeWidth="2"
                  strokeDasharray={`${12 + (skillIndex * 2)} 50`}
                  transform={`rotate(-90 550 ${420 + skillIndex * 30})`}/>
          
          <text x="550" y={425 + skillIndex * 30} textAnchor="middle" fontSize="7" fill={config.primaryColor} fontWeight="600">
            {85 + (skillIndex * 3)}%
          </text>
        </g>
      ))}

      {/* Education section */}
      <rect x="40" y="690" width="280" height="80" fill={config.primaryColor} rx="12"/>
      
      <text x="60" y="715" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="white">
        Education
      </text>
      
      {data.education.slice(0, 1).map((edu, index) => (
        <g key={index}>
          <text x="60" y="735" fontFamily="sans-serif" fontSize="11" fontWeight="500" fill="white" opacity="0.9">
            {edu.degree || 'Bachelor of Science'}
          </text>
          
          <text x="60" y="750" fontFamily="sans-serif" fontSize="10" fill="white" opacity="0.8">
            {edu.institution || edu.school || 'University'} • {edu.year || edu.endDate || '2020'}
          </text>
          
          {/* AI-enhanced relevant coursework */}
          {edu.relevantCoursework && Array.isArray(edu.relevantCoursework) && edu.relevantCoursework.length > 0 && (
            <text x="60" y="765" fontFamily="sans-serif" fontSize="9" fill="white" opacity="0.7">
              {edu.relevantCoursework.slice(0, 2).join(' • ')}
            </text>
          )}
        </g>
      ))}

      {/* Technology chips */}
      <text x="340" y="715" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill={config.primaryColor}>
        Technologies
      </text>
      
      {data.skills.slice(6, 12).map((skill, index) => (
        <g key={index}>
          <rect 
            x={340 + (index % 3) * 70} 
            y={725 + Math.floor(index / 3) * 25} 
            width="65" 
            height="18" 
            fill="white" 
            stroke={config.accentColor} 
            strokeWidth="1" 
            rx="9"
          />
          <text 
            x={372 + (index % 3) * 70} 
            y={737 + Math.floor(index / 3) * 25} 
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
          <rect x="240" y="780" width="132" height="18" fill={config.accentColor} rx="9"/>
          <text x="306" y="792" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">
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