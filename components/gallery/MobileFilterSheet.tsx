import { Filter, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { EDITIONS, CATEGORIES } from "@/lib/constants";

export function MobileFilterSheet() {
  return (
    <Sheet>
      <SheetTrigger render={
        <button className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "lg:hidden flex items-center gap-2 h-9 border border-muted/30")}>
          <Filter className="size-4" />
          Filter results...
        </button>
      } />
      <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto border-l-muted/20 pb-10">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="flex items-center gap-2 font-bold text-lg">
            <Filter className="size-5 text-primary" />
            Filtros
          </SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar foto o autor..." 
            className="w-full bg-muted/20 border border-muted/30 rounded-md py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground"
          />
        </div>
        
        <Accordion type="multiple" defaultValue={["editions", "categories"]} className="w-full">
          {/* Editions Filter */}
          <AccordionItem value="editions" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
              Ediciones
            </AccordionTrigger>
            <AccordionContent className="pt-3 pb-4 flex flex-col gap-4">
              {EDITIONS.map((edition) => {
                const Icon = edition.iconComponent;
                return (
                  <div key={edition.id} className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox id={`mob-edition-${edition.id}`} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/40 w-5 h-5" />
                    <label 
                      htmlFor={`mob-edition-${edition.id}`} 
                      className="text-base font-medium leading-none flex items-center gap-3 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors w-full"
                    >
                      <Icon className="size-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      {edition.label}
                    </label>
                  </div>
                )
              })}
            </AccordionContent>
          </AccordionItem>

          {/* Categories Filter */}
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2 text-sm font-bold text-foreground hover:text-primary transition-colors mt-4">
              Categorías
            </AccordionTrigger>
            <AccordionContent className="pt-3 pb-4 flex flex-col gap-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.iconComponent;
                return (
                  <div key={cat.id} className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox id={`mob-cat-${cat.id}`} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/40 w-5 h-5" />
                    <label 
                      htmlFor={`mob-cat-${cat.id}`} 
                      className="text-base font-medium leading-none flex items-center gap-3 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors w-full"
                    >
                      <Icon className="size-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      {cat.label}
                    </label>
                  </div>
                )
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SheetContent>
    </Sheet>
  );
}
