"use client";

import { Diamond, Drumstick, Shield, Pickaxe, Sword, FileMinus } from "lucide-react";

interface ItemTemplateModalProps {
  onSelect: (type: string) => void;
}

export function ItemTemplateModal({ onSelect }: ItemTemplateModalProps) {
  const templates = [
    { id: "material", label: "Material", icon: Diamond, color: "text-blue-400", desc: "Objetos base y crafteos" },
    { id: "comida", label: "Comida", icon: Drumstick, color: "text-orange-400", desc: "Consumibles y efectos" },
    { id: "armadura", label: "Armadura", icon: Shield, color: "text-zinc-300", desc: "Protección y habilidades" },
    { id: "herramienta", label: "Herramienta", icon: Pickaxe, color: "text-amber-600", desc: "Minería y utilidad" },
    { id: "arma", label: "Arma", icon: Sword, color: "text-red-400", desc: "Daño y combate" },
    { id: "ninguno", label: "En blanco", icon: FileMinus, color: "text-muted-foreground", desc: "Empezar desde cero" },
  ];

  return (
    <div className="w-full min-h-[500px] bg-[#080c08] border border-border/50 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none opacity-50" />

      <h2 className="text-3xl md:text-4xl font-minecraft text-primary mb-3 drop-shadow-sm relative z-10 text-center">
        ¿Qué tipo de ítem vas a crear?
      </h2>
      <p className="text-muted-foreground mb-10 text-center max-w-lg relative z-10 text-sm md:text-base">
        Selecciona una plantilla para pre-cargar la estructura del artículo y los campos relevantes en la tabla de información.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl relative z-10">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="group flex flex-col items-center justify-center p-6 bg-[#0a0f0a] border border-border/30 rounded-xl hover:bg-white/[0.03] hover:border-primary/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`p-4 rounded-full bg-black/40 border border-border/10 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${t.color}`}>
              <t.icon className="w-8 h-8 drop-shadow-md" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{t.label}</h3>
            <p className="text-xs text-muted-foreground text-center">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
