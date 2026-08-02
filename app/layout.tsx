import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import InstallBanner from './components/InstallBanner';
import GlobalSettingsProvider from './components/GlobalSettingsProvider';



const geistSans = Geist({

  variable: "--font-geist-sans",

  subsets: ["latin"],

});



const geistMono = Geist_Mono({

  variable: "--font-geist-mono",

  subsets: ["latin"],

});



export const metadata: Metadata = {
  title: "WritingChoice | Premium Custom Writing Services",
  description: "Secure portal for academic, professional, and business writing. Get 100% plagiarism-free, high-quality custom writing tailored to your exact needs.",
  keywords: "custom writing, essay help, research paper writing, professional writing, academic writing, plagiarism-free",
  manifest: "/manifest.json",
  openGraph: {
    title: "WritingChoice | Premium Custom Writing Services",
    description: "Secure portal for academic, professional, and business writing. 100% plagiarism-free.",
    url: "https://writingchoice.com",
    siteName: "WritingChoice",
    images: [
      {
        url: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "WritingChoice Custom Writing",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WritingChoice | Premium Custom Writing Services",
    description: "Get 100% plagiarism-free, high-quality custom writing tailored to your exact needs.",
    images: ["https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=1200&auto=format&fit=crop"],
  },
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

    >

      <head>

        <link rel="manifest" href="/manifest.json" />

      </head>

      <body className="min-h-full flex flex-col">
        <GlobalSettingsProvider>
          <InstallBanner />
          {children}
        </GlobalSettingsProvider>
      </body>

    </html>

  );

}