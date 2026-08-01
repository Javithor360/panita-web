"use client";

import { UsersManager } from "./UsersManager";
import { RolesManager } from "./RolesManager";
import { EmblemsManager } from "./EmblemsManager";
import { PhotosManager } from "./PhotosManager";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export function AdminPanel({ glowColor }: { glowColor?: string }) {
  const color = glowColor || "var(--primary)";

  return (
    <div className="mt-12 w-full">
      <div className="flex items-center justify-center gap-4 mb-8">
        <div
          className="h-[1px] flex-1"
          style={{
            background: `linear-gradient(to right, transparent, ${color})`,
            opacity: 0.5,
          }}
        />
        <h2 className="text-lg tracking-tight sm:text-xl md:text-2xl font-bold text-foreground uppercase sm:tracking-wide">
          <span
            className="select-none mr-3"
            style={{ color: color, opacity: 0.8 }}
          >
            ✦
          </span>
          Gestión del Servidor
          <span
            className="select-none ml-3"
            style={{ color: color, opacity: 0.8 }}
          >
            ✦
          </span>
        </h2>
        <div
          className="h-[1px] flex-1"
          style={{
            background: `linear-gradient(to left, transparent, ${color})`,
            opacity: 0.5,
          }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <UsersManager />
        <RolesManager />
        <EmblemsManager />
        <PhotosManager />

        <Link href="/admin/forms" className="contents">
          <Card className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-border bg-card hover:-translate-y-1 hover:[background-color:color-mix(in_srgb,var(--profile-glow)_15%,var(--card))] hover:border-transparent select-none h-full">
            <ClipboardList className="w-8 h-8" style={{ color: color }} />
            <span className="font-semibold text-lg select-none">
              Formularios
            </span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
