import { ChevronDownIcon, HandHeartIcon } from "lucide-react"
import { DynamicBackground } from "@/components/ui/DynamicBackground"
import { CreditsSections, UserCard } from "@/components/credits/CreditsSections"
import prisma from "@/lib/prisma"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

export const metadata = {
  title: "Agradecimientos | Panitacraft",
  description: "Agradecimientos especiales a todos los que hicieron esto posible",
}

// ! -------------------------------------------------------------
// ! Hardcoded Local User Descriptions
// ! -------------------------------------------------------------
// ! Using numeric id as key (which is unmutable in the database).

const STAFF_DESCRIPTIONS: Record<string, string> = {
  1: "<p class='text-center'>Asistente consultor de programación y tester.</p><br><ul><li>Programador web y de plugins</li><li>Consultor de diseño y desarrollo</li></ul>",
  2: "<p class='text-center'>Administrador asistente. Mano derecha del administrador principal. Organizador de ideas y colaborador en testeos multi-tareas.</p><br><ul><li>Encargado creativo</li><li>Constructor</li><li>Diseñador gráfico</li><li>Moderador del servidor de Minecraft</li><li>Soporte y atención de tickets</li><li>Supervisor del host</li></ul>",
  4: "<p class='text-center'>Administrador principal de todo el servidor. Encargado de múltiples funciones de organización, planificación y desarrollo de los proyectos.</p><br><ul><li>Moderador del servidor de Minecraft</li><li>Encargado del servidor de Discord</li><li>Soporte y atención de tickets</li><li>Programador fullstack web y plugins</li><li>Organizador de eventos</li><li>Supervisor del host</li></ul>",
  6: "<p class='text-center'>Moderador activo con la comunidad</p><br><ul><li>Asistente creativo</li><li>Constructor</li><li>Diseñador gráfico</li><li>Moderador del servidor de Minecraft</li><li>Soporte y atención de tickets</li></ul>",
};

const DONATOR_DESCRIPTIONS: Record<string, string> = {
  2: "<p class='text-center'>Ha dejado su aporte para el mantenimiento y seguimiento de Panitacraft en las siguientes ediciones:</p><br><ul><li>Panitacraft 2.75</li></ul>",
  3: "<p class='text-center'>Ha dejado su aporte para el mantenimiento y seguimiento de Panitacraft en las siguientes ediciones:</p><br><ul><li>Panitacraft 2.75</li></ul>",
  10: "<p class='text-center'>Ha dejado su aporte para el mantenimiento y seguimiento de Panitacraft en las siguientes ediciones:</p><br><ul><li>AllThePanitas</li><li>Panitacraft 2.75</li></ul>",
  15: "<p class='text-center'>Ha dejado su aporte para el mantenimiento y seguimiento de Panitacraft en las siguientes ediciones:</p><br><ul><li>AllThePanitas</li></ul>",
  16: "<p class='text-center'>Ha dejado su aporte para el mantenimiento y seguimiento de Panitacraft en las siguientes ediciones:</p><br><ul><li>Tezzlar</li><li>Panitacraft 2.75</li></ul>",
  17: "<p class='text-center'>Ha dejado su aporte para el mantenimiento y seguimiento de Panitacraft en las siguientes ediciones:</p><br><ul><li>Panitacraft 2.75</li><li>Panitamon</li></ul>",
  19: "<p class='text-center'>Ha dejado su aporte para el mantenimiento y seguimiento de Panitacraft en las siguientes ediciones:</p><br><ul><li>Panitacraft 2.75</li></ul>",
  39: "<p class='text-center'>Ha dejado su aporte para el mantenimiento y seguimiento de Panitacraft en las siguientes ediciones:</p><br><ul><li>Panitacraft 2.75</li></ul>",
};

// Default descriptions
const DEFAULT_STAFF_DESCRIPTION = "<p class='text-center'>Contribuidor esencial para la planificación y desarrollo de Panitacraft.</p>";
const DEFAULT_DONATOR_DESCRIPTION = "<p class='text-center'>Contrubución de gran valor para el seguidimiento de Panitacraft.</p>";

export default async function AgradecimientosPage() {
  const users = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          id: { in: ['donor', 'patron', 'admin', 'mod'] }
        }
      }
    },
    include: {
      roles: true
    }
  });

  const allCreditsData = users.map((u) => {
    return { 
      ...u, 
      discordAvatar: "" // Will be fetched client-side
    };
  });

  const donatorsData = allCreditsData
    .filter(u => u.roles.some(r => r.id === 'donor' || r.id === 'patron'))
    .map(u => {
      const isDonor = u.roles.some(r => r.id === 'donor');
      const activeRole = u.roles.find(r => r.id === (isDonor ? 'donor' : 'patron'));
      return {
        id: String(u.id),
        ign: u.ign || u.discord_name,
        discordName: `@${u.discord_name}`,
        discordId: u.discord_id,
        discordAvatar: u.discordAvatar,
        role: activeRole?.id,
        roleName: activeRole?.name,
        roleColor: activeRole?.color,
        description: DONATOR_DESCRIPTIONS[String(u.id)] || DEFAULT_DONATOR_DESCRIPTION
      };
    });

  const staffData = allCreditsData
    .filter(u => u.roles.some(r => r.id === 'admin' || r.id === 'mod'))
    .map(u => {
      const isAdmin = u.roles.some(r => r.id === 'admin');
      const activeRole = u.roles.find(r => r.id === (isAdmin ? 'admin' : 'mod'));
      return {
        id: String(u.id),
        ign: u.ign || u.discord_name,
        discordName: `@${u.discord_name}`,
        discordId: u.discord_id,
        discordAvatar: u.discordAvatar,
        role: activeRole?.id,
        roleName: activeRole?.name,
        roleColor: activeRole?.color,
        description: STAFF_DESCRIPTIONS[String(u.id)] || DEFAULT_STAFF_DESCRIPTION
      };
    });

  // Sort staff: admin first, then mod
  staffData.sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return 0;
  });

  // -------------------------------------------------------------
  // Panita del Mes Logic (Deterministic Pseudo-Random)
  // -------------------------------------------------------------
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const eligiblePanitas = await prisma.user.findMany({
    where: {
      joined_at: { lt: sixMonthsAgo },
      roles: { some: {} }
    },
    include: { roles: true }
  });

  let panitaOfTheMonth = null;

  if (eligiblePanitas.length > 0) {
    // Sort consistently by ID so the list is always identical
    eligiblePanitas.sort((a, b) => Number(a.id) - Number(b.id));
    
    const now = new Date();
    // Seed based on Year and Month (e.g. 202606)
    const seed = now.getFullYear() * 100 + now.getMonth();
    
    // Simple fast seeded PRNG
    const x = Math.sin(seed) * 10000;
    const randomIndex = Math.floor((x - Math.floor(x)) * eligiblePanitas.length);
    
    const panita = eligiblePanitas[randomIndex];
    
    // Get highest community role (excluding staff and donators)
    const communityRoles = panita.roles
      .filter(r => !['admin', 'mod', 'donor', 'patron'].includes(r.id))
      .sort((a, b) => (b.position || 0) - (a.position || 0));
      
    const activeRole = communityRoles[0] || panita.roles[0]; // fallback
    
    let pAvatar = ""; // Will be fetched client-side

    const joinedDateRaw = panita.joined_at ? new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(panita.joined_at) : 'desconocido';
    
    panitaOfTheMonth = {
      id: String(panita.id),
      ign: panita.ign || panita.discord_name,
      discordName: `@${panita.discord_name}`,
      discordId: panita.discord_id,
      discordAvatar: pAvatar,
      role: activeRole?.id,
      roleName: 'Panita del Mes',
      originalRoleName: activeRole?.name || 'Miembro',
      roleColor: '#818cf8', // Indigo 400 for the text glow
      joinedAt: joinedDateRaw.charAt(0).toUpperCase() + joinedDateRaw.slice(1) // Capitalize month
    };
  }

  return (
    <>
      <DynamicBackground />
      <div className="fixed inset-0 bg-black/40 pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col overflow-x-hidden w-full">
        {/* Full Screen Hero Section */}
        <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative px-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <HandHeartIcon className="h-28 w-28 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            
            <div className="flex flex-col items-center space-y-4 max-w-4xl w-full">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Agradecimientos Especiales
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl">
                A toda la comunidad y a los que hacen posible Panitacraft.
              </p>
            </div>
          </div>
          
          <a 
            href="#credits-content" 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 p-4 text-muted-foreground hover:text-foreground transition-colors animate-bounce"
            aria-label="Ver agradecimientos"
          >
            <ChevronDownIcon className="h-10 w-10 opacity-70" />
          </a>
        </div>

        {/* Content Section */}
        <div id="credits-content" className="w-full flex flex-col items-center pb-24 pt-12">
          {/* Las nuevas secciones interactivas: Donadores y Staff */}
          <CreditsSections donators={donatorsData} staffMembers={staffData} />

          <div className="mt-32 w-full flex flex-col items-center relative">
            <ScrollReveal delay={200}>
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="max-w-3xl mx-auto text-center space-y-8 text-lg text-muted-foreground leading-relaxed px-4">
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-sm pb-1">
                  Nuestra Increíble Comunidad
                </h3>
                <p className="font-medium">
                  Los jugadores son el pilar esencial de la comunidad que permiten seguir motivados a proponer nuevos proyectos. Sin ustedes, nada de esto sería posible. El factor social ha conformado una comunidad única con lazos de amistad y poder disfrutar el juego sin importar el paso del tiempo, a ustedes son quienes mayormente agradecemos por ser leales y apoyar siempre e invitar a sus amigos.
                </p>
              </div>
            </ScrollReveal>
            
            {/* Panita del Mes Section */}
            {panitaOfTheMonth && (
              <ScrollReveal delay={400}>
                <div className="mt-6 flex flex-col items-center gap-4 relative z-20">
                  <Dialog>
                    <DialogTrigger 
                      nativeButton={false} 
                      render={<div className="relative group mt-6 inline-block cursor-pointer" />}
                    >
                      <UserCard user={panitaOfTheMonth} disableModal isPanita />
                    </DialogTrigger>
                    <DialogContent showCloseButton={false} className="sm:max-w-2xl md:max-w-3xl w-full border-indigo-500/30 bg-card/95 backdrop-blur-md p-6 sm:p-8">
                      <DialogClose render={<button className="absolute top-4 right-4 rounded-full p-2 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground outline-none cursor-pointer" />}>
                        <XIcon className="h-6 w-6" />
                        <span className="sr-only">Cerrar</span>
                      </DialogClose>
                      
                      <DialogHeader className="space-y-0">
                        <DialogTitle className="text-2xl font-bold text-white text-center sm:text-left pb-3">
                          Panita del Mes
                        </DialogTitle>
                        <hr className="border-border/50 w-full" />
                        <DialogDescription render={<div />} className="text-base text-muted-foreground pt-4 pb-4 space-y-4 text-left">
                          <p>
                            El título de <span className="font-bold bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">Panita del mes</span> es un pequeño homenaje otorgado a los jugadores de la comunidad.
                          </p>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>El sistema elige al afortunado de manera completamente <strong>aleatoria</strong> entre todos los usuarios.</li>
                            <li>Necesitas tener el rango de <strong>Miembro</strong> o superior.</li>
                            <li>También requieres al menos <strong>6 meses de antigüedad</strong> desde tu ingreso.</li>
                            <li>La ruleta se reinicia cada primero de mes.</li>
                          </ul>
                          <p className="text-muted-foreground">
                            ¡Quién sabe, quizá tú seas el próximo! ¡Mantente alerta!
                          </p>
                        </DialogDescription>
                      </DialogHeader>
                      
                      <hr className="border-border/50 w-full" />
                      
                      <div className="pt-4 flex justify-center sm:justify-end">
                        <DialogClose render={<Button className="w-full sm:w-auto px-6 py-2 text-sm font-medium cursor-pointer" />}>
                          ¡Entendido!
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
