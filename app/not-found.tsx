import Link from 'next/link'
import { DynamicBackground } from '@/components/ui/DynamicBackground'
import { Compass } from 'lucide-react'

export default function GlobalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 relative overflow-hidden">
      <DynamicBackground color="var(--primary)" spacing={64} position="absolute" />
      
      <div className="relative z-10 flex flex-col items-center gap-6 bg-card/40 p-10 sm:p-14 rounded-3xl backdrop-blur-md border border-border/50 shadow-2xl max-w-lg w-full">
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-2">
          <Compass className="w-12 h-12 text-primary" style={{ animation: 'spin 4s linear infinite' }} />
          <div className="absolute inset-0 rounded-full border border-primary/30" style={{ animation: 'spin 10s linear infinite reverse' }} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-7xl font-bold tracking-tighter bg-gradient-to-br from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent drop-shadow-sm font-minecraft">404</h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Te has perdido en el vaci...</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Las coordenadas que buscaste no pertenecen a este mapa. ¡Revisa si no has ido en la direccion correcta!
            </p>
          </div>
        </div>
        
        <Link 
          href="/" 
          className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_var(--primary)]"
        >
          Volver al Spawn
        </Link>
      </div>
    </div>
  )
}
