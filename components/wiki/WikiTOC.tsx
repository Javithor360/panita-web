'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export function WikiTOC({ headings }: { headings: { id: string; text: string; level: number }[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0px 0px -80% 0px' }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (!headings.length || !mounted) return null

  const targetElement = document.getElementById('wiki-sidebar-toc')
  if (!targetElement) return null

  const content = (
    <details className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-lg group" open>
      <summary className="p-4 border-b border-border/50 bg-muted cursor-pointer hover:bg-muted/80 transition-colors flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
        <h3 className="font-bold text-foreground tracking-tight">Índice</h3>
        <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
      </summary>
      <nav className="flex flex-col p-4 pt-3 space-y-2 text-sm max-h-[60vh] overflow-y-auto pr-2">
        {headings.map(({ id, text, level }) => {
          if (level > 3) return null
          return (
            <a
              key={id}
              href={`#${id}`}
              className={`
                transition-colors hover:text-primary line-clamp-2
                ${level === 3 ? 'ml-4 text-muted-foreground' : 'font-medium'}
                ${activeId === id ? 'text-primary' : (level === 2 ? 'text-foreground/90' : '')}
              `}
            >
              {text}
            </a>
          )
        })}
      </nav>
    </details>
  )

  return createPortal(content, targetElement)
}
