"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCallback } from "react";
import type { Block } from "@blocknote/core";

interface WikiEditorProps {
  initialContent?: Block[];
  onChange: (blocks: Block[]) => void;
  categorySlug?: string;
}

function getTemplateForCategory(slug?: string): any[] {
  switch (slug) {
    case 'mobs':
      return [
        { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Descripción General", styles: {} }] },
        { type: "paragraph", content: [{ type: "text", text: "Describe al mob, su comportamiento y dónde encontrarlo.", styles: {} }] },
        { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Estadísticas", styles: {} }] },
        { type: "paragraph" },
        { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Tabla de Botín (Loot)", styles: {} }] },
        { type: "paragraph", content: [{ type: "text", text: "Menciona los drops y porcentajes.", styles: {} }] }
      ];
    case 'items':
      return [
        { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Obtención", styles: {} }] },
        { type: "paragraph", content: [{ type: "text", text: "Explica cómo se craftea o se consigue este objeto.", styles: {} }] },
        { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Usos", styles: {} }] },
        { type: "paragraph", content: [{ type: "text", text: "Para qué sirve, recetas en las que participa, etc.", styles: {} }] }
      ];
    case 'mechanics':
      return [
        { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Funcionamiento", styles: {} }] },
        { type: "paragraph", content: [{ type: "text", text: "Explica cómo interactúa el jugador con esta mecánica.", styles: {} }] },
        { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Comandos Relacionados", styles: {} }] },
        { type: "paragraph" }
      ];
    default:
      return [
        { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Resumen", styles: {} }] },
        { type: "paragraph", content: [{ type: "text", text: "Comienza a escribir aquí...", styles: {} }] }
      ];
  }
}

export function WikiEditor({ initialContent, onChange, categorySlug }: WikiEditorProps) {
  const hasInitial = initialContent && initialContent.length > 0;
  const editor = useCreateBlockNote({
    initialContent: hasInitial ? initialContent : (getTemplateForCategory(categorySlug) as any),
  });

  const handleChange = useCallback(() => {
    onChange(editor.document as Block[]);
  }, [editor, onChange]);

  return (
    <div className="min-h-[500px] w-full bg-transparent overflow-hidden">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="dark"
        className="wiki-editor"
      />
    </div>
  );
}
