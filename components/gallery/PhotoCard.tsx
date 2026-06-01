import Image from "next/image";
import { User, Tag } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface PhotoCardProps {
  id: string;
  title: string;
  author: string;
  category: string;
  imageUrl: string;
  priority?: boolean;
}

export function PhotoCard({ title, author, category, imageUrl, priority }: PhotoCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden p-0 gap-0 rounded-xl border-muted/30 bg-muted/10 transition-all hover:border-primary/50 hover:bg-muted/20 cursor-pointer shadow-none">
      <div className="relative w-full overflow-hidden bg-muted/20 rounded-t-[0.3rem]">
        <Image
          src={imageUrl}
          alt={title}
          width={800}
          height={450}
          priority={priority}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <CardFooter className="flex flex-col items-start p-4 gap-3 bg-card/50 backdrop-blur-sm border-t border-muted/20">
        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="size-3.5" />
            <span className="truncate max-w-[100px]">{author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="size-3.5" />
            <span>{category}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
