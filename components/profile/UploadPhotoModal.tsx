"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Upload,
  X,
  Loader2,
  Link,
  Film,
  Camera,
  Plus,
  ChevronDown,
  FileVideo,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { uploadPhoto } from "@/app/actions/gallery";
import { EditionIcon } from "@/components/ui/EditionIcon";
import { EditableAuthor } from "@/components/gallery/edit/EditableAuthor";
import { EditableDate } from "@/components/gallery/edit/EditableDate";

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editions: Array<{ id: string; name: string }>;
  userIgn: string;
  userId: number;
  canEdit?: boolean;
}

/** Union of the two upload modes available to the user. */
type MediaMode = "photo" | "video";

/** Source selection when the user is in video mode. */
type VideoSource = "medal" | "file" | null;

export function UploadPhotoModal({
  isOpen,
  onClose,
  onSuccess,
  editions,
  userIgn,
  userId,
  canEdit,
}: UploadPhotoModalProps) {
  // ── Mode switch ────────────────────────────────────────────────────────────
  const [mediaMode, setMediaMode] = useState<MediaMode>("photo");
  const [videoSource, setVideoSource] = useState<VideoSource>(null);

  // ── Shared fields ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editionId, setEditionId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [isEditionSelectOpen, setIsEditionSelectOpen] = useState(false);
  const [isTagSelectOpen, setIsTagSelectOpen] = useState(false);

  const [authorId, setAuthorId] = useState<number | null>(userId);
  const [authorName, setAuthorName] = useState(userIgn);
  const [authorIgn, setAuthorIgn] = useState<string | null>(userIgn);
  const [dateTaken, setDateTaken] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );

  // ── Photo-specific ─────────────────────────────────────────────────────────
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Video-specific ─────────────────────────────────────────────────────────
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [medalUrl, setMedalUrl] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePhotoFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError(
        "La imagen es demasiado pesada. El tamaño máximo permitido es de 4 MB.",
      );
      return;
    }
    setError("");
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleVideoFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Solo se permiten archivos de video.");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError(
        "El video es demasiado pesado. El tamaño máximo permitido es de 500 MB.",
      );
      return;
    }
    setError("");
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setVideoSource("file");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (mediaMode === "photo") handlePhotoFile(file);
      else handleVideoFile(file);
    },
    [mediaMode, handlePhotoFile, handleVideoFile],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const file = e.clipboardData.files?.[0];
      if (!file) return;
      if (mediaMode === "photo") handlePhotoFile(file);
    },
    [mediaMode, handlePhotoFile],
  );

  const toggleTag = (id: string) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const switchMode = (mode: MediaMode) => {
    // Reset media state when switching modes.
    setMediaMode(mode);
    setPhotoFile(null);
    setPreview(null);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setMedalUrl("");
    setVideoSource(null);
    setError("");
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    if (!editionId) {
      setError("Debes seleccionar una edición.");
      return;
    }
    if (tagIds.length === 0) {
      setError("Debes seleccionar al menos una etiqueta.");
      return;
    }

    if (mediaMode === "photo") {
      if (!photoFile) {
        setError("Debes seleccionar una imagen.");
        return;
      }
      await submitPhoto();
    } else {
      if (videoSource === "medal" && !medalUrl.trim()) {
        setError("Debes ingresar el link del clip de Medal.");
        return;
      }
      if (videoSource === "file" && !videoFile) {
        setError("Debes seleccionar un archivo de video.");
        return;
      }
      if (!videoSource) {
        setError("Debes elegir una fuente de video.");
        return;
      }
      await submitVideo();
    }
  };

  const submitPhoto = async () => {
    setError("");
    setIsUploading(true);
    setUploadProgress("Subiendo imagen a Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("file", photoFile!);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("edition_id", editionId);
      formData.append("tagIds", JSON.stringify(tagIds));
      if (canEdit) {
        formData.append(
          "author_id",
          authorId !== null ? String(authorId) : "null",
        );
        formData.append("date_taken", dateTaken);
      }
      await uploadPhoto(formData);
      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al subir la fotografía.",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const submitVideo = async () => {
    setError("");
    setIsUploading(true);
    setUploadProgress(
      "Subiendo video a YouTube... Esto puede tardar unos minutos.",
    );
    try {
      const formData = new FormData();
      formData.append("mode", videoSource === "medal" ? "medal" : "file");
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("edition_id", editionId);
      formData.append("tagIds", JSON.stringify(tagIds));
      if (videoSource === "medal") {
        formData.append("medalUrl", medalUrl.trim());
      } else {
        formData.append("file", videoFile!);
      }
      if (canEdit) {
        formData.append(
          "author_id",
          authorId !== null ? String(authorId) : "null",
        );
        formData.append("date_taken", dateTaken);
      }

      const res = await fetch("/api/gallery/upload-video", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Error al subir el video.");

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir el video.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const resetForm = () => {
    setPhotoFile(null);
    setPreview(null);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setMedalUrl("");
    setVideoSource(null);
    setTitle("");
    setDescription("");
    setEditionId("");
    setTagIds([]);
    setAuthorId(userId);
    setAuthorName(userIgn);
    setAuthorIgn(userIgn);
    setDateTaken(new Date().toISOString().split("T")[0]);
    setMediaMode("photo");
  };

  // ── Date formatting ────────────────────────────────────────────────────────
  let formattedDate = "";
  if (dateTaken) {
    const [year, monthNum, dayNum] = dateTaken.split("-");
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    formattedDate = `${monthNames[parseInt(monthNum, 10) - 1]} ${parseInt(dayNum, 10)}, ${year}`;
  }

  // ── Computed state ─────────────────────────────────────────────────────────
  const hasMedia =
    mediaMode === "photo"
      ? Boolean(photoFile)
      : videoSource === "medal"
        ? Boolean(medalUrl.trim())
        : Boolean(videoFile);
  const isSubmitDisabled =
    isUploading || !title || !editionId || tagIds.length === 0 || !hasMedia;
  const isVideoPreviewReady =
    mediaMode === "video" &&
    (videoSource === "file" ? Boolean(videoPreviewUrl) : Boolean(medalUrl));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isUploading && onClose()}
    >
      <DialogContent
        className="w-[100vw] h-[100dvh] sm:max-w-none max-w-none bg-black/60 backdrop-blur-xl border-none rounded-none p-0 flex flex-col-reverse md:flex-row shadow-none focus:outline-none !z-[100] [&>button]:hidden"
        onPaste={handlePaste}
      >
        <DialogTitle className="sr-only">
          {mediaMode === "photo" ? "Subir nueva fotografía" : "Publicar video"}
        </DialogTitle>

        {/* Left Side: Preview / Dropzone */}
        <div
          className="flex-1 relative flex items-center justify-center border-t md:border-t-0 border-white/10 overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Header overlay (mirrors PhotoModal header) */}
          <div className="hidden md:flex absolute top-0 left-0 right-0 px-6 py-6 md:px-12 md:py-8 flex-col-reverse lg:flex-row justify-between lg:items-start gap-4 lg:gap-0 z-10 pointer-events-none transition-all duration-500 ease-in-out opacity-100 bg-gradient-to-b from-black/95 via-black/50 to-transparent min-h-[150px]">
            <div className="flex flex-col gap-1.5 pointer-events-auto mt-1 w-full lg:w-auto drop-shadow-md">
              {/* Row 1: Author and Edition */}
              <div className="flex flex-wrap items-center gap-3 text-white/90 font-medium">
                {canEdit ? (
                  <EditableAuthor
                    authorId={authorId}
                    authorName={authorName}
                    authorIgn={authorIgn}
                    onSave={async (id, name, ign) => {
                      setAuthorId(id);
                      setAuthorName(name);
                      setAuthorIgn(ign);
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://render.crafty.gg/2d/head/${userIgn}`}
                      alt={userIgn}
                      className="size-4 rounded-sm bg-black/20"
                    />
                    <span>{userIgn}</span>
                  </div>
                )}
                {editionId && <span className="text-white/40">•</span>}
                {editionId && (
                  <div className="flex items-center gap-1.5 text-white/70">
                    <EditionIcon
                      editionId={editionId}
                      className="size-4 opacity-80"
                    />
                    <span>
                      {editions.find((e) => e.id === editionId)?.name}
                    </span>
                  </div>
                )}
              </div>
              {/* Row 2: Date */}
              <div className="flex flex-wrap items-center gap-3 text-white/60 text-sm">
                {canEdit ? (
                  <EditableDate
                    value={dateTaken}
                    formattedDate={formattedDate}
                    onSave={async (val) => setDateTaken(val)}
                  />
                ) : (
                  <span>{formattedDate}</span>
                )}
              </div>
            </div>
          </div>

          {/* Preview area */}
          <div className="absolute inset-0 p-4 pt-24 pb-32 md:p-12 md:pt-28 md:pb-40 flex items-center justify-center pointer-events-none z-0">
            {mediaMode === "photo" && preview && (
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-full object-contain drop-shadow-2xl pointer-events-auto"
              />
            )}

            {mediaMode === "video" &&
              videoSource === "file" &&
              videoPreviewUrl && (
                <video
                  src={videoPreviewUrl}
                  controls
                  className="max-w-full max-h-full rounded-xl drop-shadow-2xl pointer-events-auto"
                />
              )}

            {mediaMode === "video" &&
              videoSource === "medal" &&
              medalUrl.trim() && (
                <div className="flex flex-col items-center gap-4 text-white/70 pointer-events-auto">
                  <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-sm max-w-sm text-center backdrop-blur-sm">
                    <Film className="size-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium text-white/90 break-all">
                      {medalUrl}
                    </p>
                    <p className="text-xs mt-2 text-white/50">
                      El clip se importará desde Medal al subir
                    </p>
                  </div>
                </div>
              )}

            {/* Dropzone — only shown when no media is selected */}
            {!preview && !(mediaMode === "video" && isVideoPreviewReady) && (
              <div
                onClick={() =>
                  mediaMode === "photo"
                    ? photoInputRef.current?.click()
                    : videoSource === "file"
                      ? videoInputRef.current?.click()
                      : null
                }
                className="z-0 w-full max-w-md aspect-video border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-4 text-white/50 hover:text-white hover:border-white/50 hover:bg-white/5 cursor-pointer transition-all mx-8 pointer-events-auto"
              >
                {mediaMode === "photo" ? (
                  <>
                    <Camera className="w-12 h-12" />
                    <div className="text-center">
                      <p className="font-medium text-lg">
                        Haz clic o arrastra una imagen
                      </p>
                      <p className="text-sm opacity-70">
                        También puedes pegar (Ctrl+V)
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Film className="w-12 h-12" />
                    <div className="text-center">
                      <p className="font-medium text-lg">
                        Elige una fuente de video
                      </p>
                      <p className="text-sm opacity-70">
                        Medal.tv o archivo local
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom overlay: Tags, title and description preview */}
          <div className="hidden md:flex absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex-col gap-4 max-h-[50%] overflow-hidden z-10">
            {tagIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tagIds.map((id) => {
                  const cat = CATEGORIES.find((c) => c.id === id);
                  if (!cat) return null;
                  return (
                    <span
                      key={id}
                      style={{
                        backgroundColor: `${cat.color}33`,
                        borderColor: `${cat.color}66`,
                        color: cat.color,
                      }}
                      className="px-3 py-1 rounded-full text-xs backdrop-blur-md border font-medium flex items-center gap-1.5 w-fit"
                    >
                      <cat.iconComponent className="size-3.5" />
                      {cat.label}
                    </span>
                  );
                })}
              </div>
            )}
            <h3
              className={`text-2xl md:text-3xl font-bold drop-shadow-md ${title ? "text-white" : "text-white/50 italic"}`}
            >
              {title ||
                (mediaMode === "photo"
                  ? "Un atardecer cuadrado..."
                  : "Mi mejor clip...")}
            </h3>
            {(description || !preview) && (
              <p
                className={`text-sm md:text-base leading-relaxed max-w-3xl whitespace-pre-wrap ${description ? "text-white/80" : "text-white/30 italic"}`}
              >
                {description || "Cuenta la historia de este momento..."}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[400px] lg:w-[450px] bg-black/20 backdrop-blur-3xl flex flex-col h-[50dvh] md:h-full overflow-y-auto shrink-0 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isUploading}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/40 hover:bg-white/10 text-white/50 hover:text-white border border-transparent hover:border-white/20 disabled:opacity-50 cursor-pointer backdrop-blur-md transition-all shadow-xl"
            title="Cerrar (ESC)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8 flex flex-col gap-5 pt-12 md:pt-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold text-white font-minecraft tracking-wider">
                {mediaMode === "photo" ? "Publicar Foto" : "Publicar Video"}
              </h2>

              {/* Media mode switch */}
              <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 gap-1">
                <button
                  id="media-mode-photo"
                  type="button"
                  onClick={() => switchMode("photo")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${mediaMode === "photo" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white"}`}
                >
                  <Camera className="size-4" />
                  Foto
                </button>
                <button
                  id="media-mode-video"
                  type="button"
                  onClick={() => switchMode("video")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${mediaMode === "video" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white"}`}
                >
                  <Film className="size-4" />
                  Video
                </button>
              </div>

              <hr className="border-white/10" />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/80">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  mediaMode === "photo"
                    ? "Un atardecer cuadrado..."
                    : "Mi mejor clip..."
                }
                className="bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                maxLength={100}
              />
            </div>

            {/* Edition */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-medium text-white/80">
                Edición <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsEditionSelectOpen(!isEditionSelectOpen)}
                className="w-full bg-[#111] border border-white/10 hover:border-white/30 rounded-lg p-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all flex items-center justify-between cursor-pointer"
              >
                {editionId ? (
                  <div className="flex items-center gap-2">
                    <EditionIcon editionId={editionId} className="size-5" />
                    <span>
                      {editions.find((e) => e.id === editionId)?.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-white/50">
                    Selecciona la edición...
                  </span>
                )}
                <ChevronDown className="size-4 text-white/50" />
              </button>
              {isEditionSelectOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border border-white/10 bg-[#111] text-white shadow-xl flex flex-col p-1 max-h-60 overflow-y-auto">
                  {editions.map((ed) => (
                    <button
                      key={ed.id}
                      type="button"
                      onClick={() => {
                        setEditionId(ed.id);
                        setIsEditionSelectOpen(false);
                      }}
                      className={`flex items-center gap-2 text-left px-3 py-2.5 text-sm rounded-md transition-colors cursor-pointer ${editionId === ed.id ? "bg-primary/20 text-primary" : "hover:bg-white/10"}`}
                    >
                      <EditionIcon
                        editionId={ed.id}
                        alt={ed.name}
                        className="size-5"
                      />
                      <span>{ed.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/80">
                Descripción{" "}
                <span className="text-white/40 text-xs font-normal">
                  (opcional)
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cuenta la historia de este momento..."
                className="bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[80px] resize-y"
                maxLength={500}
              />
            </div>

            {/* ── Media input ── */}
            {mediaMode === "photo" ? (
              // Photo file input
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">
                  Imagen <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 w-full">
                  <div className="relative group w-3/4">
                    <input
                      type="file"
                      ref={photoInputRef}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*,image/gif"
                      onChange={(e) =>
                        e.target.files && handlePhotoFile(e.target.files[0])
                      }
                    />
                    <div className="w-full h-[50px] bg-[#111] border border-white/10 group-hover:border-white/30 rounded-lg p-3 text-white flex items-center justify-between transition-all">
                      <span
                        className={
                          photoFile
                            ? "text-white text-sm truncate pr-4"
                            : "text-white/50 text-sm"
                        }
                      >
                        {photoFile ? photoFile.name : "Seleccionar imagen..."}
                      </span>
                      <Upload className="size-4 text-white/50 shrink-0" />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!photoFile}
                    onClick={() => {
                      setPhotoFile(null);
                      setPreview(null);
                      if (photoInputRef.current)
                        photoInputRef.current.value = "";
                    }}
                    className="w-1/4 h-[50px] flex items-center justify-center bg-destructive/20 hover:bg-destructive/40 text-destructive border border-destructive/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Quitar archivo"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>
            ) : (
              // Video source selection
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">
                  Fuente de video <span className="text-red-500">*</span>
                </label>

                <div className="flex flex-col gap-3">
                  {/* Medal.tv option */}
                  <div
                    className={`rounded-lg border transition-all overflow-hidden ${videoSource === "medal" ? "border-primary/50 bg-primary/5" : "border-white/10 bg-white/3"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setVideoSource("medal")}
                      className="w-full flex items-center gap-3 p-3 text-left cursor-pointer"
                    >
                      <div
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${videoSource === "medal" ? "border-primary" : "border-white/30"}`}
                      >
                        {videoSource === "medal" && (
                          <div className="size-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src="/assets/medal_logo_white.png"
                          alt="Medal"
                          className="w-5 h-5 object-contain"
                        />
                        <span className="text-sm font-medium text-white">
                          Importar clip de Medal
                        </span>
                      </div>
                    </button>
                    {videoSource === "medal" && (
                      <div className="px-3 pb-3">
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                          <input
                            type="url"
                            value={medalUrl}
                            onChange={(e) => setMedalUrl(e.target.value)}
                            placeholder="https://medal.tv/games/minecraft/clips/..."
                            className="w-full bg-black/30 border border-white/10 rounded-md pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Local file option */}
                  <div
                    className={`rounded-lg border transition-all ${videoSource === "file" ? "border-primary/50 bg-primary/5" : "border-white/10 bg-white/3"}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setVideoSource("file");
                        videoInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left cursor-pointer"
                    >
                      <div
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${videoSource === "file" ? "border-primary" : "border-white/30"}`}
                      >
                        {videoSource === "file" && (
                          <div className="size-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileVideo className="w-5 h-5 text-white" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">
                            Subir archivo de video
                          </span>
                          <span className="text-xs text-white/40">
                            {videoFile
                              ? videoFile.name
                              : "MP4, WebM — máx. 4.5 MB"}
                          </span>
                        </div>
                      </div>
                    </button>
                    <input
                      type="file"
                      ref={videoInputRef}
                      className="hidden"
                      accept="video/*"
                      onChange={(e) =>
                        e.target.files && handleVideoFile(e.target.files[0])
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-medium text-white/80">
                Etiquetas <span className="text-red-500">*</span>{" "}
                <span className="text-white/40 text-xs font-normal">
                  (mínimo 1)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {tagIds.map((id) => {
                  const cat = CATEGORIES.find((c) => c.id === id);
                  if (!cat) return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleTag(cat.id)}
                      style={{
                        backgroundColor: `${cat.color}33`,
                        borderColor: `${cat.color}66`,
                        color: cat.color,
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border"
                    >
                      <cat.iconComponent className="size-3.5" />
                      {cat.label}
                      <span className="ml-1 opacity-60 font-bold text-sm leading-none flex items-center justify-center">
                        ×
                      </span>
                    </button>
                  );
                })}

                {CATEGORIES.filter((c) => !tagIds.includes(c.id)).length >
                  0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTagSelectOpen(!isTagSelectOpen)}
                      className="size-[30px] rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center border bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                    >
                      <Plus className="size-4" />
                    </button>

                    {isTagSelectOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[140]"
                          onClick={() => setIsTagSelectOpen(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 z-[150] w-48 rounded-lg border border-white/10 bg-[#111] text-white shadow-xl flex flex-col p-1 max-h-60 overflow-y-auto">
                          {CATEGORIES.filter((c) => !tagIds.includes(c.id)).map(
                            (cat) => {
                              if (cat.id === "members_choice" && !canEdit)
                                return null;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    toggleTag(cat.id);
                                    setIsTagSelectOpen(false);
                                  }}
                                  className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer hover:bg-white/10"
                                >
                                  <cat.iconComponent
                                    className="size-4"
                                    style={{ color: cat.color }}
                                  />
                                  <span>{cat.label}</span>
                                </button>
                              );
                            },
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="pb-12 md:pb-0">
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="w-full bg-primary hover:brightness-110 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-primary/50 disabled:bg-white/10 disabled:border-transparent disabled:text-white/40 disabled:shadow-none text-primary-foreground font-bold py-3.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {isUploading ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {mediaMode === "photo"
                        ? "Subiendo imagen..."
                        : "Subiendo video..."}
                    </div>
                    {uploadProgress && (
                      <span className="text-xs font-normal opacity-80">
                        {uploadProgress}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {mediaMode === "photo" ? (
                      <Upload className="w-5 h-5" />
                    ) : (
                      <Film className="w-5 h-5" />
                    )}
                    {mediaMode === "photo"
                      ? "Publicar Fotografía"
                      : "Publicar Video"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
