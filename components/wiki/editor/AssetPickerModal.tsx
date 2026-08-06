"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Search, Upload, X, Check, Loader2 } from "lucide-react";
import { uploadWikiAsset } from "@/app/actions/wiki";

interface WikiAsset {
  id: string;
  name: string;
  url: string;
  category: string;
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
  const [uploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSearch(q: string) {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/wiki/assets?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.assets ?? []);
    } finally {
      setSearching(false);
    }
  }

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("category", category);
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
          <h2 className="font-minecraft text-primary text-lg">Assets de la Wiki</h2>
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
            placeholder={`Buscar en ${category}...`}
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
        ) : search.length >= 2 ? (
          <p className="text-sm text-muted-foreground text-center py-4 mb-4">
            Sin resultados para &quot;{search}&quot;
          </p>
        ) : null}

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
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">o sube uno nuevo</span>
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
          />
          <input name="category" type="hidden" value={category} />

          <div className="space-y-2">
            <input
              id="asset-name-input"
              name="name"
              type="text"
              placeholder="Nombre del asset (ej: superdiamond_helmet)"
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              id="asset-file-pick-btn"
              onClick={() => fileRef.current?.click()}
              className="w-full py-2 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-primary/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="size-4" />
              {fileRef.current?.files?.[0]?.name ?? "Seleccionar archivo"}
            </button>
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
