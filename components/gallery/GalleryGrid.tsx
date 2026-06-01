import { PhotoCard } from "./PhotoCard";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Dummy data for visual layout
const DUMMY_PHOTOS = Array.from({ length: 12 }).map((_, i) => ({
  id: `photo-${i}`,
  title: `Aventura Épica #${i + 1}`,
  author: `Panita_${i}`,
  category: "Construcción",
  imageUrl: `https://picsum.photos/seed/${i + 150}/800/450`, // Random generic images
}));

export function GalleryGrid() {
  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 lg:gap-6">
        {DUMMY_PHOTOS.map((photo, i) => (
          <PhotoCard key={photo.id} {...photo} priority={i < 4} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 mb-12">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" className="hover:bg-muted/30 hover:text-foreground transition-colors" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary font-bold">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="hover:bg-muted/30 hover:text-foreground transition-colors">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="hover:bg-muted/30 hover:text-foreground transition-colors">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" className="hover:bg-muted/30 hover:text-foreground transition-colors" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
