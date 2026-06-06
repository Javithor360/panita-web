import { ShieldCheck } from "lucide-react"
import { DynamicBackground } from "@/components/ui/DynamicBackground"

export const metadata = {
  title: "Política de Privacidad | Panitacraft",
  description: "Política de privacidad y manejo de datos de la plataforma.",
}

export default function PrivacyPage() {
  return (
    <>
      <DynamicBackground />
      <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-8 lg:py-24 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 mb-12">
          <div className="rounded-full bg-primary/10 p-4 ring-1 ring-primary/20">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <div className="flex flex-col items-center space-y-4 w-full">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-center">
              Política de Privacidad
            </h1>
            <p className="text-xl text-muted-foreground text-center">
              Información clara y transparente sobre el manejo de datos en la plataforma.
            </p>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-md border border-border shadow-sm rounded-2xl p-6 sm:p-12 space-y-8 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 relative z-20">
          <section className="space-y-4">
            <p>
              El presente documento tiene como objetivo explicar de forma sencilla y transparente qué información se recopila, de qué forma se utiliza y cuáles son los derechos de los usuarios al utilizar los servicios de <strong>Panitacraft</strong>. Se busca garantizar un entorno seguro y confiable para toda la comunidad.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. ¿Qué información se recopila?</h2>
            <p>Al utilizar la plataforma, se recopila la siguiente información específica:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Datos de plataformas conectadas:</strong> Se recopila información obtenida directamente a través de Discord (nombres de usuario y fotografías de perfil) y de Minecraft (nombre de usuario asociado).</li>
              <li><strong>Información de acceso:</strong> La contraseña utilizada para el ingreso a la cuenta dentro de la plataforma web.</li>
              <li><strong>Contenido aportado por el usuario:</strong> La colección de imágenes y fotografías que los usuarios suben voluntariamente a la galería de la web o que comparten a través de la comunidad en Discord.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Uso de la información</h2>
            <p>Los datos recopilados se utilizan única y exclusivamente para el funcionamiento de la plataforma. Concretamente, se emplean para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear y gestionar las cuentas de usuario, así como mantener el estado de la sesión activa.</li>
              <li>Identificar a los usuarios en las secciones públicas de la web (como la galería de imágenes).</li>
              <li>Mostrar el contenido multimedia que los usuarios deciden compartir públicamente de forma voluntaria.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Servicios de terceros</h2>
            <p>
              <strong>La información recopilada no se vende ni se comparte con fines comerciales o publicitarios.</strong> Sin embargo, para mantener la infraestructura técnica de la página web operativa, se hace uso de servicios externos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Alojamiento y bases de datos:</strong> Se emplean servicios como Vercel y Supabase para alojar la web y resguardar las credenciales e información de las cuentas de forma segura.</li>
              <li><strong>Gestión de imágenes:</strong> Se utiliza el servicio Cloudinary para procesar y almacenar de manera optimizada las imágenes que son subidas voluntariamente a la galería.</li>
            </ul>
            <p>La información únicamente sería revelada a terceros en el caso estricto de existir un requerimiento legal de cumplimiento obligatorio.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Derechos del usuario</h2>
            <p>Todo usuario es dueño de su información personal. Se contemplan los siguientes derechos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El derecho a actualizar o modificar la información mostrada en el perfil.</li>
              <li>El derecho a solicitar la <strong>eliminación total de la cuenta</strong> y de todo el contenido asociado a la misma (imágenes, comentarios, historial, etc.).</li>
            </ul>
            <p className="text-sm text-muted-foreground/80 italic mt-6 flex items-start gap-2">
              <span className="text-base not-italic">⚠️</span>
              <span>
                Todo trámite relacionado con la privacidad, rectificación o la eliminación de datos debe ser gestionado a través de un ticket de soporte en el servidor oficial de Discord.
              </span>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Uso de Cookies</h2>
            <p>
              Únicamente se utilizan &quot;cookies&quot; técnicas esenciales. Su función exclusiva es mantener la sesión de usuario activa para evitar requerir las credenciales de acceso constantemente. No se emplean cookies de rastreo, analítica invasiva ni publicidad de terceros.
            </p>
          </section>

          <p className="text-sm text-muted-foreground pt-8 border-t border-border">
            Última actualización: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </>
  )
}
