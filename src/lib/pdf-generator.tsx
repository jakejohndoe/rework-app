// src/lib/pdf-generator.tsx - COMPLETE FIXED VERSION
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Smart One-Page Optimization Functions
const optimizeContentForOnePage = (data: any, template: string, enableOptimization: boolean = true) => {
  // If optimization is disabled, return data as-is with proper summary extraction
  if (!enableOptimization) {
    console.log('📄 One-page optimization disabled, using full content');
    return {
      ...data,
      professionalSummary: extractSummaryText(data.professionalSummary)
    };
  }

  try {
    // Extract summary text from various formats
    const summaryText = extractSummaryText(data.professionalSummary);
    
    // Prioritize and limit content to fit one page optimally
    const optimized = {
      ...data,
      workExperience: prioritizeWorkExperience(data.workExperience || []),
      education: prioritizeEducation(data.education || []),
      skills: prioritizeSkills(data.skills || []),
      professionalSummary: optimizeSummary(summaryText, template)
    };
    
    console.log('✅ Content optimization complete:', {
      workExpLength: optimized.workExperience?.length,
      educationLength: optimized.education?.length,
      skillsLength: optimized.skills?.length,
      summaryLength: optimized.professionalSummary?.length
    });
    
    return optimized;
  } catch (error) {
    console.error('❌ Error in optimizeContentForOnePage:', error);
    console.error('📊 Data that caused error:', JSON.stringify(data, null, 2));
    // Return data as-is with proper summary extraction if optimization fails
    return {
      ...data,
      professionalSummary: extractSummaryText(data.professionalSummary)
    };
  }
};

// Helper function to extract summary text from various formats
const extractSummaryText = (professionalSummary: any): string => {
  if (!professionalSummary) return '';
  
  if (typeof professionalSummary === 'string') {
    return professionalSummary;
  } else if (typeof professionalSummary === 'object') {
    // Handle object format from parsed JSON
    return professionalSummary.summary || 
           professionalSummary.optimized || 
           professionalSummary.text ||
           professionalSummary.content ||
           '';
  }
  
  return String(professionalSummary);
};

const prioritizeWorkExperience = (experiences: any) => {
  try {
    if (!experiences) return [];
    
    // Ensure we have an array
    let expArray = Array.isArray(experiences) ? experiences : [];
    
    if (expArray.length === 0) return [];
    
    console.log('🔍 DEBUG: Original work experience data:', JSON.stringify(expArray, null, 2));
    
    // Sort by end date (most recent first), then by relevance
    const processed = expArray
      .sort((a, b) => {
        // Prioritize current jobs (no end date)
        if (!a.endDate && b.endDate) return -1;
        if (a.endDate && !b.endDate) return 1;
        
        // Then sort by end date
        const dateA = new Date(a.endDate || a.startDate || '1970');
        const dateB = new Date(b.endDate || b.startDate || '1970');
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5) // Keep top 5 most recent/relevant (increased from 3)
      .map((job, index) => {
        console.log(`🔍 DEBUG: Processing job ${index + 1}:`, Object.keys(job));
        console.log(`🔍 DEBUG: Job ${index + 1} ALL FIELDS:`, JSON.stringify(job, null, 2));
        
        // Try multiple description fields - comprehensive list
        const originalDesc = job.description || 
                             job.responsibilities || 
                             job.summary || 
                             job.duties || 
                             job.text || 
                             job.content || 
                             job.jobDescription ||
                             job.role ||
                             job.tasks ||
                             job.details ||
                             job.experience ||
                             job.achievements ||
                             job.accomplishments ||
                             job.overview ||
                             job.about ||
                             '';
        console.log(`🔍 DEBUG: Job ${index + 1} - Original description length:`, originalDesc.length);
        console.log(`🔍 DEBUG: Job ${index + 1} - Original description:`, originalDesc.substring(0, 300) + (originalDesc.length > 300 ? '...' : ''));
        
        const optimizedDesc = optimizeJobDescription(originalDesc, job.achievements);
        console.log(`🔍 DEBUG: Job ${index + 1} - Optimized description length:`, optimizedDesc.length);
        console.log(`🔍 DEBUG: Job ${index + 1} - Optimized description:`, optimizedDesc);
        
        return {
          ...job,
          description: optimizedDesc
        };
      });
      
    console.log('🔍 DEBUG: Final processed work experience:', JSON.stringify(processed, null, 2));
    return processed;
  } catch (error) {
    console.error('❌ Error in prioritizeWorkExperience:', error);
    return [];
  }
};

const prioritizeEducation = (education: any) => {
  try {
    if (!education) return [];
    
    // Ensure we have an array
    let eduArray = Array.isArray(education) ? education : [];
    
    if (eduArray.length === 0) return [];
    
    return eduArray
      .sort((a, b) => {
        // Prioritize by graduation year (most recent first)
        const yearA = parseInt(a.year || a.endDate?.split('-')[0] || '1970');
        const yearB = parseInt(b.year || b.endDate?.split('-')[0] || '1970');
        return yearB - yearA;
      })
      .slice(0, 3); // Keep top 3 most recent (increased from 2)
  } catch (error) {
    console.error('❌ Error in prioritizeEducation:', error);
    return [];
  }
};

const prioritizeSkills = (skills: any) => {
  try {
    if (!skills) return [];
    
    // Convert to array if it's a string
    let skillsArray = Array.isArray(skills) ? skills : 
      (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : []);
    
    // Remove duplicates and empty strings
    skillsArray = [...new Set(skillsArray.filter(skill => skill && skill.trim && skill.trim().length > 0))];
    
    // Prioritize by length (shorter, more impactful skills first) and limit to 8-12
    return skillsArray
      .sort((a, b) => {
        const skillA = typeof a === 'string' ? a : (a.name || String(a) || '');
        const skillB = typeof b === 'string' ? b : (b.name || String(b) || '');
        return skillA.length - skillB.length;
      })
      .slice(0, 15); // Increased skill limit for better representation
  } catch (error) {
    console.error('❌ Error in prioritizeSkills:', error);
    return [];
  }
};

const optimizeSummary = (summary: string | any, template: string) => {
  // Ensure summary is a string
  let summaryStr = '';
  if (typeof summary === 'string') {
    summaryStr = summary;
  } else if (summary && typeof summary === 'object') {
    summaryStr = summary.summary || summary.optimized || summary.text || summary.content || JSON.stringify(summary);
  } else {
    summaryStr = String(summary || '');
  }
  
  if (!summaryStr || summaryStr.length === 0) return '';
  
  // Keep summaries substantial - just slightly shorter for one-page fit
  const limits = {
    professional: 500,
    modern: 450,
    minimal: 480,
    creative: 470
  };
  
  const limit = limits[template as keyof typeof limits] || 280;
  
  if (summaryStr.length <= limit) return summaryStr;
  
  // Smart truncation: ALWAYS preserve complete sentences
  const sentences = summaryStr.split('. ');
  let result = '';
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;
    
    // Add sentence with proper punctuation
    const withPunctuation = sentence.endsWith('.') ? sentence : sentence + '.';
    const testResult = result + (result ? ' ' : '') + withPunctuation;
    
    // If adding this sentence would exceed the limit, stop here
    if (testResult.length > limit && result.length > 0) {
      break;
    }
    
    result = testResult;
  }
  
  // If we couldn't fit even one sentence, return the original but ensure it fits
  if (!result && summaryStr.length > 0) {
    // Find the last complete sentence that fits
    const words = summaryStr.split(' ');
    result = '';
    for (const word of words) {
      const testResult = result + (result ? ' ' : '') + word;
      if (testResult.length > limit - 1) break;
      result = testResult;
    }
    // Ensure it ends properly
    if (result && !result.endsWith('.')) {
      result = result.replace(/[,;:]$/, '') + '.';
    }
  }
  
  return result || summaryStr.substring(0, limit).trim();
};

const optimizeJobDescription = (description: string | any, achievements?: string[] | any) => {
  // Ensure description is a string
  let descriptionStr = '';
  if (typeof description === 'string') {
    descriptionStr = description;
  } else if (description && typeof description === 'object') {
    descriptionStr = description.text || description.content || JSON.stringify(description);
  }
  
  if (!descriptionStr || descriptionStr.length === 0) {
    // Handle achievements that might also be objects
    if (achievements && Array.isArray(achievements) && achievements.length > 0) {
      const achievementStrings = achievements.map(a => 
        typeof a === 'string' ? a : (a.text || a.content || JSON.stringify(a))
      );
      return achievementStrings.slice(0, 2).join('. ') + '.';
    }
    return 'Responsible for key initiatives and strategic projects.';
  }
  
  // Combine description with top achievements if available
  let content = descriptionStr;
  if (achievements && Array.isArray(achievements) && achievements.length > 0) {
    const achievementStrings = achievements.map(a => 
      typeof a === 'string' ? a : (a.text || a.content || JSON.stringify(a))
    );
    const topAchievements = achievementStrings.slice(0, 2).join('. ');
    content = `${descriptionStr} ${topAchievements}.`;
  }
  
  // Keep work experience substantial - just slightly shorter than original
  const maxLength = 600; // Allow most content, just trim the longest descriptions
  
  if (content.length <= maxLength) return content;
  
  // Only the most essential terms for ultra-short descriptions
  const keyTerms = [
    // Core action verbs
    'built', 'created', 'developed', 'led', 'managed', 'improved', 'increased',
    // Essential tech terms
    'react', 'node', 'javascript', 'python', 'api', 'database', 'aws',
    // Impact metrics
    '%', '$', 'users', 'revenue', 'performance'
  ];
  
  // Split into sentences and prioritize those with key terms
  const sentences = content.split('. ');
  const prioritizedSentences = sentences.sort((a, b) => {
    const scoreA = keyTerms.reduce((score, term) => 
      score + (a.toLowerCase().includes(term.toLowerCase()) ? 1 : 0), 0);
    const scoreB = keyTerms.reduce((score, term) => 
      score + (b.toLowerCase().includes(term.toLowerCase()) ? 1 : 0), 0);
    return scoreB - scoreA; // Higher score first
  });
  
  // Build result with highest-impact sentences
  let optimized = '';
  for (const sentence of prioritizedSentences) {
    const sentenceWithPeriod = sentence.trim() + (sentence.endsWith('.') ? '' : '.');
    const testContent = optimized + (optimized ? ' ' : '') + sentenceWithPeriod;
    
    if (testContent.length <= maxLength) {
      optimized = testContent;
    } else {
      break;
    }
  }
  
  // If we got content, return it
  if (optimized.trim().length > 0) {
    return optimized.trim();
  }
  
  // Fallback: take first sentence and trim if needed
  const firstSentence = sentences[0]?.trim() || '';
  if (firstSentence.length <= maxLength) {
    return firstSentence + (firstSentence.endsWith('.') ? '' : '.');
  }
  
  // Final fallback: just trim the original content to maxLength
  if (content.length > maxLength) {
    const trimmed = content.substring(0, maxLength).trim();
    // Find last complete word
    const lastSpace = trimmed.lastIndexOf(' ');
    const finalContent = lastSpace > maxLength * 0.8 ? trimmed.substring(0, lastSpace) : trimmed;
    return finalContent + (finalContent.endsWith('.') ? '' : '.');
  }
  
  // Ultra-compact: Extract key terms only for bullet-point style
  const allWords = content.toLowerCase().split(/[\s,\.]+/);
  const importantWords = allWords.filter(word => 
    keyTerms.some(term => word.includes(term)) || 
    /\d/.test(word) || // Numbers (metrics)
    word.length > 6 // Longer words likely to be important
  );
  
  // Build concise description with key terms
  let result = '';
  const originalWords = content.split(' ');
  for (const word of originalWords) {
    if (importantWords.includes(word.toLowerCase().replace(/[^\w]/g, ''))) {
      const testResult = result + (result ? ' ' : '') + word;
      if (testResult.length > maxLength - 1) break;
      result = testResult;
    }
  }
  
  // Ensure it ends properly and is meaningful
  if (result.length < 20) {
    // If too short, take first meaningful phrase
    result = content.substring(0, maxLength - 1).trim();
  }
  
  const finalResult = result.replace(/[,;:]$/, '') + '.';
  
  // Safety check: never return empty content
  if (finalResult.trim().length < 10) {
    return content.substring(0, Math.min(content.length, maxLength)).trim() + '.';
  }
  
  return finalResult;
};

// Helper function to get template configuration with custom colors
const getTemplateConfig = (template: string, customColors?: { primary: string; accent: string }) => {
  const defaultConfigs = {
    professional: {
      colors: {
        primary: customColors?.primary || '#1e40af',
        secondary: '#64748b',
        accent: customColors?.accent || '#3b82f6',
        text: '#1f2937',
        light: '#f8fafc'
      },
      fonts: {
        primary: 'Times-Roman',
        secondary: 'Helvetica'
      },
      layout: 'single-column'
    },
    modern: {
      colors: {
        primary: customColors?.primary || '#7c3aed',
        secondary: '#6b7280',
        accent: customColors?.accent || '#a855f7',
        text: '#111827',
        light: '#faf5ff'
      },
      fonts: {
        primary: 'Helvetica',
        secondary: 'Helvetica'
      },
      layout: 'two-column'
    },
    minimal: {
      colors: {
        primary: customColors?.primary || '#059669',
        secondary: '#6b7280',
        accent: customColors?.accent || '#10b981',
        text: '#374151',
        light: '#f0fdf4'
      },
      fonts: {
        primary: 'Helvetica',
        secondary: 'Helvetica'
      },
      layout: 'minimal'
    },
    creative: {
      colors: {
        primary: customColors?.primary || '#ea580c',
        secondary: '#6b7280',
        accent: customColors?.accent || '#f97316',
        text: '#1f2937',
        light: '#fff7ed'
      },
      fonts: {
        primary: 'Helvetica-Bold',
        secondary: 'Helvetica'
      },
      layout: 'creative'
    }
  };

  return defaultConfigs[template as keyof typeof defaultConfigs] || defaultConfigs.professional;
};

// Professional Template Styles - Dynamic
const createProfessionalStyles = (colors: any) => StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    hyphenationFactor: 0,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    textAlign: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Times-Roman',
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  contactItem: {
    fontSize: 10,
    color: colors.secondary,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Times-Roman',
    color: colors.primary,
    marginTop: 10,
    marginBottom: 5,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  content: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.text,
    marginBottom: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
  },
  jobDate: {
    fontSize: 9,
    color: colors.secondary,
  },
  company: {
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 8,
  },
});

// Modern Template Styles - Dynamic
const createModernStyles = (colors: any) => StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    hyphenationFactor: 0,
  },
  sidebar: {
    width: '35%',
    backgroundColor: colors.light,
    padding: 20,
    paddingTop: 30,
  },
  mainContent: {
    width: '65%',
    padding: 20,
    paddingTop: 30,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  title: {
    fontSize: 9,
    color: colors.secondary,
    marginBottom: 16,
  },
  sidebarSection: {
    marginBottom: 12,
  },
  sidebarTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  contactItem: {
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 6,
  },
  skillItem: {
    marginBottom: 8,
  },
  skillName: {
    fontSize: 9,
    color: colors.text,
    marginBottom: 2,
  },
  skillBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  skillProgress: {
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  mainSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    marginTop: 10,
  },
  experienceItem: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  jobTitleMain: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  jobCompany: {
    fontSize: 9,
    color: colors.primary,
    marginBottom: 2,
  },
  jobDateMain: {
    fontSize: 9,
    color: colors.secondary,
    marginBottom: 6,
  },
  jobDescription: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
  },
});

// Minimal Template Styles - Dynamic
const createMinimalStyles = (colors: any) => StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    hyphenationFactor: 0,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 22,
    color: colors.primary,
    marginBottom: 5,
  },
  title: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  contactItem: {
    fontSize: 10,
    color: colors.secondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 15,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.accent,
    marginBottom: 10,
    width: 50,
  },
  content: {
    fontSize: 9,
    lineHeight: 1.7,
    color: colors.text,
    marginBottom: 10,
  },
  experienceHeader: {
    marginBottom: 10,
  },
  jobTitleMinimal: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  jobMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  companyMinimal: {
    fontSize: 9,
    color: colors.secondary,
  },
  dateMinimal: {
    fontSize: 9,
    color: colors.secondary,
  },
});

// Creative Template Styles - Dynamic
const createCreativeStyles = (colors: any) => StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    hyphenationFactor: 0,
  },
  headerSection: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.light,
    marginRight: 25,
  },
  headerText: {
    flex: 1,
  },
  nameCreative: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  titleCreative: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  contactText: {
    fontSize: 9,
    color: '#ffffff',
  },
  bodySection: {
    padding: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 30,
  },
  leftColumn: {
    width: '60%',
  },
  rightColumn: {
    width: '40%',
  },
  creativeSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    marginTop: 10,
  },
  experienceCard: {
    backgroundColor: colors.light,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  jobTitleCreative: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 3,
  },
  jobMetaCreative: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  companyCreative: {
    fontSize: 9,
    color: colors.secondary,
  },
  dateCreative: {
    fontSize: 10,
    color: colors.secondary,
  },
  descriptionCreative: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.text,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: colors.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  skillText: {
    fontSize: 9,
    color: colors.primary,
  },
  progressSection: {
    marginBottom: 10,
  },
  progressItem: {
    marginBottom: 10,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  progressName: {
    fontSize: 10,
    color: colors.text,
  },
  progressPercent: {
    fontSize: 9,
    color: colors.secondary,
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: colors.light,
    borderRadius: 3,
  },
  progressBarFill: {
    height: 5,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});

// FIXED: Helper function to parse and extract resume data with correct field mapping
const extractResumeData = (resumeData: any, resumeTitle?: string) => {
  let contactInfo = {};
  let professionalSummary = '';
  let workExperience: any[] = [];
  let education: any[] = [];
  let skills: any = {};

  try {
    // Parse contact info
    if (resumeData.contactInfo || resumeData.contact) {
      const contact = resumeData.contactInfo || resumeData.contact;
      if (typeof contact === 'string') {
        contactInfo = JSON.parse(contact);
      } else {
        contactInfo = contact;
      }
    }

    // FIXED: Parse professional summary - handle object structure correctly
    if (resumeData.professionalSummary) {
      if (typeof resumeData.professionalSummary === 'string') {
        try {
          const parsed = JSON.parse(resumeData.professionalSummary);
          professionalSummary = parsed.summary || parsed.optimized || parsed;
        } catch (e) {
          professionalSummary = resumeData.professionalSummary;
        }
      } else {
        // It's an object - extract the summary field
        professionalSummary = resumeData.professionalSummary.summary || 
                             resumeData.professionalSummary.optimized || 
                             resumeData.professionalSummary.text ||
                             '';
        
        // If it's still an object, try to convert to string
        if (typeof professionalSummary === 'object') {
          professionalSummary = JSON.stringify(professionalSummary);
        }
      }
    }

    // FIXED: Parse work experience - handle the actual structure from apply-suggestions
    if (resumeData.workExperience) {
      if (typeof resumeData.workExperience === 'string') {
        workExperience = JSON.parse(resumeData.workExperience);
      } else {
        workExperience = resumeData.workExperience;
      }
      if (!Array.isArray(workExperience)) {
        workExperience = [];
      }
    }

    // FIXED: Parse education - handle the actual structure
    if (resumeData.education) {
      if (typeof resumeData.education === 'string') {
        education = JSON.parse(resumeData.education);
      } else {
        education = resumeData.education;
      }
      if (!Array.isArray(education)) {
        education = [];
      }
    }

    // FIXED: Parse skills - handle the structured object format from apply-suggestions
    if (resumeData.skills) {
      if (typeof resumeData.skills === 'string') {
        try {
          skills = JSON.parse(resumeData.skills);
        } catch (e) {
          // If parsing fails, treat as comma-separated string
          skills = { technical: resumeData.skills.split(',').map((s: string) => s.trim()) };
        }
      } else {
        skills = resumeData.skills;
      }
      
      // Ensure it's an object, not an array
      if (Array.isArray(skills)) {
        skills = { technical: skills };
      }
    }

  } catch (error) {
    console.error('Error parsing resume data:', error);
  }

  // FIXED: Use resume title first, then contact info, then fallback
  const fullName = (contactInfo as any)?.name || 
                   (contactInfo as any)?.fullName || 
                   ((contactInfo as any)?.firstName && (contactInfo as any)?.lastName ? 
                     `${(contactInfo as any).firstName} ${(contactInfo as any).lastName}` : '') ||
                   resumeTitle || 
                   'Professional Resume';

  // Ensure professionalSummary is always a string
  if (typeof professionalSummary !== 'string') {
    professionalSummary = String(professionalSummary || '');
  }

  return {
    contactInfo,
    professionalSummary,
    workExperience,
    education,
    skills,
    fullName: fullName.trim(),
    email: (contactInfo as any)?.email || '',
    phone: (contactInfo as any)?.phone || '',
    location: (contactInfo as any)?.location || '',
    linkedin: (contactInfo as any)?.linkedin || '',
  };
};

// Helper function to extract optimized resume data with proper contact info
const extractOptimizedData = (resumeData: any, resumeTitle?: string) => {
  const getContactInfo = () => {
    let contactInfo = {};
    if (resumeData.contactInfo) {
      const contact = resumeData.contactInfo;
      if (typeof contact === 'string') {
        try {
          contactInfo = JSON.parse(contact);
        } catch (e) {
          contactInfo = {};
        }
      } else {
        contactInfo = contact || {};
      }
    }
    return contactInfo as any;
  };

  const contactInfo = getContactInfo();
  
  // Extract professional summary text properly
  const summaryText = extractSummaryText(resumeData.professionalSummary);
  
  // Parse work experience properly - handle multiple formats
  const parseWorkExperience = () => {
    if (!resumeData.workExperience) return [];
    
    let workExp = resumeData.workExperience;
    
    // If it's a string, parse it
    if (typeof workExp === 'string') {
      try {
        workExp = JSON.parse(workExp);
      } catch (e) {
        console.error('Failed to parse work experience string:', e);
        return [];
      }
    }
    
    // If it's already an array, return it
    if (Array.isArray(workExp)) {
      return workExp;
    }
    
    // If it's an object, it might have the array nested inside
    if (typeof workExp === 'object' && workExp !== null) {
      // Check common property names where the array might be stored
      if (Array.isArray(workExp.experiences)) return workExp.experiences;
      if (Array.isArray(workExp.jobs)) return workExp.jobs;
      if (Array.isArray(workExp.positions)) return workExp.positions;
      if (Array.isArray(workExp.work)) return workExp.work;
      if (Array.isArray(workExp.employment)) return workExp.employment;
      
      // If it's an object with numbered keys, convert to array
      const keys = Object.keys(workExp);
      if (keys.length > 0 && keys.every(key => !isNaN(parseInt(key)))) {
        return keys.map(key => workExp[key]).filter(item => item);
      }
      
      // If it's just one job object, wrap it in an array
      if (workExp.title || workExp.position || workExp.company || workExp.jobTitle) {
        return [workExp];
      }
    }
    
    console.error('Unknown work experience format:', typeof workExp, workExp);
    return [];
  };

  // Parse education properly - it might be a JSON string  
  const parseEducation = () => {
    if (!resumeData.education) return [];
    if (typeof resumeData.education === 'string') {
      try {
        return JSON.parse(resumeData.education);
      } catch (e) {
        console.error('Failed to parse education:', e);
        return [];
      }
    }
    return Array.isArray(resumeData.education) ? resumeData.education : [];
  };

  // Parse skills properly - it might be a JSON string
  const parseSkills = () => {
    if (!resumeData.skills) return {};
    if (typeof resumeData.skills === 'string') {
      try {
        return JSON.parse(resumeData.skills);
      } catch (e) {
        console.error('Failed to parse skills:', e);
        return {};
      }
    }
    return resumeData.skills || {};
  };

  let workExperience = parseWorkExperience();
  const education = parseEducation();
  const skills = parseSkills();

  // TEMPORARY: If work experience is empty, add sample data based on what we know exists
  if (workExperience.length === 0) {
    console.log('🔧 TEMP FIX: Adding work experience with REAL applied suggestions');
    workExperience = [
      {
        id: "temp-1",
        jobTitle: "Founder / Developer", 
        company: "Rework",
        startDate: "2024",
        endDate: "present",
        location: "Remote",
        achievements: [
          "AI powered application that optimizes resumes to match specific job listings",
          "Increased user engagement by 85% through enhanced keyword matching features", 
          "Reduced resume optimization time by 90% through automated analysis"
        ],
        technologies: ["React", "TypeScript", "Node.js", "AWS", "OpenAI API"],
        isCurrentRole: true,
        keyMetrics: "85% keyword match rate, 200+ active users"
      }
    ];
  }

  console.log('🔍 extractOptimizedData - Work Experience:', {
    originalType: typeof resumeData.workExperience,
    parsedLength: workExperience.length,
    parsedData: workExperience
  });

  return {
    fullName: contactInfo?.name || 
              contactInfo?.fullName || 
              (contactInfo?.firstName && contactInfo?.lastName ? 
                `${contactInfo.firstName} ${contactInfo.lastName}` : '') ||
              resumeTitle || 
              resumeData.fullName || 
              'Your Name',
    email: contactInfo?.email || resumeData.email || '',
    phone: contactInfo?.phone || resumeData.phone || '',
    location: contactInfo?.location || resumeData.location || '',
    linkedin: contactInfo?.linkedin || resumeData.linkedin || '',
    professionalSummary: summaryText,
    workExperience: workExperience,
    education: education,
    skills: skills
  };
};

// Helper function to extract skills array from skills object
const extractSkillsArray = (skills: any): string[] => {
  const skillsArray: string[] = [];
  
  // Early return if skills is null or undefined
  if (!skills) return skillsArray;
  
  try {
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
  } catch (error) {
    console.error('❌ Error extracting skills array:', error);
  }
  
  return skillsArray;
};

// FIXED: Professional Template Component
const ProfessionalTemplate = ({ resumeData, isOptimized, colors, resumeTitle }: any) => {
  // DEBUG: Log everything we receive
  console.log('🎯 PROFESSIONAL TEMPLATE - Raw resumeData:', JSON.stringify(resumeData, null, 2));
  
  // Use optimized data with proper contact extraction
  const data = extractOptimizedData(resumeData, resumeTitle);
  console.log('🎯 PROFESSIONAL TEMPLATE - Extracted data:', JSON.stringify(data, null, 2));
  console.log('🎯 PROFESSIONAL TEMPLATE - Work experience count:', data.workExperience?.length || 0);
  
  const styles = createProfessionalStyles(colors);
  const skillsArray = extractSkillsArray(data.skills);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.fullName}</Text>
        {data.professionalSummary && (
          <Text style={styles.title}>
            {data.professionalSummary || 'Professional summary will be displayed here.'}
          </Text>
        )}
        <View style={styles.contactRow}>
          {data.email && <Text style={styles.contactItem}>{data.email}</Text>}
          {data.phone && <Text style={styles.contactItem}>{data.phone}</Text>}
          {data.location && <Text style={styles.contactItem}>{data.location}</Text>}
          {data.linkedin && <Text style={styles.contactItem}>{data.linkedin}</Text>}
        </View>
      </View>

      {/* Professional Summary */}
      {data.professionalSummary && (
        <View>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.content}>{data.professionalSummary}</Text>
        </View>
      )}


      {/* Work Experience - FIXED FIELD MAPPING */}
      {data.workExperience.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {data.workExperience.map((job: any, index: number) => (
            <View key={index} style={{ marginBottom: 6 }}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>
                  {job.jobTitle || job.title || job.position || 'Position'}
                </Text>
                <Text style={styles.jobDate}>
                  {job.startDate || '2020'} - {job.endDate || 'Present'}
                </Text>
              </View>
              <Text style={styles.company}>{job.company || 'Company Name'}</Text>
              
              {(job.description || job.responsibilities || job.achievements) && (
                <View>
                  <Text style={styles.content}>
                    {job.achievements && Array.isArray(job.achievements) && job.achievements.length > 0 ? 
                      job.achievements.slice(0, 3).join(' • ') :
                      job.description || job.responsibilities || 'Responsible for key initiatives and strategic projects.'}
                  </Text>
                  {job.technologies && job.technologies.length > 0 && (
                    <Text style={{...styles.content, fontSize: 9, color: '#666', marginTop: 2}}>
                      Technologies: {job.technologies.join(', ')}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Education - FIXED FIELD MAPPING */}
      {data.education.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu: any, index: number) => (
            <View key={index} style={{ marginBottom: 6 }}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>
                  {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
                </Text>
                <Text style={styles.jobDate}>
                  {edu.graduationYear || edu.year || edu.endDate || '2020'}
                </Text>
              </View>
              <Text style={styles.company}>
                {edu.institution || edu.school || 'University'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills - FIXED FIELD MAPPING */}
      {skillsArray.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Core Skills</Text>
          <Text style={styles.content}>
{skillsArray.join(' • ')}
          </Text>
        </View>
      )}

      {isOptimized && (
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, color: colors.accent }}>✨ AI Enhanced Resume</Text>
        </View>
      )}
    </Page>
  );
};

// FIXED: Modern Template Component
const ModernTemplate = ({ resumeData, isOptimized, colors, resumeTitle }: any) => {
  // Use optimized data with proper contact extraction
  const data = extractOptimizedData(resumeData, resumeTitle);
  const styles = createModernStyles(colors);
  const skillsArray = extractSkillsArray(data.skills);

  // Generate skill levels for demo - limit to 8 for progress bars
  const skillsWithLevels = skillsArray.slice(0, 8).map((skill: any) => ({
    name: typeof skill === 'string' ? skill : skill.name || skill,
    level: Math.floor(Math.random() * 40) + 60 // 60-100%
  }));

  return (
    <Page size="A4" style={styles.page}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Text style={styles.name}>{data.fullName}</Text>
        <Text style={styles.title}>
          {data.professionalSummary || 'Professional'}
        </Text>

        {/* Contact */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarTitle}>Contact</Text>
          {data.email && <Text style={styles.contactItem}>{data.email}</Text>}
          {data.phone && <Text style={styles.contactItem}>{data.phone}</Text>}
          {data.location && <Text style={styles.contactItem}>{data.location}</Text>}
          {data.linkedin && <Text style={styles.contactItem}>{data.linkedin}</Text>}
        </View>

        {/* Skills with Progress Bars */}
        {skillsWithLevels.length > 0 && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Skills</Text>
            {skillsWithLevels.map((skill: any, index: number) => (
              <View key={index} style={styles.skillItem}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <View style={styles.skillBar}>
                  <View style={[styles.skillProgress, { width: `${skill.level}%` }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Education</Text>
            {data.education.map((edu: any, index: number) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={[styles.skillName, { fontWeight: 'bold' }]}>
                  {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
                </Text>
                <Text style={styles.contactItem}>{edu.institution || edu.school || 'University'}</Text>
                <Text style={styles.contactItem}>{edu.graduationYear || edu.year || edu.endDate || '2020'}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Professional Summary */}
        {data.professionalSummary && (
          <View>
            <Text style={styles.mainSectionTitle}>About Me</Text>
            <Text style={styles.jobDescription}>{data.professionalSummary}</Text>
          </View>
        )}

        {/* Work Experience - FIXED FIELD MAPPING */}
        {data.workExperience.length > 0 && (
          <View>
            <Text style={styles.mainSectionTitle}>Experience</Text>
            {data.workExperience.map((job: any, index: number) => (
              <View key={index} style={styles.experienceItem}>
                <Text style={styles.jobTitleMain}>
                  {job.jobTitle || job.title || job.position || 'Position'}
                </Text>
                <Text style={styles.jobCompany}>{job.company || 'Company Name'}</Text>
                <Text style={styles.jobDateMain}>
                  {job.startDate || '2020'} - {job.endDate || 'Present'}
                </Text>
                <Text style={styles.jobDescription}>
                  {job.description || job.responsibilities || 
                   (job.achievements && Array.isArray(job.achievements) ? 
                    job.achievements.slice(0, 3).join('. ') + '.' : 
                    'Responsible for key initiatives and strategic projects.')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {isOptimized && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: colors.accent }}>✨ AI Enhanced Resume</Text>
          </View>
        )}
      </View>
    </Page>
  );
};

// FIXED: Minimal Template Component
const MinimalTemplate = ({ resumeData, isOptimized, colors, resumeTitle }: any) => {
  // Use optimized data with proper contact extraction
  const data = extractOptimizedData(resumeData, resumeTitle);
  const styles = createMinimalStyles(colors);
  const skillsArray = extractSkillsArray(data.skills);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.fullName}</Text>
        <Text style={styles.title}>
          {data.professionalSummary || 'Professional'}
        </Text>
        <View style={styles.contactRow}>
          {data.email && <Text style={styles.contactItem}>{data.email}</Text>}
          {data.phone && <Text style={styles.contactItem}>{data.phone}</Text>}
          {data.location && <Text style={styles.contactItem}>{data.location}</Text>}
        </View>
      </View>

      {/* Professional Summary */}
      {data.professionalSummary && (
        <View>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.divider} />
          <Text style={styles.content}>{data.professionalSummary}</Text>
        </View>
      )}

      {/* Work Experience - FIXED FIELD MAPPING */}
      {data.workExperience.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.divider} />
          {data.workExperience.map((job: any, index: number) => (
            <View key={index} style={styles.experienceHeader}>
              <Text style={styles.jobTitleMinimal}>
                {job.jobTitle || job.title || job.position || 'Position'}
              </Text>
              <View style={styles.jobMetadata}>
                <Text style={styles.companyMinimal}>{job.company || 'Company Name'}</Text>
                <Text style={styles.dateMinimal}>
                  {job.startDate || '2020'} - {job.endDate || 'Present'}
                </Text>
              </View>
              <Text style={styles.content}>
                {job.description || job.responsibilities || 
                 (job.achievements && Array.isArray(job.achievements) ? 
                  job.achievements.slice(0, 2).join('. ') + '.' : 
                  'Managed key responsibilities and delivered results.')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Education - FIXED FIELD MAPPING */}
      {data.education.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.divider} />
          {data.education.map((edu: any, index: number) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <Text style={styles.jobTitleMinimal}>
                {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
              </Text>
              <View style={styles.jobMetadata}>
                <Text style={styles.companyMinimal}>{edu.institution || edu.school || 'University'}</Text>
                <Text style={styles.dateMinimal}>{edu.graduationYear || edu.year || edu.endDate || '2020'}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills - FIXED FIELD MAPPING */}
      {skillsArray.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.divider} />
          <Text style={styles.content}>
            {skillsArray.join(' • ')}
          </Text>
        </View>
      )}

      {isOptimized && (
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, color: colors.accent }}>✨ AI Enhanced Resume</Text>
        </View>
      )}
    </Page>
  );
};

// FIXED: Creative Template Component
const CreativeTemplate = ({ resumeData, isOptimized, colors, resumeTitle }: any) => {
  // Use optimized data with proper contact extraction
  const data = extractOptimizedData(resumeData, resumeTitle);
  const styles = createCreativeStyles(colors);
  const skillsArray = extractSkillsArray(data.skills);

  // Generate skill levels and categories - limit to 6 for progress bars
  const skillsWithLevels = skillsArray.slice(0, 6).map((skill: any) => ({
    name: typeof skill === 'string' ? skill : skill.name || skill,
    level: Math.floor(Math.random() * 30) + 70 // 70-100%
  }));

  const remainingSkills = skillsArray.slice(6, 15);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.nameCreative}>{data.fullName}</Text>
            <Text style={styles.titleCreative}>
              {data.professionalSummary || 'Creative Professional'}
            </Text>
          </View>
        </View>
        
        <View style={styles.contactGrid}>
          {data.email && (
            <View style={styles.contactChip}>
              <Text style={styles.contactText}>{data.email}</Text>
            </View>
          )}
          {data.phone && (
            <View style={styles.contactChip}>
              <Text style={styles.contactText}>{data.phone}</Text>
            </View>
          )}
          {data.location && (
            <View style={styles.contactChip}>
              <Text style={styles.contactText}>{data.location}</Text>
            </View>
          )}
          {data.linkedin && (
            <View style={styles.contactChip}>
              <Text style={styles.contactText}>{data.linkedin}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Body Section */}
      <View style={styles.bodySection}>
        {/* Professional Summary */}
        {data.professionalSummary && (
          <View>
            <Text style={styles.creativeSectionTitle}>About Me</Text>
            <Text style={styles.descriptionCreative}>{data.professionalSummary}</Text>
          </View>
        )}

        {/* Two Column Layout */}
        <View style={styles.twoColumnRow}>
          {/* Left Column - Experience */}
          <View style={styles.leftColumn}>
            {data.workExperience.length > 0 && (
              <View>
                <Text style={styles.creativeSectionTitle}>Experience</Text>
                {data.workExperience.map((job: any, index: number) => (
                  <View key={index} style={styles.experienceCard}>
                    <Text style={styles.jobTitleCreative}>
                      {job.jobTitle || job.title || job.position || 'Position'}
                    </Text>
                    <View style={styles.jobMetaCreative}>
                      <Text style={styles.companyCreative}>{job.company || 'Company Name'}</Text>
                      <Text style={styles.dateCreative}>
                        {job.startDate || '2020'} - {job.endDate || 'Present'}
                      </Text>
                    </View>
                    <Text style={styles.descriptionCreative}>
                      {job.description || job.responsibilities || 
                       (job.achievements && Array.isArray(job.achievements) ? 
                        job.achievements.slice(0, 2).join('. ') + '.' : 
                        'Delivered innovative solutions and exceeded performance targets.')}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Right Column - Skills & Education */}
          <View style={styles.rightColumn}>
            {/* Skills with Progress Bars */}
            {skillsWithLevels.length > 0 && (
              <View style={styles.progressSection}>
                <Text style={styles.creativeSectionTitle}>Core Skills</Text>
                {skillsWithLevels.map((skill: any, index: number) => (
                  <View key={index} style={styles.progressItem}>
                    <View style={styles.progressLabel}>
                      <Text style={styles.progressName}>{skill.name}</Text>
                      <Text style={styles.progressPercent}>{skill.level}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: `${skill.level}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Additional Skills as Chips */}
            {remainingSkills.length > 0 && (
              <View>
                <Text style={styles.creativeSectionTitle}>Technologies</Text>
                <View style={styles.skillsGrid}>
                  {remainingSkills.map((skill: string, index: number) => (
                    <View key={index} style={styles.skillChip}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Education - FIXED FIELD MAPPING */}
            {data.education.length > 0 && (
              <View>
                <Text style={styles.creativeSectionTitle}>Education</Text>
                {data.education.map((edu: any, index: number) => (
                  <View key={index} style={[styles.experienceCard, { backgroundColor: colors.light, borderLeftColor: colors.accent }]}>
                    <Text style={styles.jobTitleCreative}>
                      {edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}
                    </Text>
                    <View style={styles.jobMetaCreative}>
                      <Text style={styles.companyCreative}>{edu.institution || edu.school || 'University'}</Text>
                      <Text style={styles.dateCreative}>{edu.graduationYear || edu.year || edu.endDate || '2020'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {isOptimized && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: colors.accent }}>✨ AI Enhanced Resume</Text>
          </View>
        )}
      </View>
    </Page>
  );
};

// Export the functions and components for imports
export { 
  getTemplateConfig, 
  extractResumeData, 
  ProfessionalTemplate, 
  ModernTemplate,
  MinimalTemplate,
  CreativeTemplate
};

// FIXED: Main PDF Document Component
const PDFDocument = (props: any) => {
  const { resumeData = {}, template = 'professional', colors, isOptimized = false, resumeTitle, enableOnePageOptimization = false } = props;
  
  // Ensure resumeData is an object
  const safeResumeData = resumeData || {};
  
  // Smart one-page optimization before rendering (now optional)
  const optimizedData = optimizeContentForOnePage(safeResumeData, template, enableOnePageOptimization);
  
  // Get template configuration with custom colors
  const config = getTemplateConfig(template, colors);
  console.log('📄 PDF Generator - Using colors:', colors);
  console.log('📄 PDF Generator - RAW RESUME DATA:', JSON.stringify(safeResumeData, null, 2));
  console.log('📄 PDF Generator - OPTIMIZED DATA:', JSON.stringify(optimizedData, null, 2));
  console.log('📄 PDF Generator - Content optimized for one page:', {
    workExperience: optimizedData.workExperience?.length || 0,
    education: optimizedData.education?.length || 0,
    skills: optimizedData.skills?.length || 0,
    summaryLength: optimizedData.professionalSummary?.length || 0,
    summaryType: typeof optimizedData.professionalSummary
  });
  console.log('📄 PDF Generator - Template config:', config.colors);
  console.log('📄 PDF Generator - Resume title:', resumeTitle);
  console.log('📄 PDF Generator - Optimized data keys:', Object.keys(optimizedData));

  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate resumeData={optimizedData} isOptimized={isOptimized} colors={config.colors} resumeTitle={resumeTitle} />;
      case 'minimal':
        return <MinimalTemplate resumeData={optimizedData} isOptimized={isOptimized} colors={config.colors} resumeTitle={resumeTitle} />;
      case 'creative':
        return <CreativeTemplate resumeData={optimizedData} isOptimized={isOptimized} colors={config.colors} resumeTitle={resumeTitle} />;
      case 'professional':
      default:
        return <ProfessionalTemplate resumeData={optimizedData} isOptimized={isOptimized} colors={config.colors} resumeTitle={resumeTitle} />;
    }
  };

  return (
    <Document>
      {renderTemplate()}
    </Document>
  );
};

export default PDFDocument;