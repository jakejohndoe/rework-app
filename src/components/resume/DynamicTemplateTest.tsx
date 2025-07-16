// src/components/resume/DynamicTemplateTest.tsx
'use client';

import React, { useState } from 'react';
import DynamicResumeTemplate from './DynamicResumeTemplate';
import { Button } from '@/components/ui/button';

// Mock AI-generated resume data with rich content
const mockAIResumeData = {
  contactInfo: {
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johnsmith"
  },
  professionalSummary: "Experienced Full-Stack Software Engineer with 8+ years of expertise in React, Node.js, and AWS cloud technologies. Led cross-functional teams of 5-10 developers to deliver scalable web applications serving 500K+ monthly active users. Proven track record of increasing system performance by 40% and reducing deployment time by 60% through CI/CD optimization. Passionate about building user-centric solutions that drive measurable business impact and improve customer satisfaction scores by 25%.",
  workExperience: [
    {
      jobTitle: "Senior Full-Stack Engineer",
      company: "Tech Innovation Corp",
      startDate: "2021-03",
      endDate: "Present",
      description: "Lead development of microservices architecture serving 1M+ daily requests",
      achievements: [
        "Architected and implemented React-based dashboard that increased user engagement by 35% and reduced support tickets by 50%",
        "Built robust Node.js APIs with Redis caching that improved response times from 800ms to 120ms, enhancing user experience",
        "Led migration from monolithic to microservices architecture, reducing deployment time from 45 minutes to 8 minutes",
        "Mentored 5 junior developers and established code review process that reduced bugs by 60% in production",
        "Implemented automated testing suite with 95% coverage using Jest and Cypress, catching 40+ critical bugs pre-release"
      ],
      technologies: ["React", "Node.js", "TypeScript", "AWS", "Docker", "Redis", "MongoDB"]
    },
    {
      jobTitle: "Software Engineer",
      company: "StartupXYZ",
      startDate: "2019-06",
      endDate: "2021-02",
      description: "Developed scalable web applications using modern JavaScript frameworks",
      achievements: [
        "Built responsive e-commerce platform that generated $2M+ in revenue within first 6 months of launch",
        "Optimized database queries reducing page load times by 55% and improving SEO rankings by 30%",
        "Integrated Stripe payment processing handling $50K+ daily transactions with 99.9% uptime",
        "Developed real-time chat feature using WebSocket that increased customer satisfaction by 40%"
      ],
      technologies: ["Vue.js", "Python", "PostgreSQL", "AWS Lambda", "Stripe API"]
    },
    {
      jobTitle: "Frontend Developer",
      company: "Digital Agency Pro",
      startDate: "2017-08",
      endDate: "2019-05",
      description: "Created engaging user interfaces for Fortune 500 clients",
      achievements: [
        "Designed and developed 15+ responsive websites with average 98% PageSpeed scores",
        "Reduced bounce rate by 25% through implementing advanced UX/UI best practices",
        "Built reusable component library that accelerated development time by 40% across projects"
      ],
      technologies: ["JavaScript", "SCSS", "WordPress", "PHP", "MySQL"]
    }
  ],
  education: [
    {
      degree: "Master of Science",
      field: "Computer Science",
      institution: "Stanford University",
      graduationYear: "2017"
    },
    {
      degree: "Bachelor of Science",
      field: "Software Engineering",
      institution: "UC Berkeley",
      graduationYear: "2015"
    }
  ],
  skills: {
    technical: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes"],
    frameworks: ["Next.js", "Express.js", "Vue.js", "Angular", "Django", "Flask"],
    tools: ["Git", "Jenkins", "Terraform", "MongoDB", "PostgreSQL", "Redis"],
    cloud: ["AWS EC2", "AWS Lambda", "AWS S3", "AWS RDS", "Google Cloud", "Azure"],
    databases: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "DynamoDB"],
    soft: ["Leadership", "Mentoring", "Agile", "Scrum", "Communication", "Problem Solving"]
  }
};

// Lighter mock data to test content scaling
const mockLightResumeData = {
  contactInfo: {
    name: "Jane Doe",
    email: "jane@email.com",
    phone: "(555) 987-6543",
    location: "New York, NY",
    linkedin: ""
  },
  professionalSummary: "Software Developer with 3 years of experience in web development.",
  workExperience: [
    {
      jobTitle: "Software Developer",
      company: "Small Startup",
      startDate: "2021",
      endDate: "Present",
      description: "Developed web applications using modern frameworks",
      achievements: [
        "Built web applications",
        "Worked with team members"
      ],
      technologies: ["JavaScript", "React"]
    }
  ],
  education: [
    {
      degree: "Bachelor's",
      field: "Computer Science",
      institution: "State University",
      graduationYear: "2021"
    }
  ],
  skills: {
    technical: ["JavaScript", "React", "CSS"],
    frameworks: [],
    tools: [],
    cloud: [],
    databases: [],
    soft: []
  }
};

export default function DynamicTemplateTest() {
  const [currentData, setCurrentData] = useState(mockAIResumeData);
  const [template, setTemplate] = useState<'professional' | 'modern' | 'minimal' | 'creative'>('professional');

  const handleDataToggle = () => {
    setCurrentData(prev => prev === mockAIResumeData ? mockLightResumeData : mockAIResumeData);
  };

  const handleTemplateChange = (newTemplate: 'professional' | 'modern' | 'minimal' | 'creative') => {
    setTemplate(newTemplate);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Dynamic Resume Template Test</h1>
        <p className="text-gray-600">Test how the new dynamic template handles varying amounts of AI-generated content</p>
        
        <div className="flex gap-4 justify-center items-center flex-wrap">
          <Button onClick={handleDataToggle} variant="outline">
            Switch to {currentData === mockAIResumeData ? 'Light' : 'Rich AI'} Content
          </Button>
          
          <div className="flex gap-2">
            {(['professional', 'modern', 'minimal', 'creative'] as const).map((t) => (
              <Button
                key={t}
                onClick={() => handleTemplateChange(t)}
                variant={template === t ? 'default' : 'outline'}
                size="sm"
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-500 space-x-4">
          <span>Current: <strong>{currentData === mockAIResumeData ? 'Rich AI Content' : 'Light Content'}</strong></span>
          <span>Template: <strong>{template}</strong></span>
        </div>
      </div>

      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Dynamic Template Rendering</h2>
        <div className="bg-white rounded-lg shadow-lg">
          <DynamicResumeTemplate
            resumeData={currentData}
            template={template}
            colors={{
              primary: '#2563eb',
              accent: '#3b82f6'
            }}
            resumeTitle="Test Resume"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-2">
          <h3 className="font-semibold">Rich AI Content Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>500+ character professional summary</li>
            <li>3 detailed work experiences with 4-5 achievements each</li>
            <li>20+ technical skills across 6 categories</li>
            <li>Technologies and metrics highlighted</li>
            <li>Smart content prioritization by impact score</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold">Light Content Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Short 60 character summary</li>
            <li>1 basic work experience</li>
            <li>3 simple skills</li>
            <li>Minimal achievements</li>
            <li>Tests content scaling behavior</li>
          </ul>
        </div>
      </div>
    </div>
  );
}