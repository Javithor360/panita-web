import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, ArrowRight, PlayCircle } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogClose } from "@/components/ui/dialog"

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden">
      {/* Background patterns and glowing effects */}
      <div className="absolute inset-0 -z-10 bg-[oklch(0.15_0_0)]" 
           style={{
             backgroundImage: `radial-gradient(circle at center, color-mix(in oklab, var(--foreground) 10%, transparent) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }}
      />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px] opacity-70" />

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-3 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-full bg-[#1c1c1c] p-6 ring-1 ring-primary/20 shadow-[0_0_50px_-12px_var(--primary)]">
              <img src="/assets/logo_white.svg" alt="Panitacraft Logo" className="h-24 w-24 md:h-32 md:w-32 drop-shadow-md transition-transform hover:scale-105 duration-500 select-none pointer-events-none" />
            </div>
          </div>

          {/* Headlines */}
          <div className="mx-auto max-w-[800px] space-y-6 mt-4">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Panitacraft <br className="hidden sm:block" />
              
            </h1>
            <p className="mx-auto max-w-[600px] text-lg font-medium text-muted-foreground sm:text-base md:text-lg">
              Descubre todos los recuerdos a través de las distintas ediciones. Una comunidad que perdura en el tiempo.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Dialog>
              <DialogTrigger render={<Button size="lg" className="h-14 gap-2 px-8 text-lg font-semibold transition-transform hover:scale-105 cursor-pointer bg-[#8b3122] hover:bg-[#6d251a] text-white" />}>
                <img src="/assets/edition_logos/icon_tezzlar3.png" alt="Tezzlar 3 Logo" className="h-6 w-6 object-contain" />
                Ver Tráiler
              </DialogTrigger>
              <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[80%] w-full p-1 sm:p-2 bg-black border-zinc-800">
                <DialogHeader className="sr-only">
                  <DialogTitle>Tráiler de Panitacraft</DialogTitle>
                  <DialogDescription>Video promocional de las distintas ediciones de Panitacraft</DialogDescription>
                </DialogHeader>
                <div className="aspect-video w-full rounded-md overflow-hidden bg-black/50">
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
                <div className="pt-2 pb-1 flex justify-center">
                  <DialogClose render={<Button className="bg-white !text-black hover:bg-zinc-200 hover:!text-black font-semibold px-8 cursor-pointer" />}>
                    Cerrar
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            <Link href="/gallery">
              <Button size="lg" className="h-14 gap-2 px-8 text-lg font-semibold transition-transform hover:scale-105 hover:bg-primary/90 cursor-pointer">
                Visitar galería
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
