'use client'

import { useState, useRef } from 'react'
import { 
  Bold, Italic, Strikethrough, Minus, Heading, Quote, 
  Code, SquareTerminal, List, ListOrdered, CheckSquare, 
  Eye, Pencil 
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [localValue, setLocalValue] = useState(value)
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const updateValue = (newVal: string) => {
    setLocalValue(newVal)
    onChange(newVal)
  }

  const insertText = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = localValue.substring(start, end);
    const newText = localValue.substring(0, start) + prefix + selectedText + suffix + localValue.substring(end);
    updateValue(newText);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  }

  const insertLinePrefix = (prefix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    const lastNewline = localValue.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    
    const newText = localValue.substring(0, lineStart) + prefix + localValue.substring(lineStart);
    updateValue(newText);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  }

  return (
    <div className="flex flex-col h-full w-full border border-border/50 rounded-md overflow-hidden bg-background/50">
      <div className="flex items-center justify-between p-2 border-b border-border/50 bg-black/20">
        <div className="flex items-center gap-1 flex-wrap">
          <ToolbarButton icon={<Bold className="w-4 h-4"/>} onClick={() => insertText('**', '**')} title="Negrita" disabled={previewMode === 'preview'} />
          <ToolbarButton icon={<Italic className="w-4 h-4"/>} onClick={() => insertText('*', '*')} title="Cursiva" disabled={previewMode === 'preview'} />
          <ToolbarButton icon={<Strikethrough className="w-4 h-4"/>} onClick={() => insertText('~~', '~~')} title="Tachado" disabled={previewMode === 'preview'} />
          <div className="w-px h-4 bg-border mx-1" />
          <select 
            onChange={(e) => {
              if (e.target.value) {
                insertLinePrefix(e.target.value);
                e.target.value = '';
              }
            }}
            className="bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5 text-sm p-1 rounded focus:outline-none cursor-pointer [&>option]:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={previewMode === 'preview'}
            title="Título (H1-H6)"
          >
            <option value="">Título</option>
            <option value="# ">H1</option>
            <option value="## ">H2</option>
            <option value="### ">H3</option>
            <option value="#### ">H4</option>
            <option value="##### ">H5</option>
            <option value="###### ">H6</option>
          </select>
          <ToolbarButton icon={<Minus className="w-4 h-4"/>} onClick={() => insertText('\n---\n')} title="Separador (HR)" disabled={previewMode === 'preview'} />
          <ToolbarButton icon={<Quote className="w-4 h-4"/>} onClick={() => insertLinePrefix('> ')} title="Cita" disabled={previewMode === 'preview'} />
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton icon={<Code className="w-4 h-4"/>} onClick={() => insertText('`', '`')} title="Código" disabled={previewMode === 'preview'} />
          <ToolbarButton icon={<SquareTerminal className="w-4 h-4"/>} onClick={() => insertText('\n```\n', '\n```\n')} title="Bloque de código" disabled={previewMode === 'preview'} />
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton icon={<List className="w-4 h-4"/>} onClick={() => insertLinePrefix('- ')} title="Lista" disabled={previewMode === 'preview'} />
          <ToolbarButton icon={<ListOrdered className="w-4 h-4"/>} onClick={() => insertLinePrefix('1. ')} title="Lista ordenada" disabled={previewMode === 'preview'} />
          <ToolbarButton icon={<CheckSquare className="w-4 h-4"/>} onClick={() => insertLinePrefix('- [ ] ')} title="Lista de tareas" disabled={previewMode === 'preview'} />
        </div>
        
        <div className="flex bg-card/60 backdrop-blur-sm rounded-lg border border-border p-1 shadow-sm w-fit gap-0.5 ml-2 shrink-0">
          <button
            onClick={() => setPreviewMode('edit')}
            className={`px-3 py-1.5 rounded-md transition-all duration-300 cursor-pointer flex items-center justify-center ${previewMode === 'edit' ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'}`}
            title="Modo Edición"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode('preview')}
            className={`px-3 py-1.5 rounded-md transition-all duration-300 cursor-pointer flex items-center justify-center ${previewMode === 'preview' ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'}`}
            title="Vista Previa"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {previewMode === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={e => updateValue(e.target.value)}
          className="w-full flex-1 bg-transparent p-4 text-sm resize-none focus:outline-none focus:ring-0 font-mono"
          placeholder={placeholder}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 bg-background/50">
          <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-white/80 prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white/90">
            {localValue ? (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {localValue}
              </ReactMarkdown>
            ) : (
              <p className="italic text-white/50">El historial está vacío...</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ToolbarButton({ icon, onClick, title, disabled }: { icon: React.ReactNode, onClick: () => void, title: string, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      title={title}
    >
      {icon}
    </button>
  )
}
