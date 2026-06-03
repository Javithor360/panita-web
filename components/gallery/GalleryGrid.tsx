import { PhotoCard } from "./PhotoCard";
import { Loader2 } from "lucide-react";

interface GalleryGridProps {
  photos: any[];
  loading?: boolean;
}

export function GalleryGrid({ photos, loading }: GalleryGridProps) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <Loader2 className="size-8 animate-spin text-primary/50 mb-4" />
        <p className="text-muted-foreground font-medium">Cargando galería...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 min-h-[50vh] text-center px-4">
        <div className="bg-muted/10 rounded-full p-6 mb-4 border border-white/5">
          <svg className="size-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">No se encontraron fotos</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No hay fotografías que coincidan con los filtros seleccionados. Intenta borrar algunos filtros o cambiar tu búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {photos.map((photo, i) => (
          <PhotoCard 
            key={photo.id} 
            id={photo.id}
            title={photo.title}
            author={photo.author}
            tagIds={photo.tagIds}
            imageUrl={photo.imageUrl}
            priority={i < 4} 
          />
        ))}
      </div>
    </div>
  );
}
