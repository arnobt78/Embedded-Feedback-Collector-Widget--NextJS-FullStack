/**
 * Root Layout Component
 *
 * This is the root layout for the Next.js App Router application.
 * It wraps all pages and provides:
 * - Metadata for SEO and social sharing
 * - Global fonts (Google Fonts via Next.js font optimization)
 * - Global CSS styles
 *
 * Next.js automatically optimizes Google Fonts by:
 * - Self-hosting fonts (no external requests)
 * - Automatic font subsetting (only loads needed characters)
 * - Preloading fonts for better performance
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Geist Sans Font Configuration
 *
 * Loads Geist Sans font from Google Fonts and creates a CSS variable
 * that can be used in Tailwind classes or CSS.
 *
 * The font is optimized by Next.js and self-hosted for performance.
 */
const geistSans = Geist({
  variable: "--font-geist-sans", // CSS variable name (can be used in Tailwind config)
  subsets: ["latin"], // Only load Latin character subset (smaller file size)
});

/**
 * Geist Mono Font Configuration
 *
 * Monospace variant of Geist font for code blocks or technical text.
 * Same optimization benefits as geistSans.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // CSS variable name
  subsets: ["latin"],
});

/**
 * Metadata Configuration
 *
 * Comprehensive SEO and social media metadata for the application.
 * Next.js automatically converts this to appropriate <meta> tags in the <head>.
 *
 * Key Features:
 * - SEO optimization (title, description, keywords)
 * - Open Graph tags (Facebook, LinkedIn sharing)
 * - Twitter Card tags (Twitter sharing)
 * - Canonical URLs (prevent duplicate content issues)
 * - Robots directives (search engine indexing)
 */
export const metadata: Metadata = {
  // Title configuration with template for dynamic page titles
  title: {
    default:
      "Feedback Widget - Embedded User Feedback Collection Tool | Next.js",
    template: "%s | Feedback Widget", // Example: "Contact | Feedback Widget"
  },
  description:
    "A modern, reusable full-stack feedback widget built with Next.js, React, Tailwind CSS, and Prisma. Easily embed this widget into any project to collect user feedback with ratings, messages, and contact information.",
  keywords: [
    "feedback widget",
    "feedback form",
    "user feedback",
    "feedback collector",
    "react widget",
    "nextjs widget",
    "embeddable widget",
    "feedback component",
    "reactjs",
    "next.js",
    "tailwindcss",
    "prisma",
    "mongodb",
    "feedback management",
    "customer feedback",
    "web widget",
    "feedback system",
    "UI component",
    "react component",
    "widget integration",
    "fullstack",
    "typescript",
    "api integration",
    "vercel",
    "modern web",
    "feedback tool",
  ],
  authors: [
    {
      name: "Arnob Mahmud",
      url: "https://arnob-mahmud.vercel.app/",
    },
  ],
  creator: "Arnob Mahmud",
  publisher: "Arnob Mahmud",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://embedded-feedback.vercel.app/",
    title: "Feedback Widget - Embedded User Feedback Collection Tool",
    description:
      "A modern, reusable full-stack feedback widget built with Next.js, React, Tailwind CSS, and Prisma. Easily embed this widget into any project to collect user feedback.",
    siteName: "Feedback Widget",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Feedback Widget - Embedded User Feedback Collection Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feedback Widget - Embedded User Feedback Collection Tool",
    description:
      "A modern, reusable full-stack feedback widget built with Next.js, React, Tailwind CSS, and Prisma.",
    images: ["/favicon.ico"],
    creator: "@arnob_mahmud",
  },
  alternates: {
    canonical: "https://embedded-feedback.vercel.app/",
  },
  metadataBase: new URL("https://embedded-feedback.vercel.app/"),
  category: "technology",
};

/**
 * RootLayout Component
 *
 * The root layout component that wraps all pages in the application.
 * This component is required in Next.js App Router and must export
 * <html> and <body> tags.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components (pages)
 * @returns {JSX.Element} Root HTML structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply font CSS variables to body so they're available throughout the app */}
      {/* These variables can be used in Tailwind config or CSS */}
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children} {/* Render page content */}
      </body>
    </html>
  );
}
