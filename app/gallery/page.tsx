import { GallerySidebar } from "@/components/gallery/GallerySidebar";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { MobileFilterSheet } from "@/components/gallery/MobileFilterSheet";
import { Search } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function GalleryPage() {
  return (
    <>
      {/* Dynamic Background Pattern - Scoped to Gallery only */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[oklch(0.14_0_0)]"
           style={{
             backgroundImage: `
               radial-gradient(ellipse 60% 60% at 20% 0%, color-mix(in oklab, var(--primary) 12%, transparent), transparent),
               radial-gradient(ellipse 60% 60% at 80% 100%, color-mix(in oklab, var(--primary) 12%, transparent), transparent),
               linear-gradient(to right, color-mix(in oklab, var(--foreground) 3%, transparent) 1px, transparent 1px),
               linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 3%, transparent) 1px, transparent 1px)
             `,
             backgroundSize: '100% 100%, 100% 100%, 32px 32px, 32px 32px'
           }}
      />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex gap-6 md:gap-8 items-start">
        {/* Sidebar for Desktop (md and up) */}
        <GallerySidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          
          {/* Top Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar foto o autor..." 
              className="w-full bg-muted/30 border border-muted/30 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Controls & Pagination Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-muted/10 p-2 rounded-lg border border-muted/20">
            {/* Left side: View Options & Mobile Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select className="bg-muted/30 border border-muted/30 text-sm rounded-md px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-9">
                <option>View: 12</option>
                <option>View: 24</option>
                <option>View: 48</option>
              </select>
              <MobileFilterSheet />
            </div>

            {/* Right side: Pagination */}
            <div className="flex items-center justify-end w-full sm:w-auto">
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
            </div>
          </div>
          
          {/* The Grid */}
          <GalleryGrid />
        </div>
      </div>
      </div>
    </>
  );
}
