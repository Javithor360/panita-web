import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProfileView } from "@/components/profile/ProfileView";
import { getUserPhotos, getUserMediaStats } from "@/app/actions/gallery";
import {
  getPublicProfileData,
  getDefaultRole,
  getGlobalEditions,
} from "@/app/actions/profile";
import { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ ign: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const ign = decodeURIComponent(params.ign);
  return {
    title: `Perfil de ${ign} - Panitacraft`,
    description: `Descubre los roles, emblemas y trayectoria de ${ign} en Panitacraft.`,
  };
}

export default async function PublicProfilePage(props: {
  params: Promise<{ ign: string }>;
}) {
  const params = await props.params;
  const targetIgn = decodeURIComponent(params.ign);

  const session = await getSession();
  let canEdit = false;
  if (session?.userId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { roles: true },
    });

    if (
      currentUser?.trusted_author &&
      currentUser.roles.some((r: any) => r.id === "admin" || r.id === "mod")
    ) {
      canEdit = true;
    }
  }

  const user = await getPublicProfileData(targetIgn);

  if (!user) {
    notFound();
  }

  const [photos, editions, mediaStats] = await Promise.all([
    getUserPhotos(user.id),
    getGlobalEditions(),
    getUserMediaStats(user.id),
  ]);

  const ign = user.ign || user.discord_name;

  let userRoles = user.roles;
  if (userRoles.length === 0) {
    const defaultRole = await getDefaultRole();
    if (defaultRole) {
      userRoles = [defaultRole];
    }
  }

  const extractSolidColor = (c: string) => {
    if (!c) return "var(--muted)";
    if (c.includes("gradient")) {
      const match = c.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/);
      return match ? match[0] : "var(--muted)";
    }
    return c;
  };

  const visualEmblems = user.emblems.filter((e: any) => e.icon_url);
  const titles = user.emblems.filter((e: any) => !e.icon_url);

  const primaryRole = userRoles[0];
  const glowColor = primaryRole
    ? extractSolidColor(primaryRole.color)
    : "var(--muted)";

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(new Date(user.joined_at));
  const joinedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <ProfileView
      user={user}
      ign={ign}
      joinedDate={joinedDate}
      glowColor={glowColor}
      userRoles={userRoles}
      visualEmblems={visualEmblems}
      titles={titles}
      photos={photos}
      editions={editions}
      mediaStats={mediaStats}
      canEditGallery={canEdit}
      canUploadPhotos={false}
      showAdminPanel={false}
      showForms={false}
    />
  );
}
