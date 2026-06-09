'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { Save, Loader2, Award, Plus, Trash, ArrowLeft, Search, X, PlusCircle, Upload } from "lucide-react"
import { getEmblems, getEditions, saveEmblem, deleteEmblem, getEmblemUsers, searchUsersForAssignment, toggleUserEmblem, uploadEmblemIcon } from "@/app/actions/admin"
import type { Emblem, Edition } from "@/lib/generated/prisma/client"
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

export function EmblemsManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [emblems, setEmblems] = useState<Emblem[]>([])
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(false)
  
  const [selectedEmblem, setSelectedEmblem] = useState<Partial<Emblem> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [emblemToDelete, setEmblemToDelete] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'edit' | 'users'>('edit')
  
  // Tab: Users
  const [emblemUsers, setEmblemUsers] = useState<{id: number, ign: string|null, discord_name: string, discord_id: string}[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{id: number, ign: string|null, discord_name: string, discord_id: string}[]>([])
  const [searching, setSearching] = useState(false)

  // Form states
  const [emblemId, setEmblemId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [editionId, setEditionId] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [emblemsData, editionsData] = await Promise.all([
      getEmblems(),
      getEditions()
    ])
    setEmblems(emblemsData)
    setEditions(editionsData)
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData()
    } else {
      const t = setTimeout(() => {
        setSelectedEmblem(null)
        setIsNew(false)
        setActiveTab('edit')
        setSearchQuery('')
        setSearchResults([])
        setEmblemUsers([])
        setIconFile(null)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  const handleCreate = () => {
    setSelectedEmblem({})
    setIsNew(true)
    setActiveTab('edit')
    setEmblemId('')
    setName('')
    setDescription('')
    setIconUrl('')
    setIconFile(null)
    setEditionId('')
  }

  const handleEdit = (e: Emblem) => {
    setSelectedEmblem(e)
    setIsNew(false)
    setActiveTab('edit')
    setEmblemId(e.id)
    setName(e.name)
    setDescription(e.description || '')
    setIconUrl(e.icon_url)
    setIconFile(null)
    setEditionId(e.edition_id || '')
    
    setEmblemUsers([])
    setSearchQuery('')
    setSearchResults([])
  }

  const [isDirty, setIsDirty] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<'close' | 'back' | null>(null)

  const executeExit = (action: 'close' | 'back') => {
    if (action === 'back') {
      setSelectedEmblem(null)
    } else {
      setIsOpen(false)
    }
  }

  const requestExit = (action: 'close' | 'back') => {
    if (isDirty) {
      setPendingAction(action)
      setShowExitConfirm(true)
    } else {
      executeExit(action)
    }
  }

  useEffect(() => {
    if (!selectedEmblem) {
      setIsDirty(false)
      return
    }
    const isChanged = 
      name !== (selectedEmblem.name || '') ||
      description !== (selectedEmblem.description || '') ||
      iconUrl !== (selectedEmblem.icon_url || '') ||
      iconFile !== null ||
      editionId !== (selectedEmblem.edition_id || '');
      
    setIsDirty(isChanged)
  }, [name, description, iconUrl, iconFile, editionId, selectedEmblem])

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      requestExit('close')
    } else {
      setIsOpen(newOpen)
    }
  }

  const handleBack = () => {
    requestExit('back')
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let finalIconUrl = iconUrl;
      
      if (iconFile) {
        const formData = new FormData();
        formData.append('file', iconFile);
        formData.append('editionId', editionId || 'extra');
        
        const result = await uploadEmblemIcon(formData);
        if (result.error || !result.url) {
          throw new Error(result.error || 'Failed to upload icon');
        }
        finalIconUrl = result.url;
      }
      
      await saveEmblem(emblemId, {
        name,
        description: description || null,
        icon_url: finalIconUrl,
        edition_id: editionId || null
      }, isNew);
      
      setSelectedEmblem(null);
      loadData();
    } catch (e: any) {
      alert("Error al guardar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  }

  const handleDelete = async (id: string) => {
    await deleteEmblem(id)
    setEmblemToDelete(null)
    setSelectedEmblem(null)
    loadData()
  }

  // Users Tab Logic
  const loadEmblemUsers = async () => {
    if (!selectedEmblem?.id) return
    const users = await getEmblemUsers(selectedEmblem.id)
    setEmblemUsers(users)
  }

  useEffect(() => {
    if (activeTab === 'users' && selectedEmblem && !isNew) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadEmblemUsers()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedEmblem])

  useEffect(() => {
    if (activeTab !== 'users' || searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true)
      const res = await searchUsersForAssignment(searchQuery)
      setSearchResults(res)
      setSearching(false)
    }, 400)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, activeTab])

  const handleToggleEmblem = async (userId: number, assign: boolean) => {
    if (!selectedEmblem?.id) return
    await toggleUserEmblem(userId, selectedEmblem.id, assign)
    await loadEmblemUsers()
  }

  return (
    <>
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger 
        nativeButton={false}
        render={
          <Card className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-border bg-card hover:-translate-y-1 hover:[background-color:color-mix(in_srgb,var(--profile-glow)_15%,var(--card))] hover:border-transparent" />
        }
      >
        <Award className="w-8 h-8" style={{ color: 'var(--profile-glow)' }} />
        <span className="font-semibold text-lg select-none">Emblemas</span>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Gestión de Emblemas</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 px-6 pb-6 mt-4">
          {!selectedEmblem ? (
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4 text-muted-foreground animate-in fade-in duration-500">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-sm font-medium tracking-wide">Recopilando datos...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {emblems.map(e => (
                    <div 
                      key={e.id} 
                      onClick={() => handleEdit(e)}
                      className="p-3 border rounded-md flex justify-between items-center group hover:bg-secondary/20 cursor-pointer transition-colors"
                    >
                      <div className="flex-1 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.icon_url} alt="" className="w-6 h-6 object-contain" />
                        <span className="font-medium">{e.name}</span>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-primary/10 text-primary p-3 rounded-md justify-center font-medium hover:bg-primary/20 transition-colors mt-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Nuevo Emblema
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
              
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 px-1 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors select-none cursor-pointer w-fit group"
                  title="Volver a la lista"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline">Volver a la lista</span>
                </button>
                
                {!isNew && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveTab('edit')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'edit' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'users' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                    >
                      Usuarios
                    </button>
                  </div>
                )}
              </div>
              
              {activeTab === 'edit' ? (
                <div key="edit-tab" className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">ID</label>
                    <input 
                      type="text" 
                      value={emblemId} 
                      onChange={e => setEmblemId(e.target.value)} 
                      disabled={!isNew}
                      className="p-2 bg-background border rounded-md disabled:opacity-50"
                      placeholder="ej. veterano_2024"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="p-2 bg-background border rounded-md"
                      placeholder="Veterano 2024"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      className="p-2 bg-background border rounded-md min-h-[100px]"
                      placeholder="Otorgado a los jugadores que..."
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Icono del Emblema</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative group flex-1 min-w-0">
                        <input 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          accept="image/svg+xml,image/png,image/jpeg,image/webp" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const file = e.target.files[0];
                              setIconFile(file);
                              setIconUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <div className="w-full h-10 bg-background border rounded-md p-2 flex items-center justify-between transition-all group-hover:border-primary/50 text-sm">
                          <span className="truncate pr-4 text-muted-foreground">
                            {iconFile ? iconFile.name : (iconUrl || "Seleccionar imagen...")}
                          </span>
                          <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </div>
                      {iconUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={iconUrl} alt="Preview" className="w-8 h-8 object-contain rounded-sm" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Origen</label>
                    <select 
                      value={editionId} 
                      onChange={e => setEditionId(e.target.value)}
                      className="p-2 pr-8 bg-background border rounded-md appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: `right 0.5rem center`,
                        backgroundRepeat: `no-repeat`,
                        backgroundSize: `1.5em 1.5em`
                      }}
                    >
                      <option value="">-- Ninguna --</option>
                      {editions.map(ed => (
                        <option key={ed.id} value={ed.id}>{ed.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving || !emblemId || !name || (!iconUrl && !iconFile)}
                      className={`${isNew ? 'w-full' : 'w-3/4'} flex items-center justify-center gap-2 bg-primary text-primary-foreground h-11 rounded-md hover:opacity-90 transition-colors font-medium select-none disabled:opacity-50 cursor-pointer`}
                    >
                      {isSaving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Guardar</>
                      )}
                    </button>
                    {!isNew && (
                      <button 
                        onClick={() => setEmblemToDelete(emblemId)}
                        className="w-1/4 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground h-11 rounded-md hover:bg-destructive/90 transition-colors font-medium select-none cursor-pointer"
                        title="Eliminar emblema"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div key="users-tab" className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
                    <input 
                      type="text" 
                      placeholder="Buscar usuario para añadir..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  
                  {searchQuery.length >= 2 && (
                    <div className="flex flex-col gap-1 p-2 border rounded-md bg-secondary/10 max-h-48 overflow-y-auto">
                      {searching ? (
                        <p className="text-xs text-center py-2 text-muted-foreground">Buscando...</p>
                      ) : searchResults.filter(u => !emblemUsers.some(eu => eu.id === u.id)).length > 0 ? (
                        searchResults.filter(u => !emblemUsers.some(eu => eu.id === u.id)).map(u => (
                          <div 
                            key={u.id} 
                            onClick={() => handleToggleEmblem(u.id, true)}
                            className="flex items-center justify-between p-2 rounded-sm hover:bg-secondary/30 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={u.ign ? `https://mc-heads.net/avatar/${u.ign}/32` : "/steve.svg"} alt="" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{u.ign || u.discord_name}</span>
                                <span className="text-xs text-muted-foreground">@{u.discord_name}</span>
                              </div>
                            </div>
                            <button
                              className="p-1.5 rounded-md transition-colors text-muted-foreground group-hover:text-foreground cursor-pointer"
                              title="Añadir emblema"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-center py-2 text-muted-foreground">No se encontraron resultados.</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-2">
                    <h4 className="text-sm font-semibold flex items-center justify-between">
                      Usuarios con este emblema
                      <span className="bg-foreground text-background px-2 py-0.5 rounded-full text-xs font-semibold mr-1">{emblemUsers.length}</span>
                    </h4>
                    
                    {emblemUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Nadie tiene este emblema aún.</p>
                    ) : (
                      <div className="flex flex-col gap-2 pr-1">
                        {emblemUsers.map(u => (
                          <div key={u.id} className="flex items-center justify-between p-2.5 border rounded-md bg-card">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={u.ign ? `https://mc-heads.net/avatar/${u.ign}/32` : "/steve.svg"} alt="" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{u.ign || u.discord_name}</span>
                                <span className="text-xs text-muted-foreground">@{u.discord_name}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleEmblem(u.id, false)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1.5 cursor-pointer rounded-md hover:bg-destructive/10"
                              title="Quitar emblema"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
    
    <AlertDialog open={!!emblemToDelete} onOpenChange={(open) => !open && setEmblemToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el emblema y lo removerá de todos los usuarios que lo posean.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              if (emblemToDelete) handleDelete(emblemToDelete);
            }} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sí, eliminar emblema
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tienes cambios sin guardar</AlertDialogTitle>
          <AlertDialogDescription>
            Si sales ahora, perderás todas las modificaciones que no hayas guardado. ¿Estás seguro de que quieres salir?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setShowExitConfirm(false); setPendingAction(null); }}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              setShowExitConfirm(false);
              if (pendingAction) executeExit(pendingAction);
            }} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sí, salir sin guardar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
