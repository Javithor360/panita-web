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
  description: "Galería y museo digital de las ediciones de Panitacraft",
};

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { TooltipProvider } from "@/components/ui/tooltip";

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
        </TooltipProvider>
      </body>
    </html>
  );
}
