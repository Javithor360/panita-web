'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function WikiBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4 overflow-x-auto whitespace-nowrap pb-2">
      <Link href="/" className="hover:text-primary transition-colors">Home</Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={index} className="flex items-center space-x-1">
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            {isLast || !item.href ? (
              <span className="text-primary font-medium">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
