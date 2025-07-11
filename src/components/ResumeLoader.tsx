// 🔧 SERVER-SAFE ResumeLoader Component
// src/components/ResumeLoader.tsx
// NO styled-jsx, NO client features, pure server component

interface ResumeLoaderProps {
  title?: string
}

export default function ResumeLoader({ title = "loading your dashboard" }: ResumeLoaderProps) {
  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          {/* Brain Icon */}
          <div 
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
            className="animate-pulse"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>

          {/* Title */}
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '12px',
            background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 100%'
          }}>
            {title}
          </h1>

          {/* Subtitle */}
          <p style={{ 
            color: '#cbd5e1', 
            fontSize: '16px', 
            marginBottom: '32px' 
          }}>
            whispering to the ceo of openai...
          </p>

          {/* Resume Preview */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            backdropFilter: 'blur(20px)',
            maxWidth: '320px',
            margin: '0 auto'
          }}>
            {/* Resume Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  height: '12px',
                  background: 'rgba(203, 213, 225, 0.6)',
                  borderRadius: '6px',
                  marginBottom: '6px',
                  width: '80%'
                }} className="animate-pulse" />
                <div style={{
                  height: '8px',
                  background: 'rgba(148, 163, 184, 0.4)',
                  borderRadius: '4px',
                  width: '60%'
                }} className="animate-pulse" />
              </div>
            </div>

            {/* Resume Sections */}
            {[
              { label: 'contact information', completed: true },
              { label: 'professional summary', completed: true },  
              { label: 'work experience', completed: false, active: true },
              { label: 'education', completed: false },
              { label: 'skills & achievements', completed: false }
            ].map((section, index) => (
              <div key={section.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: section.completed 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : section.active 
                    ? 'rgba(6, 182, 212, 0.2)'
                    : 'rgba(100, 116, 139, 0.3)',
                border: section.completed 
                  ? '1px solid rgba(34, 197, 94, 0.3)' 
                  : section.active
                    ? '1px solid rgba(6, 182, 212, 0.3)'
                    : '1px solid rgba(100, 116, 139, 0.2)',
                marginBottom: '8px'
              }} className={section.active ? 'animate-pulse' : ''}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: section.completed 
                    ? 'rgba(34, 197, 94, 0.3)' 
                    : section.active
                      ? 'rgba(6, 182, 212, 0.3)'
                      : 'rgba(100, 116, 139, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {section.completed ? '✓' : section.active ? '⚡' : '○'}
                </div>
                <span style={{
                  fontSize: '14px',
                  color: section.completed 
                    ? '#22c55e' 
                    : section.active 
                      ? '#06b6d4'
                      : '#64748b',
                  fontWeight: section.active ? '600' : '400'
                }}>
                  {section.completed ? '✓ ' : ''}{section.label}
                </span>
              </div>
            ))}
          </div>

          {/* Loading Dots */}
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginTop: '24px'
          }}>
            <div style={{ width: '6px', height: '6px', background: '#06b6d4', borderRadius: '50%' }} className="animate-bounce" />
            <div style={{ width: '6px', height: '6px', background: '#06b6d4', borderRadius: '50%' }} className="animate-bounce" />
            <div style={{ width: '6px', height: '6px', background: '#06b6d4', borderRadius: '50%' }} className="animate-bounce" />
            <span style={{ 
              marginLeft: '12px', 
              color: '#94a3b8', 
              fontSize: '14px' 
            }}>
              enhancing your resume...
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

// 🎯 SUPER SIMPLE VERSION (backup if above still has issues)
export function SuperSimpleLoader({ title = "loading..." }: ResumeLoaderProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #0f172a, #581c87)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid rgba(6, 182, 212, 0.3)',
        borderTop: '4px solid #06b6d4',
        borderRadius: '50%',
        marginBottom: '20px'
      }} className="animate-spin" />
      
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        {title}
      </h1>
      
      <p style={{ color: '#94a3b8', fontSize: '16px' }}>
        whispering to the ceo of openai...
      </p>
    </div>
  )
}