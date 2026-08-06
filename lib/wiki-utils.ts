export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export type InlineContent = { type: string; text?: string; styles?: Record<string, string | boolean>; href?: string; content?: InlineContent[] }
export type TableContent = { rows: { cells: { content: InlineContent[] }[] }[] }
export type BlockNode = {
  id?: string;
  type: string;
  props?: Record<string, string | number | boolean>;
  content?: InlineContent[] | TableContent;
  children?: BlockNode[]
}

export function extractHeadings(content: unknown): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  
  if (!Array.isArray(content)) return headings

  for (const block of content as BlockNode[]) {
    if (block.type === 'heading') {
      const inline = block.content as InlineContent[] | undefined
      const text = inline?.map((c) => c.text ?? '').join('') || ''
      if (text) {
        headings.push({
          id: slugify(text),
          text,
          level: (block.props?.level as number) || 1
        })
      }
    }
  }

  return headings
}
