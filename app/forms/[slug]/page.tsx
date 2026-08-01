import { getSession } from "@/lib/auth";
import { getPublicFormBySlug } from "@/app/actions/forms";
import { notFound, redirect } from "next/navigation";
import { FormRenderer } from "./FormRenderer";
import { ProfileColorExtractor } from "@/components/profile/ProfileColorExtractor";
import { DynamicBackground } from "@/components/ui/DynamicBackground";
import prisma from "@/lib/prisma";

export default async function PublicFormPage(props: { params: Promise<{ slug: string }> | { slug: string } }) {
  const params = await props.params;
  
  // Try to get session to know if user is logged in and if they have responded
  const session = await getSession();
  
  const result = await getPublicFormBySlug(params.slug, session?.userId);
  if (!result) return notFound();
  
  let user = null;
  if (session?.userId) {
    user = await prisma.user.findUnique({ where: { id: session.userId } });
  }
  
  const { form, hasResponded } = result;

  return (
    <ProfileColorExtractor ign={user?.ign || "Steve"} fallbackColor="#8b5cf6">
      <div className="min-h-screen relative overflow-hidden">
        <DynamicBackground color="var(--profile-glow)" spacing={64} position="fixed" />

        <div className="max-w-3xl mx-auto px-4 relative z-10 pb-20 pt-12">
          <FormRenderer 
            form={form} 
            hasResponded={hasResponded} 
            isLoggedIn={!!session?.userId} 
            user={user}
          />
        </div>
      </div>
    </ProfileColorExtractor>
  );
}
