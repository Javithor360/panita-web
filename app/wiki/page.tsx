import { getWikiCategories } from '@/lib/wiki'
import { WikiCategoryCard } from '@/components/wiki/WikiCategoryCard'
import { Search } from 'lucide-react'

export const metadata = {
  title: 'Wiki - Panitacraft',
  description: 'Explora la enciclopedia oficial de Panitacraft.',
}

export default async function WikiHomePage() {
  let categories: any[] = []
  try {
    categories = await getWikiCategories()
  } catch(e) {}

  return (
    <div className="space-y-12">
      <section className="text-center py-16 px-4 bg-card border border-border rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-minecraft text-primary tracking-wide">
            Wiki de Panitacraft
          </h1>
          <p className="text-lg text-muted-foreground">
            Todo lo que necesitas saber sobre el servidor, mecánicas, items y el lore, en un solo lugar.
          </p>
          
          <form action="/wiki" method="GET" className="relative max-w-md mx-auto mt-8">
            <input 
              type="text" 
              name="q" 
              placeholder="¿Qué estás buscando?..." 
              className="w-full bg-background border border-border rounded-full pl-12 pr-6 py-4 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-lg"
            />
            <Search className="absolute left-5 top-4 w-5 h-5 text-muted-foreground" />
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-minecraft text-foreground mb-6 flex items-center gap-3">
          <span className="w-8 h-1 bg-primary rounded-full"></span>
          Explorar por Categoría
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <WikiCategoryCard key={category.slug} category={category} />
          ))}
          {categories.length === 0 && (
             <p className="text-muted-foreground col-span-full">No hay categorías disponibles aún.</p>
          )}
        </div>
      </section>
    </div>
  )
}
