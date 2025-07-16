import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ReWork - Resume App',
  description: 'AI-powered resume optimization for job-specific applications. Upload, optimize, and download tailored resumes in seconds.',
  keywords: 'resume, AI, job application, optimization, career, employment',
  icons: {
    icon: [
      { url: '/rework-logo-simple-cropped.png', sizes: '64x64', type: 'image/png' },
      { url: '/rework-logo-simple-cropped.png', sizes: '32x32', type: 'image/png' },
      { url: '/rework-logo-simple-cropped.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/rework-logo-simple-cropped.png',
    apple: [
      { url: '/rework-logo-simple-cropped.png', sizes: '180x180', type: 'image/png' },
      { url: '/rework-logo-simple-cropped.png', sizes: '152x152', type: 'image/png' },
      { url: '/rework-logo-simple-cropped.png', sizes: '120x120', type: 'image/png' },
    ],
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/rework-logo-simple-cropped.png',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            richColors
            theme="dark"
            expand={false}
            closeButton
          />
        </Providers>
      </body>
    </html>
  )
}