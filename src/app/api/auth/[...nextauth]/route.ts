import NextAuth, { NextAuthOptions } from "next-auth"
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
        // Add plan from database user
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true }
        })
        if (dbUser) {
          session.user.plan = dbUser.plan
        }
      }
      return session
    },
  },
  session: {
    strategy: "database",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }