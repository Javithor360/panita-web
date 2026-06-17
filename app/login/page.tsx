'use client'

import { useActionState, useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { User, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const initialState = {
  error: null as string | null,
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4">
      {/* Background patterns and glowing effects from LP */}
      <div className="absolute inset-0 -z-10 bg-[oklch(0.15_0_0)]" 
           style={{
             backgroundImage: `radial-gradient(circle at center, color-mix(in oklab, var(--foreground) 10%, transparent) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }}
      />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px] opacity-70" />

      <div className="w-full max-w-md space-y-8 rounded-xl border border-border/50 bg-card/80 backdrop-blur-md p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Iniciar Sesión</h2>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          {state?.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="ign" className="block text-sm font-medium mb-1.5">
                Nombre de Jugador
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="ml-2 h-4 w-px bg-border"></span>
                </div>
                <input
                  id="ign"
                  name="ign"
                  type="text"
                  required
                  className="block w-full rounded-md border border-input bg-background/80 pl-12 pr-3 py-2.5 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                  placeholder="Ej. Javithor360"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Contraseña
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  <span className="ml-2 h-4 w-px bg-border"></span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-md border border-input bg-background/80 pl-12 pr-10 py-2.5 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full h-11 text-base font-medium hover:bg-primary/90 cursor-pointer" disabled={isPending}>
              {isPending ? 'Ingresando...' : (
                <>
                  Ingresar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Necesitas ayuda?{' '}
          <Link href="https://discord.com/channels/707103390852710491/707103391167545414/1516923530359607388" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
            Abre ticket
          </Link>
        </p>
      </div>
    </div>
  )
}
