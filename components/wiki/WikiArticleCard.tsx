import Link from 'next/link'
import Image from 'next/image'
import { Copy } from 'lucide-react'
import { cloneWikiArticle } from '@/app/actions/wiki'

export function WikiArticleCard({ article, canEdit }: { article: any; canEdit?: boolean }) {
  return (
    <div className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg h-full relative">
      <Link href={`/wiki/${article.category.slug}/${article.slug}`} className="absolute inset-0 z-0" />
      
      {article.cover_url ? (
        <div className="relative w-full h-40 bg-muted/30 border-b border-border pointer-events-none z-0">
          <Image src={article.cover_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 300px" />
        </div>
      ) : (
        <div className="w-full h-2 flex-shrink-0 bg-primary/20 pointer-events-none z-0"></div>
      )}
      
      <div className="p-5 flex flex-col flex-grow pointer-events-none z-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {article.edition && (
              <span 
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: article.edition.theme_color || 'var(--primary)',
                  color: article.edition.theme_color || 'var(--primary)'
                }}
              >
                {article.edition.name}
              </span>
            )}
            {article.is_published === false && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-destructive text-destructive bg-destructive/10">
                Borrador
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap pl-2">
            {new Date(article.updated_at).toLocaleDateString()}
          </span>
        </div>
        
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 mt-auto">
            {article.excerpt}
          </p>
        )}
      </div>

      {canEdit && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <form action={async () => {
            "use server";
            await cloneWikiArticle(article.id);
          }}>
            <button 
              type="submit"
              className="p-2 bg-background/90 backdrop-blur border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50 shadow-sm transition-all"
              title="Clonar artículo"
            >
              <Copy className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
