"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Download, Eye } from "lucide-react"

export default function TemplatesPage() {
  const { data: session } = useSession()

  const templates = [
    {
      id: "professional",
      name: "Professional",
      description: "Clean, corporate-friendly design perfect for traditional industries",
      preview: "/api/placeholder/professional-template.png",
      colors: ["#2563eb", "#059669", "#7c3aed", "#dc2626", "#0891b2", "#64748b"],
      popular: true
    },
    {
      id: "modern",
      name: "Modern",
      description: "Two-column layout with sidebar for a contemporary look",
      preview: "/api/placeholder/modern-template.png", 
      colors: ["#2563eb", "#059669", "#7c3aed", "#dc2626", "#0891b2", "#64748b"],
      popular: false
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Ultra-clean, content-focused design that lets your experience shine",
      preview: "/api/placeholder/minimal-template.png",
      colors: ["#2563eb", "#059669", "#7c3aed", "#dc2626", "#0891b2", "#64748b"],
      popular: false
    },
    {
      id: "creative",
      name: "Creative",
      description: "Unique design with progress bars and cards for creative professionals",
      preview: "/api/placeholder/creative-template.png",
      colors: ["#2563eb", "#059669", "#7c3aed", "#dc2626", "#0891b2", "#64748b"],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 glass-dark">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 text-white hover:text-primary-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              {session && (
                <Link href="/loading/dashboard">
                  <Button className="btn-gradient">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary-400/20 text-primary-300 border-primary-400/30">
              ✨ Professional Templates
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Choose Your Perfect</span>
              <br />
              <span className="text-white">Resume Template</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              All templates support real-time color customization and perfect PDF export consistency.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {templates.map((template) => (
              <Card key={template.id} className="glass-card border-white/10 hover:border-primary-400/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        {template.name}
                        {template.popular && (
                          <Badge className="bg-primary-400/20 text-primary-300 text-xs">Popular</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Template Preview */}
                  <div className="bg-white rounded-lg p-6 mb-4 min-h-[300px] flex items-center justify-center">
                    <div className="text-slate-600 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg mx-auto mb-3"></div>
                      <div className="text-sm font-medium">{template.name} Template</div>
                      <div className="text-xs text-slate-500">Preview Coming Soon</div>
                    </div>
                  </div>

                  {/* Color Options */}
                  <div className="mb-4">
                    <div className="text-sm text-slate-300 mb-2">Available Colors:</div>
                    <div className="flex gap-2">
                      {template.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1 btn-gradient" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    {session ? (
                      <Link href="/loading/dashboard" className="flex-1">
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" size="sm">
                          Use Template
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1 border-white/20 text-white hover:bg-white/10" 
                        size="sm"
                        onClick={() => {/* Sign in logic */}}
                      >
                        Sign In to Use
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="glass-card border-primary-400/20 max-w-2xl mx-auto">
              <CardContent className="pt-8">
                <h3 className="text-xl font-bold text-white mb-2">Ready to Get Started?</h3>
                <p className="text-slate-300 mb-4">
                  Choose any template and customize it with our AI-powered optimization.
                </p>
                {session ? (
                  <Link href="/loading/dashboard">
                    <Button className="btn-gradient">
                      Create Your Resume
                    </Button>
                  </Link>
                ) : (
                  <Button className="btn-gradient" onClick={() => {/* Sign in logic */}}>
                    Start Free Trial
                  </Button>
                )}
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