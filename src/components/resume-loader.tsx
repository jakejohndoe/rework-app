"use client"

interface ResumeLoaderProps {
  title?: string
  subtitle?: string
  fullScreen?: boolean
}

export default function ResumeLoader({ 
  title = "Preparing your dashboard", 
  subtitle = "Optimizing your experience...",
  fullScreen = true
}: ResumeLoaderProps) {
  const containerClass = fullScreen 
    ? "fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50"
    : "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"
  
  return (
    <div className={containerClass}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/10 rounded-full animate-pulse"
            style={{
              left: `${(i * 13 + 10) % 90 + 5}%`,
              top: `${(i * 17 + 15) % 80 + 10}%`,
              animationDelay: `${(i * 0.5) % 4}s`,
              animationDuration: `${4 + (i % 2)}s`
            }}
          />
        ))}
      </div>

      {/* Main Loading Animation */}
      <div className="relative">
        {/* Resume Paper Animation */}
        <div className="relative w-64 h-80">
          {/* Paper Background */}
          <div 
            className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl"
            style={{
              animation: 'paperFloat 3s ease-in-out infinite'
            }}
          >
            {/* Paper Lines */}
            <div className="p-8 space-y-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded"
                  style={{
                    animation: 'lineFill 2s ease-out forwards',
                    animationDelay: `${i * 0.3}s`,
                    width: '0%',
                    opacity: 0
                  }}
                />
              ))}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full animate-pulse flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* AI Sparkles */}
          <div className="absolute -bottom-4 -left-4">
            <svg 
              className="w-8 h-8 text-cyan-400" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              style={{
                animation: 'spinSlow 4s linear infinite'
              }}
            >
              <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.82 15.45L16 22L11.18 17.45L7 21L8.27 14.73L2 16L6.18 10.45L2 7L8.26 8.09L7 2L11.82 6.55L16 2L14.73 8.27L21 7L16.82 12.55L21 16L14.73 14.73L16 21L11.82 16.82L7 21L8.27 14.91L2 16L6.55 11.18Z"/>
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse">
            {title}
          </h2>
          <p className="text-slate-400 mt-2">{subtitle}</p>
        </div>
      </div>

      <style>{`
        @keyframes paperFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        @keyframes lineFill {
          0% { width: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }

        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}