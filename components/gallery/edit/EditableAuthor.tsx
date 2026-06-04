import { useState, useTransition, useEffect, useRef } from "react";
import { Edit3, Loader2, User as UserIcon } from "lucide-react";
import { searchUsersForAssignment } from "@/app/actions/admin";

export function EditableAuthor({ 
  authorId,
  authorName,
  authorIgn,
  onSave, 
}: { 
  authorId: number | null;
  authorName: string;
  authorIgn?: string | null;
  onSave: (val: number | null, name: string, ign: string | null) => Promise<void>; 
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    if (search.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        searchUsersForAssignment(search).then(res => {
          setResults(res);
          setIsSearching(false);
        });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [search]);

  const handleSelect = (id: number | null, name: string, ign: string | null) => {
    if (isPending) return;
    setOpen(false);
    startTransition(async () => {
      await onSave(id, name, ign);
    });
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="group flex items-center gap-2 text-white/90 hover:text-white font-medium bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : authorIgn ? (
          <img src={`https://mc-heads.net/avatar/${authorIgn}`} alt={authorIgn} className="size-4 rounded-sm bg-black/20 shrink-0" />
        ) : (
          <UserIcon className="size-4 shrink-0" />
        )}
        <span>{authorName}</span>
        <Edit3 className="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity ml-1" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[300px] z-50 rounded-md border border-white/10 bg-black/95 backdrop-blur-md text-white shadow-xl flex flex-col overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input 
              type="text"
              autoFocus
              placeholder="Buscar por IGN o Discord..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-white/40"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
            {isSearching && <div className="p-3 text-center text-sm text-white/50">Buscando...</div>}
            
            {!isSearching && search.length >= 2 && results.length === 0 && (
              <div className="p-3 text-center text-sm text-white/50">No se encontraron usuarios.</div>
            )}
            
            {!isSearching && search.length < 2 && (
              <button 
                onClick={() => handleSelect(null, 'Anónimo', null)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center size-8 rounded-full bg-white/10 text-white/50 shrink-0">
                  <UserIcon className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Anónimo</span>
                  <span className="text-xs text-white/50">Sin autor registrado</span>
                </div>
              </button>
            )}

            {results.map((user) => (
              <button 
                key={user.id}
                onClick={() => handleSelect(user.id, user.ign || user.discord_name, user.ign)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 text-left transition-colors cursor-pointer"
              >
                <img 
                  src={`https://mc-heads.net/avatar/${user.ign || 'steve'}`} 
                  alt={user.ign || "Avatar"} 
                  className="size-8 rounded-sm bg-black/20 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{user.ign || "Sin IGN"}</span>
                  <span className="text-xs text-white/50 truncate">@{user.discord_name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
