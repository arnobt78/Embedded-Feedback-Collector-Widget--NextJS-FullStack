import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Feedback Widget - Embedded User Feedback Collection Tool | Next.js",
    template: "%s | Feedback Widget",
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
  manifest: "/favicon.ico",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://widget-feedback-next.vercel.app/",
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
    canonical: "https://widget-feedback-next.vercel.app/",
  },
  metadataBase: new URL("https://widget-feedback-next.vercel.app/"),
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
