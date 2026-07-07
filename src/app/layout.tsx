import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppProvider } from '@/components/providers/AppProvider';
import { AppShell } from '@/components/layout/AppShell';
import { SkipToContent } from '@/components/layout/SkipToContent';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'VenueMind AI — Stadium Operations Command Center',
    template: '%s · VenueMind AI',
  },
  description:
    'AI-powered Stadium Operations Command Center for FIFA World Cup 2026. Real-time incident management, crowd monitoring, and AI-driven decision support for professional stadium operators.',
  keywords: [
    'stadium operations',
    'FIFA World Cup 2026',
    'AI operations copilot',
    'crowd management',
    'incident management',
    'stadium command center',
    'VenueMind AI',
  ],
  authors: [{ name: 'Rahul Asthwik' }],
  creator: 'Rahul Asthwik',
  publisher: 'VenueMind AI',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'VenueMind AI — Stadium Operations Command Center',
    description:
      'AI-powered Stadium Operations Copilot for FIFA World Cup 2026. Helping operators make faster, safer, smarter decisions.',
    siteName: 'VenueMind AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VenueMind AI — Stadium Operations Command Center',
    description:
      'AI-powered Stadium Operations Copilot for FIFA World Cup 2026.',
    creator: '@rahulasthwik',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f5132',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col">
        <AppProvider>
          <SkipToContent />
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
