"use client"

import { signIn, getProviders } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Logo } from "@/components/ui/logo"

function SignInContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [providers, setProviders] = useState<Record<string, { id: string; name: string; type: string }> | null>(null)

  useEffect(() => {
    async function loadProviders() {
      const res = await getProviders()
      setProviders(res)
    }
    loadProviders()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="circuit-bg min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card border-white/10 w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 animate-glow">
              <Logo size="large" className="w-16 h-16 mx-auto" />
            </div>
            <CardTitle className="text-2xl gradient-text">Welcome to ReWork</CardTitle>
            <CardDescription className="text-slate-300">
              Sign in to start optimizing your resumes with AI
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {error === 'OAuthSignin' && 'Error with OAuth sign in'}
                {error === 'OAuthCallback' && 'Error in OAuth callback'}
                {error === 'OAuthCreateAccount' && 'Could not create OAuth account'}
                {error === 'EmailCreateAccount' && 'Could not create email account'}
                {error === 'Callback' && 'Error in callback'}
                {error === 'OAuthAccountNotLinked' && 'Account already exists with different provider'}
                {error === 'EmailSignin' && 'Check your email for sign in link'}
                {error === 'CredentialsSignin' && 'Invalid credentials'}
                {error === 'SessionRequired' && 'Please sign in to access this page'}
              </div>
            )}

            {providers ? (
              <div className="space-y-3">
                {providers.google && (
                  <Button
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="w-full btn-gradient"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                )}

                {!providers.google && (
                  <div className="text-center text-slate-400 text-sm">
                    Loading authentication providers...
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="text-center text-sm text-slate-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}