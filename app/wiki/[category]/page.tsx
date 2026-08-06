import { getWikiCategoryBySlug, getWikiArticlesByCategory } from '@/lib/wiki'
import { WikiBreadcrumbs } from '@/components/wiki/WikiBreadcrumbs'
import { WikiArticleCard } from '@/components/wiki/WikiArticleCard'
import { notFound } from 'next/navigation'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = await getWikiCategoryBySlug(category)
  if (!cat) return { title: 'No encontrado - Panitacraft Wiki' }
  return { title: `${cat.name} - Panitacraft Wiki` }
}

export default async function WikiCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = await getWikiCategoryBySlug(category)
  
  if (!cat) {
    notFound()
  }

  const articles = await getWikiArticlesByCategory(cat.slug)
  const Icon: LucideIcon = cat.icon 
    ? ((Icons as unknown as Record<string, LucideIcon>)[cat.icon] ?? Icons.BookOpen)
    : Icons.BookOpen

  // Check permissions
  const session = await getSession()
  let canEdit = false
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { trusted_author: true, roles: { select: { name: true } } },
    })
    canEdit = !!(user?.trusted_author || user?.roles.some((r) => ["Admin", "Moderador"].includes(r.name)))
  }

  return (
    <div className="space-y-8">
      <WikiBreadcrumbs items={[
        { label: 'Wiki', href: '/wiki' },
        { label: cat.name }
      ]} />

      <header className="bg-card border border-border rounded-xl p-8 flex flex-col md:flex-row items-start gap-6">
        <div className="p-4 bg-primary/10 rounded-xl text-primary flex-shrink-0">
          <Icon className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-3xl font-minecraft text-foreground mb-3">{cat.name}</h1>
          {cat.description && (
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
              {cat.description}
            </p>
          )}
          <div className="mt-4 text-sm text-primary font-medium">
            {articles.length} artículos en esta categoría
          </div>
        </div>
      </header>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {canEdit && (
            <Link href={`/wiki/new?category=${cat.slug}`}>
              <div className="group h-full min-h-[160px] flex flex-col items-center justify-center bg-card/30 border-2 border-dashed border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] hover:-translate-y-1">
                <div className="p-3 bg-muted rounded-full text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-3">
                  <Plus className="w-8 h-8" />
                </div>
                <span className="font-medium text-muted-foreground group-hover:text-primary transition-colors">Crear nuevo artículo</span>
              </div>
            </Link>
          )}
          
          {articles.map((article) => (
            <WikiArticleCard key={article.slug} article={article} />
          ))}
          {articles.length === 0 && !canEdit && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
              No hay artículos en esta categoría todavía.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
