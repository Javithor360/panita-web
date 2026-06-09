import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
  title: "Panitacraft",
  description: "Sitio web oficial del servidor de Panitacraft",
  icons: {
    icon: "/assets/logo_white.svg"
  },
  openGraph: {
    title: "Panitacraft",
    description: "Sitio web oficial del servidor de Panitacraft",
    url: "https://panita.vercel.app",
    siteName: "Panitacraft",
    images: [
      {
        url: "/assets/logo_white.svg",
        alt: "Panitacraft Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Panitacraft",
    description: "Sitio web oficial del servidor de Panitacraft",
    images: ["/assets/logo_white.svg"],
  },
  other: {
    "theme-color": "#5c7cfa",
  }
};

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  let user = null;
  
  if (session?.userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { ign: true, discord_name: true }
    });
    
    if (dbUser) {
      user = {
        ign: dbUser.ign || dbUser.discord_name,
      };
    }
  }

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <TooltipProvider>
          <Navbar user={user} />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <Analytics />
        </TooltipProvider>
      </body>
    </html>
  );
}
