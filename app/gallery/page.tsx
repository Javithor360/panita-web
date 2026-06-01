import { GallerySidebar } from "@/components/gallery/GallerySidebar";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { MobileFilterSheet } from "@/components/gallery/MobileFilterSheet";

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16 lg:mt-24">
      {/* Mobile Top Bar */}
      <div className="flex flex-col gap-4 lg:hidden mb-6">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Explorar Galería</h1>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-full border border-muted/30 font-medium">
            12 de 3171 fotos
          </div>
          <MobileFilterSheet />
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar for Desktop */}
        <GallerySidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Desktop Title & Top Stats */}
          <div className="hidden lg:flex items-center justify-between pb-4 border-b border-muted/20">
            <h1 className="text-4xl font-black tracking-tight text-foreground">Explorar Galería</h1>
            <div className="text-sm text-muted-foreground bg-muted/20 px-4 py-2 rounded-full border border-muted/30 font-medium">
              Mostrando 12 de 3171 fotos
            </div>
          </div>
          
          {/* The Grid */}
          <GalleryGrid />
        </div>
      </div>
    </div>
  );
}
