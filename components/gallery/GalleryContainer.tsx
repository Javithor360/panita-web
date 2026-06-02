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
  const [pageSize, setPageSize] = useState(15);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const [photos, setPhotos] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
        pageSize,
        editionId,
        categoryId,
        year,
        search: debouncedSearch
      };
      const result = await getPhotos(filters);
      setPhotos(result.photos);
      setTotalPages(Math.max(1, result.pagination.totalPages));
      setTotalItems(result.pagination.totalItems);
      setLoading(false);
    };

    fetchPhotos();
  }, [page, pageSize, editionId, categoryId, year, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      document.getElementById('gallery-top')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const GalleryPagination = () => {
    const [mounted, setMounted] = useState(false);
    const [width, setWidth] = useState(0);

    useEffect(() => {
      setMounted(true);
      setWidth(window.innerWidth);
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // SSR fallback: Mobile logic
    const isMd = mounted ? width >= 768 : false;
    const isXl = mounted ? width >= 1280 : false;
    const is2xl = mounted ? width >= 1536 : false;

    let showBeforeCount = 2; // +1, +2
    if (is2xl) showBeforeCount = 3; // +1, +2, +3
    else if (isMd && !isXl) showBeforeCount = 3; // md but not xl

    let showEndCount = 1; // N
    if (isXl || is2xl) showEndCount = 2; // N-1, N

    const items: React.ReactNode[] = [];
    
    // Always show current page
    items.push(
      <PaginationItem key={page}>
        <PaginationLink href="#" isActive className="h-8 w-8">{page}</PaginationLink>
      </PaginationItem>
    );

    let lastAdded = page;

    // Add before items
    for (let i = 1; i <= showBeforeCount; i++) {
      const p = page + i;
      if (p <= totalPages - showEndCount) { // Leave room for end items
        items.push(
          <PaginationItem key={p}>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(p); }} className="h-8 w-8">{p}</PaginationLink>
          </PaginationItem>
        );
        lastAdded = p;
      }
    }

    // Add ellipsis if gap exists
    const firstEndItem = totalPages - showEndCount + 1;
    if (firstEndItem > lastAdded + 1) {
      items.push(
        <PaginationItem key="ellipsis">
          <PaginationEllipsis className="h-8 w-8" />
        </PaginationItem>
      );
    }

    // Add end items
    for (let i = showEndCount - 1; i >= 0; i--) {
      const p = totalPages - i;
      if (p > lastAdded) {
        items.push(
          <PaginationItem key={p}>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(p); }} className="h-8 w-auto px-2">{p}</PaginationLink>
          </PaginationItem>
        );
        lastAdded = p;
      }
    }

    return (
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
          {items}
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
  };

  return (
    <div id="gallery-top" className="container mx-auto px-4 py-8 mt-16">
      <div className="flex gap-6 md:gap-2 xl:gap-6 items-start">
        {/* Sidebar for Desktop */}
        <GallerySidebar 
          activeEdition={editionId}
          activeCategory={categoryId}
          activeYear={year}
          onEditionChange={(id) => { setEditionId(id === editionId ? null : id); setPage(1); }}
          onCategoryChange={(id) => { setCategoryId(id === categoryId ? null : id); setPage(1); }}
          onYearChange={(y) => { setYear(y === year ? null : y); setPage(1); }}
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
          <div className="relative flex flex-col md:flex-row gap-4 justify-between items-start md:items-center py-2">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <ViewSelect 
                value={pageSize}
                onChange={(val) => { setPageSize(val); setPage(1); }}
              />
              <MobileFilterSheet 
                activeEdition={editionId}
                activeCategory={categoryId}
                activeYear={year}
                onEditionChange={(id) => { setEditionId(id === editionId ? null : id); setPage(1); }}
                onCategoryChange={(id) => { setCategoryId(id === categoryId ? null : id); setPage(1); }}
                onYearChange={(y) => { setYear(y === year ? null : y); setPage(1); }}
              />
            </div>

            {/* Desktop results count text */}
            {(editionId || categoryId || year || debouncedSearch) ? (
              <div className="hidden md:block absolute left-1/2 -translate-x-1/2 text-sm text-white/60 font-medium whitespace-nowrap">
                Revisando {totalItems} resultados
              </div>
            ) : null}

            {/* Right side: Mobile Results & Pagination */}
            <div className="flex items-center justify-between w-full md:w-auto md:justify-end">
              {(editionId || categoryId || year || debouncedSearch) ? (
                <div className="md:hidden text-xs text-white/60 font-medium whitespace-nowrap">
                  Revisando {totalItems} res.
                </div>
              ) : null}
              <GalleryPagination />
            </div>
          </div>
          
          {/* The Grid */}
          <GalleryGrid photos={photos} loading={loading} />

          {/* Bottom Pagination & Scroll to Top */}
          {photos.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
