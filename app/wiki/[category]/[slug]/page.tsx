import { getWikiArticle } from '@/lib/wiki'
import { WikiBreadcrumbs } from '@/components/wiki/WikiBreadcrumbs'
import { WikiInfoBox } from '@/components/wiki/WikiInfoBox'
import { WikiTOC } from '@/components/wiki/WikiTOC'
import { WikiBlockRenderer } from '@/components/wiki/WikiBlockRenderer'
import { extractHeadings } from '@/lib/wiki-utils'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { WikiLiveView } from '@/components/wiki/WikiLiveView'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { slug } = await params
  const article = await getWikiArticle(slug)
  if (!article) return { title: 'No encontrado - Panitacraft Wiki' }
  return { 
    title: `${article.title} - Panitacraft Wiki`,
    description: article.excerpt || ''
  }
}

export default async function WikiArticlePage({ params, searchParams }: { params: Promise<{ category: string; slug: string }>, searchParams: Promise<{ edit?: string }> }) {
  const { slug } = await params
  const { edit } = await searchParams
  const article = await getWikiArticle(slug)
  
  if (!article) {
    notFound()
  }

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

  // Determine if it should auto-start in edit mode based on URL query and permissions
  const isEditing = canEdit && edit === 'true'

  // Fetch meta data for the editor
  const categories = await prisma.wikiCategory.findMany({
    select: { id: true, name: true, slug: true, icon: true },
    orderBy: { name: "asc" }
  })
  
  const editions = await prisma.edition.findMany({
    select: { id: true, name: true, theme_color: true },
    orderBy: { started_at: "desc" }
  })

  // Prepare article for the client component
  const authorName = article.author?.ign || article.author?.discord_name || 'Desconocido'
  const authorIgn = article.author?.ign || null
  const articleData = {
    ...article,
    authorName,
    authorIgn,
    content: typeof article.content === 'string' ? JSON.parse(article.content) : article.content
  }

  return (
    <div className="flex flex-col space-y-6">
      <WikiBreadcrumbs items={[
        { label: 'Wiki', href: '/wiki' },
        { label: article.category.name, href: `/wiki/${article.category.slug}` },
        { label: article.title }
      ]} />

      <WikiLiveView 
        categories={categories}
        editions={editions}
        article={articleData}
        canEdit={canEdit}
        isNew={false}
      />
    </div>
  )
}
