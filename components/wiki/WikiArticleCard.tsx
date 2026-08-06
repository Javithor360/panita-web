import Link from 'next/link'
import Image from 'next/image'

export function WikiArticleCard({ article }: { article: any }) {
  return (
    <Link href={`/wiki/${article.category.slug}/${article.slug}`}>
      <div className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg h-full">
        {article.cover_url ? (
          <div className="relative w-full h-40 bg-muted/30 border-b border-border">
            <Image src={article.cover_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 300px" />
          </div>
        ) : (
          <div className="w-full h-2 flex-shrink-0 bg-primary/20"></div>
        )}
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-2">
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
            <span className="text-xs text-muted-foreground ml-auto">
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
      </div>
    </Link>
  )
}
