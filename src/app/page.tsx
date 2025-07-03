"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { 
  Brain, 
  FileText, 
  Download,
  Sparkles,
  Target,
  Clock
} from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 glass-dark">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* TODO: Replace with actual ReWork icon/logo */}
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">ReWork</span>
              </div>
              <div className="flex items-center space-x-4">
                {status === "loading" ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-400">Loading...</span>
                  </div>
                ) : session ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-white">
                        {session.user?.name || session.user?.email || 'User'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {session.user?.plan === 'PREMIUM' ? 'Premium' : 'Free'} Plan
                      </div>
                    </div>
                    <Link href="/loading/dashboard">
                      <Button className="btn-gradient">Dashboard</Button>
                    </Link>
                    <Button 
                      onClick={() => signOut()} 
                      variant="ghost" 
                      className="text-white hover:bg-white/10"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Button 
                      onClick={() => signIn()} 
                      variant="ghost" 
                      className="text-white hover:bg-white/10"
                    >
                      Login
                    </Button>
                    <Button 
                      onClick={() => signIn()} 
                      className="btn-gradient"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-primary-400/20 text-primary-300 border-primary-400/30">
              ✨ AI-Powered Resume Optimization
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              <span className="gradient-text">Smart Tech,</span>
              <br />
              <span className="text-white">For Smarter Jobs</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Transform your resume in seconds with AI-powered optimization. 
              Upload once, customize for any job, and download professional PDFs instantly.
            </p>
            
            {session ? (
              <div className="flex gap-4 justify-center">
                <Link href="/loading/dashboard">
                  <Button size="lg" className="btn-gradient animate-glow">
                    Create Resume
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    View Templates
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="btn-gradient animate-glow"
                  onClick={() => signIn()}
                >
                  Start Free Trial
                </Button>
                <Link href="/templates">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    View Demo
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats for Logged-in Users */}
          {session && (
            <div className="mb-16">
              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {/* Downloads This Month */}
                <Card className="glass-card border-blue-400/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {(session.user as any)?.downloadsThisMonth || 0}
                      </div>
                      <div className="text-sm text-slate-300">
                        Downloads this month
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumes Created */}
                <Card className="glass-card border-green-400/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {session.user?.resumesCreated || 0} / 3
                      </div>
                      <div className="text-sm text-slate-300 mb-3">
                        Resumes created this month
                      </div>
                      {(session.user?.resumesCreated || 0) >= 3 && session.user?.plan !== 'PREMIUM' && (
                        <Button size="sm" className="btn-gradient">
                          Upgrade to Premium
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Templates Used */}
                <Card className="glass-card border-purple-400/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {(session.user as any)?.templatesUsed || 0}
                      </div>
                      <div className="text-sm text-slate-300">
                        Templates explored
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="glass-card border-white/10 hover:border-primary-400/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 animate-float flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">AI Optimization</CardTitle>
                <CardDescription className="text-slate-300">
                  Smart keyword matching and content optimization tailored to any job description
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 hover:border-secondary-400/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg mb-4 animate-float flex items-center justify-center" style={{ animationDelay: '1s' }}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Professional Templates</CardTitle>
                <CardDescription className="text-slate-300">
                  ATS-friendly templates with real-time color customization and perfect formatting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 hover:border-primary-400/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg mb-4 animate-float flex items-center justify-center" style={{ animationDelay: '2s' }}>
                  <Download className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Instant Export</CardTitle>
                <CardDescription className="text-slate-300">
                  Download polished, job-specific PDFs ready for immediate application
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Social Proof / Value Props */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-primary-400/20">
              <CardHeader>
                <CardTitle className="text-primary-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Why ReWork Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Real-time color customization that competitors don't offer</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Perfect preview-to-PDF consistency every time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>AI optimization that actually improves your chances</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Professional results in seconds, not hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-secondary-400/20">
              <CardHeader>
                <CardTitle className="text-secondary-400 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Get Started Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>✅ Upload your current resume</span>
                    <Badge variant="secondary" className="bg-green-400/20 text-green-300 text-xs">30 seconds</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>✅ AI analyzes and optimizes content</span>
                    <Badge variant="secondary" className="bg-blue-400/20 text-blue-300 text-xs">1 minute</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>✅ Customize colors and template</span>
                    <Badge variant="secondary" className="bg-purple-400/20 text-purple-300 text-xs">30 seconds</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>✅ Download professional PDF</span>
                    <Badge variant="secondary" className="bg-teal-400/20 text-teal-300 text-xs">Instant</Badge>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    {!session && (
                      <Button 
                        onClick={() => signIn()} 
                        className="w-full btn-gradient"
                        size="sm"
                      >
                        Start Your Free Trial
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 glass-dark mt-16">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-slate-400">
              © 2025 ReWork • Professional Resume Optimization Platform
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}