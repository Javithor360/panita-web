import { PhotoCard } from "./PhotoCard";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Dummy data for visual layout
const DUMMY_PHOTOS = Array.from({ length: 30 }).map((_, i) => ({
  id: `photo-${i}`,
  title: `Aventura Épica #${i + 1}`,
  author: `Panita_${i}`,
  tags: ["Construcción", "Survival", "Evento", "Destacada"].slice(0, (i % 4) + 1), // 1 to 4 tags
  imageUrl: `https://picsum.photos/seed/${i + 150}/800/450`, // Random generic images
}));

export function GalleryGrid() {
  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {DUMMY_PHOTOS.map((photo, i) => (
          <PhotoCard key={photo.id} {...photo} priority={i < 4} />
        ))}
      </div>
    </div>
  );
}
