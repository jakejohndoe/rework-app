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
    }
  }

  interface User {
    id: string
    plan: 'FREE' | 'PREMIUM'
    resumesCreated: number
  }
}