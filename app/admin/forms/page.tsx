import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FormsManager } from "./FormsManager";

export default async function AdminFormsPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { roles: true }
  });

  if (!user || !user.roles.some((r) => r.id === 'admin' || r.id === 'mod')) {
    redirect('/profile');
  }

  return (
    <div className="min-h-screen pb-20 bg-background relative">
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% -20%, rgba(139, 92, 246, 0.25), transparent 70%),
            radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '100% 100%, 28px 28px',
          backgroundPosition: 'center center'
        }}
      />

      <div 
        className="h-48 md:h-64 w-full relative overflow-hidden bg-gradient-to-r from-violet-950 via-violet-900 to-violet-600 z-10 shadow-lg"
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
          <h1 className="text-3xl md:text-5xl font-bold tracking-widest drop-shadow-lg text-center mb-2">
            GESTIÓN DE FORMULARIOS
          </h1>
          <p className="text-white/80 max-w-2xl text-center">
            Crea encuestas, recolecta opiniones y administra todos los formularios activos del servidor.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <FormsManager />
      </div>
    </div>
  );
}
