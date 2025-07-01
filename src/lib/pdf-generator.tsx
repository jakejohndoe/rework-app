// src/lib/pdf-generator.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Ultra simple styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 15,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3b82f6',
    paddingBottom: 3,
  },
});

// Ultra simple component with no complex types
const PDFResumeDocument = (props: any) => {
  const { resumeData = {}, template = 'professional', isOptimized = false } = props;
  
  // Template colors
  const colors: any = {
    professional: '#1e40af',
    modern: '#7c3aed', 
    minimal: '#059669',
    creative: '#ea580c'
  };
  
  const primaryColor = colors[template] || colors.professional;
  
  // Extract data safely
  const contact = resumeData?.contact || resumeData?.contactInfo || {};
  const summary = resumeData?.professionalSummary?.summary || 
                  resumeData?.summary || 
                  resumeData?.professionalSummary || '';
  const workExperience = resumeData?.workExperience || resumeData?.experience || [];
  const education = resumeData?.education || [];
  const skills = resumeData?.skills || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Optimized Badge */}
        {isOptimized && (
          <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: primaryColor, color: '#ffffff', fontSize: 8, padding: 4, borderRadius: 3 }}>
            <Text>✨ AI Enhanced</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={{ ...styles.name, color: primaryColor }}>
            {contact?.name || contact?.fullName || 'Professional Resume'}
          </Text>
          {contact?.email && (
            <Text style={styles.contactInfo}>Email: {contact.email}</Text>
          )}
          {contact?.phone && (
            <Text style={styles.contactInfo}>Phone: {contact.phone}</Text>
          )}
          {contact?.location && (
            <Text style={styles.contactInfo}>Location: {contact.location}</Text>
          )}
          {contact?.linkedin && (
            <Text style={styles.contactInfo}>LinkedIn: {contact.linkedin}</Text>
          )}
        </View>

        {/* Professional Summary */}
        {summary && (
          <View style={styles.section}>
            <Text style={{ ...styles.sectionTitle, color: primaryColor, borderBottomColor: primaryColor }}>
              Professional Summary
            </Text>
            <Text style={styles.text}>{summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {workExperience && workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={{ ...styles.sectionTitle, color: primaryColor, borderBottomColor: primaryColor }}>
              Work Experience
            </Text>
            {workExperience.map((job: any, index: number) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                  {job?.title || job?.position || 'Position'}
                </Text>
                <Text style={{ ...styles.text, color: '#64748b' }}>
                  {job?.company || 'Company'} • {job?.duration || job?.dates || 'Duration'}
                </Text>
                {job?.description && (
                  <Text style={styles.text}>{job.description}</Text>
                )}
                {job?.achievements && job.achievements.length > 0 && (
                  <View>
                    {job.achievements.map((achievement: string, achIndex: number) => (
                      <Text key={achIndex} style={{ ...styles.text, marginLeft: 10 }}>
                        • {achievement}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={styles.section}>
            <Text style={{ ...styles.sectionTitle, color: primaryColor, borderBottomColor: primaryColor }}>
              Skills & Technologies
            </Text>
            <Text style={styles.text}>
              {Array.isArray(skills) 
                ? skills.map((skill: any) => typeof skill === 'string' ? skill : skill?.name || skill?.skill || 'Skill').join(', ')
                : 'Skills listed'
              }
            </Text>
          </View>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={{ ...styles.sectionTitle, color: primaryColor, borderBottomColor: primaryColor }}>
              Education
            </Text>
            {education.map((edu: any, index: number) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                  {edu?.degree || edu?.title || 'Degree'}
                </Text>
                <Text style={{ ...styles.text, color: '#64748b' }}>
                  {edu?.school || edu?.institution || 'Institution'} • {edu?.year || edu?.dates || 'Year'}
                </Text>
                {edu?.details && (
                  <Text style={styles.text}>{edu.details}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Template Attribution */}
        <View style={{ 
          position: 'absolute', 
          bottom: 20, 
          right: 20, 
          fontSize: 8, 
          color: '#9ca3af' 
        }}>
          <Text>Generated with {template.charAt(0).toUpperCase() + template.slice(1)} template</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFResumeDocument;