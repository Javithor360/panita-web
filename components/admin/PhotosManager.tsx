'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { Image as ImageIcon, Loader2, Trash2, Eye, Square, Check } from "lucide-react"
import { getHiddenPhotos, deleteHiddenPhotosBulk } from "@/app/actions/admin"
import { updatePhoto } from "@/app/actions/gallery"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function PhotosManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewPhoto, setPreviewPhoto] = useState<any | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getHiddenPhotos()
      setPhotos(data)
      setSelectedIds(new Set())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
    } else {
      setPhotos([])
      setSelectedIds(new Set())
    }
  }, [isOpen])

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) newSelection.delete(id)
    else newSelection.add(id)
    setSelectedIds(newSelection)
  }

  const toggleAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(photos.map(p => p.id)))
    }
  }

  const executeDelete = async () => {
    setShowConfirm(false)
    setDeleting(true)
    try {
      await deleteHiddenPhotosBulk(Array.from(selectedIds))
      await loadData()
    } catch (e) {
      console.error(e)
      alert("Hubo un error al eliminar las fotos.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger 
        nativeButton={false}
        render={
          <Card className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-border bg-card hover:-translate-y-1 hover:[background-color:color-mix(in_srgb,var(--profile-glow)_15%,var(--card))] hover:border-transparent select-none" />
        }
      >
        <ImageIcon className="w-8 h-8" style={{ color: 'var(--profile-glow)' }} />
        <span className="font-semibold text-lg select-none text-center">Elementos Ocultos</span>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto !right-0 !left-auto !mr-0 bg-clip-border">
        <SheetHeader>
          <SheetTitle>Elementos Ocultos</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 px-4 sm:px-8 pb-8 mt-4">
          {photos.length > 0 && !loading && (
            <p className="text-sm text-muted-foreground -mt-2">
              {photos.length} elementos disponibles
            </p>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted-foreground">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-sm font-medium tracking-wide">Cargando elementos ocultos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted-foreground opacity-60">
              <ImageIcon className="w-16 h-16" />
              <p className="text-sm font-medium">No hay elementos ocultos en este momento.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-background/70 p-3 rounded-b-xl border border-t-0 border-border/40 shadow-sm sticky top-0 z-20 backdrop-blur-xl -mx-4 px-4 sm:-mx-8 sm:px-8">
                <button 
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center">
                    {selectedIds.size === photos.length ? (
                      <div className="bg-primary rounded-sm p-[1px] shadow-sm">
                        <Check className="w-4 h-4 text-primary-foreground stroke-[3]" />
                      </div>
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="hidden xs:inline">Seleccionar Todo ({photos.length})</span>
                  <span className="xs:hidden">Todos</span>
                </button>
                
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={selectedIds.size === 0 || deleting}
                  className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-2 rounded-md hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold cursor-pointer"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Eliminar ({selectedIds.size})
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {photos.map(photo => {
                  const isSelected = selectedIds.has(photo.id)
                  return (
                    <div 
                      key={photo.id}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-card ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border/40 hover:border-border'}`}
                      onClick={() => toggleSelection(photo.id)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={photo.url} 
                        alt={photo.title || "Foto oculta"} 
                        className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'scale-110 opacity-70' : 'opacity-100 hover:scale-105'}`} 
                        loading="lazy"
                      />
                      
                      <div className="absolute top-2 left-2 z-10 p-1 drop-shadow-md">
                        {isSelected ? (
                          <div className="bg-primary rounded-sm p-[2px] shadow-sm drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                            <Check className="w-5 h-5 text-primary-foreground stroke-[3]" />
                          </div>
                        ) : (
                          <Square className="w-6 h-6 text-white/90 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
                        )}
                      </div>

                      <button 
                        className="absolute bottom-2 right-2 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full p-2 transition-colors text-white/90 hover:text-white scale-90 sm:scale-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewPhoto(photo)
                        }}
                        title="Ver en tamaño completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Info overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end pointer-events-none">
                        <span className="text-white text-xs font-medium truncate drop-shadow-md">{photo.title}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>

    <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
      <DialogContent className="w-[100vw] h-[100vh] max-w-none sm:max-w-none bg-black/90 backdrop-blur-md border-none rounded-none p-0 flex items-center justify-center shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:hover:bg-black/80 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-6 [&>button]:top-6 [&>button]:z-50 focus:outline-none">
        <DialogTitle className="sr-only">Viendo foto: {previewPhoto?.title}</DialogTitle>
        {previewPhoto && (
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={previewPhoto.url} 
              alt={previewPhoto.title || "Foto oculta"} 
              className="max-w-full max-h-full object-contain drop-shadow-2xl pointer-events-auto" 
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto">
              <button 
                onClick={async (e) => {
                  e.stopPropagation()
                  if (!previewPhoto) return
                  try {
                    await updatePhoto(previewPhoto.id, { enabled: true })
                    setPreviewPhoto(null)
                    loadData()
                  } catch (error) {
                    console.error("Error unhiding photo:", error)
                    alert("Error al desocultar la foto.")
                  }
                }}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full shadow-xl transition-transform hover:-translate-y-1 active:scale-95 font-semibold cursor-pointer"
              >
                <Eye className="w-5 h-5" />
                Restaurar Foto
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente <strong>{selectedIds.size} foto(s)</strong> de la base de datos y destruirá el archivo en la nube de Cloudinary.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={executeDelete} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            Sí, eliminar fotos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
