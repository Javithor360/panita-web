'use client'

import { Users, Shield, Award } from "lucide-react"
import { UsersManager } from "./UsersManager"
import { RolesManager } from "./RolesManager"
import { EmblemsManager } from "./EmblemsManager"

export function AdminPanel({ glowColor }: { glowColor?: string }) {
  const color = glowColor || 'var(--primary)';
  
  return (
    <div className="mt-16 w-full pt-12 pb-8">
      <div className="flex items-center justify-center gap-4 mb-8">
        <div 
          className="h-[1px] flex-1" 
          style={{ background: `linear-gradient(to right, transparent, ${color})`, opacity: 0.5 }} 
        />
        <h2 className="text-lg tracking-tight sm:text-xl md:text-2xl font-bold text-foreground uppercase sm:tracking-wide">
          <span className="select-none mr-3" style={{ color: color, opacity: 0.8 }}>✦</span>
          Gestión del Servidor
          <span className="select-none ml-3" style={{ color: color, opacity: 0.8 }}>✦</span>
        </h2>
        <div 
          className="h-[1px] flex-1" 
          style={{ background: `linear-gradient(to left, transparent, ${color})`, opacity: 0.5 }} 
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UsersManager />
        <RolesManager />
        <EmblemsManager />
      </div>
    </div>
  )
}
