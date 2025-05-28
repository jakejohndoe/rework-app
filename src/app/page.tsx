import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
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
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Login
                </Button>
                <Button className="btn-gradient">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary-400/20 text-primary-300 border-primary-400/30">
              🚀 App Platform - Coming Soon
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
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="btn-gradient animate-glow">
                Start Building Resume
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                View Demo
              </Button>
            </div>
          </div>

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
                    <span>🔄 Database Schema</span>
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
                  <div>• Set up PostgreSQL database</div>
                  <div>• Configure authentication system</div>
                  <div>• Build resume upload interface</div>
                  <div>• Integrate OpenAI API</div>
                  <div>• Create PDF generation system</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 glass-dark mt-16">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-slate-400">
              ReWork App Platform • Built with Next.js, Tailwind CSS, and shadcn/ui
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}