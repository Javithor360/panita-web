import Image from 'next/image'

export function WikiInfoBox({
  title,
  coverUrl,
  editionBadge,
  children
}: {
  title: string
  coverUrl?: string | null
  editionBadge?: { name: string; color?: string | null } | null
  children?: React.ReactNode
}) {
  return (
    <aside className="w-full bg-[#080c08] border border-border/50 rounded-xl overflow-hidden shadow-xl">
      <div className="bg-[#0f170f] border-b border-border/50 p-4 text-center">
        <h2 className="font-bold text-lg text-foreground tracking-tight">{title}</h2>
      </div>
      
      {coverUrl && (
        <div className="relative w-full aspect-square border-b border-border bg-background/50">
          <Image 
            src={coverUrl} 
            alt={title} 
            fill 
            className="object-contain p-2" 
            sizes="(max-width: 1024px) 100vw, 288px"
          />
        </div>
      )}
      
      {editionBadge && (
        <div className="p-3 border-b border-border flex justify-center">
          <span 
            className="px-3 py-1 text-xs font-bold rounded-full border bg-background/50"
            style={{ 
              borderColor: editionBadge.color || 'var(--primary)',
              color: editionBadge.color || 'var(--primary)'
            }}
          >
            {editionBadge.name}
          </span>
        </div>
      )}
      
      {children && (
        <div className="p-0">
          <table className="w-full text-sm">
            <tbody>
              {children}
            </tbody>
          </table>
        </div>
      )}
    </aside>
  )
}
