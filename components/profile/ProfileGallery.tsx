'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Photo } from '@/app/actions/gallery';
import { UploadPhotoModal } from './UploadPhotoModal';
import { PhotoModal } from '@/components/gallery/PhotoModal';
import { EditionIcon } from "@/components/ui/EditionIcon";

interface ProfileGalleryProps {
  photos: Photo[];
  canUpload: boolean;
  editions: Array<{ id: string; name: string }>;
  userId: number;
  userIgn: string;
}

import { useRouter } from 'next/navigation';

export function ProfileGallery({ photos, canUpload, editions, userId, userIgn }: ProfileGalleryProps) {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  // If there are no photos and the user cannot upload, don't show the section at all
  if (photos.length === 0 && !canUpload) {
    return null;
  }

  const allItems = [];

  if (canUpload) {
    allItems.push(
      <div 
        key="upload-card"
        onClick={() => setIsUploadOpen(true)}
        className="w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:scale-[1.02] animate-in fade-in zoom-in-95 duration-500 opacity-60 hover:opacity-100 hover:bg-white/5"
        style={{ borderColor: 'var(--profile-glow)', color: 'var(--profile-glow)' }}
      >
        <div className="p-3 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--profile-glow) 20%, transparent)' }}>
          <Plus className="w-8 h-8" />
        </div>
        <p className="font-medium text-sm sm:text-base">Subir Foto</p>
      </div>
    );
  }

  photos.forEach((photo) => {
    allItems.push(
      <div 
        key={photo.id}
        onClick={() => setSelectedPhoto(photo)}
        className="w-full aspect-video rounded-xl bg-card border overflow-hidden cursor-pointer group relative transition-all hover:scale-[1.02] animate-in fade-in zoom-in-95 duration-500"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={photo.imageUrl.replace('/upload/', '/upload/c_fill,w_600,h_338,q_auto,f_auto/')} 
          alt={photo.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-sm sm:text-base truncate drop-shadow-md">{photo.title}</h3>
          {photo.edition_name && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <EditionIcon editionId={photo.edition_id || ''} className="size-3.5 opacity-80" />
              <p className="text-white/80 text-xs font-medium drop-shadow-md">{photo.edition_name}</p>
            </div>
          )}
        </div>
      </div>
    );
  });

  const visibleItems = allItems.slice(0, visibleCount);
  const totalItems = allItems.length;

  return (
    <div className="mt-12 w-full">
      <div className="flex items-center justify-center gap-4 mb-8">
        <div 
          className="h-[1px] flex-1" 
          style={{ background: `linear-gradient(to right, transparent, var(--profile-glow))`, opacity: 0.5 }} 
        />
        <h2 className="text-lg tracking-tight sm:text-xl md:text-2xl font-bold text-foreground uppercase sm:tracking-wide">
          <span className="select-none mr-3" style={{ color: 'var(--profile-glow)', opacity: 0.8 }}>✦</span>
          Publicaciones
          <span className="select-none ml-3" style={{ color: 'var(--profile-glow)', opacity: 0.8 }}>✦</span>
        </h2>
        <div 
          className="h-[1px] flex-1" 
          style={{ background: `linear-gradient(to left, transparent, var(--profile-glow))`, opacity: 0.5 }} 
        />
      </div>

      <div className="relative w-full max-w-5xl mx-auto">
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visibleItems}
          </div>

          {/* Fade-out Overlay when there are more items */}
          {visibleCount < totalItems && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Action Buttons */}
        {totalItems > 6 && (
          <div className="mt-8 flex justify-center gap-2 sm:gap-4 relative z-10">
            {visibleCount < totalItems && (
              <button 
                onClick={() => setVisibleCount(v => v + 9)}
                className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-xs sm:text-base py-2 sm:py-2.5 px-3 sm:px-6 rounded-full shadow-lg transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--profile-glow)' }}
              >
                Mostrar más
                <ChevronDown className="size-3 sm:size-4" />
              </button>
            )}
            
            {visibleCount > 6 && (
              <button 
                onClick={() => setVisibleCount(v => Math.max(6, v - 9))}
                className="flex items-center gap-1.5 sm:gap-2 bg-card border border-border hover:bg-card/80 text-card-foreground font-bold text-xs sm:text-base py-2 sm:py-2.5 px-3 sm:px-6 rounded-full shadow-md transition-all hover:-translate-y-1 active:scale-95 cursor-pointer"
              >
                Mostrar menos
                <ChevronUp className="size-3 sm:size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <UploadPhotoModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          // Instead of hard reloading the page, we tell Next.js to re-fetch Server Components data
          // in the background. The new photo will appear seamlessly.
          router.refresh();
        }}
        editions={editions}
        userIgn={userIgn}
      />

      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
          canEdit={false} // Author can't edit from here unless we allow it. We'll disable it for now.
          onNext={() => {
            const idx = photos.findIndex(p => p.id === selectedPhoto.id);
            if (idx < photos.length - 1) setSelectedPhoto(photos[idx + 1]);
          }}
          onPrev={() => {
            const idx = photos.findIndex(p => p.id === selectedPhoto.id);
            if (idx > 0) setSelectedPhoto(photos[idx - 1]);
          }}
        />
      )}
    </div>
  );
}
