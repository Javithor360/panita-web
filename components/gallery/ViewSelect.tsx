"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "15", label: "15 fotos" },
  { value: "30", label: "30 fotos" },
  { value: "45", label: "45 fotos" },
];

export function ViewSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("15");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = OPTIONS.find(o => o.value === selectedValue) || OPTIONS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 bg-background/60 backdrop-blur-md border border-white/5 text-sm rounded-md px-4 py-2 text-foreground font-medium hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px] cursor-pointer"
      >
        <span><span className="text-muted-foreground font-normal">Mostrar:</span> {selectedOption.label}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[150px] bg-background/95 backdrop-blur-xl border border-white/5 rounded-md p-1 shadow-xl z-50 flex flex-col gap-1">
          {OPTIONS.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedValue(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md transition-all text-sm cursor-pointer w-full text-left",
                  isSelected
                    ? "bg-primary/20 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground font-medium"
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="size-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
