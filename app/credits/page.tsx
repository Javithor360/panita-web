import { HeartIcon } from "lucide-react"
import { DynamicBackground } from "@/components/ui/DynamicBackground"

export const metadata = {
  title: "Agradecimientos | Panitacraft",
  description: "Agradecimientos especiales a todos los que hicieron esto posible",
}

export default function AgradecimientosPage() {
  return (
    <>
      <DynamicBackground />
      <div className="relative z-10 container mx-auto max-w-4xl px-4 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/20">
            <HeartIcon className="h-12 w-12 text-red-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Agradecimientos Especiales
            </h1>
            <p className="text-xl text-muted-foreground">
              A toda la comunidad y a los que hacen posible Panitacraft.
            </p>
          </div>
        </div>

        <div className="mt-16 prose prose-lg prose-invert mx-auto text-center">
          <p>
            Esta galería y museo digital ha sido un esfuerzo conjunto para preservar los mejores momentos
            de todas las ediciones. Queremos extender nuestro más sincero agradecimiento a cada uno de
            los jugadores, administradores, constructores y creadores de contenido que han dedicado su
            tiempo a construir esta historia con nosotros.
          </p>
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/80">
              Próximamente más detalles...
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
