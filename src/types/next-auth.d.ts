import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      plan: 'FREE' | 'PREMIUM'
      resumesCreated: number
      createdAt: Date
      lastActiveAt: Date
      resumesOptimized: number
    }
  }

  interface User {
    id: string
    plan: 'FREE' | 'PREMIUM'
    resumesCreated: number
    createdAt: Date
    lastActiveAt: Date
    resumesOptimized: number
  }
}