import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        // Add user ID and plan to session
        session.user.id = user.id
        
        // Get user plan from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true, resumesCreated: true }
        })
        
        session.user.plan = dbUser?.plan || 'FREE'
        session.user.resumesCreated = dbUser?.resumesCreated || 0
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Update last active time when user signs in
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() }
        })
      }
      return true
    },
  },
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }