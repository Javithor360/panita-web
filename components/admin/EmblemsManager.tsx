'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { Save, Loader2, Award, Plus, Trash } from "lucide-react"
import { getEmblems, getEditions, saveEmblem, deleteEmblem } from "@/app/actions/admin"
import type { Emblem, Edition } from "@/lib/generated/prisma/client"

export function EmblemsManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [emblems, setEmblems] = useState<Emblem[]>([])
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(false)
  
  const [selectedEmblem, setSelectedEmblem] = useState<Partial<Emblem> | null>(null)
  const [isNew, setIsNew] = useState(false)

  // Form states
  const [emblemId, setEmblemId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [editionId, setEditionId] = useState('')

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
    }
  }, [isOpen])

  const handleCreate = () => {
    setSelectedEmblem({})
    setIsNew(true)
    setEmblemId('')
    setName('')
    setDescription('')
    setIconUrl('')
    setEditionId('')
  }

  const handleEdit = (e: Emblem) => {
    setSelectedEmblem(e)
    setIsNew(false)
    setEmblemId(e.id)
    setName(e.name)
    setDescription(e.description)
    setIconUrl(e.icon_url)
    setEditionId(e.edition_id || '')
  }

  const handleSave = async () => {
    await saveEmblem(emblemId, {
      name,
      description,
      icon_url: iconUrl,
      edition_id: editionId || null
    }, isNew)
    
    setSelectedEmblem(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este emblema?")) return
    await deleteEmblem(id)
    loadData()
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
        
        <div className="flex flex-col gap-6 px-6 pb-6">
          {!selectedEmblem ? (
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleCreate}
                className="flex items-center gap-2 bg-primary/10 text-primary p-2 rounded-md justify-center font-medium hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Nuevo Emblema
              </button>
              
              {loading ? (
                <p className="text-sm">Cargando...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {emblems.map(e => (
                    <div 
                      key={e.id} 
                      className="p-3 border rounded-md flex justify-between items-center group hover:bg-secondary/10"
                    >
                      <div 
                        onClick={() => handleEdit(e)}
                        className="flex-1 cursor-pointer flex items-center gap-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.icon_url} alt="" className="w-6 h-6 object-contain" />
                        <span className="font-medium">{e.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(e.id)}
                        className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
              <button 
                onClick={() => setSelectedEmblem(null)}
                className="text-sm text-primary hover:underline text-left mb-2"
              >
                &larr; Volver a la lista
              </button>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">ID del Emblema (no se podrá cambiar)</label>
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
                <label className="text-sm font-medium">URL del Icono</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={iconUrl} 
                    onChange={e => setIconUrl(e.target.value)} 
                    className="p-2 bg-background border rounded-md flex-1"
                    placeholder="https://..."
                  />
                  {iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={iconUrl} alt="Preview" className="w-8 h-8 object-contain" />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Edición a la que pertenece (Opcional)</label>
                <select 
                  value={editionId} 
                  onChange={e => setEditionId(e.target.value)}
                  className="p-2 bg-background border rounded-md"
                >
                  <option value="">-- Ninguna --</option>
                  {editions.map(ed => (
                    <option key={ed.id} value={ed.id}>{ed.name}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleSave}
                disabled={!emblemId || !name || !iconUrl || !description}
                className="mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 font-medium select-none disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Guardar Emblema
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
