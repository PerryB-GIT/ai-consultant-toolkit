import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Support Forge — AI Setup",
  description: "Get Claude Code and all AI tools installed in minutes. Powered by Support Forge.",
  openGraph: {
    title: "Support Forge — AI Setup",
    description: "Get Claude Code and all AI tools installed in minutes.",
    url: "https://ai-consultant-toolkit.vercel.app",
    siteName: "Support Forge",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Support Forge — AI Setup",
    description: "Get Claude Code and all AI tools installed in minutes.",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
