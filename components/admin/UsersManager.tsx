'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { Users, Search, Save } from "lucide-react"
import { getUsers, updateUser, getRoles, getEmblems } from "@/app/actions/admin"

export function UsersManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [allRoles, setAllRoles] = useState<any[]>([])
  const [allEmblems, setAllEmblems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  
  // Form states
  const [ign, setIgn] = useState('')
  const [discordName, setDiscordName] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [joinedAt, setJoinedAt] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [emblems, setEmblems] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      Promise.all([getUsers(), getRoles(), getEmblems()]).then(([uData, rData, eData]) => {
        setUsers(uData)
        setAllRoles(rData)
        setAllEmblems(eData)
        setLoading(false)
      })
    }
  }, [isOpen])

  const handleSelect = (u: any) => {
    setSelectedUser(u)
    setIgn(u.ign || '')
    setDiscordName(u.discord_name || '')
    setEnabled(u.enabled || false)
    // format date for input type="date"
    setJoinedAt(u.joined_at ? new Date(u.joined_at).toISOString().split('T')[0] : '')
    setRoles(u.roles?.map((r: any) => r.id) || [])
    setEmblems(u.emblems?.map((e: any) => e.id) || [])
  }

  const handleSave = async () => {
    if (!selectedUser) return
    const joinedAtDate = joinedAt ? new Date(joinedAt) : new Date()
    
    await updateUser(selectedUser.id, {
      ign: ign || null,
      discord_name: discordName,
      enabled,
      joined_at: joinedAtDate,
      roles,
      emblems
    })
    
    // Refresh users
    setLoading(true)
    const data = await getUsers()
    setUsers(data)
    setLoading(false)
    setSelectedUser(null)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger 
        nativeButton={false}
        render={
          <Card className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-border bg-card hover:-translate-y-1 hover:[background-color:color-mix(in_srgb,var(--profile-glow)_15%,var(--card))] hover:border-transparent" />
        }
      >
        <Users className="w-8 h-8" style={{ color: 'var(--profile-glow)' }} />
        <span className="font-semibold text-lg">Usuarios</span>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Gestión de Usuarios</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 px-6 pb-6">
          {!selectedUser ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">Selecciona un usuario para editar:</p>
              {loading ? (
                <p className="text-sm">Cargando...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {users.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => handleSelect(u)}
                      className="p-3 border rounded-md cursor-pointer hover:bg-secondary/30 flex justify-between items-center"
                    >
                      <span className="font-medium">{u.ign || u.discord_name}</span>
                      <span className="text-xs text-muted-foreground">{u.discord_id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-sm text-primary hover:underline text-left mb-2"
              >
                &larr; Volver a la lista
              </button>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">IGN</label>
                <input 
                  type="text" 
                  value={ign} 
                  onChange={e => setIgn(e.target.value)} 
                  className="p-2 bg-background border rounded-md"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Discord Name</label>
                <input 
                  type="text" 
                  value={discordName} 
                  onChange={e => setDiscordName(e.target.value)} 
                  className="p-2 bg-background border rounded-md"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  checked={enabled} 
                  onChange={e => setEnabled(e.target.checked)} 
                  id="enabled-check"
                  className="w-4 h-4"
                />
                <label htmlFor="enabled-check" className="text-sm font-medium">Habilitado (Puede iniciar sesión)</label>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium">Fecha de Ingreso</label>
                <input 
                  type="date" 
                  value={joinedAt} 
                  onChange={e => setJoinedAt(e.target.value)} 
                  className="p-2 bg-background border rounded-md"
                />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {allRoles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        if (roles.includes(r.id)) setRoles(roles.filter(id => id !== r.id))
                        else setRoles([...roles, r.id])
                      }}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${roles.includes(r.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary/10 border-transparent hover:bg-secondary/30'}`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium">Emblemas</label>
                <div className="flex flex-wrap gap-2">
                  {allEmblems.map(e => (
                    <button
                      key={e.id}
                      onClick={() => {
                        if (emblems.includes(e.id)) setEmblems(emblems.filter(id => id !== e.id))
                        else setEmblems([...emblems, e.id])
                      }}
                      className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 transition-colors ${emblems.includes(e.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary/10 border-transparent hover:bg-secondary/30'}`}
                    >
                      <img src={e.icon_url} alt="" className="w-4 h-4 object-contain" />
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 font-medium"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

