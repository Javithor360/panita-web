"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { submitFormResponse } from "@/app/actions/forms";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FormRenderer({
  form,
  hasResponded,
  isLoggedIn,
  user,
}: {
  form: any;
  hasResponded: boolean;
  isLoggedIn: boolean;
  user?: any;
}) {
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  // Record<questionId, value>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const ign = user?.ign || user?.discord_name || "Jugador";

  if (!isLoggedIn) {
    return (
      <Card className="p-8 bg-card border-border shadow-lg rounded-xl text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-2" />
        <h2 className="text-2xl font-bold">Inicio de sesión requerido</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Para participar en el formulario <strong>{form.title}</strong>,
          necesitas iniciar sesión con tu cuenta de Discord.
        </p>
        <Link
          href={`/login?redirect=/forms/${form.slug}`}
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-full font-medium transition-colors"
        >
          Iniciar Sesión
        </Link>
      </Card>
    );
  }

  if (hasResponded || success) {
    return (
      <Card className="p-8 bg-card border-t-8 border-t-emerald-500 border-x-border border-b-border shadow-lg rounded-xl text-center flex flex-col items-center gap-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-2" />
        <h2 className="text-3xl font-bold">¡Gracias por participar!</h2>
        <p className="text-muted-foreground">
          Tus respuestas para <strong>{form.title}</strong> han sido registradas
          exitosamente.
        </p>
        <Link
          href="/profile"
          className="mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-2 rounded-full font-medium transition-colors"
        >
          Volver al Perfil
        </Link>
      </Card>
    );
  }

  if (!form.is_open) {
    return (
      <Card className="p-8 bg-card border-border shadow-lg rounded-xl text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-2" />
        <h2 className="text-2xl font-bold">Formulario Cerrado</h2>
        <p className="text-muted-foreground">
          Lo sentimos, este formulario ya no acepta nuevas respuestas.
        </p>
        <Link
          href="/profile"
          className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-2.5 rounded-md font-medium transition-colors"
        >
          Volver al Perfil
        </Link>
      </Card>
    );
  }

  const sections = form.sections || [];
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Calculate Progress
  const progressPercent =
    sections.length > 0
      ? Math.round((currentSectionIndex / sections.length) * 100)
      : 100;

  const handleNext = () => {
    // Validate required questions in current section
    const missing = currentSection.questions.filter((q: any) => {
      if (!q.is_required) return false;
      const val = answers[q.id];
      if (!val) return true; // empty string, null, undefined
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });

    if (missing.length > 0) {
      setError(
        `Faltan ${missing.length} preguntas obligatorias por responder.`,
      );
      return;
    }

    setError("");
    setCurrentSectionIndex((c) => c + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setError("");
    setCurrentSectionIndex((c) => c - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    // Validate last section
    const missing = currentSection.questions.filter((q: any) => {
      if (!q.is_required) return false;
      const val = answers[q.id];
      if (!val) return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });

    if (missing.length > 0) {
      setError(
        `Faltan ${missing.length} preguntas obligatorias por responder.`,
      );
      return;
    }

    setError("");
    setSubmitting(true);

    const res = await submitFormResponse(form.id, answers);
    if (res.error) {
      setError(res.error);
      setSubmitting(false);
    } else {
      setSuccess(true);
    }
  };

  const updateAnswer = (questionId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    if (error) setError("");
  };

  // Handle multiple choice checkboxes
  const toggleCheckbox = (questionId: string, option: string) => {
    const currentList = Array.isArray(answers[questionId])
      ? answers[questionId]
      : [];
    if (currentList.includes(option)) {
      updateAnswer(
        questionId,
        currentList.filter((o: string) => o !== option),
      );
    } else {
      updateAnswer(questionId, [...currentList, option]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card
        className="p-6 md:p-8 bg-card border-t-8 border-l-border border-r-border border-b-border rounded-xl shadow-md"
        style={{ borderTopColor: "var(--profile-glow, var(--primary))" }}
      >
        <h1 className="w-full text-3xl font-bold bg-transparent mb-2">
          {form.title}
        </h1>
        {form.description && (
          <p className="w-full text-muted-foreground whitespace-pre-wrap">
            {form.description}
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-start justify-between gap-5 text-sm font-medium">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground">Sesión iniciada como:</span>
            <div className="flex items-center gap-2">
              <Image unoptimized
                src={`https://render.crafty.gg/2d/head/${ign}`}
                alt={ign}
                width={28}
                height={28}
                className="w-7 h-7 rounded-sm shadow-sm"
                style={{ imageRendering: "pixelated" }}
              />
              <span className="text-foreground font-semibold text-base">
                {ign}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2 mt-1 sm:mt-0">
            <span className="text-orange-500 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Solo puedes responder una vez
            </span>
            <span className="text-red-500 flex items-center gap-1">
              * indica que es una pregunta obligatoria
            </span>
          </div>
        </div>
      </Card>

      {/* Current Section Container */}
      <div className="flex flex-col gap-6 relative">
        {currentSection.title && (
          <div className="rounded-xl shadow-md flex flex-col">
            <div
              className={`px-6 py-4 ${currentSection.description ? "rounded-t-xl" : "rounded-xl"}`}
              style={{
                backgroundColor: "var(--profile-glow, var(--primary))",
                color: "var(--profile-glow-text, #ffffff)",
              }}
            >
              <h2 className="text-xl font-bold">{currentSection.title}</h2>
            </div>
            {currentSection.description && (
              <div className="px-6 py-4 bg-card border-x border-b border-border rounded-b-xl">
                <p className="text-[15px] text-foreground whitespace-pre-wrap">
                  {currentSection.description}
                </p>
              </div>
            )}
          </div>
        )}

        {currentSection.questions.map((q: any, i: number) => {
          const val = answers[q.id] || "";
          const isRequiredAndEmpty =
            q.is_required && (!val || (Array.isArray(val) && val.length === 0));
          const hasError = error && isRequiredAndEmpty;

          return (
            <Card
              key={q.id}
              style={{ zIndex: 50 - i }}
              className={`relative overflow-visible p-6 bg-card border ${hasError ? "border-destructive ring-1 ring-destructive" : "border-border"} rounded-xl shadow-sm transition-all`}
            >
              <div className="mb-2">
                <h3 className="text-lg font-medium flex items-start gap-1">
                  {q.title}
                  {q.is_required && <span className="text-red-500">*</span>}
                </h3>
                {q.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {q.description}
                  </p>
                )}
              </div>

              <div className="mt-2">
                {q.type === "SHORT_TEXT" && (
                  <input
                    type="text"
                    value={val as string}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    placeholder="Tu respuesta"
                    className="w-full md:w-1/2 p-2 bg-transparent border-b border-muted-foreground/30 hover:border-border focus:border-primary focus:outline-none transition-colors"
                  />
                )}

                {q.type === "LONG_TEXT" && (
                  <textarea
                    value={val as string}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    placeholder="Tu respuesta"
                    className="w-full p-2 bg-transparent border-b border-muted-foreground/30 hover:border-border focus:border-primary focus:outline-none resize-y min-h-[100px] transition-colors"
                  />
                )}

                {q.type === "SINGLE_CHOICE" && (
                  <div className="flex flex-col gap-1.5">
                    {JSON.parse(q.options || "[]").map(
                      (opt: string, i: number) => (
                        <label
                          key={i}
                          className="flex items-center gap-3 cursor-pointer group p-2 -ml-2 rounded-lg hover:bg-secondary/40 transition-colors"
                        >
                          <div
                            className="w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors shadow-sm"
                            style={{
                              borderColor:
                                val === opt
                                  ? "var(--profile-glow, var(--primary))"
                                  : "var(--muted-foreground)",
                            }}
                          >
                            {val === opt && (
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    "var(--profile-glow, var(--primary))",
                                }}
                              />
                            )}
                          </div>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt}
                            checked={val === opt}
                            onChange={(e) => updateAnswer(q.id, e.target.value)}
                            className="sr-only"
                          />
                          <span className="text-[15px]">{opt}</span>
                        </label>
                      ),
                    )}
                  </div>
                )}

                {q.type === "MULTIPLE_CHOICE" && (
                  <div className="flex flex-col gap-1.5">
                    {JSON.parse(q.options || "[]").map(
                      (opt: string, i: number) => {
                        const list = Array.isArray(val) ? val : [];
                        const isChecked = list.includes(opt);
                        return (
                          <label
                            key={i}
                            className="flex items-center gap-3 cursor-pointer group p-2 -ml-2 rounded-lg hover:bg-secondary/40 transition-colors"
                          >
                            <div
                              className="w-5 h-5 rounded border-[1.5px] flex items-center justify-center transition-colors shadow-sm"
                              style={{
                                backgroundColor: isChecked
                                  ? "var(--profile-glow, var(--primary))"
                                  : "transparent",
                                borderColor: isChecked
                                  ? "var(--profile-glow, var(--primary))"
                                  : "var(--muted-foreground)",
                              }}
                            >
                              {isChecked && (
                                <svg
                                  className="w-3.5 h-3.5 drop-shadow-sm"
                                  style={{
                                    color: "var(--profile-glow-text, #ffffff)",
                                  }}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheckbox(q.id, opt)}
                              className="sr-only"
                            />
                            <span className="text-[15px]">{opt}</span>
                          </label>
                        );
                      },
                    )}
                  </div>
                )}

                {q.type === "DROPDOWN" && (
                  <SearchableDropdown
                    options={JSON.parse(q.options || "[]")}
                    value={val as string}
                    onChange={(newVal) => updateAnswer(q.id, newVal)}
                  />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-4 mb-8">
        <div className="flex-1 w-full sm:w-auto flex flex-col gap-3">
          {sections.length > 1 && (
            <div className="flex items-center gap-3">
              <div className="w-full sm:max-w-[250px] h-2.5 bg-secondary/80 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: "var(--profile-glow, var(--primary))",
                  }}
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-md font-medium text-sm w-fit shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          {currentSectionIndex > 0 && (
            <button
              onClick={handlePrev}
              disabled={submitting}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
            >
              Atrás
            </button>
          )}

          {isLastSection ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="hover:opacity-90 px-8 py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--profile-glow, var(--primary))",
                color: "var(--profile-glow-text, #ffffff)",
              }}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Enviar Respuestas
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="hover:opacity-90 px-8 py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--profile-glow, var(--primary))",
                color: "var(--profile-glow-text, #ffffff)",
              }}
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchableDropdown({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const safeOptions = Array.isArray(options) ? options : [];
  const filteredOptions = safeOptions.filter((opt) => {
    if (opt === null || opt === undefined) return false;
    return String(opt).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="relative w-full md:w-1/2" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-3 bg-card text-foreground border border-border hover:border-muted-foreground/50 rounded-lg outline-none text-left flex justify-between items-center transition-colors shadow-sm"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || "Elegir opción..."}
        </span>
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-lg border border-border bg-card shadow-xl overflow-hidden flex flex-col max-h-[250px] animate-in fade-in zoom-in-95 duration-200">
          <div className="relative border-b border-border/50 bg-secondary/10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-3 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="overflow-y-auto flex flex-col p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No se encontraron resultados.
              </div>
            ) : (
              filteredOptions.map((opt, i) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex items-center px-3 py-2.5 text-sm cursor-pointer rounded-md w-full text-left transition-colors ${
                      !isSelected
                        ? "hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                        : "font-medium shadow-sm"
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor:
                              "var(--profile-glow, var(--primary))",
                            color: "var(--profile-glow-text, #ffffff)",
                          }
                        : undefined
                    }
                  >
                    {opt}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
