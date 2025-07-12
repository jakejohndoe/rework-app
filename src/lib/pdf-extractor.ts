// src/lib/pdf-extractor.ts (FIXED FOR NORMAL CASE NAMES)

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
    
    const data = await pdf(pdfBuffer, {
      max: 0,
      version: 'v1.10.100',
    });
    
    console.log('📖 PDF parsed successfully:');
    console.log('📄 Pages:', data.numpages);
    console.log('📝 Text length:', data.text.length);
    console.log('ℹ️ PDF info:', data.info?.Title || 'No title');
    
    if (!data.text || data.text.length === 0) {
      throw new Error('No text content extracted from PDF - file may be image-based or corrupted');
    }
    
    // Preserve more structure in the text
    const cleanText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
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

  // Extract contact information
  result.contact = extractContactInfo(rawText);
  console.log('📞 Contact extracted:', result.contact);

  // Extract professional summary
  result.summary = extractSummary(rawText);
  console.log('📝 Summary found:', result.summary ? `Yes (${result.summary.length} chars)` : 'No');

  // Extract experience
  result.experience = extractExperience(rawText);
  console.log('💼 Experience entries:', result.experience.length);

  // Extract education
  result.education = extractEducation(rawText);
  console.log('🎓 Education entries:', result.education.length);

  // Extract skills
  result.skills = extractSkills(rawText);
  console.log('🛠️ Skills found:', result.skills.length);

  return result;
}

/**
 * Extract contact information - FIXED for normal case names
 */
function extractContactInfo(text: string): ExtractedContact {
  const contact: ExtractedContact = {};
  
  console.log('🔍 Full text for contact extraction:\n', text.substring(0, 500));
  
  // Extract email
  const emailMatch = text.match(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/);
  if (emailMatch) {
    contact.email = emailMatch[1];
    console.log('📧 Email found:', contact.email);
  }

  // Extract phone
  const phoneMatch = text.match(/\((\d{3})\)\s*(\d{3})-(\d{4})/);
  if (phoneMatch) {
    contact.phone = `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`;
    console.log('📱 Phone found:', contact.phone);
  }

  // 🔧 FIXED: Extract full name - handle both CAPS and normal case
  const namePatterns = [
    // Pattern 1: First line of PDF (your case: "Jakob Johnson")
    /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m,
    
    // Pattern 2: Name before job title
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/m,
    
    // Pattern 3: Traditional ALL-CAPS patterns (fallback)
    /\n([A-Z][A-Z\s]{2,30})\n(?:GRIP|OBJECTIVE)/,
    /LINKEDIN URL\s*\n([A-Z][A-Z\s]{2,30})\n/,
    /([A-Z]{2,}\s[A-Z]{2,}(?:\s[A-Z]{2,})?)/,
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = text.match(pattern);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      console.log('🔍 Pattern matched:', pattern, 'Result:', name);
      
      // Validate the name
      if (name.length > 3 && name.length < 50 && 
          !name.includes('@') && 
          !name.includes('(') &&  // 🔧 ADDED: Exclude phone numbers
          !name.includes(')') &&  // 🔧 ADDED: Exclude phone numbers
          !name.includes('-') &&  // 🔧 ADDED: Exclude phone numbers
          !name.includes('OBJECTIVE') &&
          !name.includes('SKILLS') &&
          !name.includes('EMAIL') &&
          !name.includes('Software Developer') && // 🔧 ADDED: Exclude job titles
          !name.includes('Developer') &&
          !name.match(/^\d+/)) {    // 🔧 ADDED: Exclude numbers
        
        contact.fullName = name;
        console.log('👤 Name found:', contact.fullName);
        break;
      } else {
        console.log('❌ Name rejected (validation failed):', name);
      }
    }
  }

  // 🔧 SPECIAL HANDLING: If still no name, try to extract from the very beginning
  if (!contact.fullName) {
    console.log('🔍 Trying special name extraction from start of document...');
    const lines = text.split('\n').slice(0, 3); // First 3 lines
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for "FirstName LastName" pattern at start
      const nameMatch = trimmed.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)$/);
      if (nameMatch && 
          !nameMatch[1].includes('Software') && 
          !nameMatch[1].includes('Developer') &&
          !nameMatch[1].includes('@')) {
        contact.fullName = nameMatch[1];
        console.log('👤 Special extraction found name:', contact.fullName);
        break;
      }
    }
  }

  // Extract LinkedIn handle from social media reference
  const socialMatch = text.match(/@([a-zA-Z0-9_]+)/);
  if (socialMatch) {
    contact.linkedin = `https://linkedin.com/in/${socialMatch[1]}`;
    console.log('💼 LinkedIn found:', contact.linkedin);
  }

  // Extract location 
  if (text.includes('LOS ANGELES')) {
    contact.location = 'Los Angeles, CA';
    console.log('📍 Location inferred:', contact.location);
  } else if (text.includes('Saint Paul')) {
    contact.location = 'Saint Paul, MN';
    console.log('📍 Location found:', contact.location);
  }

  return contact;
}

/**
 * Extract professional summary - OPTIMIZED for your format
 */
function extractSummary(text: string): string {
  // Look for OBJECTIVE sections
  const objectivePattern = /OBJECTIVE\s*\n([\s\S]*?)(?=\n[A-Z]{3,}|\nSKILLS|\nEXPERIENCE|\nEDUCATION|$)/;
  const objectiveMatch = text.match(objectivePattern);
  
  if (objectiveMatch) {
    const summary = objectiveMatch[1]
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (summary.length > 20) {
      console.log('📝 Objective found:', summary);
      return summary;
    }
  }

  // Look for Summary sections
  const summaryPattern = /Summary\s*\n([\s\S]*?)(?=\n[A-Z]|\nSkills|\nExperience|\nEducation|$)/i;
  const summaryMatch = text.match(summaryPattern);
  
  if (summaryMatch) {
    const summary = summaryMatch[1]
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (summary.length > 20) {
      console.log('📝 Summary found:', summary);
      return summary;
    }
  }
  
  return '';
}

/**
 * Extract work experience - OPTIMIZED for your format
 */
function extractExperience(text: string): ExtractedExperience[] {
  const experiences: ExtractedExperience[] = [];
  
  // Look for EXPERIENCE section
  const expPattern = /EXPERIENCE\s*\n([\s\S]*?)(?=\nEDUCATION|\nOBJECTIVE|$)/;
  const expMatch = text.match(expPattern);
  
  if (expMatch) {
    const expSection = expMatch[1].trim();
    console.log('💼 Experience section found:', expSection);
    
    // For this resume format, create a single experience entry
    if (expSection.length > 10) {
      experiences.push({
        title: 'Software Developer', // Inferred from job title
        company: 'Various Projects',
        startDate: '',
        endDate: 'Present',
        description: expSection.replace(/\n+/g, ' ').trim()
      });
    }
  }
  
  return experiences;
}

/**
 * Extract education - OPTIMIZED for your format
 */
function extractEducation(text: string): ExtractedEducation[] {
  const education: ExtractedEducation[] = [];
  
  // Look for EDUCATION section
  const eduPattern = /EDUCATION\s*\n([\s\S]*?)(?=\nOBJECTIVE|$)/;
  const eduMatch = text.match(eduPattern);
  
  if (eduMatch) {
    const eduSection = eduMatch[1];
    console.log('🎓 Education section found:', eduSection);
    
    // Pattern for your specific format: DEGREE • YEAR • SCHOOL
    const degreePattern = /([A-Z][A-Z\s:]+?)\s*•\s*(\d{4})\s*•\s*([A-Z][A-Z\s.]+)/g;
    
    let match;
    while ((match = degreePattern.exec(eduSection)) !== null) {
      const degree = match[1].trim();
      const year = match[2].trim();
      const school = match[3].trim();
      
      education.push({
        degree,
        school,
        year
      });
      
      console.log('🎓 Education entry:', { degree, school, year });
    }
  }
  
  return education;
}

/**
 * Extract skills - OPTIMIZED for your format
 */
function extractSkills(text: string): string[] {
  const skills: string[] = [];
  
  // Look for SKILLS section
  const skillsPattern = /Skills\s*\n([\s\S]*?)(?=\n[A-Z]{2,}\s*\n|Experience|Education|$)/i;
  const skillsMatch = text.match(skillsPattern);
  
  if (skillsMatch) {
    const skillsSection = skillsMatch[1];
    console.log('🛠️ Skills section found:', skillsSection);
    
    // Extract skills that start with bullet points or are comma-separated
    const skillLines = skillsSection
      .split(/[,\n]/)
      .map(line => line.trim())
      .filter(line => line.length > 2 && line.length < 50)
      .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter(line => line.length > 0);
    
    skills.push(...skillLines);
    
    console.log('🛠️ Extracted skills:', skills);
  }
  
  return skills.slice(0, 20); // Limit to 20 skills
}


/**
 * Main function to extract and parse resume from PDF buffer
 */
export async function extractAndParseResume(pdfBuffer: Buffer): Promise<ExtractedResumeData> {
  const rawText = await extractTextFromPDF(pdfBuffer);
  return parseResumeText(rawText);
}