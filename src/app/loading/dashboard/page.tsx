"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLoading from '@/components/loading/DashboardLoading'

export default function DashboardLoadingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    // Redirect to dashboard after animation completes
    if (status === 'authenticated') {
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 4000) // 4 seconds to show the full animation

      return () => clearTimeout(timer)
    }
  }, [status, router])

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Show dashboard loading animation
  if (status === 'authenticated') {
    return <DashboardLoading />
  }

  // Fallback (shouldn't reach here)
  return null
}