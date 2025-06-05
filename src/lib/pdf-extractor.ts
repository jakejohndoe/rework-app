// src/lib/pdf-extractor.ts (WORKING NODE.JS VERSION WITH PDF-PARSE)

import pdf from 'pdf-parse';

interface ExtractedContact {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

interface ExtractedExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ExtractedEducation {
  degree: string;
  school: string;
  year: string;
  gpa?: string;
}

interface ExtractedResumeData {
  contact: ExtractedContact;
  summary?: string;
  experience: ExtractedExperience[];
  education: ExtractedEducation[];
  skills: string[];
  rawText: string;
}

/**
 * Extract text from PDF buffer using pdf-parse (Node.js native)
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log('📄 Starting PDF text extraction with pdf-parse...');
    console.log('📄 Buffer size:', pdfBuffer.length, 'bytes');
    
    // Use pdf-parse which is designed for Node.js
    const data = await pdf(pdfBuffer, {
      // Options for better text extraction
      max: 0, // Extract all pages
      version: 'v1.10.100', // Specify version for stability
    });
    
    console.log('📖 PDF parsed successfully:');
    console.log('📄 Pages:', data.numpages);
    console.log('📝 Text length:', data.text.length);
    console.log('ℹ️ PDF info:', data.info?.Title || 'No title');
    
    if (!data.text || data.text.length === 0) {
      throw new Error('No text content extracted from PDF - file may be image-based or corrupted');
    }
    
    // Clean up the extracted text
    const cleanText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')  // Normalize line breaks
      .replace(/\s+/g, ' ')          // Normalize spaces
      .trim();
    
    console.log('✅ Text extraction complete:', cleanText.length, 'characters');
    console.log('📝 Preview:', cleanText.substring(0, 200) + '...');
    
    return cleanText;
    
  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse raw text into structured resume data
 */
export function parseResumeText(rawText: string): ExtractedResumeData {
  console.log('🔍 Starting resume text parsing...');
  console.log('📝 Input text length:', rawText.length);
  
  const result: ExtractedResumeData = {
    contact: {},
    experience: [],
    education: [],
    skills: [],
    rawText: rawText,
  };

  // Clean up text for better parsing
  const cleanText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // Extract contact information
  result.contact = extractContactInfo(cleanText);
  console.log('📞 Contact extracted:', result.contact);

  // Extract professional summary
  result.summary = extractSummary(cleanText);
  console.log('📝 Summary found:', result.summary ? `Yes (${result.summary.length} chars)` : 'No');

  // Extract experience
  result.experience = extractExperience(cleanText);
  console.log('💼 Experience entries:', result.experience.length);

  // Extract education
  result.education = extractEducation(cleanText);
  console.log('🎓 Education entries:', result.education.length);

  // Extract skills
  result.skills = extractSkills(cleanText);
  console.log('🛠️ Skills found:', result.skills.length);

  return result;
}

/**
 * Extract contact information with improved patterns
 */
function extractContactInfo(text: string): ExtractedContact {
  const contact: ExtractedContact = {};
  
  console.log('🔍 Extracting contact info from text preview:', text.substring(0, 300));
  
  // Extract email (most reliable)
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    contact.email = emailMatch[0];
    console.log('📧 Email found:', contact.email);
  }

  // Extract phone (various formats)
  const phonePatterns = [
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,  // (123) 456-7890 or 123-456-7890
    /\+?1[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // +1 (123) 456-7890
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch) {
      contact.phone = phoneMatch[0].trim();
      console.log('📱 Phone found:', contact.phone);
      break;
    }
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([a-zA-Z0-9-]+)/i);
  if (linkedinMatch) {
    contact.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
    console.log('💼 LinkedIn found:', contact.linkedin);
  }

  // Extract website/portfolio
  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:com|org|net|io|dev))/i);
  if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('email')) {
    contact.website = websiteMatch[0].startsWith('http') ? websiteMatch[0] : `https://${websiteMatch[0]}`;
    console.log('🌐 Website found:', contact.website);
  }

  // Extract name (improved heuristic)
  const lines = text.split('\n').filter(line => line.trim());
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    // Name heuristics: 2-4 words, proper case, no numbers, reasonable length
    if (line.length > 5 && line.length < 50 && 
        /^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) && 
        !/\d/.test(line) && 
        !line.includes('@') && 
        !line.includes('http') &&
        !line.includes('Resume') &&
        !line.includes('RESUME')) {
      contact.fullName = line;
      console.log('👤 Name found:', contact.fullName);
      break;
    }
  }

  // Extract location
  const locationMatch = text.match(/([A-Z][a-z]+,?\s+[A-Z]{2}(?:\s+\d{5})?)/);
  if (locationMatch) {
    contact.location = locationMatch[1];
    console.log('📍 Location found:', contact.location);
  }

  return contact;
}

/**
 * Extract professional summary
 */
function extractSummary(text: string): string {
  const summaryKeywords = [
    'PROFESSIONAL SUMMARY', 'SUMMARY', 'PROFILE', 'OVERVIEW', 
    'OBJECTIVE', 'ABOUT', 'CAREER OBJECTIVE'
  ];
  
  for (const keyword of summaryKeywords) {
    const pattern = new RegExp(`${keyword}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z]{2,}|EXPERIENCE|EDUCATION|SKILLS|$)`, 'i');
    const match = text.match(pattern);
    
    if (match && match[1]) {
      const summary = match[1].trim()
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (summary.length > 20) { // Ensure it's substantial
        return summary;
      }
    }
  }
  
  return '';
}

/**
 * Extract work experience
 */
function extractExperience(text: string): ExtractedExperience[] {
  const experiences: ExtractedExperience[] = [];
  
  // Find experience section
  const expPattern = /(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE)[:\\s]*([\\s\\S]*?)(?=\\n(?:EDUCATION|SKILLS|PROJECTS|$))/i;
  const expMatch = text.match(expPattern);
  
  if (!expMatch) return experiences;
  
  const expSection = expMatch[1];
  
  // Split by job entries (look for job titles followed by companies)
  const jobPattern = /([A-Z][^\\n]*(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior|Intern)[^\\n]*)[\\n\\s]*([A-Z][^\\n]*(?:Inc|LLC|Corp|Company|Technologies|Systems)[^\\n]*)[\\n\\s]*([^\\n]*(?:202\\d|201\\d|Present)[^\\n]*)[\\n\\s]*([\\s\\S]*?)(?=(?:[A-Z][^\\n]*(?:Engineer|Developer|Manager)|$))/gi;
  
  let match;
  while ((match = jobPattern.exec(expSection)) !== null) {
    const title = match[1].trim();
    const company = match[2].trim();
    const dateInfo = match[3].trim();
    const description = match[4].trim();
    
    // Parse dates
    const { startDate, endDate } = parseDateRange(dateInfo);
    
    experiences.push({
      title,
      company,
      startDate,
      endDate,
      description: description.replace(/\n+/g, ' ').trim()
    });
  }
  
  return experiences;
}

/**
 * Extract education
 */
function extractEducation(text: string): ExtractedEducation[] {
  const education: ExtractedEducation[] = [];
  
  const eduPattern = /(?:EDUCATION|ACADEMIC)[:\\s]*([\\s\\S]*?)(?=\\n(?:EXPERIENCE|SKILLS|PROJECTS|$))/i;
  const eduMatch = text.match(eduPattern);
  
  if (!eduMatch) return education;
  
  const eduSection = eduMatch[1];
  
  // Look for degree patterns
  const degreePattern = /(Bachelor|Master|PhD|Associate|B\\.?[AS]|M\\.?[AS]|Ph\\.?D)[^\\n]*[\\n\\s]*([^\\n]*(?:University|College|Institute)[^\\n]*)[\\n\\s]*([^\\n]*(?:202\\d|201\\d|20\\d\\d)[^\\n]*)/gi;
  
  let match;
  while ((match = degreePattern.exec(eduSection)) !== null) {
    education.push({
      degree: match[1].trim(),
      school: match[2].trim(),
      year: match[3].trim()
    });
  }
  
  return education;
}

/**
 * Extract skills
 */
function extractSkills(text: string): string[] {
  const skillsPattern = /(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|TECHNOLOGIES)[:\\s]*([\\s\\S]*?)(?=\\n(?:EXPERIENCE|EDUCATION|PROJECTS|$))/i;
  const skillsMatch = text.match(skillsPattern);
  
  if (!skillsMatch) return [];
  
  const skillsSection = skillsMatch[1];
  
  // Split by common delimiters and clean up
  const skills = skillsSection
    .split(/[,•·|;\\n]/)
    .map(skill => skill.trim())
    .filter(skill => skill && skill.length > 1 && skill.length < 30)
    .filter(skill => !/^\\d+$/.test(skill)) // Remove pure numbers
    .slice(0, 20); // Limit to reasonable number
  
  return [...new Set(skills)]; // Remove duplicates
}

/**
 * Parse date range from text
 */
function parseDateRange(dateText: string): { startDate: string; endDate: string } {
  const currentMatch = dateText.match(/Present|Current|Now/i);
  const endDate = currentMatch ? 'Present' : '';
  
  // Extract years
  const years = dateText.match(/20\\d\\d/g);
  if (years && years.length >= 2) {
    return {
      startDate: years[0],
      endDate: endDate || years[years.length - 1]
    };
  } else if (years && years.length === 1) {
    return {
      startDate: years[0],
      endDate: endDate || years[0]
    };
  }
  
  return {
    startDate: '',
    endDate: endDate
  };
}

/**
 * Main function to extract and parse resume from PDF buffer
 */
export async function extractAndParseResume(pdfBuffer: Buffer): Promise<ExtractedResumeData> {
  const rawText = await extractTextFromPDF(pdfBuffer);
  return parseResumeText(rawText);
}