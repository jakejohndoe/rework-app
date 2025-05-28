"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SessionTestPage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">🔍 Session Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <strong className="text-green-400">Status:</strong>
                <span className="text-white ml-2">{status}</span>
              </div>
              
              <div>
                <strong className="text-blue-400">Session Data:</strong>
                <pre className="text-slate-300 mt-2 p-4 bg-black/20 rounded overflow-auto text-xs">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>

              {session?.user ? (
                <div className="border-t border-white/10 pt-4">
                  <strong className="text-purple-400">User Info:</strong>
                  <div className="mt-2 space-y-1 text-slate-300">
                    <div>📧 Email: {session.user.email}</div>
                    <div>👤 Name: {session.user.name}</div>
                    <div>🆔 ID: {session.user.id || 'No ID'}</div>
                    <div>💳 Plan: {session.user.plan || 'No Plan'}</div>
                    <div>📄 Resumes: {session.user.resumesCreated || 'No Count'}</div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-4 text-yellow-400">
                  ⚠️ No user data in session
                </div>
              )}

              {status === "loading" && (
                <div className="text-yellow-400">
                  ⏳ Session is still loading...
                </div>
              )}

              {status === "unauthenticated" && (
                <div className="text-red-400">
                  ❌ Not authenticated - please sign in first
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}