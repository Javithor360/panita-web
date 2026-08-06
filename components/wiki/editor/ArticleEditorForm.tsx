"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Block } from "@blocknote/core";
import { createWikiArticle, updateWikiArticle } from "@/app/actions/wiki";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

// Load BlockNote editor client-side only (no SSR)
const WikiEditor = dynamic(
  () => import("@/components/wiki/editor/WikiEditor").then((m) => m.WikiEditor),
  { ssr: false, loading: () => <div className="h-[500px] rounded-lg border border-border bg-card animate-pulse" /> }
);

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Edition {
  id: string;
  name: string;
}

interface ArticleEditorFormProps {
  categories: Category[];
  editions: Edition[];
  // Provided when editing an existing article
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
  };
}

export function ArticleEditorForm({ categories, editions, article }: ArticleEditorFormProps) {
  const isEdit = !!article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(article?.cover_url ?? "");
  const [categoryId, setCategoryId] = useState(article?.category_id ?? categories[0]?.id ?? "");
  const [editionId, setEditionId] = useState(article?.edition_id ?? "");
  const [aliases, setAliases] = useState<string[]>(article?.aliases ?? []);
  const [aliasInput, setAliasInput] = useState("");
  const [isPublished, setIsPublished] = useState(article?.is_published ?? true);
  const blocksRef = useRef<Block[]>((article?.content as Block[]) ?? []);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title if new article
  function handleTitleChange(val: string) {
    setTitle(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("title", title);
    fd.set("excerpt", excerpt);
    fd.set("cover_url", coverUrl);
    fd.set("category_id", categoryId);
    fd.set("edition_id", editionId);
    fd.set("aliases", JSON.stringify(aliases));
    fd.set("is_published", String(isPublished));
    fd.set("content", JSON.stringify(blocksRef.current));

    startTransition(async () => {
      try {
        if (isEdit && article) {
          await updateWikiArticle(article.id, fd);
        } else {
          await createWikiArticle(fd);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-minecraft text-primary text-2xl">
          {isEdit ? "Editar Artículo" : "Nuevo Artículo"}
        </h1>
        <div className="flex items-center gap-3">
          <button
            id="article-toggle-published"
            type="button"
            onClick={() => setIsPublished((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              isPublished
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {isPublished ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {isPublished ? "Publicado" : "Borrador"}
          </button>
          <button
            id="article-submit-btn"
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {pending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Meta fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Title */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="article-title" className="text-sm font-medium text-muted-foreground">
            Título *
          </label>
          <input
            id="article-title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            placeholder="Ej: Zombie Vestigio"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Slug */}
        <div className="space-y-1">
          <label htmlFor="article-slug" className="text-sm font-medium text-muted-foreground">
            Slug (URL) *
          </label>
          <input
            id="article-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="zombie-vestigio"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label htmlFor="article-category" className="text-sm font-medium text-muted-foreground">
            Categoría *
          </label>
          <select
            id="article-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Edition */}
        <div className="space-y-1">
          <label htmlFor="article-edition" className="text-sm font-medium text-muted-foreground">
            Edición (opcional)
          </label>
          <select
            id="article-edition"
            value={editionId}
            onChange={(e) => setEditionId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Global (todas las ediciones)</option>
            {editions.map((ed) => (
              <option key={ed.id} value={ed.id}>{ed.name}</option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="article-excerpt" className="text-sm font-medium text-muted-foreground">
            Resumen (aparece en listados)
          </label>
          <textarea
            id="article-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Breve descripción del artículo..."
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        {/* Cover URL */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="article-cover" className="text-sm font-medium text-muted-foreground">
            URL de imagen de portada (Cloudinary)
          </label>
          <input
            id="article-cover"
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Aliases */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">
            Aliases / Acrónimos (URLs alternativas)
          </label>
          <div className="flex gap-2">
            <input
              id="article-alias-input"
              type="text"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAlias(); } }}
              placeholder="Ej: zv, vestigio"
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              id="article-alias-add"
              type="button"
              onClick={addAlias}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              Agregar
            </button>
          </div>
          {aliases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {aliases.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-3 py-0.5 text-xs text-primary font-mono"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => removeAlias(a)}
                    className="hover:text-destructive transition-colors"
                    aria-label={`Eliminar alias ${a}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BlockNote Editor */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">
          Contenido del artículo
        </label>
        <WikiEditor
          initialContent={article?.content as Block[] | undefined}
          onChange={handleEditorChange}
        />
      </div>
    </form>
  );
}
