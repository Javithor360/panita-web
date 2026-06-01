import Link from "next/link"
import { ImageIcon } from "lucide-react"

// Ícono de Discord simplificado usando un SVG personalizado (o se puede usar uno de una librería de iconos en el futuro)
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 127.14 96.36" 
    fill="currentColor" 
    className={className}
  >
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.18,46,96.06,53,91,65.69,84.69,65.69Z" />
  </svg>
)

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-10">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-8">
        
        {/* Izquierda - Logo y Copyright */}
        <div className="flex flex-col items-center gap-4 sm:items-start">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <ImageIcon className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight">Panitacraft</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground sm:items-start sm:text-left">
            <p>© {new Date().getFullYear()} Panitacraft. Todos los derechos reservados.</p>
            <p>Diseñado y desarrollado para la comunidad.</p>
          </div>
        </div>

        {/* Derecha - Enlaces sociales */}
        <div className="flex items-center justify-center">
          <a
            href="https://discord.gg/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            aria-label="Únete a nuestro Discord"
          >
            <DiscordIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
