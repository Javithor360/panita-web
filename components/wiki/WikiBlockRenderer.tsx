'use client'

import Image from 'next/image'
import React from 'react'
import { slugify, type InlineContent, type TableContent, type BlockNode } from '@/lib/wiki-utils'

function isInlineContent(c: InlineContent[] | TableContent | undefined): c is InlineContent[] {
  return Array.isArray(c)
}

export function WikiBlockRenderer({ content }: { content: unknown }) {
  if (!Array.isArray(content)) return null
  const blocks = content as BlockNode[]

  const renderInline = (inlineContent: InlineContent[] | undefined): React.ReactNode => {
    if (!inlineContent) return null
    return inlineContent.map((c, i) => {
      if (c.type === 'text') {
        let el: React.ReactNode = <>{c.text}</>
        if (c.styles?.bold) el = <strong>{el}</strong>
        if (c.styles?.italic) el = <em>{el}</em>
        if (c.styles?.underline) el = <u>{el}</u>
        if (c.styles?.strikethrough) el = <s>{el}</s>
        if (c.styles?.code) el = <code className="bg-muted px-1 rounded text-primary text-sm font-mono">{el}</code>
        const allowedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink'];
        if (c.styles?.textColor && allowedColors.includes(c.styles.textColor as string)) {
          el = <span style={{ color: c.styles.textColor as string }}>{el}</span>
        }
        return <React.Fragment key={i}>{el}</React.Fragment>
      }
      if (c.type === 'link') {
        return <a key={i} href={c.href} className="text-primary hover:underline">{renderInline(c.content)}</a>
      }
      return null
    })
  }

  const elements: React.ReactNode[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    if (block.type === 'paragraph') {
      const inline = isInlineContent(block.content) ? block.content : undefined
      elements.push(
        <p key={block.id || i} className="mb-6 leading-relaxed text-lg" style={{ color: '#e5e7eb' }}>
          {renderInline(inline)}
        </p>
      )
    } else if (block.type === 'heading') {
      const level = (block.props?.level as number) || 1
      const inline = block.content as InlineContent[] | undefined
      const text = inline?.map((c) => c.text ?? '').join('') || ''
      const id = slugify(text)
      const validLevel = Math.min(Math.max(level, 1), 6) as 1|2|3|4|5|6
      const sizes: Record<1|2|3|4|5|6, string> = {
        1: 'text-4xl font-bold tracking-tight mt-12 mb-6 border-b border-primary/30 pb-2 flow-root scroll-mt-24',
        2: 'text-2xl font-semibold tracking-tight mt-10 mb-4 border-b border-primary/20 pb-2 flow-root scroll-mt-24',
        3: 'text-xl font-semibold mt-8 mb-3 flow-root scroll-mt-24',
        4: 'text-lg font-medium mt-6 mb-2 flow-root scroll-mt-24',
        5: 'text-base font-medium mt-4 mb-2 flow-root scroll-mt-24',
        6: 'text-sm font-medium mt-4 mb-2 flow-root scroll-mt-24'
      }
      const colors: Record<1|2|3|4|5|6, string> = {
        1: '#ffffff',
        2: '#f3f4f6',
        3: '#e5e7eb',
        4: '#9ca3af',
        5: '#9ca3af',
        6: '#9ca3af'
      }
      const tag = `h${validLevel}` as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6'
      elements.push(
        React.createElement(tag, { key: block.id || i, id, className: sizes[validLevel], style: { color: colors[validLevel] } },
          renderInline(inline)
        )
      )
    } else if (block.type === 'bulletListItem' || block.type === 'numberedListItem') {
      const isOrdered = block.type === 'numberedListItem'
      const ListTag = isOrdered ? 'ol' : 'ul'
      const listClass = isOrdered ? 'list-decimal' : 'list-disc'
      
      const items: React.ReactNode[] = []
      while (i < blocks.length && (blocks[i].type === 'bulletListItem' || blocks[i].type === 'numberedListItem')) {
        const currentBlock = blocks[i]
        const itemInline = isInlineContent(currentBlock.content) ? currentBlock.content : undefined
        items.push(
          <li key={currentBlock.id || i} className="mb-1 text-muted-foreground ml-6">
            {renderInline(itemInline)}
          </li>
        )
        i++
      }
      i-- // Step back because outer loop will increment
      
      elements.push(
        <ListTag key={`list-${i}`} className={`${listClass} mb-4 space-y-1 ml-6 flow-root`}>
          {items}
        </ListTag>
      )
    } else if (block.type === 'image') {
      const imgUrl = block.props?.url as string | undefined
      const imgCaption = block.props?.caption as string | undefined
      if (imgUrl) {
        elements.push(
          <figure key={block.id || i} className="my-6">
            <div className="relative w-full aspect-video bg-muted/20 rounded-lg overflow-hidden border border-border">
              <Image src={imgUrl} alt={imgCaption || ''} fill className="object-contain" />
            </div>
            {imgCaption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
                {imgCaption}
              </figcaption>
            )}
          </figure>
        )
      }
    } else if (block.type === 'quote') {
      const quoteInline = isInlineContent(block.content) ? block.content : undefined
      elements.push(
        <blockquote key={block.id || i} className="border-l-4 border-primary pl-4 py-1 my-4 bg-primary/5 rounded-r-lg italic text-muted-foreground flow-root">
           {renderInline(quoteInline)}
        </blockquote>
      )
    } else if (block.type === 'table') {
      const tableContent = block.content as { rows: { cells: { content: InlineContent[] }[] }[] } | undefined
      const rows = tableContent?.rows ?? []
      elements.push(
        <div key={block.id || i} className="overflow-x-auto my-6 border border-border rounded-lg">
          <table className="w-full text-sm text-left">
            {rows.length > 0 && (
              <thead>
                <tr className="bg-primary/10 border-b border-border">
                  {rows[0].cells.map((cell, ci) => (
                    <th key={ci} className="px-4 py-2 font-semibold text-foreground">
                      {renderInline(cell.content)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-border">
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-muted/20'}>
                  {row.cells.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-muted-foreground">
                      {renderInline(cell.content)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    } else {
      const fallbackInline = isInlineContent(block.content) ? block.content : undefined
      if (fallbackInline) {
        elements.push(<div key={block.id || i} className="mb-6 leading-relaxed text-lg" style={{ color: '#e5e7eb' }}>{renderInline(fallbackInline)}</div>)
      }
    }

    i++
  }

  return <div className="max-w-none wiki-content" style={{ color: '#e5e7eb' }}>{elements}</div>
}
