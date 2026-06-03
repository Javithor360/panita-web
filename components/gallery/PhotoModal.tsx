"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Share2, Check, User, Download } from "lucide-react";
import { Photo } from "@/app/actions/gallery";
import { CATEGORIES } from "@/lib/constants";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
}

export function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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
    <div className="fixed inset-0 z-[100] flex flex-col justify-start bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
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
        className="relative w-full flex items-center justify-center transition-all duration-500 ease-in-out" 
        style={{ 
          height: showDetails ? '50dvh' : '100dvh', 
          paddingBottom: showDetails ? '2rem' : '10rem', 
          paddingTop: '6rem',
          paddingLeft: '1rem',
          paddingRight: '1rem'
        }}
        onClick={onClose}
      >
        <img 
          src={photo.imageUrl}
          alt={photo.title}
          className="max-w-full max-h-full object-contain cursor-default drop-shadow-2xl transition-all duration-500 ease-in-out"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Bottom Footer */}
      <div 
        className={`absolute bottom-0 left-0 right-0 flex flex-col z-10 transition-all duration-500 ease-in-out px-6 md:px-12 py-8 md:py-10 min-h-[200px] ${showDetails ? 'max-h-[50dvh] overflow-y-auto bg-black/85 shadow-[0_-60px_100px_40px_rgba(0,0,0,0.95)] pointer-events-auto' : 'pointer-events-none overflow-hidden bg-gradient-to-t from-black/95 via-black/70 to-transparent'}`}
      >
        <div className="flex flex-col gap-3 w-full mt-auto">
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
