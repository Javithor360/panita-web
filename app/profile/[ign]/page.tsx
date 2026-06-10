import prisma from "@/lib/prisma";
import { DynamicBackground } from "@/components/ui/DynamicBackground";
import { notFound } from "next/navigation";
import { ProfileColorExtractor } from "@/components/profile/ProfileColorExtractor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Award } from "lucide-react";
import { Fragment } from "react";
import type { Metadata } from "next";
import { ProfileGallery } from "@/components/profile/ProfileGallery";
import { ProfileTrajectory } from "@/components/profile/ProfileTrajectory";
import { EditionIcon } from "@/components/ui/EditionIcon";
import { getUserPhotos } from "@/app/actions/gallery";
import { getSession } from "@/lib/auth";

export async function generateMetadata(
  props: { params: Promise<{ ign: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const ign = decodeURIComponent(params.ign);
  return {
    title: `Perfil de ${ign} - Panitacraft`,
    description: `Descubre los roles, emblemas y trayectoria de ${ign} en Panitacraft.`,
  };
}

export default async function PublicProfilePage(props: { params: Promise<{ ign: string }> }) {
  const params = await props.params;
  const targetIgn = decodeURIComponent(params.ign);

  const session = await getSession();
  let canEdit = false;
  if (session?.userId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { roles: true }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (currentUser?.trusted_author && currentUser.roles.some((r: any) => r.id === 'admin' || r.id === 'mod')) {
      canEdit = true;
    }
  }

  const user = await prisma.user.findFirst({
    where: { 
      ign: {
        equals: targetIgn,
        mode: 'insensitive'
      }
    },
    include: {
      roles: {
        orderBy: { position: 'asc' }
      },
      emblems: {
        orderBy: { position: 'asc' },
        include: { 
          edition: true,
          _count: {
            select: { users: true }
          }
        }
      },
      editions: {
        include: { edition: true },
        orderBy: { edition: { started_at: 'asc' } }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const [photos, editions] = await Promise.all([
    getUserPhotos(user.id),
    prisma.edition.findMany({ 
      orderBy: [
        { started_at: { sort: 'desc', nulls: 'last' } },
        { name: 'asc' }
      ] 
    })
  ]);

  const ign = user.ign || user.discord_name;
  
  let userRoles = user.roles;
  if (userRoles.length === 0) {
    const defaultRole = await prisma.role.findUnique({ where: { id: 'default' } });
    if (defaultRole) {
      userRoles = [defaultRole];
    }
  }
  
  const extractSolidColor = (c: string) => {
    if (!c) return 'var(--muted)';
    if (c.includes('gradient')) {
      const match = c.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/);
      return match ? match[0] : 'var(--muted)';
    }
    return c;
  };
  
  const primaryRole = userRoles[0];
  const glowColor = primaryRole ? extractSolidColor(primaryRole.color) : 'var(--muted)';

  const formattedDate = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(user.joined_at));
  const joinedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <ProfileColorExtractor ign={ign} fallbackColor={glowColor}>
      <DynamicBackground color="var(--profile-glow)" spacing={64} position="absolute" />
      <div className="w-full relative z-10 pb-16">
        {/* Banner */}
      <div 
        className="h-48 md:h-64 w-full"
        style={{ background: 'var(--profile-gradient)' }}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 flex flex-col items-center">
          {/* Avatar de Minecraft */}
          <div 
            className="rounded-full border-4 border-card bg-card overflow-hidden h-40 w-40 sm:h-48 sm:w-48 shadow-xl transition-all duration-500 hover:scale-105"
            style={{ boxShadow: '0 10px 30px -15px var(--profile-glow)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`https://mc-heads.net/avatar/${ign}/256`}
              alt={`Avatar de ${ign}`}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">{ign}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Miembro desde {joinedDate}
          </p>

          {/* Roles (Con tipografía de Minecraft y color/gradiente) */}
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6">
            {userRoles.length > 0 ? (
              userRoles.map((role: any, index: number) => {
                const isGradient = role.color.includes('gradient');
                return (
                  <Fragment key={role.id}>
                    <span 
                      className={`font-minecraft text-xl md:text-2xl tracking-widest drop-shadow-sm select-none ${isGradient ? 'bg-clip-text text-transparent' : ''}`}
                      style={{
                        backgroundImage: isGradient ? role.color : undefined,
                        color: isGradient ? undefined : role.color,
                        filter: isGradient ? 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' : `drop-shadow(0 0 8px ${role.color}60)`,
                      }}
                    >
                      {role.name}
                    </span>
                    {index < userRoles.length - 1 && (
                      <span className="text-muted-foreground/30 font-minecraft text-xl md:text-2xl select-none hidden sm:inline">
                        —
                      </span>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <span className="font-minecraft text-xl md:text-2xl tracking-widest text-muted-foreground/50 drop-shadow-sm select-none">
                SIN RANGO
              </span>
            )}
          </div>

          {/* Emblemas */}
          <div className="mt-12 w-full">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div 
                className="h-[1px] flex-1" 
                style={{ background: `linear-gradient(to right, transparent, var(--profile-glow))`, opacity: 0.5 }} 
              />
              <h2 className="text-lg tracking-tight sm:text-xl md:text-2xl font-bold text-foreground uppercase sm:tracking-wide">
                <span className="select-none mr-3" style={{ color: 'var(--profile-glow)', opacity: 0.8 }}>✦</span>
                Emblemas
                <span className="select-none ml-3" style={{ color: 'var(--profile-glow)', opacity: 0.8 }}>✦</span>
              </h2>
              <div 
                className="h-[1px] flex-1" 
                style={{ background: `linear-gradient(to left, transparent, var(--profile-glow))`, opacity: 0.5 }} 
              />
            </div>
            
            {user.emblems.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6">
                {user.emblems.map((emblem: any) => (
                  <Dialog key={emblem.id}>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <DialogTrigger 
                            nativeButton={false}
                            render={<div />}
                            className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 hover:bg-secondary/30 hover:scale-110 cursor-pointer outline-none"
                          />
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={emblem.icon_url} 
                          alt={emblem.name} 
                          className="h-16 w-16 object-contain drop-shadow-md"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{emblem.name}</p>
                      </TooltipContent>
                    </Tooltip>

                    <DialogContent className="sm:max-w-md p-6 [&>button]:top-6 [&>button]:right-6 [&>button]:cursor-pointer">
                      <DialogHeader className="pr-6">
                        <DialogTitle className="text-xl flex items-center gap-2">
                          <Award className="w-6 h-6" style={{ color: 'var(--profile-glow)' }} />
                          {emblem.name}
                        </DialogTitle>
                        {emblem.edition && (
                          <DialogDescription className="flex items-center gap-1.5 mt-1">
                            Origen: 
                            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                              <EditionIcon editionId={emblem.edition.id} className="w-4 h-4 drop-shadow-sm" />
                              {emblem.edition.name}
                            </span>
                          </DialogDescription>
                        )}
                      </DialogHeader>
                      <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={emblem.icon_url} 
                          alt={emblem.name} 
                          className="h-24 w-24 object-contain drop-shadow-lg shrink-0" 
                        />
                        <div className="flex flex-col gap-3 w-full">
                          <p className="text-muted-foreground text-sm leading-relaxed text-center sm:text-left">
                            {emblem.description || "Este emblema es símbolo de la participación en un evento de alto renombre, otorgado a los participantes más honorables."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 mt-2">
                        {Math.max(0, emblem._count.users - 1) === 0 ? (
                          <p 
                            className="text-xs text-center font-bold italic bg-clip-text text-transparent"
                            style={{ 
                              backgroundImage: 'var(--profile-gradient)',
                              filter: 'drop-shadow(0 0 8px var(--profile-glow))'
                            }}
                          >
                            ¡Es el único con este emblema!
                          </p>
                        ) : Math.max(0, emblem._count.users - 1) === 1 ? (
                          <p className="text-xs text-muted-foreground/60 italic text-center">
                            Otro usuario también tiene este emblema.
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground/60 italic text-center">
                            Otros {Math.max(0, emblem._count.users - 1)} usuarios también tienen este emblema.
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center py-12"
                style={{ color: 'var(--profile-glow)' }}
              >
                <Award className="w-16 h-16 mb-4 opacity-40 drop-shadow-md" />
                <p className="text-sm font-medium opacity-80">Aún no ha desbloqueado ningún emblema.</p>
              </div>
            )}
          </div>

          <ProfileTrajectory userEditions={user.editions} />

          <ProfileGallery 
            photos={photos} 
            canUpload={false} 
            editions={editions} 
            userId={user.id} 
            userIgn={ign}
            canEdit={canEdit}
          />

        </div>
      </div>
      </div>
    </ProfileColorExtractor>
  );
}
