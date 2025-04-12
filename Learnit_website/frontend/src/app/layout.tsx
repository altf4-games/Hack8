// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation/page";
import Footer from "./components/Footer/page";
import AuthProviderWrapper from "./components/AuthProviderWrapper/AuthProviderWrapper";
import { Toaster } from "sonner";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LearnIt.com - AI-Powered Learning Platform",
    template: "%s | LearnIt.com"
  },
  description: "Transform your study materials into interactive learning experiences with AI-powered flashcards, quizzes, and more. Upload any document and let our AI create personalized learning content.",
  keywords: ["AI learning", "flashcards", "study tools", "education technology", "online learning", "quiz generator", "PDF to flashcards", "interactive learning"],
  authors: [{ name: "LearnIt.com Team" }],
  creator: "LearnIt.com",
  publisher: "LearnIt.com",
  icons: {
    icon: [
      { url: '/learnit logo.png', sizes: '16x16', type: 'image/png' },
      { url: '/learnit logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/learnit logo.png', sizes: '48x48', type: 'image/png' },
      { url: '/learnit logo.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [
      { url: '/learnit logo.png', sizes: '57x57', type: 'image/png' },
      { url: '/learnit logo.png', sizes: '72x72', type: 'image/png' },
      { url: '/learnit logo.png', sizes: '114x114', type: 'image/png' },
      { url: '/learnit logo.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: [{ url: '/learnit logo.png' }],
    other: [
      { rel: 'mask-icon', url: '/learnit logo.png', color: '#5bbad5' }
    ]
  },
  manifest: '/manifest.json',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://learnit.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification=K3zP7e9nLIxEZXCpYF3d_ffREhY4gDoMLaJDryxy5eI',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://learnit.com',
    siteName: 'LearnIt.com',
    title: 'LearnIt.com - AI-Powered Learning Platform',
    description: 'Transform your study materials into interactive learning experiences with AI-powered flashcards, quizzes, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LearnIt.com Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LearnIt.com - AI-Powered Learning Platform',
    description: 'Transform your study materials into interactive learning experiences with AI-powered flashcards, quizzes, and more.',
    images: ['/og-image.png'],
    creator: '@learnit_com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://upload-widget.cloudinary.com/global/all.js" 
          strategy="beforeInteractive"
        />
        
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "LearnIt.com",
              "description": "AI-powered learning platform that transforms study materials into interactive learning experiences",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "AI-powered flashcard generation",
                "Multiple choice questions",
                "True/False questions",
                "Matching exercises",
                "Fill in the blanks",
                "Interactive learning games"
              ],
              "url": "https://learnit.com",
              "author": {
                "@type": "Organization",
                "name": "LearnIt.com Team"
              },
              "publisher": {
                "@type": "Organization",
                "name": "LearnIt.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://learnit.com/learnit logo.png"
                }
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProviderWrapper>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </AuthProviderWrapper>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}