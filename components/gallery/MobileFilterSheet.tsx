"use client";

import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EDITIONS, CATEGORIES } from "@/lib/constants";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => (currentYear - i).toString());
const DEFAULT_OPEN = ["editions", "categories", "years"];

interface MobileFilterSheetProps {
  activeEditions?: string[];
  activeCategories?: string[];
  activeYears?: string[];
  onEditionToggle?: (id: string) => void;
  onCategoryToggle?: (id: string) => void;
  onYearToggle?: (year: string) => void;
}

export function MobileFilterSheet({
  activeEditions = [],
  activeCategories = [],
  activeYears = [],
  onEditionToggle,
  onCategoryToggle,
  onYearToggle
}: MobileFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden flex-1 flex justify-center items-center gap-2 bg-background/60 backdrop-blur-md border border-white/5 text-sm rounded-md px-4 py-2 text-foreground font-medium hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-primary h-[38px]">
        <Filter className="size-4" />
        Filtros
      </SheetTrigger>
      <SheetContent side="right" className="!w-full 2xs:!w-[85vw] sm:!w-[400px] border-l-muted/20 p-0 flex flex-col overscroll-none bg-popover">
        <SheetHeader className="text-left p-0 mt-6 px-6 h-12 flex justify-center shrink-0">
          <SheetTitle className="flex items-center gap-2 font-bold text-xl">
            <Filter className="size-6 text-primary" />
            Filtros
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 pb-10 overscroll-contain">
          <Accordion multiple defaultValue={DEFAULT_OPEN} className="w-full flex flex-col gap-4">
          {/* Editions Filter */}
          <AccordionItem value="editions" className="border border-white/5 bg-background/60 backdrop-blur-md rounded-[0.5rem] px-4 py-1">
            <AccordionTrigger className="hover:no-underline py-3 text-lg font-bold text-foreground transition-colors">
              Edición
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-3 flex flex-col gap-1">
              {EDITIONS.map((edition) => {
                const Icon = edition.iconComponent;
                const isSelected = activeEditions.includes(edition.id);
                
                return (
                  <button
                    key={edition.id}
                    onClick={() => onEditionToggle?.(edition.id)}
                    className={cn(
                      "flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-all text-sm cursor-pointer",
                      isSelected 
                        ? "bg-primary/20 text-primary font-semibold" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground font-medium"
                    )}
                  >
                    <Icon className={cn("size-4 transition-opacity", isSelected ? "opacity-100" : "opacity-70")} />
                    <span>{edition.label}</span>
                  </button>
                )
              })}
            </AccordionContent>
          </AccordionItem>

          {/* Categories Filter */}
          <AccordionItem value="categories" className="border border-white/5 bg-background/60 backdrop-blur-md rounded-[0.5rem] px-4 py-1">
            <AccordionTrigger className="hover:no-underline py-3 text-lg font-bold text-foreground transition-colors">
              Etiquetas
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-3 flex flex-col gap-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.iconComponent;
                const isSelected = activeCategories.includes(cat.id);
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryToggle?.(cat.id)}
                    className={cn(
                      "flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-all text-sm cursor-pointer",
                      isSelected 
                        ? "bg-primary/20 text-primary font-semibold" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground font-medium"
                    )}
                  >
                    <Icon className={cn("size-4 transition-opacity", isSelected ? "opacity-100" : "opacity-70")} />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </AccordionContent>
          </AccordionItem>

          {/* Years Filter */}
          <AccordionItem value="years" className="border border-white/5 bg-background/60 backdrop-blur-md rounded-[0.5rem] px-4 py-1">
            <AccordionTrigger className="hover:no-underline py-3 text-lg font-bold text-foreground transition-colors">
              Año de publicación
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-3 flex flex-col gap-1">
              {YEARS.map((year) => {
                const isSelected = activeYears.includes(year);
                
                return (
                  <button
                    key={year}
                    onClick={() => onYearToggle?.(year)}
                    className={cn(
                      "flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-all text-sm cursor-pointer",
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
