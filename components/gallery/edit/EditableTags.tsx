import { useState, useTransition, useRef, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export function EditableTags({ 
  categoryIds, 
  onSave, 
}: { 
  categoryIds: string[]; 
  onSave: (val: string[]) => Promise<void>; 
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const resolvedTags = categoryIds.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as typeof CATEGORIES;
  const availableTags = CATEGORIES.filter(c => !categoryIds.includes(c.id) && c.label.toLowerCase().includes(search.toLowerCase()));

  const handleRemove = (idToRemove: string) => {
    if (isPending) return;
    startTransition(async () => {
      await onSave(categoryIds.filter(id => id !== idToRemove));
    });
  };

  const handleAdd = (idToAdd: string) => {
    if (isPending) return;
    setOpen(false);
    setSearch("");
    startTransition(async () => {
      await onSave([...categoryIds, idToAdd]);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-1 pointer-events-auto">
      {resolvedTags.map((tag, i) => {
        const Icon = tag.iconComponent;
        return (
          <span 
            key={tag.id} 
            style={{ 
              backgroundColor: `${tag.color}33`, 
              borderColor: `${tag.color}66`, 
              color: tag.color 
            }}
            className="group border rounded-full pl-3 pr-1 py-1 text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm transition-all duration-300"
          >
            <Icon className="size-3.5" />
            <span>{tag.label}</span>
            <button 
              onClick={() => handleRemove(tag.id)}
              disabled={isPending}
              className="ml-1 opacity-50 hover:opacity-100 hover:bg-black/20 p-0.5 rounded-full transition-all disabled:opacity-30"
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}

      <div className="relative" ref={popoverRef}>
        <button 
          disabled={isPending || CATEGORIES.length === categoryIds.length}
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center size-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-[200px] z-50 rounded-md border border-white/10 bg-black/90 backdrop-blur-md text-white shadow-xl overflow-hidden flex flex-col max-h-[300px]">
            <input 
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar etiqueta..."
              className="px-3 py-2 bg-transparent border-b border-white/10 text-sm text-white focus:outline-none placeholder:text-white/50 shrink-0"
            />
            <div className="overflow-y-auto p-1 flex flex-col">
              {availableTags.length === 0 ? (
                <div className="p-3 text-sm text-white/50 text-center">No hay etiquetas.</div>
              ) : (
                availableTags.map((tag) => {
                  const Icon = tag.iconComponent;
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleAdd(tag.id)}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer text-white hover:bg-white/10 rounded-sm w-full text-left transition-colors"
                    >
                      <Icon className="size-3.5" style={{ color: tag.color }} />
                      <span>{tag.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
