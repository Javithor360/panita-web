"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Share2, Check, User, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "@/app/actions/gallery";
import { CATEGORIES } from "@/lib/constants";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function PhotoModal({ photo, onClose, onNext, onPrev }: PhotoModalProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [slideDir, setSlideDir] = useState<'next' | 'prev' | null>(null);

  // Close on Escape key and navigate with arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext && scale === 1) {
        e.preventDefault();
        setSlideDir('next');
        onNext();
      }
      if (e.key === "ArrowLeft" && onPrev && scale === 1) {
        e.preventDefault();
        setSlideDir('prev');
        onPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev, scale]);

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
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Get extension from url or fallback to jpg
      const ext = photo.imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      a.download = `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading image:", err);
      window.open(photo.imageUrl, '_blank');
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
    if (e.deltaY < 0) {
      handleZoom(0.25);
    } else {
      handleZoom(-0.25);
    }
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  const resolvedTags = photo.tagIds.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as any[];

  let formattedDate = null;
  if (photo.date_taken) {
    const d = new Date(photo.date_taken);
    const month = d.toLocaleDateString("es-ES", { month: "short" });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    const day = d.getDate();
    const year = d.getFullYear();
    formattedDate = `${capitalizedMonth} ${day}, ${year}`;
  }

  const hasDescription = Boolean(photo.description && photo.description.trim() !== "");

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-start bg-black/40 backdrop-blur-lg lg:backdrop-blur-xs animate-in fade-in duration-300">
      {/* Top Header */}
      <div 
        className="absolute top-0 left-0 right-0 px-6 py-6 md:px-12 md:py-8 flex justify-between items-start z-10 pointer-events-none transition-all duration-500 ease-in-out opacity-100 bg-gradient-to-b from-black/95 via-black/50 to-transparent min-h-[150px]"
      >
        {/* Left side info */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2 text-white/90 font-medium">
            <User className="size-4" />
            <span>{photo.author}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            {photo.edition_name && <span>{photo.edition_name}</span>}
            {photo.edition_name && formattedDate && <span>•</span>}
            {formattedDate && <span>{formattedDate}</span>}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 pointer-events-auto">
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
        className="relative w-full flex items-center justify-center transition-all duration-500 ease-in-out group overflow-hidden" 
        style={{ 
          height: showDetails ? '50dvh' : '100dvh', 
          paddingBottom: showDetails ? '2rem' : '8rem', 
          paddingTop: '8rem',
          paddingLeft: '1rem',
          paddingRight: '1rem'
        }}
        onClick={onClose}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          key={photo.id}
          src={photo.imageUrl}
          alt={photo.title}
          draggable={false}
          className={`max-w-full max-h-full object-contain drop-shadow-2xl animate-in fade-in duration-300 ${slideDir === 'next' ? 'slide-in-from-right-12' : slideDir === 'prev' ? 'slide-in-from-left-12' : 'zoom-in-95'} ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Navigation Arrows */}
        {scale === 1 && !showDetails && (
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
        className={`absolute bottom-0 left-0 right-0 flex flex-col z-10 transition-all duration-500 ease-in-out px-6 md:px-12 py-6 md:py-8 min-h-[200px] ${showDetails ? 'max-h-[50dvh] overflow-y-auto bg-black/85 shadow-[0_-60px_100px_40px_rgba(0,0,0,0.95)] pointer-events-auto' : 'pointer-events-none overflow-hidden bg-gradient-to-t from-black/95 via-black/70 to-transparent'}`}
      >
        <div key={photo.id} className="flex flex-col gap-3 w-full mt-auto animate-in fade-in duration-300">
          {/* Tags */}
          {resolvedTags.length > 0 && (
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
          )}
          
          {/* Title and Expand Button */}
          <div className="flex items-start gap-3 md:gap-4 pointer-events-auto shrink-0">
            <h2 className={`font-bold text-white leading-tight drop-shadow-md transition-all duration-500 ${showDetails ? 'text-xl md:text-5xl mb-4' : 'text-xl md:text-3xl'}`}>
              {photo.title}
            </h2>
            
            {hasDescription && (
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-center size-7 md:size-10 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all duration-300 cursor-pointer shrink-0 mt-0.5 md:mt-1.5"
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
            {hasDescription && (
              <div className="prose prose-invert max-w-4xl">
                <p className="text-white/80 text-sm md:text-lg leading-relaxed whitespace-pre-wrap font-normal">
                  {photo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
