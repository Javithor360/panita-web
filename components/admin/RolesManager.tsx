'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { Shield, Save, Loader2, Plus, Trash, ArrowLeft } from "lucide-react"
import { getRoles, saveRole, deleteRole } from "@/app/actions/admin"
import type { Role } from "@/lib/generated/prisma/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const extractSolidColor = (c: string) => {
  if (!c) return 'var(--foreground)'
  if (c.includes('gradient')) {
    const match = c.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/)
    return match ? match[0] : 'var(--foreground)'
  }
  return c
}

function RoleEditor({ 
  initialRole, 
  isNew, 
  onSave, 
  onCancel, 
  onDelete 
}: { 
  initialRole: Partial<Role>, 
  isNew: boolean, 
  onSave: (id: string, name: string, color: string) => Promise<string | void>, 
  onCancel: () => void, 
  onDelete: (id: string) => void 
}) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [roleId, setRoleId] = useState(initialRole.id || '')
  const [name, setName] = useState(initialRole.name || '')
  const [color, setColor] = useState(initialRole.color || '#ffffff')
  const [colorMode, setColorMode] = useState<'hex' | 'gradient'>(initialRole.color?.includes('gradient') ? 'gradient' : 'hex')

  const isGradient = color.includes('gradient');

  const parsedGradientColors = (() => {
    const match = color.match(/#[0-9a-fA-F]{3,6}/g)
    if (match && match.length >= 3) return [match[0], match[1], match[2]]
    if (match && match.length === 2) return [match[0], match[1], match[1]]
    if (match && match.length === 1) return [match[0], match[0], match[0]]
    return ['#8bfff7', '#9FF388', '#8bfff7']
  })();

  const updateGradientColor = (index: number, newHex: string) => {
    const newColors = [...parsedGradientColors];
    newColors[index] = newHex;
    setColor(`linear-gradient(90deg, ${newColors[0]}, ${newColors[1]}, ${newColors[2]})`);
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 px-1 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors select-none cursor-pointer w-fit group mb-2"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver a la lista
      </button>

      {errorMsg && (
        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md mb-2 flex items-center gap-2">
           <span>{errorMsg}</span>
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">ID</label>
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
        <label className="text-sm font-medium">Nombre</label>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="p-2 bg-background border rounded-md"
          placeholder="MODERADOR"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Color</label>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          
          {colorMode === 'hex' ? (
            <input 
              type="color" 
              value={color.match(/^#[0-9a-fA-F]{6}$/) ? color : '#ffffff'} 
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer flex-shrink-0"
            />
          ) : (
            <div className="flex flex-col w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
              <input 
                type="color" 
                value={parsedGradientColors[0].length === 7 ? parsedGradientColors[0] : '#ffffff'} 
                onChange={e => updateGradientColor(0, e.target.value)}
                className="w-full h-1/3 p-0 border-0 cursor-pointer block scale-150"
              />
              <input 
                type="color" 
                value={parsedGradientColors[1].length === 7 ? parsedGradientColors[1] : '#ffffff'} 
                onChange={e => updateGradientColor(1, e.target.value)}
                className="w-full h-1/3 p-0 border-0 cursor-pointer block scale-150"
              />
              <input 
                type="color" 
                value={parsedGradientColors[2].length === 7 ? parsedGradientColors[2] : '#ffffff'} 
                onChange={e => updateGradientColor(2, e.target.value)}
                className="w-full h-1/3 p-0 border-0 cursor-pointer block scale-150"
              />
            </div>
          )}

          <select 
            value={colorMode}
            onChange={e => {
              const newMode = e.target.value as 'hex' | 'gradient';
              setColorMode(newMode);
              if (newMode === 'hex' && color.includes('gradient')) {
                 setColor(extractSolidColor(color) || '#ffffff');
              } else if (newMode === 'gradient' && !color.includes('gradient')) {
                 setColor(`linear-gradient(90deg, ${color}, #9FF388, ${color})`);
              }
            }}
            className="p-2 pr-8 bg-background border rounded-md text-sm flex-1 sm:flex-none sm:w-32 cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: `right 0.5rem center`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `1.5em 1.5em`
            }}
          >
            <option value="hex">Sólido</option>
            <option value="gradient">Gradiente</option>
          </select>

          <input 
            type="text" 
            value={color} 
            onChange={e => setColor(e.target.value)} 
            className="p-2 bg-background border rounded-md w-full sm:flex-1 text-sm font-mono"
            placeholder={colorMode === 'hex' ? "#ff0000" : "linear-gradient(...)"}
          />
        </div>
        
        {/* Preview del Rango */}
        <div className="mt-1 p-4 rounded-md border flex items-center justify-center gap-3 bg-secondary/10 @container overflow-hidden">
          <div className="w-4 h-4 rounded-full shadow-sm flex-shrink-0" style={{ background: color }} />
          <span 
            className={`font-minecraft tracking-wider leading-none relative -top-[2px] select-none text-[clamp(0.75rem,8cqw,1.25rem)] truncate ${isGradient ? 'text-transparent bg-clip-text' : 'drop-shadow-sm'}`} 
            style={{ 
              color: !isGradient ? color : undefined,
              backgroundImage: isGradient ? color : undefined,
              filter: isGradient ? 'drop-shadow(0 0 8px rgba(255,255,255,0.15))' : undefined
            }}
          >
            {name || "VISTA PREVIA"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button 
          onClick={async () => {
            setErrorMsg(null)
            const err = await onSave(roleId, name, color)
            if (err) setErrorMsg(err)
          }}
          disabled={!roleId || !name || !color}
          className={`${isNew ? 'w-full' : 'w-3/4'} flex items-center justify-center gap-2 bg-primary text-primary-foreground h-11 rounded-md hover:bg-primary/90 transition-colors font-medium select-none disabled:opacity-50 cursor-pointer`}
        >
          <Save className="w-4 h-4" />
          Guardar
        </button>
        {!isNew && (
          <button 
            onClick={() => onDelete(roleId)}
            className="w-1/4 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground h-11 rounded-md hover:bg-destructive/90 transition-colors font-medium select-none cursor-pointer"
            title="Eliminar rango"
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function RolesManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)
  
  const [selectedRole, setSelectedRole] = useState<Partial<Role> | null>(null)
  const [isNew, setIsNew] = useState(false)

  const loadRoles = async () => {
    setLoading(true)
    const data = await getRoles()
    setRoles(data)
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRoles()
    } else {
      setSelectedRole(null)
    }
  }, [isOpen])

  const handleCreate = () => {
    setSelectedRole({ color: '#ffffff' })
    setIsNew(true)
  }

  const handleEdit = (r: Role) => {
    setSelectedRole(r)
    setIsNew(false)
  }

  const handleSave = async (id: string, name: string, color: string) => {
    const res = await saveRole(id, name, color, isNew)
    if (res && res.error) {
      return res.error
    }
    setSelectedRole(null)
    loadRoles()
  }

  const handleDelete = async (id: string) => {
    await deleteRole(id)
    setRoleToDelete(null)
    setSelectedRole(null)
    loadRoles()
  }

  return (
    <>
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger 
        nativeButton={false}
        render={
          <Card className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-border bg-card hover:-translate-y-1 hover:[background-color:color-mix(in_srgb,var(--profile-glow)_15%,var(--card))] hover:border-transparent" />
        }
      >
        <Shield className="w-8 h-8" style={{ color: 'var(--profile-glow)' }} />
        <span className="font-semibold text-lg select-none">Rangos</span>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Gestión de Rangos</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 px-6 pb-6 mt-4">
          {!selectedRole ? (
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4 text-muted-foreground animate-in fade-in duration-500">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-sm font-medium tracking-wide">Recopilando datos...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {roles.map(r => {
                    const isGradient = r.color?.includes('gradient');
                    return (
                      <div 
                        key={r.id} 
                        onClick={() => handleEdit(r)}
                        className="p-3 border rounded-md flex justify-between items-center group hover:bg-secondary/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 @container overflow-hidden w-full">
                          <div className="w-4 h-4 rounded-full shadow-sm flex-shrink-0" style={{ background: r.color || 'var(--foreground)' }} />
                          <span 
                            className={`font-minecraft tracking-wider leading-none relative -top-[2px] text-[clamp(0.875rem,8cqw,1.25rem)] truncate ${isGradient ? 'text-transparent bg-clip-text' : 'drop-shadow-sm'}`} 
                            style={{ 
                              color: !isGradient ? extractSolidColor(r.color) : undefined,
                              backgroundImage: isGradient ? r.color : undefined,
                              filter: isGradient ? 'drop-shadow(0 0 8px rgba(255,255,255,0.15))' : undefined
                            }}
                          >
                            {r.name}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-primary/10 text-primary p-3 rounded-md justify-center font-medium hover:bg-primary/20 transition-colors mt-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Crear nuevo rango
                  </button>
                </div>
              )}
            </div>
          ) : (
            <RoleEditor 
              initialRole={selectedRole}
              isNew={isNew}
              onSave={handleSave}
              onCancel={() => setSelectedRole(null)}
              onDelete={(id) => setRoleToDelete(id)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
    
    <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el rango y removerá todas sus asignaciones de los usuarios que actualmente lo posean.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              if (roleToDelete) handleDelete(roleToDelete);
            }} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sí, eliminar rango
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
