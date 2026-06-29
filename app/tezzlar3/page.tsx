import { CountdownTimer } from "@/components/CountdownTimer"
import Link from "next/link"
import { ArrowLeft, Swords, Sparkles, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DynamicBackground } from "@/components/ui/DynamicBackground"
import { DiscordIcon } from "@/components/Footer"
import { ScrollToTopButton } from "@/components/ScrollToTopButton"

export default function Tezzlar3Page() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background patterns matching homepage */}
      <DynamicBackground pattern="stars" spacing={48} color="#5FE2C5" position="absolute" />
      <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] opacity-70" />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-white cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Volver al Inicio
            </Button>
          </Link>
        </div>

        {/* 1. Timer sin hover épico y con titulo blanco */}
        <div className="mb-12">
          <CountdownTimer plainTitle theme="cyan" />
        </div>

        {/* 2. Trailer */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/DgSIYtxt_jE?autoplay=1" 
              title="Tráiler Promocional" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen>
            </iframe>
          </div>
        </div>

        {/* 3. Titulo y Descripción (Caja sutil) */}
        <div className="max-w-4xl mx-auto text-center mb-16 py-8 px-6 sm:py-10 sm:px-10 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md shadow-lg flex flex-col items-center justify-center gap-6">
          <h1 className="text-5xl md:text-7xl font-minecraft text-center tracking-tight bg-gradient-to-b from-[#5FE2C5] via-[#C6DEF1] to-[#5FE2C5] text-transparent bg-clip-text drop-shadow-[0_4px_4px_#0D1E40]">
            Tezzlar III
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-medium">
            Este 2026, llega la tercera edición Tezzlar para desafiarnos en una aventura hardcore durante todo el mes de julio, con misiones, cambios de dificultad y trabajo en equipo. 
          </p>
        </div>
        
        {/* 4. Desafío Flotante */}
        <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(95,226,197,0.3)] tracking-tight uppercase">
            ¿Estás listo para afrontar el reto?
          </h2>
          <p className="text-lg text-[#5FE2C5] font-semibold tracking-widest uppercase">
            Pero antes de continuar, esto es todo lo que debes saber
          </p>
        </div>

        {/* 5. Mecánicas Básicas */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
            <div className="p-2 bg-[#5FE2C5]/10 rounded-lg border border-[#5FE2C5]/20 shadow-[0_0_15px_rgba(95,226,197,0.2)]">
              <Swords className="w-6 h-6 text-[#5FE2C5]" />
            </div>
            Mecánicas Básicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 1, title: "Modo Semi-Hardcore", desc: "Comenzarás con una cantidad de vidas limitadas. Cada muerte tendrá severas penalizaciones, elevando la tensión de tu supervivencia al máximo.", icon: "/assets/texture_icons/hardcore_heart.webp", titleColor: "text-rose-400", descColor: "text-rose-200/70", colorClass: "bg-rose-500/10 border-rose-500/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.15)] hover:bg-rose-500/20 hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]" },
              { id: 2, title: "Dificultad Progresiva", desc: "El entorno mutará diariamente. Prepárate para modificaciones sorpresivas en las mecánicas del juego y un incremento constante en la hostilidad del mundo.", icon: "/assets/texture_icons/bone.webp", titleColor: "text-slate-200", descColor: "text-slate-400/80", colorClass: "bg-slate-300/10 border-slate-300/20 shadow-[inset_0_0_20px_rgba(203,213,225,0.15)] hover:bg-slate-300/20 hover:border-slate-300/40 hover:shadow-[0_0_30px_rgba(203,213,225,0.25)]" },
              { id: 3, title: "Supervivencia Cooperativa", desc: "Aquí nadie se salva solo. Tu mayor recurso será la comunidad; todos los jugadores conformarán un único bando para protegerse, colaborar y sobrevivir juntos.", icon: "/assets/texture_icons/bow.webp", titleColor: "text-amber-400", descColor: "text-amber-200/70", colorClass: "bg-amber-500/10 border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.15)] hover:bg-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]" },
              { id: 4, title: "Sistema de Misiones", desc: "Enfrenta eventos dinámicos de tiempo limitado. Completarlos otorgará valiosas recompensas a todo el equipo, pero fracasar desatará castigos implacables.", icon: "/assets/texture_icons/ominius_key.webp", titleColor: "text-orange-400", descColor: "text-orange-200/70", colorClass: "bg-orange-500/10 border-orange-500/20 shadow-[inset_0_0_20px_rgba(249,115,22,0.15)] hover:bg-orange-500/20 hover:border-orange-500/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]" }
            ].map((item) => (
              <div key={item.id} className={`group p-6 rounded-xl border backdrop-blur-md transition-all duration-500 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-4 sm:gap-6 cursor-pointer ${item.colorClass}`}>
                <div className="shrink-0 rounded-lg bg-black/40 p-4 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                  <img src={item.icon} alt={item.title} className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 transition-colors ${item.titleColor}`}>{item.title}</h3>
                  <p className={`transition-colors group-hover:text-white ${item.descColor}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Requisitos */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
            <div className="p-2 bg-[#5FE2C5]/10 rounded-lg border border-[#5FE2C5]/20 shadow-[0_0_15px_rgba(95,226,197,0.2)]">
              <ShieldAlert className="w-6 h-6 text-[#5FE2C5]" />
            </div>
            Requisitos
          </h2>
          <div className="p-8 sm:p-10 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
            <ul className="space-y-6 text-zinc-300 text-lg">
              <li className="flex items-start gap-4">
                <div className="mt-2.5 h-2 w-2 rounded-full bg-[#5FE2C5] shrink-0 shadow-[0_0_10px_#5FE2C5]" />
                <p className="leading-relaxed">
                  Únete a nuestro <a href="https://discord.gg/m9zFH8yqUu" target="_blank" rel="noopener noreferrer" className="text-[#5FE2C5] hover:text-white font-bold transition-colors underline decoration-[#5FE2C5]/30 underline-offset-4">servidor de Discord</a> y crea tu cuenta para asegurar tu registro en la whitelist oficial del evento.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-2.5 h-2 w-2 rounded-full bg-[#5FE2C5] shrink-0 shadow-[0_0_10px_#5FE2C5]" />
                <p className="leading-relaxed">
                  Mantén una actividad constante. Aunque no es obligatorio jugar a diario, perderás tu lugar si acumulas <span className="text-[#5FE2C5] font-bold drop-shadow-[0_0_8px_rgba(95,226,197,0.4)]">más de 5 días</span> consecutivos sin conectarte.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-2.5 h-2 w-2 rounded-full bg-[#5FE2C5] shrink-0 shadow-[0_0_10px_#5FE2C5]" />
                <p className="leading-relaxed">
                  Prepárate mentalmente para el desafío final: el evento tiene una duración exacta de <span className="text-[#5FE2C5] font-bold drop-shadow-[0_0_8px_rgba(95,226,197,0.4)]">31 días</span> enfocados puramente en la supervivencia.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* 7. Comandos Discord */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
            <div className="p-2 bg-[#5FE2C5]/10 rounded-lg border border-[#5FE2C5]/20 shadow-[0_0_15px_rgba(95,226,197,0.2)]">
              <Sparkles className="w-6 h-6 text-[#5FE2C5]" />
            </div>
            Comandos de Discord
          </h2>
          <div className="p-6 md:p-8 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
            <ul className="space-y-6">
              {[
                { cmd: "/registrar", extra: "Slash Command", desc: "Crea tu perfil de usuario y te registra en la whitelist del servidor." },
                { cmd: "!tezzlar day <número>", desc: "Te muestra de manera resumida los cambios de un día específico por si necesitas recordarlos." },
                { cmd: "!ip", desc: "Te comparte la dirección IP del servidor para conectarte." },
                { cmd: "!donar", desc: "Te comparte la URL para realizar aportes económicos y apoyar el proyecto." }
              ].map((item, i) => (
                <li key={i} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 text-zinc-300">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-[#5FE2C5] bg-[#5FE2C5]/10 px-3 py-1.5 rounded-md border border-[#5FE2C5]/20 shadow-[0_0_10px_rgba(95,226,197,0.1)]">
                      {item.cmd}
                    </span>
                    <span className="text-zinc-600 hidden md:inline ml-2">➔</span>
                  </div>
                  <span className="mt-1 md:mt-0 leading-relaxed text-lg flex flex-wrap items-center gap-3">
                    {item.desc}
                    {item.extra && (
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/10">
                        {item.extra}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 8. Soporte */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
            <div className="p-2 bg-[#5FE2C5]/10 rounded-lg border border-[#5FE2C5]/20 shadow-[0_0_15px_rgba(95,226,197,0.2)]">
              <DiscordIcon className="w-6 h-6 text-[#5FE2C5]" />
            </div>
            Soporte y Asistencia
          </h2>
          <div className="p-8 md:p-12 rounded-2xl border border-white/10 bg-gradient-to-b from-black/40 to-black/80 backdrop-blur-xl shadow-2xl text-center">
            <h3 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <DiscordIcon className="w-8 h-8 text-white" />
              ¿Necesitas ayuda adicional?
            </h3>
            <p className="text-zinc-400 mb-8 max-w-2xl mx-auto text-lg">
              Si tienes problemas técnicos o requieres soporte, el equipo del staff está disponible para ayudarte.
            </p>
            <a 
              href="https://discord.com/channels/707103390852710491/1406385534712156301/1521266058206511146" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold h-14 px-8 text-lg cursor-pointer transition-colors shadow-[0_0_15px_rgba(88,101,242,0.4)]">
                Abrir Ticket
              </Button>
            </a>
          </div>
        </section>

      </div>
      
      <ScrollToTopButton />
    </div>
  )
}
