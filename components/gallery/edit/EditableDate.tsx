import { useState, useTransition } from "react";
import { Check, Edit3, Loader2, X } from "lucide-react";

export function EditableDate({ 
  value, 
  onSave, 
  placeholder = "Añadir fecha",
  className = "",
  textClassName = "",
  formattedDate
}: { 
  value: string; // "YYYY-MM-DD"
  formattedDate: string | null;
  onSave: (val: string) => Promise<void>; 
  placeholder?: string;
  className?: string;
  textClassName?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (isPending) return;
    startTransition(async () => {
      await onSave(tempValue);
      setIsEditing(false);
    });
  };

  if (!isEditing) {
    return (
      <div className={`group flex items-center gap-2 ${className}`}>
        {formattedDate ? (
          <span className={`${textClassName}`}>{formattedDate}</span>
        ) : (
          <button 
            onClick={() => setIsEditing(true)} 
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full transition-all text-sm font-medium cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            <span>{placeholder}</span>
          </button>
        )}
        {formattedDate && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="opacity-40 hover:opacity-100 p-1.5 text-white transition-all bg-white/10 hover:bg-white/20 rounded-md shrink-0 cursor-pointer"
          >
            <Edit3 className="size-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input 
        autoFocus
        type="date"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        className="bg-black/50 border border-white/20 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-primary text-sm cursor-pointer"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          else if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
          }
        }}
      />
      <button 
        disabled={isPending}
        onClick={handleSave}
        className="flex items-center justify-center p-1.5 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
      </button>
      <button 
        disabled={isPending}
        onClick={() => {
          setTempValue(value);
          setIsEditing(false);
        }}
        className="flex items-center justify-center p-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-md transition-colors cursor-pointer"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
