"use client";

import { useState, useEffect } from "react";
import { GallerySidebar } from "@/components/gallery/GallerySidebar";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { MobileFilterSheet } from "@/components/gallery/MobileFilterSheet";
import { ViewSelect } from "@/components/gallery/ViewSelect";
import { Search, ArrowUp, MoreHorizontal, Dices } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getPhotos, getPhotoById, GalleryFilters, Photo } from "@/app/actions/gallery";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PhotoModal } from "@/components/gallery/PhotoModal";
import { useRef } from "react";



interface GalleryPaginationProps {
  page: number;
  totalPages: number;
  handlePageChange: (newPage: number) => void;
}

const GalleryPagination = ({ page, totalPages, handlePageChange }: GalleryPaginationProps) => {
  const [mounted, setMounted] = useState(false);
  const [width, setWidth] = useState(0);
  const [editingEllipsis, setEditingEllipsis] = useState<"left" | "right" | null>(null);
  const [jumpPage, setJumpPage] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMd = mounted ? width >= 768 : false;
  const isXl = mounted ? width >= 1280 : false;
  const is2xl = mounted ? width >= 1536 : false;

  const getPaginationRange = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (is2xl) {
      if (page <= 4) return [1, 2, 3, 4, '...right', totalPages - 1, totalPages];
      if (page >= totalPages - 3) return [1, 2, '...left', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      return [1, '...left', page - 1, page, page + 1, '...right', totalPages];
    }
    
    if (isXl) {
      if (page <= 3) return [1, 2, 3, '...right', totalPages - 1, totalPages];
      if (page >= totalPages - 2) return [1, 2, '...left', totalPages - 2, totalPages - 1, totalPages];
      return [1, '...left', page, '...right', totalPages - 1, totalPages];
    }

    if (isMd) {
      if (page <= 4) return [1, 2, 3, 4, '...right', totalPages];
      if (page >= totalPages - 3) return [1, '...left', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      return [1, '...left', page - 1, page, '...right', totalPages];
    }

    if (page <= 3) return [1, 2, 3, '...right', totalPages];
    if (page >= totalPages - 2) return [1, '...left', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...left', page, '...right', totalPages];
  };

  const paginationRange = getPaginationRange();

  const renderEllipsis = (type: "left" | "right") => {
    const isEditing = editingEllipsis === type;

    return (
      <PaginationItem key={`ellipsis-${type}`}>
        {isEditing ? (
          <input 
            autoFocus
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value.replace(/\D/g, ''))}
            onBlur={() => {
              setEditingEllipsis(null);
              if (jumpPage) {
                 const p = parseInt(jumpPage, 10);
                 if (!isNaN(p)) handlePageChange(p);
              }
              setJumpPage("");
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              else if (e.key === 'Escape') {
                setEditingEllipsis(null);
                setJumpPage("");
              }
            }}
            className="h-8 w-10 md:w-12 rounded-md border border-input bg-background/50 px-1 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            placeholder="..."
          />
        ) : (
          <button 
            onClick={() => setEditingEllipsis(type)}
            className="flex h-8 w-8 items-center justify-center hover:bg-white/5 rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
            title="Ir a página..."
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}
      </PaginationItem>
    );
  };

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

        {paginationRange.map((item, index) => {
          if (item === '...left') return renderEllipsis('left');
          if (item === '...right') return renderEllipsis('right');
          
          const pageNumber = item as number;
          return (
            <PaginationItem key={index}>
              <PaginationLink 
                href="#" 
                isActive={pageNumber === page}
                onClick={(e) => { e.preventDefault(); handlePageChange(pageNumber); }} 
                className={pageNumber === page ? "h-8 w-8" : "h-8 w-auto min-w-8 px-2"}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

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

export function GalleryContainer({ canEdit = false }: { canEdit?: boolean }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [editionIds, setEditionIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [randomSeed, setRandomSeed] = useState<number | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const photoParam = searchParams.get('photo');
  
  const [isDirectLink, setIsDirectLink] = useState(false);

  // Handle URL changes for the modal
  useEffect(() => {
    if (photoParam && photos.length === 0 && loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDirectLink(true);
    } else if (!photoParam) {
      setIsDirectLink(false);
    }

    if (!photoParam) {
      setSelectedPhoto(null);
      return;
    }

    // Is it in current page results?
    const existing = photos.find(p => p.id === photoParam);
    if (existing) {
      setSelectedPhoto(existing);
    } else {
      // It's a direct link to a photo not currently loaded
      getPhotoById(photoParam).then(fetched => {
        if (fetched) setSelectedPhoto(fetched);
      });
    }
  }, [photoParam, photos, loading]);

  const closeModal = () => {
    setSelectedPhoto(null);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('photo');
    const queryString = newParams.toString();
    if (queryString) {
      router.push(`${pathname}?${queryString}`, { scroll: false });
    } else {
      window.history.replaceState(null, '', pathname);
      router.replace(`${pathname}?`, { scroll: false });
    }
  };
  
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
        editionIds,
        categoryIds,
        years,
        search: debouncedSearch,
        randomSeed
      };
      const result = await getPhotos(filters);
      setPhotos(result.photos);
      setTotalPages(Math.max(1, result.pagination.totalPages));
      setTotalItems(result.pagination.totalItems);
      setLoading(false);
    };

    fetchPhotos();
  }, [page, pageSize, editionIds, categoryIds, years, debouncedSearch, randomSeed]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      document.getElementById('gallery-top')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEditionToggle = (id: string) => {
    setEditionIds(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    setPage(1);
    setRandomSeed(null);
  };

  const handleCategoryToggle = (id: string) => {
    setCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    setPage(1);
    setRandomSeed(null);
  };

  const handleYearToggle = (y: string) => {
    setYears(prev => prev.includes(y) ? prev.filter(item => item !== y) : [...prev, y]);
    setPage(1);
    setRandomSeed(null);
  };

  const handleRandomize = () => {
    setRandomSeed(Date.now());
    setPage(1);
  };

  let onNext: (() => void) | undefined;
  let onPrev: (() => void) | undefined;
  
  if (selectedPhoto && !isDirectLink) {
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex !== -1) {
      if (currentIndex > 0) {
        onPrev = () => {
          const prevId = photos[currentIndex - 1].id;
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.set('photo', prevId);
          router.push(`?${newParams.toString()}`, { scroll: false });
        };
      }
      if (currentIndex < photos.length - 1) {
        onNext = () => {
          const nextId = photos[currentIndex + 1].id;
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.set('photo', nextId);
          router.push(`?${newParams.toString()}`, { scroll: false });
        };
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex gap-6 md:gap-2 xl:gap-6 items-start">
        <GallerySidebar 
          activeEditions={editionIds}
          activeCategories={categoryIds}
          activeYears={years}
          onEditionToggle={handleEditionToggle}
          onCategoryToggle={handleCategoryToggle}
          onYearToggle={handleYearToggle}
        />
        
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          
          <div id="gallery-top" className="relative w-full scroll-mt-28 md:scroll-mt-32">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-foreground z-10" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar foto o autor..." 
              className="w-full bg-background/60 backdrop-blur-md border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

          <div className="relative flex flex-col md:flex-row gap-4 justify-between items-start md:items-center py-2">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <ViewSelect 
                value={pageSize}
                onChange={(val) => { setPageSize(val); setPage(1); }}
              />
              <button
                onClick={handleRandomize}
                className="hidden sm:flex group items-center justify-center gap-2 bg-background/60 backdrop-blur-md border border-white/5 text-sm rounded-md px-4 md:px-3 lg:px-4 py-2 text-foreground font-medium hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
                title="Aleatorizar orden"
              >
                <Dices className="size-4 transition-transform duration-500 group-hover:rotate-[360deg]" />
                <span className="hidden sm:inline md:hidden lg:inline">Aleatorizar</span>
              </button>
              <MobileFilterSheet 
                activeEditions={editionIds}
                activeCategories={categoryIds}
                activeYears={years}
                onEditionToggle={handleEditionToggle}
                onCategoryToggle={handleCategoryToggle}
                onYearToggle={handleYearToggle}
              />
            </div>

            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-2">
              <button
                onClick={handleRandomize}
                className="sm:hidden group flex items-center justify-center bg-background/60 backdrop-blur-md border border-white/5 rounded-md h-[36px] w-[36px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
                title="Aleatorizar orden"
              >
                <Dices className="size-4 transition-transform duration-500 group-hover:rotate-[360deg]" />
              </button>
              <GalleryPagination page={page} totalPages={totalPages} handlePageChange={handlePageChange} />
            </div>
          </div>
          
          <GalleryGrid photos={photos} loading={loading} />

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
                <GalleryPagination page={page} totalPages={totalPages} handlePageChange={handlePageChange} />
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={closeModal} 
          onNext={onNext}
          onPrev={onPrev}
          canEdit={canEdit}
          onUpdate={(updatedPhoto) => {
            setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
            setSelectedPhoto(updatedPhoto);
          }}
        />
      )}
    </div>
  );
}
