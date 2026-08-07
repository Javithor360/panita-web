import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { getUserPhotos, getUserMediaStats } from "@/app/actions/gallery";
import { getPersonalProfileData, getDefaultRole, getGlobalEditions, getUserForms } from "@/app/actions/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil de Jugador - Panitacraft",
  description: "Accede a tu perfil personal y administra tu cuenta",
  openGraph: {
    title: "Perfil de Jugador",
    description: "Accede a tu perfil personal y administra tu cuenta",
    siteName: "Panitacraft",
    url: "https://panita.vercel.app/profile",
    images: [
      {
        url: "https://render.crafty.gg/2d/head/Steve",
        width: 256,
        height: 256,
        alt: "Avatar de Jugador",
      }
    ],
    type: "profile",
  },
  twitter: {
    card: "summary",
    title: "Perfil de Jugador",
    description: "Accede a tu perfil personal y administra tu cuenta",
    images: ["https://render.crafty.gg/2d/head/Steve"],
  }
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const user = await getPersonalProfileData(session.userId);

  if (!user) {
    redirect("/login");
  }

  const [photos, editions, forms, mediaStats] = await Promise.all([
    getUserPhotos(user.id),
    getGlobalEditions(),
    getUserForms(user.id),
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
  const titles = user.emblems.filter((e: any) => !e.icon_url);

  const canAdmin = userRoles.some((r: any) => r.id === "admin" || r.id === "mod");

  return (
    <ProfileView
      user={user}
      ign={ign}
      joinedDate={joinedDate}
      glowColor={glowColor}
      userRoles={userRoles}
      visualEmblems={user.emblems.filter((e: any) => e.icon_url)}
      titles={titles}
      photos={photos}
      editions={editions}
      forms={forms}
      mediaStats={mediaStats}
      canEditGallery={!!user.trusted_author && canAdmin}
      canUploadPhotos={!!user.trusted_author}
      showAdminPanel={canAdmin}
      showForms={true}
    />
  );
}
