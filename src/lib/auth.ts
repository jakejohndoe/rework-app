import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user && user) {
        session.user.id = user.id
        // Add plan and other data from database user
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            plan: true,
            resumesCreated: true,
            createdAt: true,
            lastActiveAt: true
          }
        })
        if (dbUser) {
          session.user.plan = dbUser.plan
          session.user.resumesCreated = dbUser.resumesCreated
          session.user.createdAt = dbUser.createdAt
          session.user.lastActiveAt = dbUser.lastActiveAt
        }
        
        // Get job applications count for "resumes optimized"
        const jobApplicationsCount = await prisma.jobApplication.count({
          where: { userId: user.id }
        })
        session.user.resumesOptimized = jobApplicationsCount
      }
      return session
    },
  },
  session: {
    strategy: "database",
  },
}