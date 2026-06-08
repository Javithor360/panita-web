"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Share2, Check, User, Download, ChevronLeft, ChevronRight, Edit3, EyeOff } from "lucide-react";
import { Photo, updatePhoto } from "@/app/actions/gallery";
import { CATEGORIES } from "@/lib/constants";

import { EditableText } from "./edit/EditableText";
import { EditableDate } from "./edit/EditableDate";
import { EditableAuthor } from "./edit/EditableAuthor";
import { EditableTags } from "./edit/EditableTags";
import { EditableEdition } from "./edit/EditableEdition";
import { EditionIcon } from "@/components/ui/EditionIcon";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  canEdit?: boolean;
  onUpdate?: (photo: Photo) => void;
}

export function PhotoModal({ photo, onClose, onNext, onPrev, canEdit = false, onUpdate }: PhotoModalProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [slideDir, setSlideDir] = useState<'next' | 'prev' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isEditMode, setIsEditMode] = useState(false);
  const [localPhoto, setLocalPhoto] = useState(photo);
  const [isPending, startTransition] = useTransition();
  const [imageLoaded, setImageLoaded] = useState(false);
  const loadedImagesRef = useRef<Set<string>>(new Set());

  // Handle prop changes synchronously to avoid UI flicker
  if (photo.id !== localPhoto.id) {
    setLocalPhoto(photo);
    if (!loadedImagesRef.current.has(photo.id)) {
      setImageLoaded(false);
    } else {
      setImageLoaded(true);
    }
  }

  // Close on Escape key and navigate with arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext && scale === 1 && !isEditMode) {
        e.preventDefault();
        setSlideDir('next');
        onNext();
      }
      if (e.key === "ArrowLeft" && onPrev && scale === 1 && !isEditMode) {
        e.preventDefault();
        setSlideDir('prev');
        onPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev, scale, isEditMode]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Reset scale when details open
  useEffect(() => {
    if (showDetails) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [showDetails]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log("Error copying to clipboard", err);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(localPhoto.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = localPhoto.imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      a.download = `${localPhoto.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading image:", err);
      window.open(localPhoto.imageUrl, '_blank');
    }
  };

  const handleZoom = (delta: number) => {
    setScale(s => {
      const newScale = Math.min(Math.max(s + delta, 1), 4);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (showDetails) return;
    if (e.deltaY < 0) handleZoom(0.25);
    else handleZoom(-0.25);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1 || showDetails) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1 || showDetails) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1) return;
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (scale > 1 || !touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    if (distance > 50 && onNext) {
      setSlideDir('next');
      onNext();
    }
    if (distance < -50 && onPrev) {
      setSlideDir('prev');
      onPrev();
    }
    setTouchStart(0);
  };

  const resolvedTags = localPhoto.tagIds.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as typeof CATEGORIES;

  let formattedDate = null;
  if (localPhoto.date_taken) {
    const dateStr = localPhoto.date_taken instanceof Date ? localPhoto.date_taken.toISOString() : String(localPhoto.date_taken);
    const datePart = dateStr.split('T')[0]; // "YYYY-MM-DD"
    const [year, monthNum, dayNum] = datePart.split('-');
    
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthName = monthNames[parseInt(monthNum, 10) - 1];
    const day = parseInt(dayNum, 10);
    
    formattedDate = `${monthName} ${day}, ${year}`;
  }

  const hasDescription = Boolean(localPhoto.description && localPhoto.description.trim() !== "");

  let optimizedUrl = localPhoto.imageUrl;
  let thumbnailUrl = localPhoto.imageUrl;
  if (optimizedUrl.includes('res.cloudinary.com') && optimizedUrl.includes('/upload/')) {
    optimizedUrl = optimizedUrl.replace('/upload/', '/upload/c_limit,w_1920,q_auto,f_auto/');
    thumbnailUrl = thumbnailUrl.replace('/upload/', '/upload/c_limit,w_800,q_auto,f_auto/');
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-start bg-black/40 backdrop-blur-lg lg:backdrop-blur-xs animate-in fade-in zoom-in-95 duration-500 ease-out">
      {/* Top Header */}
      <div 
        className="absolute top-0 left-0 right-0 px-6 py-6 md:px-12 md:py-8 flex flex-col-reverse lg:flex-row justify-between lg:items-start gap-4 lg:gap-0 z-10 pointer-events-none transition-all duration-500 ease-in-out opacity-100 bg-gradient-to-b from-black/95 via-black/50 to-transparent min-h-[150px]"
      >
        {/* Left side info */}
        <div className="flex flex-col gap-1.5 pointer-events-auto mt-1 w-full lg:w-auto">
          {/* Primera Fila: Autor y Edición */}
          <div className="flex flex-wrap items-center gap-3 text-white/90 font-medium">
            {isEditMode ? (
              <EditableAuthor 
                authorId={localPhoto.authorId}
                authorName={localPhoto.author}
                authorIgn={localPhoto.authorIgn}
                onSave={async (id, name, ign) => {
                  await updatePhoto(localPhoto.id, { user_id: id });
                  const newPhoto = { ...localPhoto, authorId: id, author: name, authorIgn: ign };
                  setLocalPhoto(newPhoto);
                  onUpdate?.(newPhoto);
                }}
              />
            ) : (
              <div className="flex items-center gap-2">
                {localPhoto.authorIgn ? (
                  <img src={`https://mc-heads.net/avatar/${localPhoto.authorIgn}`} alt={localPhoto.authorIgn} className="size-4 rounded-sm bg-black/20" />
                ) : (
                  <User className="size-4" />
                )}
                <span>{localPhoto.author}</span>
              </div>
            )}

            {(localPhoto.edition_name || isEditMode) && <span className="text-white/40">•</span>}

            {isEditMode ? (
              <EditableEdition 
                editionId={localPhoto.edition_id}
                editionName={localPhoto.edition_name}
                onSave={async (id, name) => {
                  await updatePhoto(localPhoto.id, { edition_id: id });
                  const newPhoto = { ...localPhoto, edition_id: id, edition_name: name };
                  setLocalPhoto(newPhoto);
                  onUpdate?.(newPhoto);
                }}
              />
            ) : (
              localPhoto.edition_name && (
                <div className="flex items-center gap-1.5 text-white/70">
                  {localPhoto.edition_id && <EditionIcon editionId={localPhoto.edition_id} className="size-4 opacity-80" />}
                  <span>{localPhoto.edition_name}</span>
                </div>
              )
            )}
          </div>

          {/* Segunda Fila: Fecha y Visibilidad */}
          <div className="flex flex-wrap items-center gap-3 text-white/60 text-sm">
            {isEditMode ? (
              <EditableDate 
                value={localPhoto.date_taken ? new Date(localPhoto.date_taken).toISOString().split('T')[0] : ""}
                formattedDate={formattedDate}
                onSave={async (val) => {
                  const date = val ? new Date(val) : null;
                  await updatePhoto(localPhoto.id, { date_taken: date });
                  const newPhoto = { ...localPhoto, date_taken: date };
                  setLocalPhoto(newPhoto);
                  onUpdate?.(newPhoto);
                }}
              />
            ) : (
              formattedDate && <span>{formattedDate}</span>
            )}

            {isEditMode && (
              <div className="flex items-center gap-2 w-full min-[480px]:w-auto">
                <span className="hidden min-[480px]:inline text-white/40">•</span>
                <span className="text-white/60 text-sm">Visible:</span>
                <button 
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await updatePhoto(localPhoto.id, { enabled: !localPhoto.enabled });
                      const newPhoto = { ...localPhoto, enabled: !localPhoto.enabled };
                      setLocalPhoto(newPhoto);
                      onUpdate?.(newPhoto);
                    });
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 ${localPhoto.enabled ? 'bg-primary' : 'bg-white/20'}`}
                >
                  <span className={`pointer-events-none inline-block size-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${localPhoto.enabled ? 'translate-x-2' : '-translate-x-2'}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pointer-events-auto w-full lg:w-auto">
          {canEdit && (
            <button 
              onClick={() => {
                if (!isEditMode) {
                  setIsEditMode(true);
                  setShowDetails(true);
                } else {
                  setIsEditMode(false);
                  if (!hasDescription) {
                    setShowDetails(false);
                  }
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 text-sm font-medium cursor-pointer ${isEditMode ? 'bg-primary/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <Edit3 className="size-4" />
              <span className="hidden sm:inline">{isEditMode ? "Modo Vista" : "Editar"}</span>
            </button>
          )}

          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 text-sm font-medium cursor-pointer"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Descargar</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 text-sm font-medium cursor-pointer"
          >
            {copied ? <Check className="size-4 text-green-400" /> : <Share2 className="size-4" />}
            <span className="hidden sm:inline">{copied ? "Copiado" : "Compartir"}</span>
          </button>
          
          <button 
            onClick={onClose}
            className="flex items-center justify-center size-10 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-white rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Image Area */}
      <div 
        className="relative w-full flex items-center justify-center transition-all duration-500 ease-in-out group overflow-hidden pt-52 lg:pt-32 px-4" 
        style={{ 
          height: showDetails ? '50dvh' : '100dvh', 
          paddingBottom: showDetails ? '2rem' : '8rem'
        }}
        onClick={onClose}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Placeholder from cache */}
        {!imageLoaded && (
          <img 
            key={`${localPhoto.id}-thumb`}
            src={thumbnailUrl}
            alt="Cargando..."
            draggable={false}
            className={`absolute max-w-full max-h-full object-contain blur-md animate-pulse ${scale > 1 ? 'cursor-grab' : 'cursor-default'}`}
            style={{ 
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              filter: (!localPhoto.enabled && canEdit) ? 'grayscale(100%) opacity(50%) blur(8px)' : 'blur(8px)'
            }}
          />
        )}
        
        {/* High-res Image */}
        <img 
          key={localPhoto.id}
          src={optimizedUrl}
          alt={localPhoto.title}
          draggable={false}
          onLoad={() => {
            setImageLoaded(true);
            loadedImagesRef.current.add(localPhoto.id);
          }}
          className={`max-w-full max-h-full object-contain drop-shadow-2xl animate-in fade-in duration-300 ${slideDir === 'next' ? 'slide-in-from-right-12' : slideDir === 'prev' ? 'slide-in-from-left-12' : 'zoom-in-95'} ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            filter: (!localPhoto.enabled && canEdit) ? 'grayscale(100%) opacity(50%)' : 'none'
          }}
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
        />

        {(!localPhoto.enabled && canEdit) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full text-white font-medium text-lg pointer-events-none flex items-center gap-2">
            <EyeOff className="size-5 text-red-400" />
            <span>Foto Oculta</span>
          </div>
        )}

        {/* Navigation Arrows */}
        {scale === 1 && !showDetails && !isEditMode && (
          <>
            {onPrev && (
              <button 
                onClick={(e) => { e.stopPropagation(); setSlideDir('prev'); onPrev(); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 size-10 md:size-12 flex items-center justify-center bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="size-6 md:size-8" />
              </button>
            )}
            {onNext && (
              <button 
                onClick={(e) => { e.stopPropagation(); setSlideDir('next'); onNext(); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 size-10 md:size-12 flex items-center justify-center bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="size-6 md:size-8" />
              </button>
            )}
          </>
        )}
        
        {/* Zoom Controls */}
        {!showDetails && (
          <div className="absolute right-6 bottom-32 md:right-12 md:bottom-40 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); handleZoom(0.5); }} 
              className="bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title="Acercar"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            {scale > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setScale(1); setPosition({x:0, y:0}); }} 
                className="bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Restablecer"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); handleZoom(-0.5); }} 
              className={`bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${scale <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
              disabled={scale <= 1}
              title="Alejar"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div 
        className={`absolute bottom-0 left-0 right-0 flex flex-col z-10 transition-all duration-500 ease-in-out px-6 md:px-12 py-6 md:py-8 min-h-[200px] ${showDetails ? `max-h-[50dvh] ${isEditMode ? 'overflow-visible' : 'overflow-y-auto'} bg-black/85 shadow-[0_-60px_100px_40px_rgba(0,0,0,0.95)] pointer-events-auto` : 'pointer-events-none overflow-hidden bg-gradient-to-t from-black/95 via-black/70 to-transparent'}`}
      >
        <div className="flex flex-col gap-3 w-full mt-auto animate-in fade-in duration-300">
          {/* Tags */}
          {isEditMode ? (
            <EditableTags 
              categoryIds={localPhoto.tagIds}
              onSave={async (tags) => {
                await updatePhoto(localPhoto.id, { categoryIds: tags });
                const newPhoto = { ...localPhoto, tagIds: tags };
                setLocalPhoto(newPhoto);
                onUpdate?.(newPhoto);
              }}
            />
          ) : (
            resolvedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1 pointer-events-auto">
                {resolvedTags.map((tag, i) => {
                  const Icon = tag.iconComponent;
                  return (
                    <span 
                      key={i} 
                      style={{ 
                        backgroundColor: `${tag.color}33`, 
                        borderColor: `${tag.color}66`, 
                        color: tag.color 
                      }}
                      className="border rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm transition-all duration-300"
                    >
                      <Icon className="size-3.5" />
                      <span>{tag.label}</span>
                    </span>
                  );
                })}
              </div>
            )
          )}
          
          {/* Title and Expand Button */}
          <div className="flex items-center gap-3 md:gap-4 pointer-events-auto shrink-0">
            {isEditMode ? (
                <EditableText 
                  value={localPhoto.title}
                  placeholder="Añadir título"
                  className="font-bold text-lg md:text-xl text-white flex items-center"
                  textClassName={`font-bold text-white leading-tight drop-shadow-md transition-all duration-500 ${showDetails ? 'text-xl md:text-5xl mb-4' : 'text-xl md:text-3xl'}`}
                  onSave={async (val) => {
                    await updatePhoto(localPhoto.id, { title: val });
                    const newPhoto = { ...localPhoto, title: val };
                    setLocalPhoto(newPhoto);
                    onUpdate?.(newPhoto);
                  }}
                />
            ) : (
              <h2 className={`font-bold text-white leading-tight drop-shadow-md transition-all duration-500 ${showDetails ? 'text-xl md:text-5xl mb-4' : 'text-xl md:text-3xl'}`}>
                {localPhoto.title}
              </h2>
            )}
            
            {(hasDescription || isEditMode) && (
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className={`flex items-center justify-center size-7 md:size-10 text-white rounded-full backdrop-blur-sm transition-all duration-300 cursor-pointer shrink-0 mt-0.5 md:mt-1.5 ${showDetails ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                title={showDetails ? "Ocultar Detalles" : "Ver Detalles"}
              >
                <svg className={`size-3.5 md:size-5 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Expandable Description Area */}
          <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden pointer-events-auto ${showDetails ? 'opacity-100 max-h-[1000px] mt-2 md:mt-4' : 'opacity-0 max-h-0'}`}
          >
            {isEditMode ? (
              <div className="max-w-4xl pb-4">
                <EditableText 
                  value={localPhoto.description || ""}
                  placeholder="Añadir descripción"
                  isTextArea={true}
                  textClassName="text-white/80 text-sm md:text-lg leading-relaxed whitespace-pre-wrap font-normal"
                  onSave={async (val) => {
                    await updatePhoto(localPhoto.id, { description: val });
                    const newPhoto = { ...localPhoto, description: val };
                    setLocalPhoto(newPhoto);
                    onUpdate?.(newPhoto);
                  }}
                />
              </div>
            ) : (
              hasDescription && (
                <div className="prose prose-invert max-w-4xl">
                  <p className="text-white/80 text-sm md:text-lg leading-relaxed whitespace-pre-wrap font-normal">
                    {localPhoto.description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
