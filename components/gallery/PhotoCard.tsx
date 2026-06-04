"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { FilterOption, CATEGORIES } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PhotoCardProps {
  id?: string;
  title: string;
  author: string;
  authorIgn?: string | null;
  tagIds?: string[];
  tags?: FilterOption[]; // legacy support
  imageUrl: string;
  priority?: boolean;
}

export function PhotoCard({ id, title, author, authorIgn, tagIds = [], tags: legacyTags = [], imageUrl, priority }: PhotoCardProps) {
  // Resolve tag IDs into full category objects on the client side
  const resolvedTags = tagIds.length > 0 
    ? (tagIds.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as FilterOption[])
    : legacyTags;
  
  const tags = resolvedTags;
  const router = useRouter();
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(3); // SSR default
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const containerWidth = entry.contentRect.width;
      
      // The children of the measuring container are the tags
      const children = Array.from(container.children) as HTMLElement[];
      
      let currentWidth = 0;
      let count = 0;
      const gap = 8; // gap-2 = 8px
      const plusNWidth = 45; // Safe estimate for the "+N" chip width
      
      for (let i = 0; i < tags.length; i++) {
        if (!children[i]) break;
        
        const childWidth = children[i].offsetWidth;
        const currentGap = count > 0 ? gap : 0;
        const isLastTag = i === tags.length - 1;
        
        // If it's not the last tag, we MUST have enough room to show the +N chip afterwards
        const requiredWidth = currentWidth + currentGap + childWidth + (isLastTag ? 0 : plusNWidth + gap);
        
        if (requiredWidth > containerWidth) {
          break; // Doesn't fit, stop counting
        }
        
        currentWidth += currentGap + childWidth;
        count++;
      }
      
      // If the container is incredibly small, at least try to show 1 tag and let it clip
      setVisibleCount(Math.max(1, count));
      setIsMeasured(true);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [tags]);

  const visibleTags = tags.slice(0, isMeasured ? visibleCount : 3);
  const hiddenTags = tags.slice(isMeasured ? visibleCount : 3);
  const hiddenCount = hiddenTags.length;

  const handleClick = () => {
    if (!id) return;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('photo', id);
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  return (
    <Card 
      onClick={handleClick}
      className="group flex flex-col h-full overflow-hidden p-0 gap-0 rounded-xl border-muted/30 bg-muted/10 transition-all hover:border-primary/50 hover:bg-muted/20 cursor-pointer shadow-none"
    >
      <div className="relative w-full aspect-video overflow-hidden bg-muted/20 rounded-t-[0.3rem]">
        <Image
          src={imageUrl}
          alt={title}
          width={800}
          height={450}
          priority={priority}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      </div>
      <CardFooter className="flex flex-col flex-1 items-start p-4 gap-3 bg-card/50 backdrop-blur-sm border-t border-muted/20">
        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors shrink-0">{title}</h3>
        <div className="flex flex-col flex-1 gap-3 w-full overflow-hidden relative">
          
          {/* Hidden measuring container to compute exact pixel widths of tags safely */}
          <div 
            ref={containerRef} 
            className="absolute top-0 left-0 w-full flex gap-2 opacity-0 pointer-events-none -z-10"
            aria-hidden="true"
          >
            {tags.map((tag, i) => {
              const Icon = tag.iconComponent;
              return (
                <span 
                  key={`measure-${i}`} 
                  className="border rounded-full px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 shrink-0"
                >
                  <Icon className="size-3.5" />
                  <span className="whitespace-nowrap">{tag.label}</span>
                </span>
              );
            })}
          </div>

          {/* Actual visible tags */}
          <div 
            className="flex flex-nowrap items-center gap-2 overflow-hidden h-[28px] shrink-0 transition-opacity duration-300" 
            style={{ opacity: isMeasured ? 1 : 0 }}
          >
            {visibleTags.map((tag, i) => {
              const Icon = tag.iconComponent;
              return (
                <span 
                  key={`visible-${i}`} 
                  style={{ 
                    backgroundColor: `${tag.color}1A`, // 10% opacity
                    borderColor: `${tag.color}33`, // 20% opacity
                    color: tag.color 
                  }}
                  className="border rounded-full px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Icon className="size-3.5" />
                  <span className="text-foreground/90 whitespace-nowrap">{tag.label}</span>
                </span>
              );
            })}
            {hiddenCount > 0 && (
              <span 
                title={hiddenTags.map(t => t.label).join(", ")}
                className="bg-muted/40 border border-muted/50 rounded-full px-2 py-1 text-[11px] font-medium flex items-center text-foreground/80 transition-colors hover:bg-muted/80 shrink-0 cursor-help"
              >
                +{hiddenCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto shrink-0">
            {authorIgn ? (
              <img src={`https://mc-heads.net/avatar/${authorIgn}`} alt={authorIgn} className="size-3.5 rounded-sm bg-black/20 shrink-0" />
            ) : (
              <User className="size-3.5 shrink-0" />
            )}
            <span className="truncate max-w-[150px]">{author}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
