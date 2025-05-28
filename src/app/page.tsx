"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()

  // Debug logging
  console.log('🔍 Homepage Debug - Status:', status, 'Session:', session)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 glass-dark">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
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
                        {session.user?.plan || 'FREE'} Plan
                      </div>
                    </div>
                    <Button 
                      onClick={() => signOut()} 
                      variant="ghost" 
                      className="text-white hover:bg-white/10"
                    >
                      Sign Out
                    </Button>
                    <Link href="/dashboard">
                      <Button className="btn-gradient">Dashboard</Button>
                    </Link>
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
            <Badge className="mb-4 bg-primary-400/20 text-primary-300 border-primary-400/30">
              🚀 Authentication System - {status === "authenticated" ? "Working!" : "Ready!"}
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              <span className="gradient-text">Smart Tech,</span>
              <br />
              <span className="text-white">For Smarter Jobs</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              AI-powered resume optimization that transforms how you apply for jobs. 
              Upload, optimize, and download in seconds.
            </p>
            
            {session ? (
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="btn-gradient animate-glow">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/test-session">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    View Session Debug
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
                  Start Building Resume
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  View Demo
                </Button>
              </div>
            )}
          </div>

          {/* Auth Status Card */}
          {session && (
            <div className="mb-16">
              <Card className="glass-card border-green-400/20 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    Welcome, {session.user?.name || session.user?.email}!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>📧 Email:</span>
                      <span>{session.user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>💳 Plan:</span>
                      <Badge variant="secondary" className={session.user?.plan === 'PREMIUM' ? 'bg-purple-400/20 text-purple-300' : 'bg-blue-400/20 text-blue-300'}>
                        {session.user?.plan || 'FREE'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>📄 Resumes Created:</span>
                      <span>{session.user?.resumesCreated || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🔍 Debug Status:</span>
                      <Badge variant="secondary" className="bg-green-400/20 text-green-300">
                        {status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Debug Card (only when not authenticated) */}
          {!session && status !== "loading" && (
            <div className="mb-16">
              <Card className="glass-card border-yellow-400/20 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    Debug Info - Not Signed In
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300">
                        {status}
                      </Badge>
                    </div>
                    <div className="text-center pt-2">
                      <Link href="/test-session">
                        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                          View Full Debug Info
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="glass-card border-white/10 hover:border-primary-400/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mb-4 animate-float"></div>
                <CardTitle className="text-white">AI Optimization</CardTitle>
                <CardDescription className="text-slate-300">
                  Smart keyword matching and content optimization for any job description
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 hover:border-secondary-400/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-lg mb-4 animate-float" style={{ animationDelay: '1s' }}></div>
                <CardTitle className="text-white">Multiple Templates</CardTitle>
                <CardDescription className="text-slate-300">
                  Professional templates designed to pass ATS systems and impress recruiters
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 hover:border-primary-400/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-4 animate-float" style={{ animationDelay: '2s' }}></div>
                <CardTitle className="text-white">Instant Export</CardTitle>
                <CardDescription className="text-slate-300">
                  Download polished, tailored PDFs ready for any application
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-green-400/20">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  Development Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>✅ Project Setup</span>
                    <Badge variant="secondary" className="bg-green-400/20 text-green-300">Complete</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>✅ Database Schema</span>
                    <Badge variant="secondary" className="bg-green-400/20 text-green-300">Complete</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>✅ Authentication</span>
                    <Badge variant="secondary" className="bg-green-400/20 text-green-300">Complete</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>🔄 Resume Upload</span>
                    <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300">Next</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>⏳ AI Integration</span>
                    <Badge variant="secondary" className="bg-slate-600/20 text-slate-400">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-blue-400">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>• {session ? 'Build dashboard interface' : 'Sign in to test session'}</div>
                  <div>• Create resume upload system</div>
                  <div>• Integrate OpenAI API</div>
                  <div>• Build PDF generation</div>
                  <div>• Add payment system</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 glass-dark mt-16">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-slate-400">
              ReWork App Platform • Built with Next.js, NextAuth.js, Prisma, and PostgreSQL
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}