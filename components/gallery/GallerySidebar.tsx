import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { EDITIONS, CATEGORIES } from "@/lib/constants";
import { Search } from "lucide-react";

export function GallerySidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-6 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pb-10 custom-scrollbar">
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Buscar foto o autor..." 
          className="w-full bg-muted/20 border border-muted/30 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground"
        />
      </div>

      <Accordion type="multiple" defaultValue={["editions", "categories"]} className="w-full">
        {/* Editions Filter */}
        <AccordionItem value="editions" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
            Ediciones
          </AccordionTrigger>
          <AccordionContent className="pt-3 pb-4 flex flex-col gap-3.5">
            {EDITIONS.map((edition) => {
              const Icon = edition.iconComponent;
              return (
                <div key={edition.id} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox id={`edition-${edition.id}`} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/40" />
                  <label 
                    htmlFor={`edition-${edition.id}`} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2.5 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors w-full"
                  >
                    <Icon className="size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
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
          <AccordionContent className="pt-3 pb-4 flex flex-col gap-3.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.iconComponent;
              return (
                <div key={cat.id} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox id={`cat-${cat.id}`} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/40" />
                  <label 
                    htmlFor={`cat-${cat.id}`} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2.5 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors w-full"
                  >
                    <Icon className="size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    {cat.label}
                  </label>
                </div>
              )
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
