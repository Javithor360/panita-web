import { useState, useTransition, useRef, useEffect } from "react";
import { Edit3, Loader2 } from "lucide-react";
import { EDITIONS } from "@/lib/constants";

export function EditableEdition({ 
  editionId,
  editionName,
  onSave, 
}: { 
  editionId: string | null;
  editionName: string | null;
  onSave: (val: string | null, name: string | null) => Promise<void>; 
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
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

  const handleSelect = (id: string | null, name: string | null) => {
    if (isPending) return;
    setOpen(false);
    startTransition(async () => {
      await onSave(id, name);
    });
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        disabled={isPending}
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-1.5 text-white/60 hover:text-white/90 text-sm transition-all disabled:opacity-50 cursor-pointer"
      >
        {isPending ? <Loader2 className="size-3 animate-spin" /> : <span>{editionName || "Sin edición"}</span>}
        <Edit3 className="size-3 opacity-40 group-hover:opacity-100 transition-opacity" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[200px] z-50 rounded-md border border-white/10 bg-black/95 backdrop-blur-md text-white shadow-xl flex flex-col p-1">
          <button 
            onClick={() => handleSelect(null, null)}
            className={`text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${editionId === null ? 'bg-primary/20 text-primary' : 'hover:bg-white/10'}`}
          >
            Sin edición
          </button>
          {EDITIONS.map((ed) => (
            <button 
              key={ed.id}
              onClick={() => handleSelect(ed.id, ed.label)}
              className={`text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${editionId === ed.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/10'}`}
            >
              {ed.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
