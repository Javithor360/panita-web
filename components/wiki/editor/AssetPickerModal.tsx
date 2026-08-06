"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import { Search, Upload, X, Check, Loader2, Pickaxe, Box, Skull, LayoutTemplate, Star, ChevronDown, PenLine, Folder } from "lucide-react";
import { uploadWikiAsset } from "@/app/actions/wiki";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WikiAsset {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface WikiCategory {
  slug: string;
  name: string;
}

interface AssetPickerModalProps {
  category: string;
  onSelect: (asset: WikiAsset) => void;
  onClose: () => void;
}

export function AssetPickerModal({ category, onSelect, onClose }: AssetPickerModalProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<WikiAsset[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<WikiAsset | null>(null);
  const [uploadCategory, setUploadCategory] = useState(category);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [dbCategories, setDbCategories] = useState<WikiCategory[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    handleSearch("");
    fetch("/api/wiki/categories")
      .then((res) => res.json())
      .then((data) => setDbCategories(data.categories ?? []))
      .catch(() => {});
      
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleSearch(q: string) {
    setSearch(q);
    setSearching(true);
    try {
      const res = await fetch(`/api/wiki/assets?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.assets ?? []);
    } finally {
      setSearching(false);
    }
  }

  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleFileSelection = (file?: File) => {
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      
      const nameInput = document.getElementById("asset-name-input") as HTMLInputElement;
      if (nameInput && !nameInput.value) {
        nameInput.value = file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
      }
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && fileRef.current) {
      const file = e.dataTransfer.files[0];
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
      handleFileSelection(file);
    }
  };

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("category", uploadCategory);
    setUploadError(null);

    startUpload(async () => {
      try {
        const asset = await uploadWikiAsset(fd);
        onSelect(asset as WikiAsset);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Error al subir el archivo");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Selector de assets"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-primary text-lg">Assets de la Wiki</h2>
          <button
            id="asset-picker-close"
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search existing */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            id="asset-search-input"
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar en la wiki global..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Results grid */}
        {searching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 mb-4 max-h-48 overflow-y-auto">
            {results.map((asset) => (
              <button
                key={asset.id}
                id={`asset-item-${asset.id}`}
                onClick={() => setSelected(asset)}
                className={`relative aspect-square rounded-lg border p-1 transition-all ${
                  selected?.id === asset.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                title={asset.name}
              >
                <Image
                  src={asset.url}
                  alt={asset.name}
                  fill
                  className="object-contain p-1 image-rendering-pixelated"
                />
                {selected?.id === asset.id && (
                  <div className="absolute top-0.5 right-0.5 rounded-full bg-primary p-0.5">
                    <Check className="size-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : search.length > 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 mb-4">
            Sin resultados para &quot;{search}&quot;
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 mb-4">
            Aún no hay assets subidos.
          </p>
        )}

        {/* Confirm selection */}
        {selected && (
          <button
            id="asset-confirm-selection"
            onClick={() => onSelect(selected)}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm mb-4 hover:opacity-90 transition-opacity"
          >
            Usar &quot;{selected.name}&quot;
          </button>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">o sube uno nuevo</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Upload form */}
        <form onSubmit={handleUpload} className="space-y-3">
          <input
            ref={fileRef}
            id="asset-file-input"
            name="file"
            type="file"
            accept="image/*"
            required
            className="hidden"
            onChange={(e) => handleFileSelection(e.target.files?.[0])}
          />
          <div className="flex gap-3">
            <div className="w-[140px] shrink-0 flex flex-col gap-1.5">
              <label htmlFor="asset-category-input" className="text-xs font-medium text-muted-foreground">Ruta</label>
              {isCustomCategory ? (
                <div className="flex gap-1 h-10">
                  <input
                    id="asset-category-input"
                    name="category"
                    type="text"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    placeholder="ej: icons"
                    required
                    className="w-full min-w-0 px-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <button type="button" onClick={() => setIsCustomCategory(false)} className="px-2 flex items-center justify-center border border-border rounded-lg hover:bg-muted/10 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 h-10 rounded-lg bg-background border border-border text-foreground text-sm hover:border-primary/50 transition-colors">
                    <span className="truncate">{uploadCategory}</span>
                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px]">
                    {dbCategories.map((c) => (
                      <DropdownMenuItem key={c.slug} onClick={() => setUploadCategory(c.slug)}>
                        {c.slug}
                      </DropdownMenuItem>
                    ))}
                    {dbCategories.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={() => setIsCustomCategory(true)}>Otro (escribir ruta)...</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {!isCustomCategory && <input type="hidden" name="category" value={uploadCategory} />}
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
              <label htmlFor="asset-name-input" className="text-xs font-medium text-muted-foreground">Nombre del asset</label>
              <input
                id="asset-name-input"
                name="name"
                type="text"
                placeholder="ej: superdiamond_helmet"
                required
                className="w-full px-3 h-10 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div
            className={`w-full py-8 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${
              dragActive ? "border-primary bg-primary/10" : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            {previewUrl ? (
              <div className="relative w-full h-32">
                <Image src={previewUrl} alt="Preview" fill className="object-contain image-rendering-pixelated" />
              </div>
            ) : (
              <>
                <div className="p-3 rounded-full bg-background border border-border shadow-sm">
                  <Upload className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Haz clic para subir o arrastra un archivo aquí
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, GIF hasta 4.5MB</p>
              </>
            )}
          </div>

          {uploadError && (
            <p className="text-xs text-destructive">{uploadError}</p>
          )}

          <button
            id="asset-upload-submit"
            type="submit"
            disabled={uploading}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? "Subiendo..." : "Subir a Cloudinary"}
          </button>
        </form>
      </div>
    </div>
  );
}
