"use client";

import { useEffect } from "react";
import { X, Calendar, BookOpen, Award, Trophy } from "lucide-react";
import { EditionIcon } from "@/components/ui/EditionIcon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface EditionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEdition: {
    history_text: string | null;
    edition: {
      id: string;
      name: string;
      started_at: Date | null;
      ended_at: Date | null;
      synopsis: string | null;
      theme_color: string | null;
    };
  } | null;
  editionTitles?: any[];
  userName: string;
}

export function EditionHistoryModal({
  isOpen,
  onClose,
  userEdition,
  editionTitles = [],
  userName,
}: EditionHistoryModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !userEdition) return null;

  const { edition, history_text } = userEdition;
  const themeColor = edition.theme_color || "var(--profile-glow)";

  const formatDate = (date: Date | null) => {
    if (!date) return "?";
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const periodString = `${formatDate(edition.started_at)} - ${formatDate(
    edition.ended_at,
  )}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-black/60 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] my-6 animate-in zoom-in-95 duration-300"
        style={{
          borderColor: `color-mix(in srgb, ${themeColor} 30%, transparent)`,
        }}
      >
        {/* Header Background Glow */}
        <div
          className="absolute top-0 left-0 right-0 h-32 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top, ${themeColor}, transparent 70%)`,
          }}
        />

        {/* Header */}
        <div className="relative flex items-start justify-between p-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 shrink-0 bg-black/40 rounded-xl p-2.5 border border-white/10 shadow-inner"
              style={{
                boxShadow: `inset 0 0 20px color-mix(in srgb, ${themeColor} 20%, transparent)`,
              }}
            >
              <EditionIcon
                editionId={edition.id}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold font-minecraft text-white tracking-widest">
                {edition.name}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-white/60 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{periodString}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Synopsis Section */}
          {edition.synopsis && (
            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
              <div
                className="flex items-center gap-2 mb-2"
                style={{ color: themeColor }}
              >
                <BookOpen className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Sobre esta edición
                </h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                {edition.synopsis}
              </p>
            </div>
          )}

          {/* Títulos Section */}
          {editionTitles && editionTitles.length > 0 && (
            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
              <div
                className="flex items-center gap-2 mb-4"
                style={{ color: themeColor }}
              >
                <Trophy className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-widest">
                  Títulos y Méritos
                </h3>
              </div>
              <div className="flex flex-col mt-2">
                {editionTitles.map((t: any, idx: number) => (
                  <div key={t.id} className="group relative">
                    <div className="py-4 relative z-10 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        {/* Stylized Bullet / Medal */}
                        <div className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5 group-hover:scale-110 transition-transform">
                          <Award
                            className="w-4 h-4"
                            style={{ color: themeColor }}
                          />
                          <div
                            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 blur-md transition-opacity"
                            style={{ backgroundColor: themeColor }}
                          />
                        </div>
                        <span className="text-sm sm:text-base font-bold tracking-wide text-white drop-shadow-sm group-hover:text-white/90 transition-colors">
                          {t.name}
                        </span>
                      </div>

                      {/* Información */}
                      <div className="pl-11">
                        {t.description ? (
                          <p
                            className="text-xs sm:text-sm text-white/70 leading-relaxed italic pl-3 border-l-2"
                            style={{
                              borderLeftColor: `color-mix(in srgb, ${themeColor} 50%, transparent)`,
                            }}
                          >
                            &quot;{t.description}&quot;
                          </p>
                        ) : (
                          <p className="text-[10px] sm:text-xs text-white/40 italic pl-3 border-l-2 border-white/10">
                            Mérito honorífico sin descripción detallada.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Gradient Separator */}
                    {idx < editionTitles.length - 1 && (
                      <div className="absolute bottom-0 left-12 right-0 h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player History Section */}
          {history_text && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span style={{ color: themeColor }}>✦</span>
                Legado de {userName} en {edition.name}
              </h3>

              <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-white/80 prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white/90">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {history_text}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-white/10 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md font-medium text-sm text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
