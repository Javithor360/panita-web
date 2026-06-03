'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { Shield, Save, Plus, Trash } from "lucide-react"
import { getRoles, saveRole, deleteRole } from "@/app/actions/admin"

export function RolesManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [selectedRole, setSelectedRole] = useState<any | null>(null)
  const [isNew, setIsNew] = useState(false)

  // Form states
  const [roleId, setRoleId] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadRoles()
    }
  }, [isOpen])

  const loadRoles = async () => {
    setLoading(true)
    const data = await getRoles()
    setRoles(data)
    setLoading(false)
  }

  const handleCreate = () => {
    setSelectedRole({})
    setIsNew(true)
    setRoleId('')
    setName('')
    setColor('#ffffff')
  }

  const handleEdit = (r: any) => {
    setSelectedRole(r)
    setIsNew(false)
    setRoleId(r.id)
    setName(r.name)
    setColor(r.color)
  }

  const handleSave = async () => {
    await saveRole(roleId, name, color, isNew)
    setSelectedRole(null)
    loadRoles()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este rol?")) return
    await deleteRole(id)
    loadRoles()
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger 
        nativeButton={false}
        render={
          <Card className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-border bg-card hover:-translate-y-1 hover:[background-color:color-mix(in_srgb,var(--profile-glow)_15%,var(--card))] hover:border-transparent" />
        }
      >
        <Shield className="w-8 h-8" style={{ color: 'var(--profile-glow)' }} />
        <span className="font-semibold text-lg select-none">Roles</span>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Gestión de Roles</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 px-6 pb-6">
          {!selectedRole ? (
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleCreate}
                className="flex items-center gap-2 bg-primary/10 text-primary p-2 rounded-md justify-center font-medium hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Nuevo Rol
              </button>
              
              {loading ? (
                <p className="text-sm">Cargando...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {roles.map(r => (
                    <div 
                      key={r.id} 
                      className="p-3 border rounded-md flex justify-between items-center group hover:bg-secondary/10"
                    >
                      <div 
                        onClick={() => handleEdit(r)}
                        className="flex-1 cursor-pointer flex items-center gap-3"
                      >
                        <div className="w-4 h-4 rounded-full" style={{ background: r.color }} />
                        <span className="font-medium font-minecraft tracking-wider">{r.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(r.id)}
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
                onClick={() => setSelectedRole(null)}
                className="text-sm text-primary hover:underline text-left mb-2"
              >
                &larr; Volver a la lista
              </button>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">ID del Rol (no se podrá cambiar)</label>
                <input 
                  type="text" 
                  value={roleId} 
                  onChange={e => setRoleId(e.target.value)} 
                  disabled={!isNew}
                  className="p-2 bg-background border rounded-md disabled:opacity-50"
                  placeholder="ej. moderador"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Nombre a mostrar</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="p-2 bg-background border rounded-md font-minecraft tracking-wider"
                  placeholder="MODERADOR"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Color (Hexadecimal o Gradient CSS)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={color} 
                    onChange={e => setColor(e.target.value)} 
                    className="p-2 bg-background border rounded-md flex-1"
                    placeholder="#ff0000 o linear-gradient(...)"
                  />
                  <div 
                    className="w-10 h-10 rounded-md border" 
                    style={{ background: color }}
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={!roleId || !name || !color}
                className="mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 font-medium select-none disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Guardar Rol
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
