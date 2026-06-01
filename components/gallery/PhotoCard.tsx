import Image from "next/image";
import { User, Tag } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface PhotoCardProps {
  id: string;
  title: string;
  author: string;
  tags: string[];
  imageUrl: string;
  priority?: boolean;
}

export function PhotoCard({ title, author, tags, imageUrl, priority }: PhotoCardProps) {
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
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap items-center gap-2">
            {tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="bg-muted/40 border border-muted/50 rounded-full px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 text-foreground/90 transition-colors hover:bg-muted/80">
                <div className="size-1.5 rounded-full bg-primary/80" />
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="bg-muted/40 border border-muted/50 rounded-full px-2 py-1 text-[11px] font-medium flex items-center text-foreground/80 transition-colors hover:bg-muted/80">
                +{tags.length - 2}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
            <User className="size-3.5" />
            <span className="truncate max-w-[150px]">{author}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
