import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import InstallBanner from './components/InstallBanner';



const geistSans = Geist({

  variable: "--font-geist-sans",

  subsets: ["latin"],

});



const geistMono = Geist_Mono({

  variable: "--font-geist-mono",

  subsets: ["latin"],

});



export const metadata: Metadata = {

  title: "WritingChoice",

  description: "Secure portal for academic and professional writing.",

  manifest: "/manifest.json",

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

        <InstallBanner />

        {children}

      </body>

    </html>

  );

}