import { Image as ImageIcon } from "lucide-react"
import { DynamicBackground } from "@/components/ui/DynamicBackground"

export const metadata = {
  title: "Historia | Panitacraft",
  description: "La historia detrás de las ediciones de Panitacraft",
}

export default function AboutPage() {
  return (
    <>
      <DynamicBackground />
      <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-8 lg:py-24">
      <div className="flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="rounded-full bg-primary/10 p-4 ring-1 ring-primary/20">
          <ImageIcon className="h-12 w-12 text-primary" />
        </div>
        <div className="flex flex-col items-center space-y-4 w-full">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-center">
            Historia de Panitacraft
          </h1>
          <p className="text-xl text-muted-foreground text-center">
            Desde un grupo de jóvenes amigos a una comunidad llena de recuerdos.
          </p>
        </div>
      </div>

      <div className="mt-16 max-w-3xl mx-auto text-center space-y-6 text-lg text-muted-foreground leading-relaxed">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam augue mi, euismod ac sagittis non, posuere sed turpis. Ut eu lacinia ipsum. Integer ac dolor vitae eros mollis hendrerit non ut elit. Nam fringilla, nulla non euismod porttitor, sem urna varius quam, et eleifend odio mi ac augue. Proin ornare felis non sapien dignissim accumsan. Donec vitae dapibus velit, imperdiet interdum tortor. Suspendisse id lectus egestas, dignissim lacus nec, commodo lectus. Nulla facilisi. Suspendisse rhoncus leo vel commodo varius. In quis consequat eros. Aenean sollicitudin tristique hendrerit. Proin consectetur enim sapien, vel fringilla augue vulputate in.
        </p>
        <p>
          Duis euismod pulvinar nunc non pharetra. Quisque at iaculis dolor. Nullam a eleifend dolor, a mollis nisi. Pellentesque semper lacinia luctus. Vestibulum eget lacus magna. Donec tristique sem elit, et consectetur diam lacinia quis. Duis venenatis dapibus tellus, et vestibulum arcu varius scelerisque. Aliquam vehicula odio nec libero ullamcorper molestie. Ut porttitor lobortis felis eu convallis. Maecenas ultrices dolor vel urna faucibus, ac tristique nibh viverra. Vestibulum feugiat semper dolor vitae ullamcorper. Sed hendrerit gravida porttitor. Nullam sed elit fringilla enim tempor malesuada at eu sem. Morbi in justo eget ex condimentum suscipit.
        </p>
      </div>
      </div>
    </>
  )
}
