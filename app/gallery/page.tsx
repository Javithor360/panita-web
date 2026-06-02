import { GallerySidebar } from "@/components/gallery/GallerySidebar";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { MobileFilterSheet } from "@/components/gallery/MobileFilterSheet";
import { ViewSelect } from "@/components/gallery/ViewSelect";
import { Search, ArrowUp } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { DynamicBackground } from "@/components/ui/DynamicBackground";

const GalleryPagination = () => (
  <Pagination className="mx-0 w-auto">
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious href="#" className="h-8 px-2" text="" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#" isActive className="h-8 w-8">1</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#" className="h-8 w-8 hidden sm:inline-flex">2</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationEllipsis className="h-8 w-8" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#" className="h-8 w-auto px-2">3171</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationNext href="#" className="h-8 px-2" text="" />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);

export default function GalleryPage() {
  return (
    <>
      <DynamicBackground />
      <div id="gallery-top" className="container mx-auto px-4 py-8 mt-16">
        <div className="flex gap-6 md:gap-2 xl:gap-6 items-start">
        {/* Sidebar for Desktop (md and up) */}
        <GallerySidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          
          {/* Top Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-foreground z-10" />
            <input 
              type="text" 
              placeholder="Buscar foto o autor..." 
              className="w-full bg-background/60 backdrop-blur-md border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Controls & Pagination Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center py-2">
            {/* Left side: View Options & Mobile Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <ViewSelect />
              <MobileFilterSheet />
            </div>

            {/* Right side: Pagination */}
            <div className="flex items-center justify-end w-full sm:w-auto">
              <GalleryPagination />
            </div>
          </div>
          
          {/* The Grid */}
          <GalleryGrid />

          {/* Bottom Pagination & Scroll to Top */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center py-4 mt-2 border-t border-white/5">
            {/* Left side: Scroll to Top */}
            <div className="flex justify-start w-full sm:w-auto">
              <a 
                href="#gallery-top"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-md hover:bg-white/5"
              >
                <ArrowUp className="size-4" />
                Volver arriba
              </a>
            </div>
            
            {/* Right side: Pagination */}
            <div className="flex items-center justify-end w-full sm:w-auto">
              <GalleryPagination />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
