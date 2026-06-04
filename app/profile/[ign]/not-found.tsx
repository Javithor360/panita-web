import Link from 'next/link'
import { DynamicBackground } from '@/components/ui/DynamicBackground'

export default function ProfileNotFound() {
  return (
    <div className="w-full relative z-10 pb-16 min-h-[calc(100vh-4rem)]">
      <DynamicBackground color="var(--muted-foreground)" spacing={64} position="absolute" />
      
      {/* Banner Gris */}
      <div className="h-48 md:h-64 w-full bg-secondary/20 border-b border-border/50 relative overflow-hidden" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 flex flex-col items-center">
          {/* Avatar de Steve Gris */}
          <div className="rounded-full border-4 border-card bg-secondary/10 overflow-hidden h-40 w-40 sm:h-48 sm:w-48 shadow-xl transition-all duration-500 opacity-60 grayscale">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/steve.svg"
              alt="Avatar Desconocido"
              className="w-full h-full object-cover opacity-80"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-muted-foreground/80">Jugador Desconocido</h1>

          <div className="mt-12 w-full max-w-md border border-dashed border-border/60 bg-secondary/5 rounded-2xl p-8 text-center flex flex-col items-center gap-4">
            <h2 className="text-xl font-medium text-foreground/80">Este perfil no existe</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              No logramos ubicar a nadie con este nombre en los registros del servidor. Es probable que no forme parte de Panitacraft.
            </p>
            <Link 
              href="/" 
              className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-secondary/40 px-6 text-sm font-medium transition-colors hover:bg-secondary/60 focus-visible:outline-none"
            >
              Volver a la página principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
