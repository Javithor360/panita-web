"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EDITIONS, CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => (currentYear - i).toString());
const DEFAULT_OPEN = ["editions", "categories", "years"];

export function GallerySidebar() {
  const [selectedEditions, setSelectedEditions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  const toggleEdition = (id: string) => {
    setSelectedEditions(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleYear = (year: string) => {
    setSelectedYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);
  };

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 gap-6 pb-10">
      
      <Accordion multiple defaultValue={DEFAULT_OPEN} className="w-full flex flex-col gap-4 ">
        {/* Editions Filter */}
        <AccordionItem value="editions" className="border border-white/5 bg-background/60 backdrop-blur-md rounded-[0.5rem] px-4 py-1">
          <AccordionTrigger className="hover:no-underline py-3 text-lg font-bold text-foreground transition-colors">
            Edición
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3 flex flex-col gap-1">
            {EDITIONS.map((edition) => {
              const Icon = edition.iconComponent;
              const isSelected = selectedEditions.includes(edition.id);
              
              return (
                <button
                  key={edition.id}
                  onClick={() => toggleEdition(edition.id)}
                  className={cn(
                    "flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-all text-sm cursor-pointer",
                    isSelected 
                      ? "bg-primary/20 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground font-medium"
                  )}
                >
                  <Icon className={cn("size-4 transition-opacity ", isSelected ? "opacity-100" : "opacity-70")} />
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
              const isSelected = selectedCategories.includes(cat.id);
              
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
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
              const isSelected = selectedYears.includes(year);
              
              return (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
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
    </aside>
  );
}
