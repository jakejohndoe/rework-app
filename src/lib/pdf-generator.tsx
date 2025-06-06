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
});

// Ultra simple component with any types to avoid TS issues
const PDFResumeDocument = ({ resumeData, isOptimized }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>
          {resumeData?.contact?.name || 'Resume'}
        </Text>
        {isOptimized && (
          <Text style={styles.text}>✨ AI Optimized</Text>
        )}
      </View>

      {resumeData?.contact?.email && (
        <View style={styles.section}>
          <Text style={styles.text}>Email: {resumeData.contact.email}</Text>
        </View>
      )}

      {resumeData?.contact?.phone && (
        <View style={styles.section}>
          <Text style={styles.text}>Phone: {resumeData.contact.phone}</Text>
        </View>
      )}

      {resumeData?.summary && (
        <View style={styles.section}>
          <Text style={styles.title}>Summary</Text>
          <Text style={styles.text}>{resumeData.summary}</Text>
        </View>
      )}

      {resumeData?.experience && resumeData.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.title}>Experience</Text>
          {resumeData.experience.map((exp: any, index: number) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={styles.text}>
                {exp?.title || 'Job Title'} at {exp?.company || 'Company'}
              </Text>
              {exp?.description && (
                <Text style={styles.text}>{exp.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {resumeData?.education && resumeData.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.title}>Education</Text>
          {resumeData.education.map((edu: any, index: number) => (
            <View key={index}>
              <Text style={styles.text}>
                {edu?.degree || 'Degree'} - {edu?.school || 'School'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {resumeData?.skills && resumeData.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.title}>Skills</Text>
          <Text style={styles.text}>
            {resumeData.skills.join(', ')}
          </Text>
        </View>
      )}
    </Page>
  </Document>
);

export default PDFResumeDocument;