"use client";

import { ClipboardList, Check, X, Clock } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Form, FormResponse } from "@/lib/generated/prisma/client";

type FormWithUserResponse = Form & {
  responses: FormResponse[];
};

export function ProfileForms({ forms }: { forms: FormWithUserResponse[] }) {
  if (forms.length === 0) {
    return null; // Don't show the section if there are no forms in the database yet
  }

  return (
    <div className="mt-12 w-full">
      <div className="flex items-center justify-center gap-4 mb-8">
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
          Formularios
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((form) => {
          const hasResponded = form.responses.length > 0;
          const isOpen = form.is_open;

          const d = new Date(form.created_at);
          const monthStr = d
            .toLocaleDateString("es-ES", { month: "short" })
            .replace(".", "")
            .replace(/^\w/, (c) => c.toUpperCase());
          const dateStr = `${monthStr} de ${d.getFullYear()}`;

          let statusConfig = {
            icon: (
              <Clock
                className="w-[18px] h-[18px] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 drop-shadow-sm"
                style={{ color: "var(--profile-glow)" }}
              />
            ),
            tooltip: "Abierto - ¡Participa!",
            statusText: (
              <span
                style={{ color: "var(--profile-glow)" }}
                className="font-medium"
              >
                Abierto
              </span>
            ),
            cardClass:
              "bg-card border-background hover:[background-color:color-mix(in_srgb,var(--profile-glow)_15%,var(--card))] cursor-pointer shadow-none",
            titleClass:
              "font-semibold text-[16px] leading-tight transition-colors drop-shadow-sm",
            titleStyle: { color: "var(--profile-glow)" } as React.CSSProperties,
            isLink: true,
          };

          if (hasResponded) {
            statusConfig = {
              icon: <Check className="w-[18px] h-[18px] text-emerald-500/70" />,
              tooltip: "Completado",
              statusText: (
                <span className="font-medium text-emerald-500/90">
                  Completado
                </span>
              ),
              cardClass:
                "bg-card border-border hover:[background-color:color-mix(in_srgb,oklch(0.62_0.15_160)_10%,var(--card))] shadow-none",
              titleClass:
                "font-semibold text-[16px] leading-tight text-foreground/90 transition-colors",
              titleStyle: {},
              isLink: false,
            };
          } else if (!isOpen) {
            statusConfig = {
              icon: (
                <X className="w-[18px] h-[18px] text-destructive/80 transition-colors" />
              ),
              tooltip: "Cerrado - No participaste",
              statusText: <span>Cerrado</span>,
              cardClass:
                "bg-card border-border hover:[background-color:color-mix(in_srgb,oklch(0.6_0.2_25)_10%,var(--card))] shadow-none",
              titleClass:
                "font-semibold text-[16px] leading-tight text-foreground/90 transition-colors",
              titleStyle: {},
              isLink: false,
            };
          }

          const CardContent = (
            <Card
              className={`group relative p-4 flex flex-col transition-all duration-300 h-full ${statusConfig.cardClass}`}
            >
              <div className="relative z-10 flex items-start gap-3 h-full">
                <div className="shrink-0 mt-[2px]" title={statusConfig.tooltip}>
                  {statusConfig.icon}
                </div>

                <div className="flex flex-col flex-1 h-full">
                  <h3
                    className={statusConfig.titleClass}
                    style={statusConfig.titleStyle}
                  >
                    {form.title}
                  </h3>

                  {form.description && (
                    <p className="text-[12px] leading-relaxed text-muted-foreground/80 mt-[10px] line-clamp-2">
                      {form.description}
                    </p>
                  )}

                  <div className="mt-auto pt-[8px]">
                    <p className="text-[10px] leading-none text-muted-foreground/60 italic">
                      Publicado en {dateStr} • {statusConfig.statusText}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );

          if (statusConfig.isLink) {
            return (
              <Link
                key={form.id}
                href={`/forms/${form.slug}`}
                className="contents"
              >
                {CardContent}
              </Link>
            );
          }

          return (
            <div key={form.id} className="h-full">
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
