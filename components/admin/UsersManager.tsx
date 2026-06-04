'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { Users, Search, Check, Loader2, Plus, ArrowLeft } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { getUsers, updateUser, getRoles, getEmblems, getEditions } from "@/app/actions/admin"
import { EditionIcon } from "@/components/ui/EditionIcon"
import type { User as PrismaUser, Role, Emblem, Edition, UserEdition } from "@/lib/generated/prisma/client"

type UserWithRelations = PrismaUser & { roles: Role[], emblems: Emblem[], editions: UserEdition[] }

export function UsersManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<UserWithRelations[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [skip, setSkip] = useState(0)
  const INITIAL_TAKE = 8
  const LOAD_MORE_TAKE = 5

  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [allEmblems, setAllEmblems] = useState<Emblem[]>([])
  const [allEditions, setAllEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithRelations | null>(null)
  
  const extractSolidColor = (c: string) => {
    if (!c) return 'var(--foreground)'
    if (c.includes('gradient')) {
      const match = c.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/)
      return match ? match[0] : 'var(--foreground)'
    }
    return c
  }

  // Form states
  const [ign, setIgn] = useState('')
  const [discordName, setDiscordName] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [trustedAuthor, setTrustedAuthor] = useState(false)
  const [joinedAt, setJoinedAt] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [emblems, setEmblems] = useState<string[]>([])
  const [editions, setEditions] = useState<string[]>([])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [uData, rData, eData, edData] = await Promise.all([
        getUsers(searchQuery, INITIAL_TAKE, 0),
        getRoles(),
        getEmblems(),
        getEditions()
      ])
      setUsers(uData.users as UserWithRelations[])
      setTotalUsers(uData.total)
      setAllRoles(rData)
      setAllEmblems(eData)
      
      const sortedEditions = [...edData].sort((a, b) => {
        if (a.started_at && b.started_at) {
          return new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
        }
        if (a.started_at && !b.started_at) return -1;
        if (!a.started_at && b.started_at) return 1;
        return a.name.localeCompare(b.name);
      });
      setAllEditions(sortedEditions)
      
      setSkip(INITIAL_TAKE)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    } else {
      // Reset when closed
      setSelectedUser(null)
      setSearchQuery('')
      setSkip(0)
    }
  }, [isOpen])

  // Debounced Search
  useEffect(() => {
    if (!isOpen) return
    const delayDebounceFn = setTimeout(() => {
      setSkip(0)
      setLoading(true)
      getUsers(searchQuery, INITIAL_TAKE, 0).then(data => {
        setUsers(data.users)
        setTotalUsers(data.total)
        setSkip(INITIAL_TAKE)
        setLoading(false)
      })
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      const data = await getUsers(searchQuery, LOAD_MORE_TAKE, skip)
      setUsers(prev => {
        const newUsers = data.users.filter((u: UserWithRelations) => !prev.some(p => p.id === u.id))
        return [...prev, ...newUsers]
      })
      setSkip(prev => prev + LOAD_MORE_TAKE)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSelect = (u: UserWithRelations) => {
    setSelectedUser(u)
    setIgn(u.ign || '')
    setDiscordName(u.discord_name || '')
    setEnabled(u.enabled || false)
    // @ts-ignore - Prisma generated client might not be fully synced in IDE yet
    setTrustedAuthor(u.trusted_author || false)
    setJoinedAt(u.joined_at ? new Date(u.joined_at).toISOString().split('T')[0] : '')
    setRoles(u.roles?.map((r: Role) => r.id) || [])
    setEmblems(u.emblems?.map((e: Emblem) => e.id) || [])
    setEditions(u.editions?.map((e: UserEdition) => e.edition_id) || [])
  }

  const handleSave = async () => {
    if (!selectedUser) return
    const joinedAtDate = joinedAt ? new Date(joinedAt) : new Date()
    
    await updateUser(selectedUser.id, {
      ign: ign || null,
      discord_name: discordName,
      enabled,
      trusted_author: trustedAuthor,
      joined_at: joinedAtDate,
      roles,
      emblems,
      editions
    })
    
    // Refresh current user list without resetting pagination completely if possible, 
    // but easiest is to just reload from start
    setSearchQuery('')
    loadInitialData()
    setSelectedUser(null)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger 
        nativeButton={false}
        render={
          <Card className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-border bg-card hover:-translate-y-1 hover:[background-color:color-mix(in_srgb,var(--profile-glow)_15%,var(--card))] hover:border-transparent select-none" />
        }
      >
        <Users className="w-8 h-8" style={{ color: 'var(--profile-glow)' }} />
        <span className="font-semibold text-lg select-none">Usuarios</span>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Gestión de Usuarios</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 px-6 pb-6">
          {!selectedUser ? (
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-foreground z-10" />
                <input 
                  type="text" 
                  placeholder="Buscar por IGN o Discord..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-background/60 backdrop-blur-md border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
                />
              </div>

              {loading && skip === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted-foreground animate-in fade-in duration-500">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-sm font-medium tracking-wide">Recopilando datos...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {users.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No se encontraron usuarios.</p>
                  ) : (
                    users.map(u => (
                      <div 
                        key={u.id} 
                        onClick={() => handleSelect(u)}
                        className="p-3 border rounded-md cursor-pointer hover:bg-secondary/30 flex justify-between items-center transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-secondary overflow-hidden flex-shrink-0 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={u.ign ? `https://mc-heads.net/avatar/${u.ign}/64` : "/steve.svg"} alt={u.ign || 'Steve'} className="w-full h-full object-cover z-10 relative" style={{ imageRendering: 'pixelated' }} />
                            {/* Loading placeholder skeleton underneath */}
                            <div className="absolute inset-0 bg-muted animate-pulse z-0"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium group-hover:text-primary transition-colors">{u.ign || u.discord_name}</span>
                            <span className="text-xs text-muted-foreground">@{u.discord_name}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {users.length < totalUsers && (
                    <button 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="mt-2 w-full py-2 border border-border rounded-md text-sm font-medium hover:bg-secondary/30 transition-colors flex items-center justify-center gap-2 select-none cursor-pointer disabled:cursor-not-allowed"
                    >
                      {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Mostrar más
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
              <button 
                onClick={() => setSelectedUser(null)}
                className="flex items-center gap-2 px-1 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors select-none cursor-pointer w-fit group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver a la lista
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 mt-2">
                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                   <div className="w-16 h-16 rounded-md bg-secondary overflow-hidden shadow-md relative flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ign ? `https://mc-heads.net/avatar/${ign}/128` : "/steve.svg"} alt={ign || 'Steve'} className="w-full h-full object-cover z-10 relative" style={{ imageRendering: 'pixelated' }} />
                    {/* Loading placeholder skeleton underneath */}
                    <div className="absolute inset-0 bg-muted animate-pulse z-0"></div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-xl leading-none truncate">{ign || discordName}</h3>
                    <div className="flex flex-col 2xs:flex-row 2xs:items-center gap-1 2xs:gap-2 mt-1.5 min-w-0">
                      <p className="text-sm text-muted-foreground truncate">@{selectedUser.discord_name}</p>
                      <span className="text-muted-foreground/40 text-xs select-none truncate" title="Discord ID">
                        ID: {selectedUser.discord_id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-start sm:justify-center gap-2 px-1 sm:py-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={enabled} 
                      onChange={e => setEnabled(e.target.checked)} 
                      id="enabled-check"
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <label htmlFor="enabled-check" className="text-sm font-medium select-none cursor-pointer">Activo</label>
                  </div>

                  <div className="w-px h-4 bg-border sm:hidden"></div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={trustedAuthor} 
                      onChange={e => setTrustedAuthor(e.target.checked)} 
                      id="trusted-author-check"
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <label htmlFor="trusted-author-check" className="text-sm font-medium select-none cursor-pointer whitespace-nowrap">Autorizado</label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium">Nombre de Jugador</label>
                <input 
                  type="text" 
                  value={ign} 
                  onChange={e => setIgn(e.target.value)} 
                  className="p-2 bg-background border rounded-md"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Nombre de Discord</label>
                <input 
                  type="text" 
                  value={discordName} 
                  onChange={e => setDiscordName(e.target.value)} 
                  className="p-2 bg-background border rounded-md"
                />
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
                <label className="text-sm font-medium select-none">Rangos</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map(roleId => {
                    const r = allRoles.find(x => x.id === roleId);
                    if (!r) return null;
                    const solidColor = extractSolidColor(r.color);
                    const isCritical = r.id === 'admin' || r.id === 'mod';
                    return (
                      <button
                        key={r.id}
                        onClick={isCritical ? undefined : () => setRoles(roles.filter(id => id !== r.id))}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-all select-none flex items-center gap-1 group ${isCritical ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                        style={{ 
                          color: solidColor, 
                          borderColor: solidColor, 
                          backgroundColor: `color-mix(in srgb, ${solidColor} 15%, transparent)` 
                        }}
                        title={isCritical ? "Rol protegido" : "Click para remover"}
                      >
                        {r.name}
                        {!isCritical && <span className="text-[12px] ml-1 opacity-70 group-hover:opacity-100">&times;</span>}
                      </button>
                    )
                  })}
                  
                  {allRoles.filter(r => !roles.includes(r.id) && r.id !== 'admin' && r.id !== 'mod').length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-7 w-7 rounded-full border border-dashed border-border bg-secondary/10 hover:bg-secondary/30 transition-colors select-none cursor-pointer flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {allRoles.filter(r => !roles.includes(r.id) && r.id !== 'admin' && r.id !== 'mod').map(r => (
                          <DropdownMenuItem
                            key={r.id}
                            onClick={() => setRoles([...roles, r.id])}
                          >
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: extractSolidColor(r.color) }} />
                            {r.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium">Emblemas</label>
                <div className="flex flex-wrap gap-2">
                  {emblems.map(emblemId => {
                    const e = allEmblems.find(x => x.id === emblemId);
                    if (!e) return null;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setEmblems(emblems.filter(id => id !== e.id))}
                        className="px-2.5 py-1 text-xs rounded-full border transition-all select-none cursor-pointer flex items-center gap-1.5 group"
                        style={{ 
                          color: 'var(--profile-glow)', 
                          borderColor: 'color-mix(in srgb, var(--profile-glow) 30%, transparent)', 
                          backgroundColor: 'color-mix(in srgb, var(--profile-glow) 15%, transparent)' 
                        }}
                        title="Click para remover"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.icon_url} alt="" className="w-3.5 h-3.5 object-contain" />
                        {e.name}
                        <span className="text-[12px] ml-1 opacity-70 group-hover:opacity-100">&times;</span>
                      </button>
                    )
                  })}
                  
                  {allEmblems.filter(e => !emblems.includes(e.id)).length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-7 w-7 rounded-full border border-dashed border-border bg-secondary/10 hover:bg-secondary/30 transition-colors select-none cursor-pointer flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {allEmblems.filter(e => !emblems.includes(e.id)).map(e => (
                          <DropdownMenuItem
                            key={e.id}
                            onClick={() => setEmblems([...emblems, e.id])}
                            className="flex items-center gap-2"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={e.icon_url} alt="" className="w-4 h-4 object-contain" />
                            {e.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Historial de Participación */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium">Historial de Participación</label>
                <div className="flex flex-wrap gap-2">
                  {editions.map(edId => {
                    const ed = allEditions.find(x => x.id === edId);
                    if (!ed) return null;
                    return (
                      <button
                        key={ed.id}
                        onClick={() => setEditions(editions.filter(id => id !== ed.id))}
                        className="px-2.5 py-1 text-xs rounded-full border transition-all select-none cursor-pointer flex items-center gap-1.5 group"
                        style={{ 
                          color: 'var(--profile-glow)', 
                          borderColor: 'color-mix(in srgb, var(--profile-glow) 30%, transparent)', 
                          backgroundColor: 'color-mix(in srgb, var(--profile-glow) 15%, transparent)' 
                        }}
                        title="Click para remover"
                      >
                        <div className="w-3.5 h-3.5 shrink-0">
                          <EditionIcon editionId={ed.id} className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        {ed.name}
                        <span className="text-[12px] ml-1 opacity-70 group-hover:opacity-100">&times;</span>
                      </button>
                    )
                  })}
                  
                  {allEditions.filter(ed => !editions.includes(ed.id)).length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-7 w-7 rounded-full border border-dashed border-border bg-secondary/10 hover:bg-secondary/30 transition-colors select-none cursor-pointer flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {allEditions.filter(ed => !editions.includes(ed.id)).map(ed => (
                          <DropdownMenuItem
                            key={ed.id}
                            onClick={() => setEditions([...editions, ed.id])}
                            className="flex items-center gap-2"
                          >
                            <div className="w-4 h-4 shrink-0">
                              <EditionIcon editionId={ed.id} className="w-full h-full object-contain" />
                            </div>
                            {ed.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 font-medium select-none cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

