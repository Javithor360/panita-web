"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2, X, ChevronDown } from "lucide-react";
import { changePasswordAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"account">("account");
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(true);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Submission state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  // Limpiar el estado cada vez que se abre el modal para evitar mensajes "fantasma" de sesiones previas
  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setIsPasswordSectionOpen(true);
      setActiveTab("account");
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
    // Reset form on close
    setTimeout(() => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setIsPasswordSectionOpen(true);
    }, 300);
  };

  const validatePassword = (pass: string) => {
    if (pass.length < 5) {
      return "La contraseña debe tener al menos 5 caracteres.";
    }
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_+=/[\]\-~]/;
    if (!specialCharRegex.test(pass)) {
      return "La contraseña debe contener al menos un carácter especial.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      
      const result = await changePasswordAction(null, formData);
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess("Tu contraseña ha sido actualizada correctamente.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* @ts-ignore */}
      <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-[700px] md:max-w-[850px] max-h-[90vh] p-0 overflow-hidden bg-card border-border/50">
        <div className="flex flex-col md:flex-row h-[85vh] md:h-[650px] max-h-[850px]">
          {/* Sidebar / Tabs */}
          <div className="w-full md:w-1/3 bg-black/20 p-4 border-b md:border-b-0 md:border-r border-border/50 flex flex-col">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <h2 className="font-bold text-lg text-foreground/90 pl-2">Ajustes</h2>
              {/* Botón X Móvil */}
              <button 
                onClick={handleClose} 
                className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                 <X className="w-6 h-6" />
              </button>
            </div>
            <div className="h-px bg-border/30 w-full mb-4"></div>
            
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveTab("account")}
                className={`flex-shrink-0 w-full md:w-auto flex items-center justify-start gap-2 px-3 py-2 rounded-md text-sm transition-colors outline-none cursor-pointer ${
                  activeTab === "account" 
                    ? "bg-primary/20 text-primary font-medium" 
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4" />
                Cuenta
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto relative">
            {/* Botón X Desktop */}
            <button 
              onClick={handleClose} 
              className="hidden md:block absolute top-6 right-6 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer z-10"
              aria-label="Cerrar modal"
            >
               <X className="w-6 h-6" />
            </button>
            
            {activeTab === "account" && (
              <div className="space-y-6 relative">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1">Cuenta</h2>
                  <p className="text-sm text-muted-foreground">Administra la configuración de seguridad y detalles de tu cuenta.</p>
                </div>
                
                <div className="h-px bg-border/30 w-full -mt-2"></div>

                <div className="border border-border/50 rounded-lg overflow-hidden bg-background/30">
                  <div 
                    className="flex items-center gap-3 p-4 cursor-pointer select-none hover:bg-secondary/20 transition-colors"
                    onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                  >
                    <ChevronDown className={cn("w-5 h-5 transition-transform text-muted-foreground shrink-0", !isPasswordSectionOpen ? "-rotate-90" : "rotate-0")} />
                    <div>
                      <h3 className="font-bold text-base">Cambiar Contraseña</h3>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isPasswordSectionOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <form onSubmit={handleSubmit} className="p-4 pt-0 space-y-4 border-t border-border/50 mt-2">
                        <p className="text-sm text-muted-foreground mt-4 mb-2">Asegúrate de usar al menos 5 caracteres y un símbolo especial.</p>
                        <div className="space-y-2">
                          <label htmlFor="current" className="text-sm font-medium leading-none">Contraseña Actual</label>
                      <div className="relative">
                        <input
                          id="current"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full p-2 bg-background border rounded-md pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="new" className="text-sm font-medium leading-none">Nueva Contraseña</label>
                      <div className="relative">
                        <input
                          id="new"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-2 bg-background border rounded-md pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirm" className="text-sm font-medium leading-none">Confirmar Contraseña</label>
                      <div className="relative">
                        <input
                          id="confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full p-2 bg-background border rounded-md pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    {success && (
                      <div className="flex items-start gap-2 p-3 bg-emerald-500/10 text-emerald-500 rounded-md text-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{success}</p>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={isPending}
                            className="gap-2 cursor-pointer"
                          >
                            <Lock className="w-4 h-4" />
                            {isPending ? "Actualizando..." : "Actualizar"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
