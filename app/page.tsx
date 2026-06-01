import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden">
      {/* Background patterns and glowing effects */}
      <div className="absolute inset-0 -z-10 bg-[url('/bg-pattern.svg')] bg-[length:32px_32px] opacity-[0.2]" />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-3 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* Big Imagotype */}
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-full bg-primary/10 p-6 ring-1 ring-primary/20">
              <ImageIcon className="h-20 w-20 text-primary md:h-24 md:w-24" />
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
          <div className="pt-4">
            <Link href="/gallery">
              <Button size="lg" className="h-14 gap-2 px-8 text-lg font-semibold transition-transform hover:scale-105 hover:bg-primary/90">
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
