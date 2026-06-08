import { 
  Users, 
  Pickaxe, 
  Zap, 
  Flame, 
  Cloud, 
  Map, 
  Target, 
  Swords, 
  Star, 
  Ghost, 
  Construction, 
  Image as ImageIcon, 
  Smile, 
  Trophy, 
  Skull, 
  Calendar,
  Gamepad2,
  Paintbrush,
  Hexagon,
  MessageSquare,
  Book,
  BicepsFlexed,
  Medal,
  Camera,
  Landmark,
  VenetianMask,
  Dices,
  Presentation,
  PartyPopper
} from 'lucide-react'

export type FilterOption = {
  id: string; // We use this for URL queries
  label: string; // Display name
  iconName?: string; // String identifier to store in DB
  iconComponent?: any; // Actual Lucide component for rendering
  color?: string; // Hex color for UI styling
  imagePath?: string; // Hardcoded custom image
}

export const EDITIONS: FilterOption[] = [
  { id: "survivalcomunitario", label: "Survival Comunitario" },
  { id: "panitacraft", label: "Panitacraft I" },
  { id: "tezzlar", label: "Tezzlar I" },
  { id: "tezzlar2", label: "Tezzlar II" },
  { id: "panitaskyblock", label: "Panitaskyblock" },
  { id: "panitacraft2", label: "Panitacraft II" },
  { id: "panitagames", label: "Panita Games" },
  { id: "panitacraft25", label: "Panitacraft 2.5" },
  { id: "allthepanitas", label: "AllThePanitas" },
  { id: "panitacraft275", label: "Panitacraft 2.75" },
  { id: "panitamon", label: "Panitamon" }, 
];

export const RANGOS: Record<string, {name: string, color: string}> = {
  admin: { name: "Admin", color: "#ef4444" },
  moderador: { name: "Moderador", color: "#3b82f6" },
  veterano: { name: "Veterano", color: "#eab308" },
};

export const CATEGORIES: FilterOption[] = [
  { id: "selfie", label: "Selfie", iconName: "lucide-Camera", iconComponent: Camera, color: "#ec4899" },
  { id: "group", label: "Foto grupal", iconName: "lucide-Users", iconComponent: Users, color: "#3b82f6" },
  { id: "build", label: "Construcción", iconName: "lucide-Construction", iconComponent: Construction, color: "#f97316" },
  { id: "epic_build", label: "Construcción Épica", iconName: "lucide-Landmark", iconComponent: Landmark, color: "#14b8a6" },
  { id: "panorama", label: "Panorama", iconName: "lucide-ImageIcon", iconComponent: ImageIcon, color: "#10b981" },
  { id: "funny", label: "Divertida", iconName: "lucide-Smile", iconComponent: Smile, color: "#eab308" },
  { id: "random", label: "Momento random", iconName: "lucide-Dices", iconComponent: Dices, color: "#0ea5e9" },
  { id: "featured", label: "Destacada", iconName: "lucide-Trophy", iconComponent: Trophy, color: "#f59e0b" },
  { id: "members_choice", label: "Elección del Público", iconName: "lucide-Medal", iconComponent: Medal, color: "#d4af37" },
  { id: "prank", label: "Broma", iconName: "lucide-Skull", iconComponent: Skull, color: "#f43f5e" },
  { id: "event", label: "Evento", iconName: "lucide-Calendar", iconComponent: Calendar, color: "#a855f7" },
  { id: "roleplay", label: "Roleplay", iconName: "lucide-VenetianMask", iconComponent: VenetianMask, color: "#8b5cf6" },
  { id: "pvp", label: "PVP", iconName: "lucide-Swords", iconComponent: Swords, color: "#ef4444" },
  { id: "nether", label: "Nether", iconName: "lucide-Flame", iconComponent: Flame, color: "#dc2626" },
  { id: "end", label: "End", iconName: "lucide-Ghost", iconComponent: Ghost, color: "#818cf8" },
  { id: "farm", label: "Granja", iconName: "lucide-Pickaxe", iconComponent: Pickaxe, color: "#84cc16" },
  { id: "mechanism", label: "Mecanismo", iconName: "lucide-Zap", iconComponent: Zap, color: "#06b6d4" },
  { id: "showcase", label: "Showcase", iconName: "lucide-Presentation", iconComponent: Presentation, color: "#be185d" },
  { id: "memes", label: "Memes", iconName: "lucide-PartyPopper", iconComponent: PartyPopper, color: "#fcd34d" },
  { id: "flexing", label: "Flexing", iconName: "lucide-BicepsFlexed", iconComponent: BicepsFlexed, color: "#75f0aa" },
  { id: "textures", label: "Texturas", iconName: "lucide-Paintbrush", iconComponent: Paintbrush, color: "#d946ef" },
  { id: "logos", label: "Logos", iconName: "lucide-Hexagon", iconComponent: Hexagon, color: "#6366f1" },
  { id: "recipes", label: "Recetas", iconName: "lucide-Book", iconComponent: Book, color: "#fb923c" },
  { id: "messages", label: "Mensajes iconicos", iconName: "lucide-MessageSquare", iconComponent: MessageSquare, color: "#34d399" },
  { id: "others", label: "Otros", iconName: "lucide-Star", iconComponent: Star, color: "#9ca3af" },
];
