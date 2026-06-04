import { useState, useTransition } from "react";
import { Check, Edit3, Loader2, X } from "lucide-react";

export function EditableText({ 
  value, 
  onSave, 
  isTextArea = false, 
  placeholder = "Escribir..." ,
  className = "",
  inputClassName = "",
  textClassName = ""
}: { 
  value: string; 
  onSave: (val: string) => Promise<void>; 
  isTextArea?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
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
      <div className={`group flex items-start gap-3 ${className}`}>
        {value ? (
          <span className={`whitespace-pre-wrap ${textClassName}`}>{value}</span>
        ) : (
          <button 
            onClick={() => setIsEditing(true)} 
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full transition-all text-sm font-medium cursor-pointer mt-0.5"
          >
            <span className="text-lg leading-none">+</span>
            <span>{placeholder}</span>
          </button>
        )}
        {value && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="opacity-40 hover:opacity-100 p-1.5 text-white transition-all bg-white/10 hover:bg-white/20 rounded-md shrink-0 cursor-pointer mt-1"
          >
            <Edit3 className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row items-start gap-2 ${className}`}>
      {isTextArea ? (
        <textarea
          autoFocus
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className={`bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none min-h-[100px] w-full ${textClassName}`}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setTempValue(value || "");
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <input
          autoFocus
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className={`bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-full ${textClassName}`}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            else if (e.key === 'Escape') {
              setTempValue(value || "");
              setIsEditing(false);
            }
          }}
        />
      )}
      <div className="flex flex-col gap-1 shrink-0 mt-1">
        <button 
          onClick={handleSave}
          disabled={isPending}
          className="p-1.5 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        </button>
        <button 
          onClick={() => {
            setTempValue(value || "");
            setIsEditing(false);
          }}
          disabled={isPending}
          className="p-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
