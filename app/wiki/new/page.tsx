import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { WikiBreadcrumbs } from '@/components/wiki/WikiBreadcrumbs'
import { WikiLiveView } from '@/components/wiki/WikiLiveView'

export const metadata = {
  title: 'Nuevo Artículo - Panitacraft Wiki'
}

export default async function NewWikiArticlePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login?next=/wiki/new')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { trusted_author: true, roles: { select: { name: true } } },
  })
  
  const isAdmin = !!(user?.trusted_author || user?.roles.some((r) => ["Admin", "Moderador"].includes(r.name)))
  if (!isAdmin) {
    notFound() // Hide route if not admin
  }

  // Fetch meta data for the editor
  const categories = await prisma.wikiCategory.findMany({
    select: { id: true, name: true, slug: true, icon: true },
    orderBy: { position: "asc" }
  })
  
  const editions = await prisma.edition.findMany({
    select: { id: true, name: true, theme_color: true },
    orderBy: { started_at: "desc" }
  })

  // Get initial category from query param if available
  const { category: initialCategorySlug } = await searchParams
  const initialCategory = categories.find(c => c.slug === initialCategorySlug)

  return (
    <div className="flex flex-col space-y-6">
      <WikiBreadcrumbs items={[
        { label: 'Wiki', href: '/wiki' },
        { label: 'Creando nuevo artículo' }
      ]} />

      <WikiLiveView 
        categories={categories}
        editions={editions}
        canEdit={true}
        isNew={true}
        initialCategoryId={initialCategory?.id}
      />
    </div>
  )
}
