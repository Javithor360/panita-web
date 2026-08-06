'use client'

import Image from 'next/image'
import React from 'react'
import { ArrowRight } from 'lucide-react'
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
        if (c.styles?.code) el = <code className="bg-[#f2f4f6] text-[#0f1419] border border-[#d1d5db] px-1.5 py-0.5 mx-0.5 rounded text-[13px] font-mono shadow-sm whitespace-nowrap">{el}</code>
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
        <p key={block.id || i} className="mb-4 leading-relaxed text-[14px]" style={{ color: '#e5e7eb' }}>
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
        1: 'text-[28px] font-bold tracking-tight mt-10 mb-4 border-b border-primary/30 pb-2 flow-root scroll-mt-24',
        2: 'text-[20px] font-bold tracking-tight mt-8 mb-3 border-b border-primary/20 pb-1 flow-root scroll-mt-24',
        3: 'text-[16px] font-semibold mt-6 mb-2 scroll-mt-24',
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
    } else if (block.type === 'crafting') {
      let slots: any[] = ["", "", "", "", "", "", "", "", ""]
      try { slots = JSON.parse(String(block.props?.slotsJson)) } catch {}
      const outputAsset = String(block.props?.outputAsset || '')
      const outputCount = String(block.props?.outputCount || '1')

      const formatItemName = (name: string) => {
        if (!name) return "";
        return name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[-_]/g, " ")    // spaces instead of - or _
          .replace(/\b\w/g, c => c.toUpperCase()); // capitalize
      }

      elements.push(
        <div key={block.id || i} className="flex flex-col bg-[#c6c6c6] p-2 rounded-md border-4 border-b-[#555] border-r-[#555] border-t-[#fff] border-l-[#fff] w-fit shadow-md my-4">
          <div className="text-xs font-bold text-black mb-1 self-start font-minecraft">Crafting</div>
          <div className="flex items-center gap-6">
            <div className="grid grid-cols-3 gap-[2px]">
              {slots.map((s, idx) => {
                const url = typeof s === 'string' ? s : s?.url || "";
                const rawName = typeof s === 'string' ? "" : s?.name || "";
                const name = formatItemName(rawName);
                return (
                  <div key={idx} className="w-16 h-16 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#fff] border-r-[#fff] flex items-center justify-center relative group">
                    {url && (
                      <>
                        <Image src={url} alt={name || "Slot"} fill className="p-1 object-contain pixelated" />
                        {name && (
                          <div className="absolute z-50 invisible group-hover:visible bg-[#110111] border-[2px] border-[#3a0088] px-2 py-1 text-white font-minecraft shadow-lg whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2 text-xs pointer-events-none">
                            <span className="drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">{name}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-[#373737]"><ArrowRight className="w-10 h-10" strokeWidth={3} /></div>
            <div className="w-16 h-16 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#fff] border-r-[#fff] flex items-center justify-center relative group">
              {outputAsset && (
                <>
                  <Image src={outputAsset} alt={formatItemName(String(block.props?.outputName)) || "Output"} fill className="p-1 object-contain pixelated" />
                  {block.props?.outputName && (
                    <div className="absolute z-50 invisible group-hover:visible bg-[#110111] border-[2px] border-[#3a0088] px-2 py-1 text-white font-minecraft shadow-lg whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2 text-xs pointer-events-none">
                      <span className="drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">{formatItemName(String(block.props?.outputName))}</span>
                    </div>
                  )}
                  {outputCount !== "1" && <span className="absolute bottom-0 right-0 font-minecraft text-white drop-shadow-[1px_1px_0_rgba(0,0,0,1)] text-xs z-10 px-1">{outputCount}</span>}
                </>
              )}
            </div>
          </div>
        </div>
      )
    } else if (block.type === 'craftingrecipe') {
      let slots: any[] = ["", "", "", "", "", "", "", "", ""]
      try { slots = JSON.parse(String(block.props?.slotsJson)) } catch {}
      const outputAsset = String(block.props?.outputAsset || '')
      const outputCount = String(block.props?.outputCount || '1')
      const itemName = String(block.props?.itemName || '')
      const ingredientsText = String(block.props?.ingredientsText || '')

      const formatItemName = (name: string) => {
        if (!name) return "";
        return name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[-_]/g, " ")    // spaces instead of - or _
          .replace(/\b\w/g, c => c.toUpperCase()); // capitalize
      }

      elements.push(
        <div key={block.id || i} className="w-fit overflow-x-auto my-6 border border-border/40 rounded-xl bg-card shadow-lg">
          <div className="flex flex-col w-fit text-sm text-left">
            <div className="flex bg-primary/15 border-b border-primary/30">
              <div className="px-4 py-2.5 font-bold text-foreground border-r border-primary/30 min-w-[200px] w-1/3 text-[16px] drop-shadow-sm">Ingredientes</div>
              <div className="px-4 py-2.5 font-bold text-foreground min-w-[250px] flex-1 text-[16px] drop-shadow-sm">Receta de crafteo</div>
            </div>
            <div className="flex">
              <div className="px-4 py-3 border-r border-border/40 min-w-[200px] w-1/3 flex-shrink-0 flex items-center text-foreground font-medium whitespace-pre-wrap bg-white/5">
                {ingredientsText}
              </div>
              <div className="px-4 py-4 flex-1 flex justify-start items-center bg-black/10 min-w-[250px]">
                  <div className="flex flex-col items-start bg-[#c6c6c6] p-1.5 rounded-md border-2 border-b-[#555] border-r-[#555] border-t-[#fff] border-l-[#fff] w-fit shadow-sm scale-90 origin-left">
                    <div className="flex items-center gap-4">
                      <div className="grid grid-cols-3 gap-[2px]">
                        {slots.map((s, idx) => {
                          const url = typeof s === 'string' ? s : s?.url || "";
                          const rawName = typeof s === 'string' ? "" : s?.name || "";
                          const name = formatItemName(rawName);
                          return (
                            <div key={idx} className="w-16 h-16 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#fff] border-r-[#fff] flex items-center justify-center relative group">
                              {url && (
                                <>
                                  <Image src={url} alt={name || "Slot"} fill className="p-1 object-contain pixelated" />
                                  {name && (
                                    <div className="absolute z-50 invisible group-hover:visible bg-[#110111] border-[2px] border-[#3a0088] px-2 py-1 text-white font-minecraft shadow-lg whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2 text-xs pointer-events-none">
                                      <span className="drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">{name}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-[#373737]"><ArrowRight className="w-8 h-8" strokeWidth={3} /></div>
                      <div className="w-16 h-16 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#fff] border-r-[#fff] flex items-center justify-center relative group">
                        {outputAsset && (
                          <>
                            <Image src={outputAsset} alt={formatItemName(String(block.props?.outputName)) || "Output"} fill className="p-1 object-contain pixelated" />
                            {block.props?.outputName && (
                              <div className="absolute z-50 invisible group-hover:visible bg-[#110111] border-[2px] border-[#3a0088] px-2 py-1 text-white font-minecraft shadow-lg whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2 text-xs pointer-events-none">
                                <span className="drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">{formatItemName(String(block.props?.outputName))}</span>
                              </div>
                            )}
                            {outputCount !== "1" && <span className="absolute bottom-0 right-0 font-minecraft text-white drop-shadow-[1px_1px_0_rgba(0,0,0,1)] text-xs z-10 px-1">{outputCount}</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
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
