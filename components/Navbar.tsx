"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, LogIn, BookOpen, LayoutGrid, Menu, Heart } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center md:px-8">
        
        {/* Mobile: Hamburger Menu - Left */}
        <div className="flex flex-1 items-center justify-start md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" className="h-12 w-12 p-0" aria-label="Abrir menú" />}>
              <Menu className="size-8" />
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-6 sm:max-w-xs">
              <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
              <div className="mb-8 mt-2 flex items-center gap-3 px-2 pr-14">
                <ImageIcon className="h-8 w-8 text-primary shrink-0" />
                <span className="text-xl font-bold tracking-tight truncate">Panitacraft</span>
              </div>
              
              {/* Mobile Navigation Links - Top */}
              <nav className="flex flex-col gap-3 text-lg font-medium">
                <Link 
                  href="/about" 
                  className={cn(
                    "flex items-center gap-4 rounded-md px-4 py-4 transition-colors",
                    pathname === "/about" 
                      ? "bg-primary/20 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <BookOpen className="h-6 w-6" />
                  Historia
                </Link>
                <Link 
                  href="/gallery" 
                  className={cn(
                    "flex items-center gap-4 rounded-md px-4 py-4 transition-colors",
                    pathname.startsWith("/gallery") 
                      ? "bg-primary/20 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-6 w-6" />
                  Galería
                </Link>
                <Link 
                  href="/acknowledgments" 
                  className={cn(
                    "flex items-center gap-4 rounded-md px-4 py-4 transition-colors",
                    pathname.startsWith("/acknowledgments") 
                      ? "bg-primary/20 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Heart className="h-6 w-6" />
                  Agradecimientos
                </Link>
              </nav>

              {/* Mobile Auth Button - Bottom */}
              <div className="mt-auto pb-6">
                <Button variant="default" className="flex h-14 w-full items-center justify-start gap-4 px-6 text-lg font-medium">
                  <LogIn className="h-6 w-6 shrink-0" />
                  <span>Iniciar Sesión</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - Center on Mobile, Left on Desktop */}
        <div className="flex flex-1 items-center justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <ImageIcon className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Panitacraft</span>
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <nav className="hidden flex-1 items-center justify-center gap-2 text-sm font-medium md:flex">
          <Link 
            href="/about" 
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
              pathname === "/about" 
                ? "bg-primary/20 text-primary font-semibold" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Historia
          </Link>
          <Link 
            href="/gallery" 
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
              pathname.startsWith("/gallery") 
                ? "bg-primary/20 text-primary font-semibold" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Galería
          </Link>
          <Link 
            href="/acknowledgments" 
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
              pathname.startsWith("/acknowledgments") 
                ? "bg-primary/20 text-primary font-semibold" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Heart className="h-4 w-4" />
            Agradecimientos
          </Link>
        </nav>

        {/* Desktop Auth - Right */}
        <div className="hidden flex-1 items-center justify-end md:flex">
          <Button variant="default" className="gap-2 font-medium cursor-pointer">
            <LogIn className="h-4 w-4" />
            <span>Iniciar Sesión</span>
          </Button>
        </div>

        {/* Dummy div to balance flex on mobile so logo is exactly centered */}
        <div className="flex flex-1 md:hidden" />
      </div>
    </header>
  )
}
