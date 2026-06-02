"use client";

import { useState, useEffect } from "react";
import { GallerySidebar } from "@/components/gallery/GallerySidebar";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { MobileFilterSheet } from "@/components/gallery/MobileFilterSheet";
import { ViewSelect } from "@/components/gallery/ViewSelect";
import { Search, ArrowUp } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getPhotos, GalleryFilters } from "@/app/actions/gallery";

export function GalleryContainer() {
  const [page, setPage] = useState(1);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const [photos, setPhotos] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      const filters: GalleryFilters = {
        page,
        editionId,
        categoryId,
        search: debouncedSearch
      };
      const result = await getPhotos(filters);
      setPhotos(result.photos);
      setTotalPages(Math.max(1, result.pagination.totalPages));
      setLoading(false);
    };

    fetchPhotos();
  }, [page, editionId, categoryId, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      document.getElementById('gallery-top')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const GalleryPagination = () => (
    <Pagination className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }} 
            href="#" 
            className={`h-8 px-2 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`} 
            text="" 
          />
        </PaginationItem>
        
        <PaginationItem>
          <PaginationLink href="#" isActive className="h-8 w-8">
            {page}
          </PaginationLink>
        </PaginationItem>
        
        {page < totalPages && (
          <PaginationItem>
            <PaginationLink 
              href="#" 
              onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
              className="h-8 w-8 hidden sm:inline-flex"
            >
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        
        {page < totalPages - 1 && (
          <PaginationItem>
            <PaginationEllipsis className="h-8 w-8" />
          </PaginationItem>
        )}
        
        {page < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink 
              href="#" 
              onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}
              className="h-8 w-auto px-2"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        
        <PaginationItem>
          <PaginationNext 
            onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }} 
            href="#" 
            className={`h-8 px-2 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`} 
            text="" 
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <div id="gallery-top" className="container mx-auto px-4 py-8 mt-16">
      <div className="flex gap-6 md:gap-2 xl:gap-6 items-start">
        {/* Sidebar for Desktop */}
        <GallerySidebar 
          activeEdition={editionId}
          activeCategory={categoryId}
          onEditionChange={(id) => { setEditionId(id === editionId ? null : id); setPage(1); }}
          onCategoryChange={(id) => { setCategoryId(id === categoryId ? null : id); setPage(1); }}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          
          {/* Top Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-foreground z-10" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar foto o autor..." 
              className="w-full bg-background/60 backdrop-blur-md border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Controls & Pagination Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center py-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <ViewSelect />
              <MobileFilterSheet 
                activeEdition={editionId}
                activeCategory={categoryId}
                onEditionChange={(id) => { setEditionId(id === editionId ? null : id); setPage(1); }}
                onCategoryChange={(id) => { setCategoryId(id === categoryId ? null : id); setPage(1); }}
              />
            </div>

            {/* Right side: Pagination */}
            <div className="flex items-center justify-end w-full sm:w-auto">
              <GalleryPagination />
            </div>
          </div>
          
          {/* The Grid */}
          <GalleryGrid photos={photos} loading={loading} />

          {/* Bottom Pagination & Scroll to Top */}
          <div className="flex justify-between items-center py-4 mt-2 border-t border-white/5 w-full">
            <div className="flex justify-start">
              <a 
                href="#gallery-top"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('gallery-top')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center h-8 w-8 md:w-auto md:px-3 gap-2 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-white/5 shrink-0"
                title="Volver arriba"
              >
                <ArrowUp className="size-6 shrink-0" />
                <span className="hidden md:inline text-sm font-medium">Volver arriba</span>
              </a>
            </div>
            
            <div className="flex items-center justify-end overflow-x-auto">
              <GalleryPagination />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
