"use client"
import { useState } from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, LogIn, BookOpen, LayoutGrid, Menu, Heart, ChevronDown, Settings, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { SettingsModal } from "@/components/profile/SettingsModal"
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
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center md:px-8">
        
        {/* Mobile: Hamburger Menu - Left */}
        <div className="flex items-center justify-start md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={<Button variant="ghost" className="h-12 w-12 p-0" aria-label="Abrir menú" />}>
              <Menu className="size-8" />
            </SheetTrigger>
            <SheetContent side="left" className="!w-full 2xs:!w-[85vw] sm:!w-[320px] flex flex-col p-6">
              <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
              <div className="mb-8 mt-2 flex items-center gap-3 px-2 pr-14">
                <img src="/assets/logo_white.svg" alt="Panitacraft" className="h-10 w-10 shrink-0 select-none pointer-events-none" />
                <span className="text-xl font-bold tracking-tight truncate select-none">Panitacraft</span>
              </div>
              
              {/* Mobile Navigation Links - Top */}
              <nav className="flex flex-col gap-3 text-lg font-medium">
                {/*
                <Link 
                  href="/about" 
                  onClick={() => setIsOpen(false)}
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
                */}
                <Link 
                  href="/gallery" 
                  onClick={() => setIsOpen(false)}
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
                  href="/community" 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 rounded-md px-4 py-4 transition-colors",
                    pathname.startsWith("/community") 
                      ? "bg-primary/20 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Heart className="h-6 w-6" />
                  Comunidad
                </Link>
              </nav>

              {/* Mobile Auth Button - Bottom */}
              <div className="mt-auto pb-6 flex flex-col gap-3">
                {user ? (
                  <div className="flex flex-col gap-2 bg-secondary/10 rounded-md overflow-hidden transition-all">
                    {isProfileExpanded && (
                      <div className="flex flex-col border-b border-border/20 bg-black/10">
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <Button 
                            variant="ghost" 
                            className="flex h-12 w-full items-center justify-start gap-4 px-6 text-base font-medium cursor-pointer rounded-none hover:bg-secondary/20"
                          >
                            <User className="h-5 w-5 shrink-0" />
                            <span>Mi Perfil</span>
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          onClick={() => { setIsOpen(false); setIsSettingsOpen(true); }}
                          className="flex h-12 w-full items-center justify-start gap-4 px-6 text-base font-medium cursor-pointer rounded-none hover:bg-secondary/20"
                        >
                          <Settings className="h-5 w-5 shrink-0" />
                          <span>Configuraciones</span>
                        </Button>
                        <form action={logoutAction} className="w-full">
                          <Button variant="ghost" type="submit" className="flex h-12 w-full items-center justify-start gap-4 px-6 text-base font-medium cursor-pointer rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <LogIn className="h-5 w-5 shrink-0 rotate-180" />
                            <span>Cerrar Sesión</span>
                          </Button>
                        </form>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-6 py-3">
                      <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg font-medium hover:opacity-80 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={`https://mc-heads.net/avatar/${user.ign}/128`} 
                          alt={`Skin de ${user.ign}`} 
                          className="h-8 w-8 rounded-sm" 
                        />
                        <span className="truncate">{user.ign}</span>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setIsProfileExpanded(!isProfileExpanded)} className="h-10 w-10">
                        <ChevronDown className={cn("h-5 w-5 transition-transform", isProfileExpanded ? "" : "rotate-180")} />
                      </Button>
                    </div>
                  </div>
                ) : /* (
                  <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="default" className="flex h-14 w-full items-center justify-start gap-4 px-6 text-lg font-medium">
                      <LogIn className="h-6 w-6 shrink-0" />
                      <span>Iniciar Sesión</span>
                    </Button>
                  </Link>
                ) */ null}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - Center on Mobile, Left on Desktop */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 flex md:flex-1 items-center z-10">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80 select-none">
            <img src="/assets/logo_white.svg" alt="Panitacraft" className="h-10 w-10 pointer-events-none" />
            <span className="text-lg font-bold tracking-tight">Panitacraft</span>
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <nav className="hidden flex-1 items-center justify-center gap-2 text-sm font-medium md:flex">
          {/*
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
          */}
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
            href="/community" 
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
              pathname.startsWith("/community") 
                ? "bg-primary/20 text-primary font-semibold" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Heart className="h-4 w-4" />
            Comunidad
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
                {/* Ítem oculto para robar el auto-foco y que "Mi Perfil" no se vea seleccionado por defecto */}
                <DropdownMenuItem className="sr-only" aria-hidden="true" />
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center gap-2"
                  render={<Link href="/profile" />}
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center gap-2" 
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                  Configuraciones
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logoutAction} className="w-full m-0 p-0">
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
                    render={<button type="submit" className="w-full" />}
                    nativeButton={true}
                  >
                    <LogIn className="h-4 w-4 rotate-180" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : /* (
            <Link href="/login">
              <Button variant="default" className="gap-2 font-medium cursor-pointer">
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
          ) */ null}
        </div>

      </div>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </header>
  )
}
