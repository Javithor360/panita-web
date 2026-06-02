import { PhotoCard } from "./PhotoCard";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { CATEGORIES } from "@/lib/constants";

// Dummy data for visual layout
const TITLES = [
  "El amanecer en el castillo de cristal", "Sobreviviendo a la horda en el nether", 
  "La granja de hierro terminada por fin", "Panitacraft Temporada 2: Día 100", 
  "El dragón ha sido derrotado", "Nuestra humilde morada en la montaña", 
  "Explorando las profundidades abisales", "Proyecto Mega-Base Fase 1", 
  "Encuentro inesperado en la mina", "Mi primer diamante en este wipe",
  "Construcción del puente colgante", "Amanecer desde la torre más alta",
  "Evento de PVP en la arena central", "Atrapados en la fortaleza",
  "Foto grupal del servidor", "Arte pixelado en el spawn"
];

const AUTHORS = [
  "LoboSolitario99", "xX_Sniper_Xx", "GatitoCosmico", "Panita_Jose", "ElKrak3n", 
  "BloqueRoto", "DiamanteRojo", "MinerCraftero", "NocturnoGaming", "Juanpe123", "SrPato", "AlexGamer", "SoySteve"
];

const DUMMY_PHOTOS = Array.from({ length: 30 }).map((_, i) => {
  const tagCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 tags
  const shuffledTags = [...CATEGORIES].sort(() => 0.5 - Math.random());
  
  return {
    id: `photo-${i}`,
    title: TITLES[Math.floor(Math.random() * TITLES.length)],
    author: AUTHORS[Math.floor(Math.random() * AUTHORS.length)],
    tagIds: shuffledTags.slice(0, tagCount).map(t => t.id),
    imageUrl: `https://picsum.photos/seed/${i + 50}/800/450`,
  };
});

export function GalleryGrid() {
  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {DUMMY_PHOTOS.map((photo, i) => (
          <PhotoCard key={photo.id} {...photo} priority={i < 4} />
        ))}
      </div>
    </div>
  );
}
