import React from 'react'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Rankr | AI AI Talent Screening Platform',
  description: 'AI-powered talent screening platform for faster and smarter hiring.',
}

import { ToastProvider } from './components/ui/Toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning={true}>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning={true}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

