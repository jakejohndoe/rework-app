"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { 
  Brain, 
  FileText, 
  Download,
  Sparkles,
  Target,
  Clock,
  ArrowRight
} from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 }) // Default center position
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)

  // Client-side mount check
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mouse tracking for interactive effects (only after mount)
  useEffect(() => {
    if (!isMounted) return
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth * 100, y: e.clientY / window.innerHeight * 100 })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMounted])

  // Load animation trigger (only after mount)
  useEffect(() => {
    if (!isMounted) return
    setTimeout(() => setIsLoaded(true), 100)
  }, [isMounted])

  // Magnetic button effect
  const handleCtaMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ctaRef.current) return
    const rect = ctaRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const distance = Math.sqrt(x * x + y * y)
    const maxDistance = 100
    
    if (distance < maxDistance) {
      const force = (maxDistance - distance) / maxDistance
      const moveX = (x / distance) * force * 8
      const moveY = (y / distance) * force * 8
      ctaRef.current.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`
    }
  }

  const handleCtaMouseLeave = () => {
    if (ctaRef.current) {
      ctaRef.current.style.transform = 'translate(0px, 0px) scale(1)'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Floating Particles Background - Only render on client */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-pulse"
              style={{
                left: `${(i * 13 + 10) % 90 + 5}%`, // Deterministic positioning
                top: `${(i * 17 + 15) % 80 + 10}%`, // Deterministic positioning
                animationDelay: `${(i * 0.3) % 3}s`,
                animationDuration: `${3 + (i % 3)}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Dynamic Gradient Mesh Background - Only render on client */}
      {isMounted && (
        <div 
          className="absolute inset-0 opacity-30 transition-all duration-1000"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)`
          }}
        />
      )}

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="circuit-bg min-h-screen relative z-10">
        {/* Enhanced Header with Glassmorphism */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-slate-900/30 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:scale-105 transition-transform duration-300">rework</span>
              </div>
              <div className="flex items-center space-x-4">
                {status === "loading" ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-400">Loading...</span>
                  </div>
                ) : session ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right hover:scale-105 transition-transform duration-200 group">
                      <div className="text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {session.user?.name || session.user?.email || 'User'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {session.user?.plan === 'PREMIUM' ? 'Premium' : 'Free'} Plan
                      </div>
                    </div>
                    <Link href="/loading/dashboard">
                      <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">dashboard</Button>
                    </Link>
                    <Button 
                      onClick={() => signOut()} 
                      variant="ghost" 
                      className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
                    >
                      sign out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Button 
                      onClick={() => signIn()} 
                      variant="ghost" 
                      className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
                    >
                      login
                    </Button>
                    <Button 
                      onClick={() => signIn()} 
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                    >
                      get started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16">
          {/* Revolutionary Hero Section */}
          <div ref={heroRef} className="text-center mb-20 relative">
            {/* Ultra-Premium AI Badge */}
            <div className={`mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Badge className="bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-cyan-200 border border-cyan-400/40 px-6 py-3 hover:from-purple-500/40 hover:to-cyan-500/40 hover:border-cyan-400/60 hover:scale-105 transition-all duration-300 cursor-pointer backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10 flex items-center gap-2 font-medium">
                  <span className="text-cyan-300 animate-pulse">✦</span>
                  ai-powered optimization
                  <span className="text-purple-300 animate-bounce text-xs">●</span>
                </span>
              </Badge>
            </div>
            
            {/* Revolutionary Animated Title */}
            <h1 className="text-6xl md:text-8xl font-bold mb-10 leading-[0.9] tracking-tight relative">
              <div 
                className={`transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <span 
                  className="hover:scale-105 transition-transform duration-300 inline-block cursor-pointer"
                  style={isMounted ? {
                    backgroundImage: `linear-gradient(45deg, 
                      hsl(${180 + mousePosition.x * 0.1}, 70%, 60%) 0%,
                      hsl(${200 + mousePosition.y * 0.05}, 80%, 70%) 25%,
                      hsl(${220 + mousePosition.x * 0.05}, 75%, 65%) 50%,
                      hsl(${240 + mousePosition.y * 0.1}, 85%, 75%) 75%,
                      hsl(${260 + mousePosition.x * 0.08}, 80%, 70%) 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  } : {
                    backgroundImage: 'linear-gradient(45deg, hsl(200, 70%, 60%) 0%, hsl(220, 80%, 70%) 50%, hsl(240, 75%, 65%) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  smart tech,
                </span>
                <br />
                <span className="text-slate-300 hover:text-slate-100 hover:scale-105 transition-all duration-300 inline-block mr-3 cursor-pointer">for</span>
                <span 
                  className="hover:scale-105 transition-transform duration-300 inline-block cursor-pointer"
                  style={isMounted ? {
                    backgroundImage: `linear-gradient(45deg, 
                      hsl(${280 + mousePosition.x * 0.1}, 70%, 65%) 0%,
                      hsl(${300 + mousePosition.y * 0.08}, 75%, 70%) 50%,
                      hsl(${320 + mousePosition.x * 0.05}, 80%, 75%) 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  } : {
                    backgroundImage: 'linear-gradient(45deg, hsl(300, 70%, 65%) 0%, hsl(320, 75%, 70%) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  smarter jobs
                </span>
              </div>
            </h1>
            
            {/* Enhanced Description with Staggered Animation */}
            <div className="max-w-3xl mx-auto mb-14">
              <p className={`text-xl md:text-2xl text-slate-200 mb-4 font-medium hover:text-white transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
                transform your resume in seconds with revolutionary optimization.
              </p>
              <p className={`text-lg text-slate-300 leading-relaxed hover:text-slate-200 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
                upload • optimize • dominate
              </p>
            </div>
            
            {/* Magnetic CTA Button */}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '800ms' }}>
              {session ? (
                <Link href="/loading/dashboard">
                  <button
                    ref={ctaRef}
                    onMouseMove={handleCtaMouseMove}
                    onMouseLeave={handleCtaMouseLeave}
                    className="relative px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center gap-2">
                      create resume
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  </button>
                </Link>
              ) : (
                <button
                  ref={ctaRef}
                  onMouseMove={handleCtaMouseMove}
                  onMouseLeave={handleCtaMouseLeave}
                  onClick={() => signIn()}
                  className="relative px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center gap-2">
                    start free trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                </button>
              )}
            </div>
            
            {/* Enhanced Trust Indicator */}
            <p className={`text-sm text-slate-400 font-medium hover:text-slate-300 transition-all duration-500 cursor-default ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '1000ms' }}>
              🔒 no credit card required • 3 free resumes • cancel anytime
            </p>
          </div>

          {/* Enhanced Quick Stats for Logged-in Users */}
          {session && (
            <div className="mb-24">
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Downloads This Month */}
                <Card className="bg-slate-800/30 backdrop-blur-sm border-blue-400/20 hover:border-blue-400/40 transition-all duration-500 hover:scale-105 cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="pt-6 relative z-10">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                        {(session.user as any)?.downloadsThisMonth || 0}
                      </div>
                      <div className="text-sm text-slate-300 group-hover:text-white transition-colors duration-300">
                        downloads this month
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumes Created */}
                <Card className="bg-slate-800/30 backdrop-blur-sm border-green-400/20 hover:border-green-400/40 transition-all duration-500 hover:scale-105 cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="pt-6 relative z-10">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                        {session.user?.resumesCreated || 0} / 3
                      </div>
                      <div className="text-sm text-slate-300 mb-3 group-hover:text-white transition-colors duration-300">
                        resumes created this month
                      </div>
                      {(session.user?.resumesCreated || 0) >= 3 && session.user?.plan !== 'PREMIUM' && (
                        <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-all duration-300 text-white border-0">
                          upgrade to premium
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Templates Used */}
                <Card className="bg-slate-800/30 backdrop-blur-sm border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-105 cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="pt-6 relative z-10">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                        {(session.user as any)?.templatesUsed || 0}
                      </div>
                      <div className="text-sm text-slate-300 group-hover:text-white transition-colors duration-300">
                        templates explored
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 3D Tilt Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: Brain, title: "ai optimization", desc: "smart keyword matching and content optimization tailored to any job description", color: "from-blue-400 to-purple-500", hoverColor: "primary" },
              { icon: FileText, title: "professional templates", desc: "ats-friendly templates with real-time color customization and perfect formatting", color: "from-teal-400 to-blue-500", hoverColor: "secondary" },
              { icon: Download, title: "instant export", desc: "download polished, job-specific pdfs ready for immediate application", color: "from-green-400 to-teal-500", hoverColor: "green" }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="bg-slate-800/40 backdrop-blur-sm border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 group cursor-pointer relative overflow-hidden"
                style={{
                  transform: 'perspective(1000px)',
                  transition: 'all 0.3s ease-out'
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const centerX = rect.width / 2
                  const centerY = rect.height / 2
                  const rotateX = (y - centerY) / centerY * -10
                  const rotateY = (x - centerX) / centerX * 10
                  e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="text-center relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 mx-auto animate-float flex items-center justify-center group-hover:scale-110 transition-transform duration-300`} style={{ animationDelay: `${index}s` }}>
                    <feature.icon className="w-8 h-8 text-white group-hover:animate-pulse" />
                  </div>
                  <CardTitle className={`text-white text-xl mb-3 group-hover:text-${feature.hoverColor}-300 transition-colors duration-300`}>{feature.title}</CardTitle>
                  <CardDescription className="text-slate-300 text-base leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Enhanced Social Proof / Value Props */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-slate-800/40 backdrop-blur-sm border-primary-400/20 hover:border-primary-400/40 transition-all duration-500 hover:scale-105 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-primary-400 flex items-center gap-3 text-xl group-hover:text-primary-300 transition-colors duration-300">
                  <Target className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  why rework works
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4 text-base text-slate-300">
                  {[
                    "real-time color customization that competitors don't offer",
                    "perfect preview-to-pdf consistency every time",
                    "ai optimization that actually improves your chances",
                    "professional results in seconds, not hours"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 hover:bg-slate-800/30 p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] group/item">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-3 flex-shrink-0 group-hover/item:animate-pulse"></div>
                      <span className="group-hover/item:text-slate-200 transition-colors duration-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 backdrop-blur-sm border-secondary-400/20 hover:border-secondary-400/40 transition-all duration-500 hover:scale-105 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-secondary-400 flex items-center gap-3 text-xl group-hover:text-secondary-300 transition-colors duration-300">
                  <Clock className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  get started today
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4 text-base text-slate-300">
                  {[
                    { text: "upload your current resume", time: "30 seconds", color: "green" },
                    { text: "ai analyzes and optimizes content", time: "1 minute", color: "blue" },
                    { text: "customize colors and template", time: "30 seconds", color: "purple" },
                    { text: "download professional pdf", time: "instant", color: "teal" }
                  ].map((step, index) => (
                    <div key={index} className="flex justify-between items-center hover:bg-slate-800/30 p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] group/item">
                      <span className="group-hover/item:text-slate-200 transition-colors duration-300">✅ {step.text}</span>
                      <Badge variant="secondary" className={`bg-${step.color}-400/20 text-${step.color}-300 text-sm px-3 py-1 hover:bg-${step.color}-400/30 transition-colors duration-300`}>{step.time}</Badge>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-white/10">
                    {!session && (
                      <Button 
                        onClick={() => signIn()} 
                        className="w-full bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-400 hover:to-cyan-500 text-white border-0 group hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                        size="sm"
                      >
                        start your free trial
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Ultra-Modern Footer */}
        <footer className="border-t border-white/10 backdrop-blur-xl bg-slate-900/30 mt-24 hover:border-white/20 transition-colors duration-500">
          <div className="container mx-auto px-4 py-12 text-center">
            <p className="text-slate-400 hover:text-slate-300 transition-colors duration-300 cursor-default">
              © 2025 rework • professional resume optimization platform
            </p>
          </div>
        </footer>
      </div>

      {/* Custom CSS for Advanced Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}