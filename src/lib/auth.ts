import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function getUserPlan(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, resumesCreated: true }
  })
  return user
}

export async function checkPlanLimits(userId: string) {
  const user = await getUserPlan(userId)
  
  if (!user) return { canCreate: false, reason: 'User not found' }
  
  // Free plan limits
  if (user.plan === 'FREE') {
    const resumeCount = await prisma.resume.count({
      where: { userId, isActive: true }
    })
    
    if (resumeCount >= 3) {
      return { 
        canCreate: false, 
        reason: 'Free plan limited to 3 active resumes. Upgrade to create more.' 
      }
    }
  }
  
  return { canCreate: true }
}