// src/app/test-pdf/page.tsx
'use client';

import { useState } from 'react';

export default function TestPDFPage() {
  const [result, setResult] = useState('');
  const [resumeId, setResumeId] = useState('');

  const testAPI = async () => {
    if (!resumeId) {
      setResult('❌ Enter a resume ID first');
      return;
    }

    setResult('🔄 Testing...');
    
    try {
      const response = await fetch(`/api/resumes/${resumeId}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        setResult(`✅ Success! Got ${blob.size} byte PDF`);
        
        // Download it
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test.pdf';
        a.click();
        URL.revokeObjectURL(url);
        
      } else {
        const text = await response.text();
        setResult(`❌ Failed: ${response.status} - ${text}`);
      }
      
    } catch (error) {
      setResult(`💥 Error: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>PDF Download Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Resume ID:</label><br />
        <input 
          type="text" 
          value={resumeId}
          onChange={(e) => setResumeId(e.target.value)}
          placeholder="Enter your resume ID"
          style={{ 
            width: '100%', 
            padding: '8px', 
            marginTop: '5px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>
      
      <button 
        onClick={testAPI}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Download
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        minHeight: '60px'
      }}>
        <strong>Result:</strong><br />
        {result || 'Ready to test...'}
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px'
      }}>
        <strong>How to get a resume ID:</strong><br />
        1. Go to your dashboard<br />
        2. Open browser dev tools (F12)<br />
        3. Look at the resume URLs or check the network tab<br />
        4. Copy the ID from a URL like: /dashboard/resume/[ID]
      </div>
    </div>
  );
}