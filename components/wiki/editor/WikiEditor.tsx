"use client";

import { useCreateBlockNote, SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteSchema, defaultBlockSpecs, insertOrUpdateBlockForSlashMenu, filterSuggestionItems } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { useCallback } from "react";
import type { Block } from "@blocknote/core";
import { CraftingBlock } from "./custom-blocks/CraftingBlock";
import { CraftingTableBlock } from "./custom-blocks/CraftingTableBlock";

interface WikiEditorProps {
  initialContent?: Block[];
  onChange: (blocks: Block[]) => void;
  categorySlug?: string;
}

// Define the custom schema
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    crafting: CraftingBlock(),
    craftingrecipe: CraftingTableBlock(),
  },
});

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
    schema,
    initialContent: hasInitial ? (initialContent as any) : (getTemplateForCategory(categorySlug) as any),
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
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) => {
            const defaultItems = getDefaultReactSlashMenuItems(editor).map(item => {
              let newTitle = item.title;
              let newSubtext = item.subtext;
              let newGroup = item.group;

              // Translate Titles
              const translations: Record<string, string> = {
                'Heading 1': 'Encabezado 1',
                'Heading 2': 'Encabezado 2',
                'Heading 3': 'Encabezado 3',
                'Numbered List': 'Lista Numerada',
                'Bullet List': 'Lista con Viñetas',
                'Check List': 'Lista de Tareas',
                'Paragraph': 'Párrafo',
                'Image': 'Imagen',
                'Table': 'Tabla',
                'Blockquote': 'Cita',
                'Code Block': 'Bloque de Código',
                'Audio': 'Audio',
                'Video': 'Video',
                'File': 'Archivo',
                'Emoji': 'Emoji'
              };
              if (translations[item.title]) newTitle = translations[item.title];

              // Translate Subtexts
              const subtextTranslations: Record<string, string> = {
                'Used for a top-level heading': 'Encabezado principal',
                'Used for a key section': 'Sección clave',
                'Used for a subsection': 'Subsección',
                'Used for a numbered list': 'Lista ordenada con números',
                'Used for a bulleted list': 'Lista desordenada',
                'Used to write a paragraph': 'Para escribir texto plano',
                'Insert an image': 'Insertar una imagen',
                'Insert a table': 'Insertar una tabla',
                'Used for a quote': 'Para citar un texto',
                'Used for code': 'Para mostrar código',
                'Insert an audio file': 'Insertar archivo de audio',
                'Insert a video': 'Insertar un video',
                'Insert a file': 'Insertar un archivo'
              };
              if (item.subtext && subtextTranslations[item.subtext]) newSubtext = subtextTranslations[item.subtext];

              // Translate Groups
              if (item.group === 'Basic Blocks') newGroup = 'Bloques Básicos';
              if (item.group === 'Headings') newGroup = 'Encabezados';
              if (item.group === 'Media') newGroup = 'Multimedia';
              if (item.group === 'Advanced') newGroup = 'Avanzado';

              return { ...item, title: newTitle, subtext: newSubtext, group: newGroup };
            });

            return filterSuggestionItems(
              [
                ...defaultItems,
                {
                  title: "Crafteo (Grid)",
                  subtext: "Cuadrícula de crafteo 3x3",
                  onItemClick: () => {
                    insertOrUpdateBlockForSlashMenu(editor, { type: "crafting" });
                  },
                  aliases: ["crafteo"],
                  group: "Minecraft",
                  icon: <span>🧊</span>,
                },
                {
                  title: "Crafteo (Tabla)",
                  subtext: "Receta completa con ingredientes",
                  onItemClick: () => {
                    insertOrUpdateBlockForSlashMenu(editor, { type: "craftingrecipe" });
                  },
                  aliases: ["tablacrafteo"],
                  group: "Minecraft",
                  icon: <span>🪑</span>,
                },
              ],
              query
            );
          }}
        />
      </BlockNoteView>
    </div>
  );
}
