import Link from 'next/link'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function WikiCategoryCard({ category }: { category: any }) {
  const Icon: LucideIcon = category.icon 
    ? ((Icons as unknown as Record<string, LucideIcon>)[category.icon] ?? Icons.BookOpen)
    : Icons.BookOpen

  return (
    <Link href={`/wiki/${category.slug}`}>
      <div className="group relative bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] hover:-translate-y-1 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
            <Icon className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-muted rounded-full text-muted-foreground border border-border">
            {category._count?.articles || 0} arts
          </span>
        </div>
        
        <h3 className="font-minecraft text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        
        {category.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  )
}
