"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProfileColorExtractor } from "@/components/profile/ProfileColorExtractor"
import { cn } from "@/lib/utils"
import { Crown } from "lucide-react"

export type CreditUser = {
  id: string
  ign: string
  discordName: string
  discordId: string
  discordAvatar: string
  role?: string
  roleName?: string
  roleColor?: string
  description?: string
  joinedAt?: string
  originalRoleName?: string
}

type UserCardProps = {
  user: CreditUser;
  onOpenChange?: (open: boolean) => void;
  disableModal?: boolean;
  isPanita?: boolean;
}

export function UserCard({ user, onOpenChange, disableModal, isPanita }: UserCardProps) {
  const isDonor = user.role === 'donor';
  const isPatron = user.role === 'patron';
  const isStaff = user.role === 'admin' || user.role === 'mod';

  const roleText = isDonor ? 'Donador Activo' : isPatron ? 'Donador' : user.roleName || user.role || 'Miembro';
  const tooltipText = (isPanita && user.originalRoleName) ? user.originalRoleName : roleText;
  
  const CardContent = (
    <div className={cn(
      "group/card relative flex flex-col items-center gap-3 rounded-2xl border transition-all duration-300 cursor-pointer shrink-0 z-10 shadow-lg",
      isPanita 
        ? "w-52 p-6 bg-card border-indigo-500/50 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] hover:border-indigo-400 hover:shadow-[0_0_50px_-5px_rgba(99,102,241,0.6)]"
        : "w-48 p-6 hover:-translate-y-2",
      !isPanita && isDonor 
        ? "bg-amber-500/10 border-yellow-500/50 hover:border-yellow-400 hover:shadow-[0_0_40px_-10px_rgba(250,204,21,0.6)]" 
        : !isPanita && "bg-card border-border/50 hover:border-white/20 hover:bg-accent"
    )}>
                <ProfileColorExtractor ign={user.ign} fallbackColor="var(--foreground)">
                  <div className="flex flex-col items-center">
                    <div className={cn("relative overflow-visible", !isPanita && "transition-transform duration-300 group-hover/card:scale-110")}>
                      {isPanita && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_2px_8px_rgba(250,204,21,0.6)]">
                          <Crown className="w-16 h-16 text-yellow-500 fill-yellow-500" />
                        </div>
                      )}
                      <img 
                        src={`https://mc-heads.net/avatar/${user.ign}/128?cors=true`} 
                        alt={user.ign} 
                        className="h-20 w-20 rounded-md shadow-md"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <div className="absolute -bottom-2 -right-2 rounded-full border-2 border-card bg-muted h-8 w-8 overflow-hidden">
                        <img 
                          src={user.discordAvatar} 
                          alt={user.discordName} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className={cn("text-center flex flex-col items-center w-full", isPanita ? "mt-5 gap-2" : "mt-4 gap-1")}>
                      <h3 
                        className="font-bold text-lg tracking-tight truncate w-full transition-colors duration-300"
                        style={{ color: isPanita ? '#ffffff' : 'var(--profile-glow)' }}
                      >
                        {user.ign}
                      </h3>
                      
                      {isDonor && (
                        <span className="text-[11px] font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] uppercase tracking-wide">
                          {roleText}
                        </span>
                      )}
                      {isPatron && (
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          {roleText}
                        </span>
                      )}
                      {isStaff && (
                        <span 
                          className="text-[11px] font-bold uppercase tracking-wide"
                          style={{ 
                            color: user.roleColor || 'var(--primary)',
                            textShadow: user.roleColor ? `0 0 12px ${user.roleColor}` : undefined
                          }}
                        >
                          {roleText}
                        </span>
                      )}
                      {!isDonor && !isPatron && !isStaff && (
                        <span 
                          className="text-[11px] font-bold uppercase tracking-wide"
                          style={{ 
                            color: user.roleColor || 'var(--primary)',
                            textShadow: user.roleColor ? `0 0 12px ${user.roleColor}` : undefined
                          }}
                        >
                          {roleText}
                        </span>
                      )}
                      
                      <p className="text-sm text-muted-foreground truncate w-full">{user.discordName}</p>
                      
                      {isPanita && user.joinedAt && (
                        <p className="text-[10.5px] text-muted-foreground/80 font-medium w-full whitespace-nowrap italic">
                          Panita desde {user.joinedAt}
                        </p>
                      )}
                    </div>
                  </div>
                </ProfileColorExtractor>
              </div>
  );

  if (disableModal) {
    return (
      <TooltipProvider delay={100}>
        <Tooltip>
          <TooltipTrigger render={<div className="inline-block" />}>
            {CardContent}
          </TooltipTrigger>
          <TooltipContent side={isPanita ? "bottom" : "top"} sideOffset={isPanita ? 0 : 4} className="bg-popover text-popover-foreground border-border/50">
            <p className="font-semibold">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <TooltipProvider delay={100}>
        <Tooltip>
          <TooltipTrigger render={<div className="inline-block" />}>
            <DialogTrigger nativeButton={false} render={CardContent} />
          </TooltipTrigger>
          <TooltipContent side={isPanita ? "bottom" : "top"} sideOffset={isPanita ? 0 : 4} className="bg-popover text-popover-foreground border-border/50">
            <p className="font-semibold">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DialogContent className={cn(
        "sm:max-w-md [&_[data-slot=dialog-close]]:scale-125 [&_[data-slot=dialog-close]]:right-4 [&_[data-slot=dialog-close]]:top-4",
        !user.roleColor && isDonor ? "border-yellow-400/40" : !user.roleColor ? "border-primary/20" : ""
      )}
      style={user.roleColor ? { borderColor: `${user.roleColor}40` } : {}}
      >
        <DialogHeader className="items-center sm:text-center pt-4">
          <div className="relative mb-4">
            <img 
              src={`https://mc-heads.net/avatar/${user.ign}/256?cors=true`} 
              alt={user.ign} 
              className="h-32 w-32 rounded-lg shadow-xl ring-2 ring-primary/20"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <DialogTitle className="text-2xl">{user.ign}</DialogTitle>
          <div className="flex items-center gap-2 mt-1 justify-center bg-secondary/10 px-3 py-1 rounded-full w-fit">
            <img 
              src={user.discordAvatar} 
              alt={user.discordName}
              className="h-4 w-4 rounded-full object-cover"
            />
            <span className="text-sm text-muted-foreground font-medium">{user.discordName}</span>
          </div>
          {user.role && (
            <span 
              className="mt-2 inline-block rounded-md px-2.5 py-0.5 text-sm font-semibold border"
              style={{ 
                color: user.roleColor || (isDonor ? '#facc15' : 'var(--primary)'),
                borderColor: user.roleColor ? `${user.roleColor}40` : isDonor ? 'rgba(250,204,21,0.2)' : 'rgba(var(--primary), 0.2)',
                backgroundColor: user.roleColor ? `${user.roleColor}20` : isDonor ? 'rgba(250,204,21,0.1)' : 'rgba(var(--primary), 0.1)'
              }}
            >
              {roleText}
            </span>
          )}
        </DialogHeader>
        <div className="mt-4 text-center">
          <p className="text-base text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50">
            "{user.description}"
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CreditsSections({ donators, staffMembers, panitaOfTheMonth }: { donators: CreditUser[], staffMembers: CreditUser[], panitaOfTheMonth?: CreditUser | null }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;

      const creditsSection = document.getElementById("credits-content");
      if (!creditsSection) return;

      const sectionTop = creditsSection.getBoundingClientRect().top;
      const scrollY = window.scrollY;

      // Al estar arriba de todo y scrollear hacia abajo, saltar al contenido
      if (scrollY < 50 && e.deltaY > 0) {
        e.preventDefault();
        isScrolling = true;
        creditsSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { isScrolling = false }, 1000);
      }
      // Al estar justo en el contenido y scrollear hacia arriba, saltar al inicio
      else if (sectionTop > -50 && sectionTop < 100 && e.deltaY < 0) {
        e.preventDefault();
        isScrolling = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false }, 1000);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isScrolling) return;
      
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      const creditsSection = document.getElementById("credits-content");
      if (!creditsSection) return;

      const sectionTop = creditsSection.getBoundingClientRect().top;
      const scrollY = window.scrollY;

      if (scrollY < 50 && deltaY > 30) {
        isScrolling = true;
        creditsSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { isScrolling = false }, 1000);
      } else if (sectionTop > -50 && sectionTop < 100 && deltaY < -30) {
        isScrolling = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false }, 1000);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-32 mt-20 relative">
      
      {/* Background glowing blob for visual separation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none -z-10" />
      
      {/* Donators Section (Infinite Carousel) */}
      <section className="w-full flex flex-col gap-10 overflow-hidden relative">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-sm pb-1">
            Nuestros Donadores
          </h2>
          <p className="text-muted-foreground mt-4 font-medium text-lg leading-relaxed">
            Aquellos usuarios que apoyan económicamente el servidor. Sin importar la cantidad, sus aportes nos permiten cubrir los costos de financiamiento y mejorar la calidad del contenido. ¡Todo lo recaudado va 100% dirigido a mantener vivo a Panitacraft!
          </p>
          
          {/* PayPal Subtle CTA Text */}
          <div className="flex justify-center mt-4 relative">
            <p className="text-sm max-[360px]:text-xs text-muted-foreground flex flex-wrap justify-center items-center gap-2 max-[360px]:gap-1">
              ¿Quieres apoyar a la comunidad? 
              <a 
                href="https://www.paypal.me/Javithor360" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-amber-500 hover:text-amber-400 hover:underline font-medium transition-colors"
              >
                Realiza tu donación
              </a>
            </p>
          </div>
        </div>
        
        {/* Carousel Wrapper with mask-image for transparent edges */}
        <div 
          className="relative container max-w-4xl mx-auto px-4 flex overflow-hidden pt-2 pb-8"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
        >
          <div className={cn("flex w-max animate-marquee hover:[animation-play-state:paused]", isDialogOpen && "[animation-play-state:paused]")}>
            <div className="flex items-center gap-8 px-4 w-max shrink-0">
              {donators.map((user, i) => (
                <UserCard key={`${user.id}-${i}`} user={user} onOpenChange={setIsDialogOpen} />
              ))}
            </div>
            <div className="flex items-center gap-8 px-4 w-max shrink-0">
              {donators.map((user, i) => (
                <UserCard key={`${user.id}-${i}-duplicate`} user={user} onOpenChange={setIsDialogOpen} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Staff Section (Static Grid) */}
      <section className="container max-w-4xl mx-auto px-4 flex flex-col gap-10 relative">
        {/* Subtle divider line with glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 bg-clip-text text-transparent drop-shadow-sm pb-1">
            Nuestro Equipo del Staff
          </h2>
          <p className="text-muted-foreground mt-4 font-medium text-lg leading-relaxed">
            Colaboradores apasionados que participan sin ánimos de lucro. Demuestran su talento haciendo realidad las ideas y escuchando las sugerencias de la comunidad para brindar la mejor experiencia de juego, tanto dentro como fuera del servidor.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 relative z-10">
          {staffMembers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </section>

    </div>
  )
}
