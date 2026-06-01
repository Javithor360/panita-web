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
  Gamepad2
} from 'lucide-react'

export type FilterOption = {
  id: string; // We use this for URL queries
  label: string; // Display name
  iconName: string; // String identifier to store in DB
  iconComponent: any; // Actual Lucide component for rendering
}

export const EDITIONS: FilterOption[] = [
  { id: "survival-comunitario", label: "Survival Comunitario", iconName: "Users", iconComponent: Users },
  { id: "panitacraft-1", label: "Panitacraft I", iconName: "Pickaxe", iconComponent: Pickaxe },
  { id: "tezzlar-1", label: "Tezzlar I", iconName: "Zap", iconComponent: Zap },
  { id: "tezzlar-2", label: "Tezzlar II", iconName: "Flame", iconComponent: Flame },
  { id: "panitaskyblock", label: "Panitaskyblock", iconName: "Cloud", iconComponent: Cloud },
  { id: "panitacraft-2", label: "Panitacraft II", iconName: "Map", iconComponent: Map },
  { id: "panita-games", label: "Panita Games", iconName: "Gamepad2", iconComponent: Gamepad2 },
  { id: "panitacraft-25", label: "Panitacraft 2.5", iconName: "Swords", iconComponent: Swords },
  { id: "allthepanitas", label: "AllThePanitas", iconName: "Star", iconComponent: Star },
  { id: "panitacraft-275", label: "Panitacraft 2.75", iconName: "Ghost", iconComponent: Ghost },
  { id: "panitamon", label: "Panitamon", iconName: "Target", iconComponent: Target }, 
];

export const CATEGORIES: FilterOption[] = [
  { id: "grupal", label: "Foto grupal", iconName: "Users", iconComponent: Users },
  { id: "construccion", label: "Construcción", iconName: "Construction", iconComponent: Construction },
  { id: "panorama", label: "Panorama", iconName: "ImageIcon", iconComponent: ImageIcon },
  { id: "divertida", label: "Divertida", iconName: "Smile", iconComponent: Smile },
  { id: "destacada", label: "Destacada", iconName: "Trophy", iconComponent: Trophy },
  { id: "broma", label: "Broma", iconName: "Skull", iconComponent: Skull },
  { id: "evento", label: "Evento", iconName: "Calendar", iconComponent: Calendar },
];
