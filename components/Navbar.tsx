"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, LogIn, BookOpen, LayoutGrid, Menu, Heart, ChevronDown } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutAction } from "@/app/actions/auth"

interface NavbarProps {
  user?: { ign: string } | null;
}

export function Navbar({ user }: NavbarProps) {
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
            <SheetContent side="left" className="!w-full 2xs:!w-[85vw] sm:!w-[320px] flex flex-col p-6">
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
              <div className="mt-auto pb-6 flex flex-col gap-3">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link href="/profile" className="flex h-14 w-full items-center justify-start gap-4 rounded-md bg-secondary/10 px-6 text-lg font-medium transition-colors hover:bg-secondary/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`https://mc-heads.net/avatar/${user.ign}/128`} 
                        alt={`Skin de ${user.ign}`} 
                        className="h-8 w-8 rounded-sm" 
                      />
                      <span className="truncate">{user.ign}</span>
                    </Link>
                    <form action={logoutAction} className="w-full">
                      <Button variant="destructive" type="submit" className="flex h-14 w-full items-center justify-start gap-4 px-6 text-lg font-medium">
                        <LogIn className="h-6 w-6 shrink-0 rotate-180" />
                        <span>Cerrar Sesión</span>
                      </Button>
                    </form>
                  </div>
                ) : (
                  <Link href="/login" className="w-full">
                    <Button variant="default" className="flex h-14 w-full items-center justify-start gap-4 px-6 text-lg font-medium">
                      <LogIn className="h-6 w-6 shrink-0" />
                      <span>Iniciar Sesión</span>
                    </Button>
                  </Link>
                )}
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 h-10 px-2 rounded-md bg-transparent hover:bg-accent/50 cursor-pointer outline-none transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`https://mc-heads.net/avatar/${user.ign}/128`} 
                    alt={`Skin de ${user.ign}`} 
                    className="h-7 w-7 rounded-full bg-black/10" 
                  />
                  <span className="font-medium">{user.ign}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer p-0">
                  <Link href="/profile" className="flex items-center w-full h-full px-2 py-1.5">
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive p-0">
                  <form action={logoutAction} className="w-full m-0 p-0">
                    <button type="submit" className="flex w-full items-center px-2 py-1.5 text-left outline-none cursor-pointer">
                      Cerrar Sesión
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="default" className="gap-2 font-medium cursor-pointer">
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Dummy div to balance flex on mobile so logo is exactly centered */}
        <div className="flex flex-1 md:hidden" />
      </div>
    </header>
  )
}
