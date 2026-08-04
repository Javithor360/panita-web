"use client";

import { useState, useRef } from "react";
import { EditionIcon } from "@/components/ui/EditionIcon";
import { EditionHistoryModal } from "./EditionHistoryModal";
import { ChevronUp, MapPin, Info } from "lucide-react";

interface UserEdition {
  id: string;
  joined_at: Date | null;
  history_text: string | null;
  edition: {
    id: string;
    name: string;
    started_at: Date | null;
    ended_at: Date | null;
    synopsis: string | null;
    theme_color: string | null;
  };
}

interface ProfileTrajectoryProps {
  userEditions: UserEdition[];
  titles?: any[];
  userName: string;
}

function TrajectoryNode({
  ue,
  index,
  isFirst,
  expandAction,
  onOpenHistory,
  editionTitles = [],
}: {
  ue: UserEdition;
  index: number;
  isFirst: boolean;
  expandAction?: { onExpand: () => void; count: number };
  onOpenHistory: (ue: UserEdition) => void;
  editionTitles?: any[];
}) {
  const isEven = index % 2 === 0;
  let formattedDate = null;
  if (ue.edition.started_at) {
    const dateStr =
      ue.edition.started_at instanceof Date
        ? ue.edition.started_at.toISOString()
        : String(ue.edition.started_at);
    const datePart = dateStr.split("T")[0];
    const [year, monthNum] = datePart.split("-");
    const monthNames = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    const monthName = monthNames[parseInt(monthNum, 10) - 1];
    formattedDate = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
  }

  return (
    <div
      className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full group ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Label and Arrow of "Here begins your adventure" */}
      {isFirst && (
        <div
          className="hidden md:flex absolute -top-16 right-4 md:top-1/2 md:-translate-y-[100%] md:right-auto md:left-[calc(50%+2.5rem)] items-center gap-2 pointer-events-none z-20 -rotate-2"
          style={{ color: "var(--profile-glow)" }}
        >
          <svg
            width="55"
            height="35"
            viewBox="0 0 55 35"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90 drop-shadow-lg"
          >
            <path d="M 50 20 Q 25 -5 5 25" />
            <path d="M 7 10 L 5 25 L 22 28" />
          </svg>
          <span className="text-sm sm:text-base font-['Comic_Sans_MS',_'Chalkboard_SE',_'Comic_Neue',_cursive] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            ¡Aquí inicia la aventura!
          </span>
        </div>
      )}

      {/* Magic portal to expand */}
      {expandAction && (
        <button
          onClick={expandAction.onExpand}
          className="absolute left-8 md:left-1/2 -translate-x-1/2 -top-16 z-30 group/expand flex flex-col items-center justify-center h-16 w-16 cursor-pointer"
          title="Expandir historial"
        >
          <div
            className="absolute inset-0 rounded-full border-t-2 border-[var(--profile-glow)] group-hover/expand:border-white opacity-40 group-hover/expand:opacity-100 animate-spin transition-colors"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute inset-2 rounded-full border-r-2 border-[var(--profile-glow)] group-hover/expand:border-white opacity-60 group-hover/expand:opacity-100 animate-spin transition-colors"
            style={{ animationDirection: "reverse", animationDuration: "2s" }}
          />

          <ChevronUp className="w-6 h-6 text-[var(--profile-glow)] group-hover/expand:text-white group-hover/expand:-translate-y-1 transition-all relative z-10 drop-shadow-[0_0_8px_var(--profile-glow)] group-hover/expand:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
        </button>
      )}

      {/* Node */}
      <div
        className={`absolute left-8 md:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full border-2 border-background bg-[var(--profile-glow)] transition-all duration-500 group-hover:scale-150 ${expandAction ? "animate-pulse" : ""}`}
        style={{
          boxShadow: "0 0 15px var(--profile-glow)",
        }}
      />

      {/* Edition card */}
      <div
        className={`w-full md:w-1/2 pl-20 md:pl-0 flex py-2 ${isEven ? "md:justify-end" : "md:justify-start"}`}
      >
        <button
          onClick={() => onOpenHistory(ue)}
          className="w-full sm:w-[320px] flex items-center gap-4 p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 transition-all duration-300 group-hover:bg-black/40 group-hover:border-white/20 hover:-translate-y-1 cursor-pointer relative text-left"
          style={{
            boxShadow: ue.history_text
              ? `0 10px 30px -15px ${ue.edition.theme_color || "rgba(0,0,0,0.5)"}`
              : "0 10px 30px -15px rgba(0,0,0,0.5)",
            borderColor: ue.history_text
              ? `color-mix(in srgb, ${ue.edition.theme_color || "var(--profile-glow)"} 30%, transparent)`
              : "rgba(255,255,255,0.1)",
          }}
        >
          {ue.history_text && (
            <div className="absolute top-4 right-4 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 rounded-full animate-ping opacity-40 bg-[var(--profile-glow)]" />
              <Info className="w-5 h-5 text-[var(--profile-glow)] drop-shadow-md relative z-10" />
            </div>
          )}
          <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-xl p-2 flex items-center justify-center shadow-inner">
            <EditionIcon
              editionId={ue.edition.id}
              className="w-full h-full drop-shadow-lg"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h3
              className={`font-bold font-minecraft text-white/90 drop-shadow-md truncate md:whitespace-normal md:break-words md:leading-tight ${
                ue.edition.name.length > 18
                  ? "text-sm sm:text-base tracking-normal md:tracking-[0.1em]"
                  : "text-base sm:text-lg tracking-wide md:tracking-[0.15em]"
              }`}
              title={ue.edition.name}
            >
              {ue.edition.name}
            </h3>
            {formattedDate && (
              <span className="text-xs sm:text-sm font-medium text-white/50 tracking-wide mt-0.5">
                {formattedDate}
              </span>
            )}
            {editionTitles && editionTitles.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <span
                  className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold tracking-wide border shadow-sm"
                  style={{
                    color: "var(--profile-glow)",
                    borderColor:
                      "color-mix(in srgb, var(--profile-glow) 30%, transparent)",
                    backgroundColor:
                      "color-mix(in srgb, var(--profile-glow) 15%, transparent)",
                  }}
                >
                  ✦ {editionTitles[0].name}
                </span>
                {editionTitles.length > 1 && (
                  <span className="text-[10px] sm:text-xs font-bold text-white/40 tracking-wider">
                    +{editionTitles.length - 1}
                  </span>
                )}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Empty space to balance flex */}
      <div className="hidden md:block w-1/2" />
    </div>
  );
}

export function ProfileTrajectory({
  userEditions,
  titles = [],
  userName,
}: ProfileTrajectoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<UserEdition | null>(
    null,
  );
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleCollapse = () => {
    setIsExpanded(false);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const sortedEditions = [...(userEditions || [])].sort((a, b) => {
    if (a.edition.started_at && b.edition.started_at) {
      return (
        new Date(a.edition.started_at).getTime() -
        new Date(b.edition.started_at).getTime()
      );
    }
    if (a.edition.started_at && !b.edition.started_at) return -1;
    if (!a.edition.started_at && b.edition.started_at) return 1;
    return a.edition.name.localeCompare(b.edition.name);
  });

  const hasEditions = sortedEditions.length > 0;
  const showCollapse = sortedEditions.length > 3;

  const oldEditions = showCollapse ? sortedEditions.slice(0, -3) : [];
  const recentEditions = showCollapse
    ? sortedEditions.slice(-3)
    : sortedEditions;

  return (
    <div
      ref={sectionRef}
      className="mt-16 w-full max-w-3xl mx-auto px-4 scroll-mt-24"
    >
      <div className="flex items-center justify-center gap-4 mb-16">
        <div
          className="h-[1px] flex-1"
          style={{
            background: `linear-gradient(to right, transparent, var(--profile-glow))`,
            opacity: 0.5,
          }}
        />
        <h2 className="text-lg tracking-tight sm:text-xl md:text-2xl font-bold text-foreground uppercase sm:tracking-wide">
          <span
            className="select-none mr-3"
            style={{ color: "var(--profile-glow)", opacity: 0.8 }}
          >
            ✦
          </span>
          Trayectoria
          <span
            className="select-none ml-3"
            style={{ color: "var(--profile-glow)", opacity: 0.8 }}
          >
            ✦
          </span>
        </h2>
        <div
          className="h-[1px] flex-1"
          style={{
            background: `linear-gradient(to left, transparent, var(--profile-glow))`,
            opacity: 0.5,
          }}
        />
      </div>

      <div className="relative">
        {hasEditions ? (
          <>
            {/* Línea central vertical - span visible */}
            <div
              className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, var(--profile-glow), transparent)",
                opacity: 0.3,
              }}
            />

            <div className="flex flex-col gap-8 md:gap-16">
              {showCollapse && (
                <div
                  className={`grid transition-all duration-700 ease-in-out relative ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-8 md:gap-16 pb-8 md:pb-16">
                      {oldEditions.map((ue, idx) => (
                        <TrajectoryNode
                          key={ue.id}
                          ue={ue}
                          index={idx}
                          isFirst={idx === 0}
                          onOpenHistory={setSelectedHistory}
                          editionTitles={titles.filter(
                            (t: any) => t.edition_id === ue.edition.id,
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-8 md:gap-16">
                {recentEditions.map((ue, idx) => (
                  <TrajectoryNode
                    key={ue.id}
                    ue={ue}
                    index={showCollapse ? oldEditions.length + idx : idx}
                    isFirst={!showCollapse && idx === 0}
                    expandAction={
                      showCollapse && !isExpanded && idx === 0
                        ? {
                            onExpand: () => setIsExpanded(true),
                            count: oldEditions.length,
                          }
                        : undefined
                    }
                    onOpenHistory={setSelectedHistory}
                    editionTitles={titles.filter(
                      (t: any) => t.edition_id === ue.edition.id,
                    )}
                  />
                ))}
              </div>

              {showCollapse && isExpanded && (
                <div className="flex justify-center mt-4 relative z-20">
                  <button
                    onClick={handleCollapse}
                    className="p-3 w-16 flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card hover:-translate-y-1 hover:[background-color:color-mix(in_srgb,var(--profile-glow)_15%,var(--card))] hover:border-transparent transition-all duration-300 cursor-pointer shadow-md select-none"
                    title="Colapsar historial"
                  >
                    <ChevronUp
                      className="w-6 h-6"
                      style={{ color: "var(--profile-glow)" }}
                    />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            style={{ color: "var(--profile-glow)" }}
          >
            <MapPin className="w-16 h-16 mb-4 opacity-40 drop-shadow-md" />
            <p className="text-sm font-medium opacity-80">
              Un lienzo en blanco aguarda.
              <br />
              Una gran historia y legado están por escribirse.
            </p>
          </div>
        )}
      </div>
      <EditionHistoryModal
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        userEdition={selectedHistory}
        editionTitles={
          selectedHistory
            ? titles.filter(
                (t: any) => t.edition_id === selectedHistory.edition.id,
              )
            : []
        }
        userName={userName}
      />
    </div>
  );
}
