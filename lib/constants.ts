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
  Book
} from 'lucide-react'

export type FilterOption = {
  id: string; // We use this for URL queries
  label: string; // Display name
  iconName: string; // String identifier to store in DB
  iconComponent: any; // Actual Lucide component for rendering
  color?: string; // Hex color for UI styling
}

export const EDITIONS: FilterOption[] = [
  { id: "survivalcomunitario", label: "Survival Comunitario", iconName: "lucide-Users", iconComponent: Users },
  { id: "panitacraft", label: "Panitacraft I", iconName: "lucide-Pickaxe", iconComponent: Pickaxe },
  { id: "tezzlar", label: "Tezzlar I", iconName: "lucide-Zap", iconComponent: Zap },
  { id: "tezzlar2", label: "Tezzlar II", iconName: "lucide-Flame", iconComponent: Flame },
  { id: "panitaskyblock", label: "Panitaskyblock", iconName: "lucide-Cloud", iconComponent: Cloud },
  { id: "panitacraft2", label: "Panitacraft II", iconName: "lucide-Map", iconComponent: Map },
  { id: "panitagames", label: "Panita Games", iconName: "lucide-Gamepad2", iconComponent: Gamepad2 },
  { id: "panitacraft25", label: "Panitacraft 2.5", iconName: "lucide-Swords", iconComponent: Swords },
  { id: "allthepanitas", label: "AllThePanitas", iconName: "lucide-Star", iconComponent: Star },
  { id: "panitacraft275", label: "Panitacraft 2.75", iconName: "lucide-Ghost", iconComponent: Ghost },
  { id: "panitamon", label: "Panitamon", iconName: "lucide-Target", iconComponent: Target }, 
];

export const CATEGORIES: FilterOption[] = [
  { id: "group", label: "Foto grupal", iconName: "lucide-Users", iconComponent: Users, color: "#3b82f6" },
  { id: "build", label: "Construcción", iconName: "lucide-Construction", iconComponent: Construction, color: "#f97316" },
  { id: "panorama", label: "Panorama", iconName: "lucide-ImageIcon", iconComponent: ImageIcon, color: "#10b981" },
  { id: "funny", label: "Divertida", iconName: "lucide-Smile", iconComponent: Smile, color: "#eab308" },
  { id: "featured", label: "Destacada", iconName: "lucide-Trophy", iconComponent: Trophy, color: "#f59e0b" },
  { id: "prank", label: "Broma", iconName: "lucide-Skull", iconComponent: Skull, color: "#f43f5e" },
  { id: "event", label: "Evento", iconName: "lucide-Calendar", iconComponent: Calendar, color: "#a855f7" },
  { id: "pvp", label: "PVP", iconName: "lucide-Swords", iconComponent: Swords, color: "#ef4444" },
  { id: "nether", label: "Nether", iconName: "lucide-Flame", iconComponent: Flame, color: "#dc2626" },
  { id: "end", label: "End", iconName: "lucide-Ghost", iconComponent: Ghost, color: "#818cf8" },
  { id: "farm", label: "Granja", iconName: "lucide-Pickaxe", iconComponent: Pickaxe, color: "#84cc16" },
  { id: "mechanism", label: "Mecanismo", iconName: "lucide-Zap", iconComponent: Zap, color: "#ef4444" },
  { id: "textures", label: "Texturas", iconName: "lucide-Paintbrush", iconComponent: Paintbrush, color: "#d946ef" },
  { id: "logos", label: "Logos", iconName: "lucide-Hexagon", iconComponent: Hexagon, color: "#6366f1" },
  { id: "memes", label: "Memes", iconName: "lucide-Smile", iconComponent: Smile, color: "#fcd34d" },
  { id: "messages", label: "Mensajes iconicos", iconName: "lucide-MessageSquare", iconComponent: MessageSquare, color: "#34d399" },
  { id: "recipes", label: "Recetas", iconName: "lucide-Book", iconComponent: Book, color: "#fb923c" },
  { id: "others", label: "Otros", iconName: "lucide-Star", iconComponent: Star, color: "#9ca3af" },
];
