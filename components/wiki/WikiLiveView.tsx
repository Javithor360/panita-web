"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WikiInfoBox } from "./WikiInfoBox";
import { WikiTOC } from "./WikiTOC";
import { WikiBlockRenderer } from "./WikiBlockRenderer";
import { extractHeadings, type BlockNode } from "@/lib/wiki-utils";
import dynamic from "next/dynamic";
import type { Block } from "@blocknote/core";
import {
  createWikiArticle,
  updateWikiArticle,
  deleteWikiArticle,
} from "@/app/actions/wiki";
import {
  Loader2,
  Save,
  X,
  Settings2,
  Pencil,
  Trash,
  ChevronDown,
  Check,
  Globe,
} from "lucide-react";
import * as Icons from "lucide-react";
import { AssetPickerModal } from "./editor/AssetPickerModal";
import { ItemTemplateModal } from "./editor/ItemTemplateModal";
import { EditionIcon } from "@/components/ui/EditionIcon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Dynamic import of the BlockNote editor
const WikiEditor = dynamic(
  () => import("@/components/wiki/editor/WikiEditor").then((m) => m.WikiEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-muted/20 animate-pulse rounded-xl border border-border" />
    ),
  },
);

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface Edition {
  id: string;
  name: string;
  theme_color?: string | null;
}

interface WikiLiveViewProps {
  categories: Category[];
  editions: Edition[];
  article?: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    cover_url: string | null;
    category_id: string;
    edition_id: string | null;
    aliases: string[];
    is_published: boolean;
    content: unknown;
    infobox_data: unknown;
    category: { name: string; slug: string };
    edition: { id: string; name: string; theme_color: string | null } | null;
    updated_at: Date;
    authorName: string;
    authorIgn: string | null;
  };
  canEdit: boolean;
  isNew?: boolean;
  initialCategoryId?: string;
}

export function WikiLiveView({
  categories,
  editions,
  article,
  canEdit,
  isNew,
  initialCategoryId,
}: WikiLiveViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(isNew ?? false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(article?.cover_url ?? "");
  const [categoryId, setCategoryId] = useState(
    article?.category_id ?? initialCategoryId ?? categories[0]?.id ?? "",
  );
  const [editionId, setEditionId] = useState(article?.edition_id ?? "");
  const [aliases, setAliases] = useState<string[]>(article?.aliases ?? []);
  const [aliasInput, setAliasInput] = useState("");
  const [isPublished, setIsPublished] = useState(article?.is_published ?? true);
  const [infoboxData, setInfoboxData] = useState<
    { id?: string; label: string; value: string }[]
  >(Array.isArray(article?.infobox_data) ? (article.infobox_data as any) : []);

  const blocksRef = useRef<Block[]>((article?.content as Block[]) ?? []);

  // Template Modal State
  const initialCat = categories.find(
    (c) => c.id === (article?.category_id ?? initialCategoryId ?? categories[0]?.id ?? "")
  );
  const [templatePicked, setTemplatePicked] = useState(
    !(isNew && initialCat?.slug === "items")
  );

  // UI State
  const [showSettings, setShowSettings] = useState(true);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [editionDropdownOpen, setEditionDropdownOpen] = useState(false);

  // Auto-generate slug from title if new article
  function handleTitleChange(val: string) {
    setTitle(val);
    if (isNew) {
      setSlug(
        val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
      );
    }
  }

  function addAlias() {
    const a = aliasInput.trim().toLowerCase();
    if (a && !aliases.includes(a)) {
      setAliases((prev) => [...prev, a]);
    }
    setAliasInput("");
  }

  function removeAlias(a: string) {
    setAliases((prev) => prev.filter((x) => x !== a));
  }

  const handleEditorChange = useCallback((blocks: Block[]) => {
    blocksRef.current = blocks;
  }, []);

  function handleSave() {
    setError(null);
    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("title", title || "Sin título");
    fd.set("excerpt", excerpt);
    fd.set("cover_url", coverUrl);
    fd.set("category_id", categoryId);
    fd.set("edition_id", editionId);
    fd.set("aliases", JSON.stringify(aliases));
    fd.set("is_published", String(isPublished));
    fd.set("infobox_data", JSON.stringify(infoboxData));
    fd.set("content", JSON.stringify(blocksRef.current));

    startTransition(async () => {
      try {
        if (!isNew && article) {
          await updateWikiArticle(article.id, fd);
          setIsEditing(false);
          router.refresh();
        } else {
          await createWikiArticle(fd);
          const cat = categories.find((c) => c.id === categoryId);
          router.push(`/wiki/${cat?.slug}/${slug}`);
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          throw err;
        }
        setError(
          err instanceof Error ? err.message : "Error desconocido al guardar",
        );
      }
    });
  }

  const handleDelete = () => {
    if (!article) return;
    startTransition(async () => {
      try {
        await deleteWikiArticle(article.id);
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          throw err;
        }
        setError(err instanceof Error ? err.message : "Error al eliminar");
      }
    });
  };

  const displayCategory = categories.find((c) => c.id === categoryId);
  const displayEdition = editions.find((e) => e.id === editionId);

  // Fake article object for previewing the InfoBox while editing
  const previewEdition = displayEdition
    ? {
        id: displayEdition.id,
        name: displayEdition.name,
        color: displayEdition.theme_color,
      }
    : null;

  const currentEdition = article?.edition
    ? {
        id: article.edition.id,
        name: article.edition.name,
        color: article.edition.theme_color,
      }
    : null;

  const applyTemplate = (type: string) => {
    let newInfobox: { id: string; label: string; value: string }[] = [];
    let newBlocks: any[] = [
      { type: "paragraph", content: "Añade una descripción inicial aquí..." },
    ];

    const addHeading = (text: string) => {
      newBlocks.push({ type: "heading", props: { level: 2 }, content: text });
      newBlocks.push({ type: "paragraph" });
    };

    switch (type) {
      case "material":
        newInfobox = [
          { id: crypto.randomUUID(), label: "Rareza", value: "" },
          { id: crypto.randomUUID(), label: "Stack", value: "" },
        ];
        addHeading("Obtención");
        addHeading("Uso");
        break;
      case "comida":
        newInfobox = [
          { id: crypto.randomUUID(), label: "Rareza", value: "" },
          { id: crypto.randomUUID(), label: "Hambre", value: "" },
          { id: crypto.randomUUID(), label: "Saturación", value: "" },
          { id: crypto.randomUUID(), label: "Efectos", value: "" },
          { id: crypto.randomUUID(), label: "Stack", value: "" },
        ];
        addHeading("Obtención");
        addHeading("Uso");
        addHeading("Efectos Especiales");
        break;
      case "armadura":
        newInfobox = [
          { id: crypto.randomUUID(), label: "Rareza", value: "" },
          { id: crypto.randomUUID(), label: "Armadura", value: "" },
          { id: crypto.randomUUID(), label: "Dureza de armadura", value: "" },
          { id: crypto.randomUUID(), label: "Durabilidad", value: "" },
          { id: crypto.randomUUID(), label: "Stack", value: "" },
        ];
        addHeading("Obtención");
        addHeading("Uso");
        addHeading("Reparación");
        addHeading("Patrones de Armadura");
        addHeading("Habilidades");
        addHeading("Historia");
        addHeading("Galería");
        break;
      case "herramienta":
        newInfobox = [
          { id: crypto.randomUUID(), label: "Rareza", value: "" },
          { id: crypto.randomUUID(), label: "Eficiencia Minera", value: "" },
          { id: crypto.randomUUID(), label: "Nivel de Minería", value: "" },
          { id: crypto.randomUUID(), label: "Daño", value: "" },
          { id: crypto.randomUUID(), label: "Velocidad de Ataque", value: "" },
          { id: crypto.randomUUID(), label: "Durabilidad", value: "" },
          { id: crypto.randomUUID(), label: "Stack", value: "" },
        ];
        addHeading("Obtención");
        addHeading("Uso");
        addHeading("Reparación");
        addHeading("Habilidades");
        addHeading("Historia");
        break;
      case "arma":
        newInfobox = [
          { id: crypto.randomUUID(), label: "Rareza", value: "" },
          { id: crypto.randomUUID(), label: "Daño", value: "" },
          { id: crypto.randomUUID(), label: "Velocidad de Ataque", value: "" },
          { id: crypto.randomUUID(), label: "Durabilidad", value: "" },
          { id: crypto.randomUUID(), label: "Stack", value: "" },
        ];
        addHeading("Obtención");
        addHeading("Uso");
        addHeading("Reparación");
        addHeading("Habilidades");
        addHeading("Historia");
        break;
      case "ninguno":
        // Fallback simple
        break;
    }

    setInfoboxData(newInfobox);
    blocksRef.current = newBlocks as Block[];
    setTemplatePicked(true);
  };

  if (!templatePicked) {
    return <ItemTemplateModal onSelect={applyTemplate} />;
  }

  return (
    <>
      <div className="relative">
        {/* Main Content Area */}
        <article
          className={`flex-grow min-w-0 bg-[#080c08] border border-border/50 rounded-xl p-6 lg:p-12 shadow-2xl transition-all ${isEditing ? "ring-2 ring-primary/20" : ""}`}
        >
          {/* InfoBox (Floats right on desktop, inline on mobile) */}
          {(isEditing || coverUrl || article?.edition) && (
            <div className="relative group/cover float-none lg:float-right lg:ml-8 mb-8 w-full lg:w-[320px] clear-both lg:clear-none z-10">
              <WikiInfoBox
                title={title || "Sin título"}
                coverUrl={coverUrl}
                editionBadge={isEditing ? previewEdition : currentEdition}
                data={infoboxData}
                categorySlug={displayCategory?.slug}
                isEditing={isEditing}
                onDataChange={setInfoboxData}
                onCoverClick={
                  isEditing ? () => setShowAssetPicker(true) : undefined
                }
              />
            </div>
          )}

          {/* Article Header (Title) */}
          <div className="mb-8 pb-4 border-b border-primary/30 flex items-start justify-between clear-none">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título del artículo..."
                className="text-4xl md:text-5xl font-bold tracking-tight text-foreground bg-transparent outline-none w-full placeholder:text-foreground/30"
                autoFocus={isNew}
              />
            ) : (
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                {title || "Sin título"}
              </h1>
            )}

            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="hidden xl:flex ml-4 p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors items-center gap-2 flex-shrink-0 font-medium text-sm"
              >
                <Pencil className="w-4 h-4" /> Editar
              </button>
            )}
          </div>

          {/* Settings Bar (Visible only in edit mode) */}
          {isEditing && (
            <div className="mb-6 p-4 bg-muted/20 border border-border rounded-lg space-y-4 flow-root">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Configuración del Artículo
                </h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {showSettings ? "Ocultar" : "Mostrar"} campos avanzados
                </button>
              </div>

              {showSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Categoría
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryDropdownOpen(!categoryDropdownOpen);
                          setEditionDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-sm rounded-md bg-background border border-border text-foreground flex items-center justify-between focus:outline-none focus:border-primary"
                      >
                        <div className="flex items-center gap-2">
                          {(() => {
                            const cat = categories.find(
                              (c) => c.id === categoryId,
                            );
                            if (!cat) return <span>Seleccionar Categoría</span>;
                            const Icon = cat.icon
                              ? ((
                                  Icons as unknown as Record<
                                    string,
                                    React.FC<any>
                                  >
                                )[cat.icon] ?? Icons.BookOpen)
                              : Icons.BookOpen;
                            return (
                              <>
                                <Icon className="w-4 h-4 text-primary" />{" "}
                                {cat.name}
                              </>
                            );
                          })()}
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {categoryDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 max-h-48 overflow-y-auto">
                          {categories.map((c) => {
                            const Icon = c.icon
                              ? ((
                                  Icons as unknown as Record<
                                    string,
                                    React.FC<any>
                                  >
                                )[c.icon] ?? Icons.BookOpen)
                              : Icons.BookOpen;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setCategoryId(c.id);
                                  setCategoryDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-primary" />
                                  <span>{c.name}</span>
                                </div>
                                {categoryId === c.id && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Edición
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setEditionDropdownOpen(!editionDropdownOpen);
                          setCategoryDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-sm rounded-md bg-background border border-border text-foreground flex items-center justify-between focus:outline-none focus:border-primary"
                      >
                        <div className="flex items-center gap-2">
                          {(() => {
                            const ed = editions.find((e) => e.id === editionId);
                            if (!ed)
                              return (
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                  <Globe className="w-4 h-4 opacity-50" />{" "}
                                  Global (Sin edición)
                                </span>
                              );
                            return (
                              <>
                                <EditionIcon
                                  editionId={ed.id}
                                  className="w-5 h-5 rounded-md object-contain"
                                />
                                <span>{ed.name}</span>
                              </>
                            );
                          })()}
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {editionDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 max-h-48 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setEditionId("");
                              setEditionDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                          >
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Globe className="w-4 h-4 opacity-50" /> Global
                              (Sin edición)
                            </span>
                            {editionId === "" && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </button>
                          {editions.map((e) => (
                            <button
                              key={e.id}
                              type="button"
                              onClick={() => {
                                setEditionId(e.id);
                                setEditionDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <EditionIcon
                                  editionId={e.id}
                                  className="w-5 h-5 rounded-md object-contain"
                                />
                                <span>{e.name}</span>
                              </div>
                              {editionId === e.id && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Resumen
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 text-sm rounded-md bg-background border border-border text-foreground resize-none focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Aliases
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aliasInput}
                        onChange={(e) => setAliasInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAlias();
                          }
                        }}
                        className="flex-1 px-3 py-2 text-sm rounded-md bg-background border border-border text-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={addAlias}
                        type="button"
                        className="px-3 py-2 text-sm border border-border rounded-md hover:bg-muted"
                      >
                        Añadir
                      </button>
                    </div>
                    {aliases.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {aliases.map((a) => (
                          <span
                            key={a}
                            className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-xs text-primary font-mono"
                          >
                            {a}{" "}
                            <button
                              type="button"
                              onClick={() => removeAlias(a)}
                              className="hover:text-destructive"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 md:col-span-2 flex items-center justify-between p-4 border border-border rounded-md bg-background/30 mt-4">
                    <div>
                      <span className="text-sm font-medium block text-foreground">
                        Estado del artículo
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        {isPublished
                          ? "Público para todos."
                          : "Borrador (Solo visible para autores)."}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublished((p) => !p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${isPublished ? "bg-green-500" : "bg-muted-foreground/30"}`}
                    >
                      <span className="sr-only">Toggle publicación</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublished ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          <div className="min-h-[300px] pt-4">
            {isEditing ? (
              <WikiEditor
                initialContent={blocksRef.current}
                onChange={handleEditorChange}
                categorySlug={displayCategory?.slug}
              />
            ) : (
              <WikiBlockRenderer content={blocksRef.current} />
            )}
          </div>

          {/* Footer Metadata (Read-only) */}
          {!isEditing && article && (
            <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground flex items-center justify-between">
              <span>
                Última edición:{" "}
                {new Date(article.updated_at).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                Por{" "}
                {article.authorIgn && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://render.crafty.gg/2d/head/${article.authorIgn}`}
                    alt=""
                    className="w-5 h-5 rounded-sm pixelated"
                  />
                )}
                <span className="text-foreground font-medium">
                  {article.authorName}
                </span>
              </span>
            </footer>
          )}
        </article>

        {/* TOC Portal Rendering */}
        {!isEditing && (
          <WikiTOC headings={extractHeadings(blocksRef.current)} />
        )}
      </div>

      {/* Sticky Save Bar */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-bottom flex justify-center">
          <div className="container max-w-7xl flex items-center justify-between gap-3">
            <div className="flex-shrink-0">
              {!isNew && article && (
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="destructive" />}>
                    <Trash className="w-4 h-4 mr-2" /> Eliminar
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Eliminar este artículo?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El artículo "{title}"
                        será eliminado permanentemente de la Wiki.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Eliminar Artículo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isNew && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors"
                  disabled={pending}
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={pending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {pending ? "Guardando..." : "Guardar Página"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Picker Modal */}
      {showAssetPicker && displayCategory && (
        <AssetPickerModal
          category={displayCategory.slug}
          onSelect={(asset) => {
            setCoverUrl(asset.url);
            setShowAssetPicker(false);
          }}
          onClose={() => setShowAssetPicker(false)}
        />
      )}
    </>
  );
}
