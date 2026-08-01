'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { getAdminForms, createForm, toggleFormStatus, deleteForm } from "@/app/actions/forms"
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, LayoutTemplate, Users, ClipboardList, BarChart3, Type, Link as LinkIcon, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormWithCounts = any;

export function FormsManager() {
  const router = useRouter()
  const [forms, setForms] = useState<FormWithCounts[]>([])
  const [loading, setLoading] = useState(true)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState("")
  const [createSlug, setCreateSlug] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadForms = async () => {
    setLoading(true)
    const data = await getAdminForms()
    setForms(data)
    setLoading(false)
  }

  useEffect(() => {
    loadForms()
  }, [])

  const handleCreate = async () => {
    if (!createTitle || !createSlug) return;
    setCreating(true)
    setCreateError("")
    
    // Auto-format slug just in case
    const safeSlug = createSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    
    const res = await createForm(createTitle, safeSlug);
    if (res.error) {
      setCreateError(res.error)
      setCreating(false)
    } else if (res.success) {
      router.push(`/admin/forms/${res.formId}/edit`)
    }
  }

  const handleToggleOpen = async (id: string, current: boolean) => {
    await toggleFormStatus(id, !current)
    loadForms()
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true)
    await deleteForm(deleteId)
    setDeleteId(null)
    setDeleting(false)
    loadForms()
  }

  return (
    <Card className="p-6 bg-card border-border shadow-lg min-h-[60vh] rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 border border-violet-500/20">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Todos los Formularios</h2>
            <p className="text-muted-foreground text-sm">Gestiona y crea nuevas encuestas para la comunidad.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-violet-600 text-white hover:bg-violet-700 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors cursor-pointer select-none"
        >
          <Plus className="w-5 h-5" />
          Crear Nuevo
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p>Cargando formularios...</p>
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg">No hay formularios creados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {forms.map(form => (
            <div key={form.id} className="group relative bg-card hover:bg-accent/5 transition-all duration-300 border border-border hover:border-violet-500/30 rounded-xl p-5 flex flex-col shadow-sm hover:shadow-md">
              <div className="flex justify-between items-start gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-violet-400 transition-colors" title={form.title}>{form.title}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-1 bg-white/10 inline-block px-2 py-0.5 rounded-md">/forms/{form.slug}</p>
                </div>
                <button
                  onClick={() => handleToggleOpen(form.id, form.is_open)}
                  className={`px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all border shrink-0 ${
                    form.is_open 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                      : 'bg-red-500/10 text-red-400/90 border-red-500/20 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]'
                  }`}
                  title={form.is_open ? "Cerrar formulario" : "Abrir formulario"}
                >
                  {form.is_open ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {form.is_open ? 'Abierto' : 'Cerrado'}
                </button>
              </div>

              <div className="flex items-center gap-6 py-4 border-y border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-sm">{form._count.responses}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {form._count.responses === 1 ? 'Respuesta' : 'Respuestas'}
                    </span>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-border/50" />

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                    <LayoutTemplate className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-sm">{form._count.sections}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {form._count.sections === 1 ? 'Sección' : 'Secciones'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button 
                  onClick={() => router.push(`/admin/forms/${form.id}/edit`)}
                  className="flex-1 bg-violet-500/10 text-violet-500 border border-violet-500/20 hover:bg-violet-500/20 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button 
                  onClick={() => router.push(`/admin/forms/${form.id}/results`)}
                  className="flex-1 bg-white/5 text-foreground border border-white/10 hover:bg-white/10 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  Resultados
                </button>
                <button 
                  onClick={() => setDeleteId(form.id)}
                  className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-all shrink-0 active:scale-95"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md p-7 gap-6">
          <DialogHeader className="pt-2">
            <DialogTitle className="text-xl">Crear Nuevo Formulario</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              Configura los detalles básicos. Luego podrás agregar secciones y preguntas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground/90">
                <Type className="w-4 h-4 text-violet-500/70" />
                Título del Formulario
              </label>
              <input 
                type="text" 
                value={createTitle}
                onChange={e => {
                  setCreateTitle(e.target.value)
                  // Auto-generate slug if it hasn't been manually edited much
                  if (!createSlug || createSlug === createTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, -1)) {
                    setCreateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))
                  }
                }}
                placeholder="Ej: Encuesta de la Comunidad 2026"
                className="p-3 bg-white/5 border border-border rounded-lg outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-sm"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground/90">
                <LinkIcon className="w-4 h-4 text-violet-500/70" />
                Enlace (Slug)
              </label>
              <div className="flex items-center gap-2 bg-white/5 border border-border rounded-lg focus-within:ring-1 focus-within:ring-violet-500 focus-within:border-violet-500 transition-all overflow-hidden">
                <span className="text-muted-foreground text-sm pl-3 select-none">/forms/</span>
                <input 
                  type="text" 
                  value={createSlug}
                  onChange={e => setCreateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                  placeholder="encuesta-2026"
                  className="flex-1 p-3 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
            {createError && <p className="text-sm text-destructive font-medium">{createError}</p>}
          </div>
          
          <DialogFooter className="mt-2">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              disabled={creating}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !createTitle || !createSlug}
              className="bg-violet-600 text-white hover:bg-violet-700 px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Continuar
              {!creating && <ArrowRight className="w-4 h-4" />}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar formulario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente el formulario, todas sus preguntas y todas las respuestas de los usuarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
