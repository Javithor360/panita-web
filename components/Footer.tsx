import Link from "next/link"
import { ImageIcon } from "lucide-react"

export const DiscordIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 127.14 96.36" 
    fill="currentColor" 
    className={className}
  >
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.18,46,96.06,53,91,65.69,84.69,65.69Z" />
  </svg>
)

const PayPalIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 16 16" 
    fill="currentColor" 
    className={className}
  >
    <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z"/>
  </svg>
)

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/40 bg-background py-10">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-8">
        
        {/* Left - Logo and Copyright */}
        <div className="flex flex-col items-center gap-4 sm:items-start">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <img src="/assets/logo_white.svg" alt="Panitacraft" className="h-7 w-7" />
            <span className="font-bold tracking-tight text-lg">Panitacraft</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground sm:items-start sm:text-left">
            <p>© {new Date().getFullYear()} Panitacraft. Todos los derechos reservados.</p>
            <div className="flex flex-row items-center justify-center sm:justify-start gap-2">
              <p>Hecho por Javithor & Aerø</p>
              <span className="text-muted-foreground/50 hidden sm:inline-block">•</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors hover:underline underline-offset-4">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>

        {/* Right - Social Media */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-3">
          <a
            href="https://discord.gg/m9zFH8yqUu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            aria-label="Únete a nuestra comunidad de Discord"
          >
            <DiscordIcon className="h-5 w-5" />
          </a>
          <a
            href="https://www.paypal.me/Javithor360"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            aria-label="Apoya al servidor con una donación"
          >
            <PayPalIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
