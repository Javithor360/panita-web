"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EDITIONS, CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => (currentYear - i).toString());
const DEFAULT_OPEN = ["editions", "categories", "years"];

interface GallerySidebarProps {
  activeEdition?: string | null;
  activeCategory?: string | null;
  activeYear?: string | null;
  onEditionChange?: (id: string) => void;
  onCategoryChange?: (id: string) => void;
  onYearChange?: (year: string) => void;
}

export function GallerySidebar({
  activeEdition,
  activeCategory,
  activeYear,
  onEditionChange,
  onCategoryChange,
  onYearChange
}: GallerySidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-[200px] xl:w-[240px] shrink-0 gap-4 xl:gap-6 pb-10">
      
      <Accordion multiple defaultValue={DEFAULT_OPEN} className="w-full flex flex-col gap-3 xl:gap-4 ">
        {/* Editions Filter */}
        <AccordionItem value="editions" className="border border-white/5 bg-background/60 backdrop-blur-md rounded-[0.5rem] px-3 xl:px-4 py-1">
          <AccordionTrigger className="hover:no-underline py-2 xl:py-3 text-base xl:text-lg font-bold text-foreground transition-colors">
            Edición
          </AccordionTrigger>
          <AccordionContent className="pt-1 xl:pt-2 pb-2 xl:pb-3 flex flex-col gap-1">
            {EDITIONS.map((edition) => {
              const Icon = edition.iconComponent;
              const isSelected = activeEdition === edition.id;
              
              return (
                <button
                  key={edition.id}
                  onClick={() => onEditionChange?.(edition.id)}
                  className={cn(
                    "flex items-center space-x-2 xl:space-x-3 w-full px-2 xl:px-3 py-1.5 xl:py-2 rounded-md transition-all text-xs xl:text-sm cursor-pointer",
                    isSelected 
                      ? "bg-primary/20 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground font-medium"
                  )}
                >
                  <Icon className={cn("size-3.5 xl:size-4 transition-opacity ", isSelected ? "opacity-100" : "opacity-70")} />
                  <span>{edition.label}</span>
                </button>
              )
            })}
          </AccordionContent>
        </AccordionItem>

        {/* Categories Filter */}
        <AccordionItem value="categories" className="border border-white/5 bg-background/60 backdrop-blur-md rounded-[0.5rem] px-3 xl:px-4 py-1">
          <AccordionTrigger className="hover:no-underline py-2 xl:py-3 text-base xl:text-lg font-bold text-foreground transition-colors">
            Etiquetas
          </AccordionTrigger>
          <AccordionContent className="pt-1 xl:pt-2 pb-2 xl:pb-3 flex flex-col gap-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.iconComponent;
              const isSelected = activeCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange?.(cat.id)}
                  className={cn(
                    "flex items-center space-x-2 xl:space-x-3 w-full px-2 xl:px-3 py-1.5 xl:py-2 rounded-md transition-all text-xs xl:text-sm cursor-pointer",
                    isSelected 
                      ? "bg-primary/20 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground font-medium"
                  )}
                >
                  <Icon className={cn("size-3.5 xl:size-4 transition-opacity", isSelected ? "opacity-100" : "opacity-70")} />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </AccordionContent>
        </AccordionItem>

        {/* Years Filter */}
        <AccordionItem value="years" className="border border-white/5 bg-background/60 backdrop-blur-md rounded-[0.5rem] px-3 xl:px-4 py-1">
          <AccordionTrigger className="hover:no-underline py-2 xl:py-3 text-base xl:text-lg font-bold text-foreground transition-colors">
            Año de publicación
          </AccordionTrigger>
          <AccordionContent className="pt-1 xl:pt-2 pb-2 xl:pb-3 flex flex-col gap-1">
            {YEARS.map((year) => {
              const isSelected = activeYear === year;
              
              return (
                <button
                  key={year}
                  onClick={() => onYearChange?.(year)}
                  className={cn(
                    "flex items-center space-x-2 xl:space-x-3 w-full px-2 xl:px-3 py-1.5 xl:py-2 rounded-md transition-all text-xs xl:text-sm cursor-pointer",
                    isSelected 
                      ? "bg-primary/20 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground font-medium"
                  )}
                >
                  <span>{year}</span>
                </button>
              )
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
