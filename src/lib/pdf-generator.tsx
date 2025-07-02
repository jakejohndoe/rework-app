// src/lib/pdf-generator.tsx - PART 1 (UPDATED)
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

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

// Professional Template Styles - Now Dynamic
const createProfessionalStyles = (colors: any) => StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    textAlign: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Times-Roman',
    color: colors.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 15,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  contactItem: {
    fontSize: 11,
    color: colors.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Times-Roman',
    color: colors.primary,
    marginTop: 25,
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.6,
    color: colors.text,
    marginBottom: 10,
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
    fontSize: 11,
    color: colors.secondary,
  },
  company: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 8,
  },
});

// Modern Template Styles - Now Dynamic
const createModernStyles = (colors: any) => StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  sidebar: {
    width: '35%',
    backgroundColor: colors.light,
    padding: 25,
    paddingTop: 40,
  },
  mainContent: {
    width: '65%',
    padding: 30,
    paddingTop: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 20,
  },
  sidebarSection: {
    marginBottom: 25,
  },
  sidebarTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
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
    fontSize: 11,
    color: colors.text,
    marginBottom: 3,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    marginTop: 20,
  },
  experienceItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  jobTitleMain: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 3,
  },
  jobCompany: {
    fontSize: 11,
    color: colors.primary,
    marginBottom: 2,
  },
  jobDateMain: {
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
  },
});

// UPDATED: Helper function to parse and extract resume data with resumeTitle
const extractResumeData = (resumeData: any, resumeTitle?: string) => {
  let contactInfo = {};
  let professionalSummary = '';
  let workExperience: any[] = [];
  let education: any[] = [];
  let skills: any[] = [];

  try {
    // Parse contact info
    if (resumeData.contactInfo) {
      if (typeof resumeData.contactInfo === 'string') {
        contactInfo = JSON.parse(resumeData.contactInfo);
      } else {
        contactInfo = resumeData.contactInfo;
      }
    }

    // Parse professional summary
    if (resumeData.professionalSummary) {
      if (typeof resumeData.professionalSummary === 'string') {
        const parsed = JSON.parse(resumeData.professionalSummary);
        professionalSummary = parsed.optimized || parsed.summary || parsed;
      } else {
        professionalSummary = resumeData.professionalSummary.optimized || resumeData.professionalSummary.summary || resumeData.professionalSummary;
      }
    }

    // Parse work experience
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

    // Parse education
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

    // Parse skills - handle different formats
    if (resumeData.skills) {
      if (typeof resumeData.skills === 'string') {
        try {
          skills = JSON.parse(resumeData.skills);
        } catch (e) {
          // If parsing fails, treat as comma-separated string
          skills = resumeData.skills.split(',').map((s: string) => s.trim());
        }
      } else {
        skills = resumeData.skills;
      }
      if (!Array.isArray(skills)) {
        skills = [];
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

// PART 2 - Template Components (UPDATED with resumeTitle)

// UPDATED: Professional Template Component
const ProfessionalTemplate = ({ resumeData, isOptimized, colors, resumeTitle }: any) => {
  const data = extractResumeData(resumeData, resumeTitle);
  const styles = createProfessionalStyles(colors);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.fullName}</Text>
        {data.professionalSummary && (
          <Text style={styles.title}>
            {data.professionalSummary.substring(0, 80) + '...'}
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

      {/* Work Experience */}
      {data.workExperience.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {data.workExperience.slice(0, 6).map((job: any, index: number) => (
            <View key={index} style={{ marginBottom: 15 }}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.title || job.position || 'Position'}</Text>
                <Text style={styles.jobDate}>{job.startDate || '2020'} - {job.endDate || 'Present'}</Text>
              </View>
              <Text style={styles.company}>{job.company || 'Company Name'}</Text>
              <Text style={styles.content}>
                {job.description || job.responsibilities || 'Responsible for key initiatives and strategic projects.'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.slice(0, 3).map((edu: any, index: number) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{edu.degree || 'Degree'}</Text>
                <Text style={styles.jobDate}>{edu.year || edu.endDate || '2020'}</Text>
              </View>
              <Text style={styles.company}>{edu.institution || edu.school || 'University'}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Core Skills</Text>
          <Text style={styles.content}>
            {data.skills.slice(0, 12).map((skill: any) => 
              typeof skill === 'string' ? skill : skill.name || skill
            ).join(' • ')}
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

// UPDATED: Modern Template Component (Two-Column)
const ModernTemplate = ({ resumeData, isOptimized, colors, resumeTitle }: any) => {
  const data = extractResumeData(resumeData, resumeTitle);
  const styles = createModernStyles(colors);

  // Generate skill levels for demo
  const skillsWithLevels = data.skills.slice(0, 8).map((skill: any) => ({
    name: typeof skill === 'string' ? skill : skill.name || skill,
    level: Math.floor(Math.random() * 40) + 60 // 60-100%
  }));

  return (
    <Page size="A4" style={styles.page}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Text style={styles.name}>{data.fullName}</Text>
        <Text style={styles.title}>
          {data.professionalSummary ? data.professionalSummary.substring(0, 50) + '...' : 'Professional'}
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
            {data.education.slice(0, 2).map((edu: any, index: number) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={[styles.skillName, { fontWeight: 'bold' }]}>{edu.degree || 'Degree'}</Text>
                <Text style={styles.contactItem}>{edu.institution || edu.school || 'University'}</Text>
                <Text style={styles.contactItem}>{edu.year || edu.endDate || '2020'}</Text>
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

        {/* Work Experience */}
        {data.workExperience.length > 0 && (
          <View>
            <Text style={styles.mainSectionTitle}>Experience</Text>
            {data.workExperience.slice(0, 5).map((job: any, index: number) => (
              <View key={index} style={styles.experienceItem}>
                <Text style={styles.jobTitleMain}>{job.title || job.position || 'Position'}</Text>
                <Text style={styles.jobCompany}>{job.company || 'Company Name'}</Text>
                <Text style={styles.jobDateMain}>{job.startDate || '2020'} - {job.endDate || 'Present'}</Text>
                <Text style={styles.jobDescription}>
                  {job.description || job.responsibilities || 'Responsible for key initiatives and strategic projects.'}
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

// PART 3 - Minimal and Creative Template Styles & Components

// Minimal Template Styles - Now Dynamic
const createMinimalStyles = (colors: any) => StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 40,
    textAlign: 'center',
  },
  name: {
    fontSize: 26,
    color: colors.primary,
    marginBottom: 5,
  },
  title: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 20,
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
    marginTop: 30,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.accent,
    marginBottom: 20,
    width: 50,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.7,
    color: colors.text,
    marginBottom: 15,
  },
  experienceHeader: {
    marginBottom: 15,
  },
  jobTitleMinimal: {
    fontSize: 12,
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
    fontSize: 11,
    color: colors.secondary,
  },
  dateMinimal: {
    fontSize: 11,
    color: colors.secondary,
  },
});

// Creative Template Styles - Now Dynamic
const createCreativeStyles = (colors: any) => StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  headerSection: {
    backgroundColor: colors.primary,
    padding: 30,
    paddingBottom: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  titleCreative: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
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
    padding: 30,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    marginTop: 20,
  },
  experienceCard: {
    backgroundColor: colors.light,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
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
    fontSize: 11,
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
    marginBottom: 20,
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

// UPDATED: Minimal Template Component
const MinimalTemplate = ({ resumeData, isOptimized, colors, resumeTitle }: any) => {
  const data = extractResumeData(resumeData, resumeTitle);
  const styles = createMinimalStyles(colors);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.fullName}</Text>
        <Text style={styles.title}>
          {data.professionalSummary ? data.professionalSummary.substring(0, 60) + '...' : 'Professional'}
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

      {/* Work Experience */}
      {data.workExperience.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.divider} />
          {data.workExperience.slice(0, 5).map((job: any, index: number) => (
            <View key={index} style={styles.experienceHeader}>
              <Text style={styles.jobTitleMinimal}>{job.title || job.position || 'Position'}</Text>
              <View style={styles.jobMetadata}>
                <Text style={styles.companyMinimal}>{job.company || 'Company Name'}</Text>
                <Text style={styles.dateMinimal}>{job.startDate || '2020'} - {job.endDate || 'Present'}</Text>
              </View>
              <Text style={styles.content}>
                {job.description || job.responsibilities || 'Managed key responsibilities and delivered results.'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.divider} />
          {data.education.slice(0, 3).map((edu: any, index: number) => (
            <View key={index} style={{ marginBottom: 15 }}>
              <Text style={styles.jobTitleMinimal}>{edu.degree || 'Degree'}</Text>
              <View style={styles.jobMetadata}>
                <Text style={styles.companyMinimal}>{edu.institution || edu.school || 'University'}</Text>
                <Text style={styles.dateMinimal}>{edu.year || edu.endDate || '2020'}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.divider} />
          <Text style={styles.content}>
            {data.skills.slice(0, 15).map((skill: any) => typeof skill === 'string' ? skill : skill.name || skill).join(' • ')}
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

// PART 4 - Creative Template Component and Main Document (FINAL)

// UPDATED: Creative Template Component
const CreativeTemplate = ({ resumeData, isOptimized, colors, resumeTitle }: any) => {
  const data = extractResumeData(resumeData, resumeTitle);
  const styles = createCreativeStyles(colors);

  // Generate skill levels and categories
  const skillsWithLevels = data.skills.slice(0, 6).map((skill: any) => ({
    name: typeof skill === 'string' ? skill : skill.name || skill,
    level: Math.floor(Math.random() * 30) + 70 // 70-100%
  }));

  const remainingSkills = data.skills.slice(6, 15).map((skill: any) => 
    typeof skill === 'string' ? skill : skill.name || skill
  );

  return (
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.nameCreative}>{data.fullName}</Text>
            <Text style={styles.titleCreative}>
              {data.professionalSummary ? data.professionalSummary.substring(0, 50) + '...' : 'Creative Professional'}
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
                {data.workExperience.slice(0, 4).map((job: any, index: number) => (
                  <View key={index} style={styles.experienceCard}>
                    <Text style={styles.jobTitleCreative}>{job.title || job.position || 'Position'}</Text>
                    <View style={styles.jobMetaCreative}>
                      <Text style={styles.companyCreative}>{job.company || 'Company Name'}</Text>
                      <Text style={styles.dateCreative}>{job.startDate || '2020'} - {job.endDate || 'Present'}</Text>
                    </View>
                    <Text style={styles.descriptionCreative}>
                      {job.description || job.responsibilities || 'Delivered innovative solutions and exceeded performance targets.'}
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

            {/* Education */}
            {data.education.length > 0 && (
              <View>
                <Text style={styles.creativeSectionTitle}>Education</Text>
                {data.education.slice(0, 2).map((edu: any, index: number) => (
                  <View key={index} style={[styles.experienceCard, { backgroundColor: colors.light, borderLeftColor: colors.accent }]}>
                    <Text style={styles.jobTitleCreative}>{edu.degree || 'Degree'}</Text>
                    <View style={styles.jobMetaCreative}>
                      <Text style={styles.companyCreative}>{edu.institution || edu.school || 'University'}</Text>
                      <Text style={styles.dateCreative}>{edu.year || edu.endDate || '2020'}</Text>
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

// UPDATED: Main PDF Document Component
const PDFDocument = (props: any) => {
  const { resumeData = {}, template = 'professional', colors, isOptimized = false, resumeTitle } = props;
  
  // Get template configuration with custom colors
  const config = getTemplateConfig(template, colors);
  console.log('📄 PDF Generator - Using colors:', colors);
  console.log('📄 PDF Generator - Template config:', config.colors);
  console.log('📄 PDF Generator - Resume title:', resumeTitle);

  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate resumeData={resumeData} isOptimized={isOptimized} colors={config.colors} resumeTitle={resumeTitle} />;
      case 'minimal':
        return <MinimalTemplate resumeData={resumeData} isOptimized={isOptimized} colors={config.colors} resumeTitle={resumeTitle} />;
      case 'creative':
        return <CreativeTemplate resumeData={resumeData} isOptimized={isOptimized} colors={config.colors} resumeTitle={resumeTitle} />;
      case 'professional':
      default:
        return <ProfessionalTemplate resumeData={resumeData} isOptimized={isOptimized} colors={config.colors} resumeTitle={resumeTitle} />;
    }
  };

  return (
    <Document>
      {renderTemplate()}
    </Document>
  );
};

export default PDFDocument;