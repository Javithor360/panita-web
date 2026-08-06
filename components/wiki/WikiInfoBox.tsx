"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  Drumstick,
  Shield,
  Sword,
  Plus,
  Trash2,
  Globe,
  ChevronDown,
  ChevronUp,
  ChevronDown as ArrowDown,
  ChevronUp as ArrowUp,
  X,
} from "lucide-react";
import { EditionIcon } from "@/components/ui/EditionIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const CLOUDINARY_BASE =
  "https://res.cloudinary.com/panita/image/upload/panita-web/wiki/icons";

const SHORTCODES: Record<string, React.ReactNode> = {
  ":health:": (
    <Image
      src={`${CLOUDINARY_BASE}/heart.png`}
      alt="Health"
      width={18}
      height={18}
      className="object-contain image-rendering-pixelated w-auto h-[13px]"
    />
  ),
  ":hunger:": (
    <Image
      src={`${CLOUDINARY_BASE}/hunger2.png`}
      alt="Hunger"
      width={18}
      height={18}
      className="object-contain image-rendering-pixelated w-auto h-[13px]"
    />
  ),
  ":armor:": (
    <Image
      src={`${CLOUDINARY_BASE}/armor.png`}
      alt="Armor"
      width={18}
      height={18}
      className="object-contain image-rendering-pixelated w-auto h-[13px]"
    />
  ),
  ":attack:": <Sword className="w-3.5 h-3.5 text-gray-300 fill-gray-300" />,
  ":common:": <span style={{ display: "inline-block", backgroundColor: "#fff", border: "1px solid #888", borderRadius: "0.3em", color: "transparent", width: "1em", height: "1em", verticalAlign: "-0.36em", marginRight: "0.3em" }}><br /></span>,
  ":rare:": <span style={{ display: "inline-block", backgroundColor: "#55ffff", border: "1px solid #888", borderRadius: "0.3em", color: "transparent", width: "1em", height: "1em", verticalAlign: "-0.36em", marginRight: "0.3em" }}><br /></span>,
  ":epic:": <span style={{ display: "inline-block", backgroundColor: "#ff55ff", border: "1px solid #888", borderRadius: "0.3em", color: "transparent", width: "1em", height: "1em", verticalAlign: "-0.36em", marginRight: "0.3em" }}><br /></span>,
  ":legendary:": <span style={{ display: "inline-block", backgroundColor: "#ffaa00", border: "1px solid #888", borderRadius: "0.3em", color: "transparent", width: "1em", height: "1em", verticalAlign: "-0.36em", marginRight: "0.3em" }}><br /></span>,
};

const EFFECT_EXTENSIONS: Record<string, string> = {
  bad_omen: "png",
  breath_of_the_nautilus: "png",
  infested: "png",
  raid_omen: "png",
  slowness: "png",
};

const SHORTCODES_HALF: Record<string, React.ReactNode> = {
  ":health:": (
    <Image
      src={`${CLOUDINARY_BASE}/heart_half.png`}
      alt="Half Health"
      width={18}
      height={18}
      className="object-contain image-rendering-pixelated w-auto h-[13px]"
    />
  ),
  ":hunger:": (
    <Image
      src={`${CLOUDINARY_BASE}/hunger_half.png`}
      alt="Half Hunger"
      width={18}
      height={18}
      className="object-contain image-rendering-pixelated w-auto h-[13px]"
    />
  ),
  ":armor:": (
    <Image
      src={`${CLOUDINARY_BASE}/armor_half.png`}
      alt="Half Armor"
      width={18}
      height={18}
      className="object-contain image-rendering-pixelated w-auto h-[13px]"
    />
  ),
};

const SUGGESTED_LABELS = [
  "Daño",
  "Vida",
  "Hambre",
  "Saturación",
  "Armadura",
  "Dureza de armadura",
  "Durabilidad",
  "Tipo",
  "Rareza",
  "Herramienta",
  "Stack",
  "Efectos",
];

function renderValueWithShortcodes(value: string) {
  if (!value) return null;

  let amountStr = null;
  let shortcode = null;

  const match1 = value.trim().match(/^(:\w+:)\s*(\d+(\.\d+)?)$/);
  const match2 = value.trim().match(/^(\d+(\.\d+)?)\s*(:\w+:)$/);

  if (match1) {
    shortcode = match1[1];
    amountStr = match1[2];
  } else if (match2) {
    amountStr = match2[1];
    shortcode = match2[3];
  }

  if (shortcode && amountStr && SHORTCODES[shortcode]) {
    const amount = parseFloat(amountStr);
    const fullIcons = Math.floor(amount / 2);
    const hasHalf = amount % 2 >= 1; // Basic half detection

    return (
      <span className="flex items-center justify-start flex-wrap gap-1">
        <span className="font-semibold">{amount}</span>
        <span className="flex items-center gap-[1px] text-muted-foreground">
          (
          {Array.from({ length: fullIcons }).map((_, i) => (
            <span
              key={`full-${i}`}
              className="flex-shrink-0 flex items-center justify-center"
            >
              {SHORTCODES[shortcode]}
            </span>
          ))}
          {hasHalf && (
            <span className="flex-shrink-0 flex items-center justify-start">
              {SHORTCODES_HALF[shortcode] || (
                <span className="overflow-hidden w-[7px]">
                  {SHORTCODES[shortcode]}
                </span>
              )}
            </span>
          )}
          )
        </span>
      </span>
    );
  }

  // Fallback to normal string replacement
  const parts = value.split(/(:[a-zA-Z0-9_]+:|\n)/g);
  return (
    <span className="flex items-center justify-start flex-wrap gap-[2px]">
      {parts.map((part, i) => {
        if (!part) return null;
        if (part === '\n') {
          return <div key={i} className="basis-full h-0" />;
        }
        if (SHORTCODES[part]) {
          return (
            <span key={i} className="flex-shrink-0 flex items-center justify-center">
              {SHORTCODES[part]}
            </span>
          );
        }
        
        // Check for dynamic effects / icons
        const effectMatch = part.match(/^:([a-zA-Z0-9_]+):$/);
        if (effectMatch) {
          const effectName = effectMatch[1];
          const ext = EFFECT_EXTENSIONS[effectName] || "webp";
          return (
            <span key={i} className="flex-shrink-0 flex items-center justify-center">
              <Image
                src={`https://res.cloudinary.com/panita/image/upload/panita-web/wiki/icons/${effectName}.${ext}`}
                alt={effectName}
                width={20}
                height={20}
                className="object-contain image-rendering-pixelated w-5 h-5"
              />
            </span>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export function WikiInfoBox({
  title,
  coverUrl,
  editionBadge,
  data,
  categorySlug,
  isEditing,
  onDataChange,
  onCoverClick,
  children,
}: {
  title: string;
  coverUrl?: string | null;
  editionBadge?: { id?: string; name: string; color?: string | null } | null;
  data?: { id?: string; label: string; value: string }[] | null;
  categorySlug?: string;
  isEditing?: boolean;
  onDataChange?: (
    data: { id?: string; label: string; value: string }[],
  ) => void;
  onCoverClick?: () => void;
  children?: React.ReactNode;
}) {
  const [customLabelIndices, setCustomLabelIndices] = useState<Set<number>>(
    new Set(),
  );

  return (
    <aside className="w-full bg-card border border-border/40 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="bg-primary/15 border-b border-primary/30 px-4 pt-2.5 pb-3 text-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
        <h2 className="font-bold text-[16px] text-foreground tracking-tight drop-shadow-sm">
          {title}
        </h2>
      </div>

      {(coverUrl || isEditing) && (
        <div className="relative w-full border-b border-border bg-background/50 flex flex-col items-center justify-center pt-8 pb-2 group/cover cursor-pointer min-h-[220px]">
          {coverUrl ? (
            categorySlug === "items" ? (
              <div className="relative w-full flex flex-col items-center justify-center">
                <div className="relative w-[150px] h-[150px] mb-4 drop-shadow-xl">
                  <Image
                    src={coverUrl}
                    alt={title}
                    fill
                    className="object-contain image-rendering-pixelated"
                    sizes="(max-width: 1024px) 100vw, 288px"
                  />
                </div>
                <div className="relative w-12 h-12 bg-[#8b8b8b] border-2 border-[#373737] border-t-white border-l-white flex items-center justify-center p-1.5 group">
                  <div className="relative w-full h-full hover:scale-110 transition-transform">
                    <Image
                      src={coverUrl}
                      alt={title}
                      fill
                      className="object-contain image-rendering-pixelated drop-shadow-md"
                    />
                  </div>
                  {title && (
                    <div className="absolute z-50 invisible group-hover:visible bg-[#110111] border-[2px] border-[#3a0088] px-2 py-1 text-white font-minecraft shadow-lg whitespace-nowrap -top-10 left-1/2 transform -translate-x-1/2 text-xs pointer-events-none">
                      <span className="drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                        {title}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative w-[150px] h-[150px] drop-shadow-xl">
                <Image
                  src={coverUrl}
                  alt={title}
                  fill
                  className="object-contain image-rendering-pixelated"
                  sizes="150px"
                />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <span className="text-xs font-semibold">Sin portada</span>
            </div>
          )}

          {/* Edit Cover Overlay */}
          {onCoverClick && (
            <button
              onClick={onCoverClick}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity backdrop-blur-sm z-50 w-full h-full"
            >
              <span className="flex items-center gap-2 px-3 py-2 bg-primary/80 rounded-md">
                Cambiar Portada
              </span>
            </button>
          )}
        </div>
      )}

      {((data && data.length > 0) || editionBadge || isEditing || children) && (
        <div className="p-0">
          <table className="w-full text-sm">
            <tbody>
              {editionBadge && (
                <tr className="border-b border-border/20">
                  <td colSpan={2} className="p-0">
                    <div
                      className="w-full relative overflow-hidden px-4 py-2 flex items-center justify-center gap-2 group/edition cursor-default"
                      style={{
                        backgroundColor: `${editionBadge.color || "#5FE2C5"}30`,
                        borderBottom: `2px solid ${editionBadge.color || "#5FE2C5"}80`,
                      }}
                    >
                      {/* Subtly glow background effect */}
                      <div
                        className="absolute inset-0 opacity-40 pointer-events-none transition-opacity group-hover/edition:opacity-70"
                        style={{
                          background: `radial-gradient(circle at center, ${editionBadge.color || "#5FE2C5"} 0%, transparent 70%)`,
                        }}
                      />

                      {editionBadge.id ? (
                        <EditionIcon
                          editionId={editionBadge.id}
                          className="relative z-10 w-6 h-6 object-contain drop-shadow-md"
                        />
                      ) : (
                        <Globe
                          className="relative z-10 w-5 h-5 opacity-80 drop-shadow-sm"
                          style={{
                            color: editionBadge.color || "var(--primary)",
                          }}
                        />
                      )}
                      <span
                        className="relative z-10 font-bold text-[15px] drop-shadow-sm"
                        style={{
                          color: editionBadge.color || "var(--primary)",
                        }}
                      >
                        {editionBadge.name}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {data?.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="border-b border-white/5 last:border-0 odd:bg-white/5 even:bg-transparent hover:bg-white/10 transition-colors group"
                >
                  {isEditing ? (
                    <td colSpan={2} className="p-1 bg-[#0a0f0a]/50">
                      <div className="flex gap-1">
                        {customLabelIndices.has(i) ||
                        (row.label && !SUGGESTED_LABELS.includes(row.label)) ? (
                          <div className="flex items-center gap-1 w-2/5">
                            <input
                              type="text"
                              placeholder="Etiqueta..."
                              value={row.label}
                              onChange={(e) => {
                                if (!onDataChange || !data) return;
                                const newData = [...data];
                                newData[i].label = e.target.value;
                                onDataChange(newData);
                              }}
                              className="w-full px-2 py-1 text-[12px] font-semibold text-muted-foreground bg-background border border-border focus:border-primary rounded outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newSet = new Set(customLabelIndices);
                                newSet.delete(i);
                                setCustomLabelIndices(newSet);
                                if (!onDataChange || !data) return;
                                const newData = [...data];
                                newData[i].label = "";
                                onDataChange(newData);
                              }}
                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="w-2/5 flex items-center justify-between px-2 py-1 text-[12px] font-semibold text-muted-foreground bg-transparent border border-transparent hover:border-border rounded outline-none text-left">
                              <span className="truncate">
                                {row.label || "Etiqueta..."}
                              </span>
                              <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[140px]">
                              {SUGGESTED_LABELS.map((l) => (
                                <DropdownMenuItem
                                  key={l}
                                  onClick={() => {
                                    if (!onDataChange || !data) return;
                                    const newData = [...data];
                                    newData[i].label = l;
                                    onDataChange(newData);
                                  }}
                                  className="text-xs"
                                >
                                  {l}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  const newSet = new Set(customLabelIndices);
                                  newSet.add(i);
                                  setCustomLabelIndices(newSet);
                                }}
                                className="text-xs text-primary"
                              >
                                Otro (escribir)...
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <textarea
                          placeholder="Valor (o shortcode)"
                          value={row.value}
                          onChange={(e) => {
                            if (!onDataChange || !data) return;
                            const newData = [...data];
                            newData[i].value = e.target.value;
                            onDataChange(newData);
                          }}
                          className="flex-1 px-2 py-1 text-[12px] text-foreground bg-transparent border border-transparent hover:border-border focus:border-primary rounded outline-none resize-y min-h-[28px] leading-tight"
                          rows={1}
                        />
                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              if (!onDataChange || !data || i === 0) return;
                              const newData = [...data];
                              const temp = newData[i - 1];
                              newData[i - 1] = newData[i];
                              newData[i] = temp;
                              onDataChange(newData);
                            }}
                            className="p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded disabled:opacity-30 disabled:pointer-events-none"
                            disabled={i === 0}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!onDataChange || !data || i === data.length - 1) return;
                              const newData = [...data];
                              const temp = newData[i + 1];
                              newData[i + 1] = newData[i];
                              newData[i] = temp;
                              onDataChange(newData);
                            }}
                            className="p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded disabled:opacity-30 disabled:pointer-events-none"
                            disabled={i === data.length - 1}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!onDataChange || !data) return;
                            onDataChange(data.filter((_, idx) => idx !== i));
                          }}
                          className="p-1.5 ml-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="py-2.5 px-4 font-semibold text-[12px] text-muted-foreground w-2/5 align-middle tracking-wide">
                        {row.label}
                      </td>
                      <td className={`py-3 px-4 text-foreground text-left align-middle break-words bg-transparent ${row.label === 'Efectos' ? 'text-[10px]' : 'text-[12px]'}`}>
                        {renderValueWithShortcodes(row.value)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {children}
            </tbody>
          </table>

          {isEditing && (
            <>
              {onDataChange && (
                <div className="p-2 border-t border-border/30 bg-muted/10">
                  <button
                    type="button"
                    onClick={() => {
                      const current = data || [];
                      onDataChange([
                        ...current,
                        { id: crypto.randomUUID(), label: "", value: "" },
                      ]);
                    }}
                    className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded border border-dashed border-primary/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir Fila
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </aside>
  );
}
