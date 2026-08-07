import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Inicio de Sesión - Panitacraft",
  description: "Accede a tu cuenta con tus credenciales ingresadas al momento de activar tu cuenta",
  openGraph: {
    title: "Inicio de Sesión",
    description: "Accede a tu cuenta con tus credenciales ingresadas al momento de activar tu cuenta",
    siteName: "Panitacraft",
    url: "https://panita.vercel.app/login",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inicio de Sesión",
    description: "Accede a tu cuenta con tus credenciales ingresadas al momento de activar tu cuenta",
  }
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
