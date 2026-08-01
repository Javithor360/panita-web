"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  ArrowLeft,
  Copy,
  Loader2,
  Check,
} from "lucide-react";
import { updateFormStructure } from "@/app/actions/forms";
import Link from "next/link";

const QUESTION_TYPES = [
  { value: "SHORT_TEXT", label: "Texto Corto" },
  { value: "LONG_TEXT", label: "Párrafo" },
  { value: "SINGLE_CHOICE", label: "Varias Opciones (Radio)" },
  { value: "MULTIPLE_CHOICE", label: "Casillas (Checkboxes)" },
  { value: "DROPDOWN", label: "Desplegable" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableQuestionItem({
  question,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  isSorting,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const needsOptions = [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "DROPDOWN",
  ].includes(question.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-lg shadow-sm mb-4 flex transition-opacity ${isDragging ? "opacity-50 ring-2 ring-primary" : ""}`}
    >
      {/* Drag Handle */}
      <div
        className="w-8 flex flex-col items-center justify-center border-r bg-white/5 cursor-grab hover:bg-white/10 active:cursor-grabbing rounded-l-lg transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex-1 p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 w-full space-y-3">
            <input
              type="text"
              value={question.title}
              onChange={(e) =>
                updateQuestion(question.id, { title: e.target.value })
              }
              placeholder="Pregunta sin título"
              className="w-full text-lg font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-1 transition-colors"
            />
            <input
              type="text"
              value={question.description || ""}
              onChange={(e) =>
                updateQuestion(question.id, { description: e.target.value })
              }
              placeholder="Descripción (opcional)"
              className="w-full text-sm text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-1 transition-colors"
            />
          </div>

          <div className="w-full md:w-56 shrink-0">
            <select
              value={question.type}
              onChange={(e) =>
                updateQuestion(question.id, {
                  type: e.target.value,
                  options: [
                    "SINGLE_CHOICE",
                    "MULTIPLE_CHOICE",
                    "DROPDOWN",
                  ].includes(e.target.value)
                    ? question.options || ["Opción 1"]
                    : null,
                })
              }
              className="w-full p-2 bg-card text-foreground border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {QUESTION_TYPES.map((t) => (
                <option
                  key={t.value}
                  value={t.value}
                  className="bg-card text-foreground"
                >
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Options Editor */}
        {needsOptions && (
          <div className="mt-4 pl-1 space-y-2">
            {(question.options || []).map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className="w-4 h-4 shrink-0 rounded-full border border-muted-foreground/50 flex items-center justify-center">
                  {question.type === "MULTIPLE_CHOICE" && (
                    <div className="w-2 h-2 rounded-sm bg-muted-foreground/20" />
                  )}
                </div>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...(question.options || [])];
                    newOpts[i] = e.target.value;
                    updateQuestion(question.id, { options: newOpts });
                  }}
                  className="flex-1 bg-transparent text-foreground border-b border-transparent hover:border-border focus:border-primary focus:outline-none text-sm py-1 transition-colors"
                />
                <button
                  onClick={() => {
                    const newOpts = (question.options || []).filter(
                      (_: any, idx: number) => idx !== i,
                    );
                    updateQuestion(question.id, { options: newOpts });
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive rounded transition-all cursor-pointer"
                  title="Eliminar opción"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                updateQuestion(question.id, {
                  options: [
                    ...(question.options || []),
                    `Opción ${(question.options?.length || 0) + 1}`,
                  ],
                })
              }
              className="text-sm text-primary hover:underline font-medium flex items-center gap-1 mt-2 cursor-pointer select-none"
            >
              <Plus className="w-4 h-4" /> Añadir opción
            </button>
          </div>
        )}

        {/* Visual placeholders for text inputs */}
        {!needsOptions && (
          <div className="mt-4 pl-1">
            <div className="border-b border-dashed border-muted-foreground/30 py-2 w-1/2 text-muted-foreground/50 text-sm">
              Texto de respuesta{" "}
              {question.type === "LONG_TEXT" ? "larga" : "corta"}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-border">
          <button
            onClick={() => duplicateQuestion(question)}
            className="p-2 hover:bg-white/10 rounded-md text-muted-foreground cursor-pointer transition-colors"
            title="Duplicar"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteQuestion(question.id)}
            className="p-2 hover:bg-destructive/10 text-destructive rounded-md cursor-pointer transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-2" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Obligatorio
            </span>
            <div
              onClick={() =>
                updateQuestion(question.id, {
                  is_required: !question.is_required,
                })
              }
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${question.is_required ? "bg-violet-600" : "bg-white/10"}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${question.is_required ? "left-5" : "left-0.5"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FormBuilder({ initialForm }: { initialForm: any }) {
  const router = useRouter();
  const parseForm = (data: any) => {
    const f = JSON.parse(JSON.stringify(data));
    f.sections.forEach((sec: any) => {
      sec.questions.forEach((q: any) => {
        if (typeof q.options === "string") {
          try {
            q.options = JSON.parse(q.options);
          } catch (e) {
            q.options = [];
          }
        }
      });
    });
    return f;
  };

  const [originalForm, setOriginalForm] = useState(() =>
    parseForm(initialForm),
  );
  const [form, setForm] = useState(() => parseForm(initialForm));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateFormAttr = (key: string, value: any) => {
    setForm((f: any) => ({ ...f, [key]: value }));
  };

  const addSection = () => {
    setForm((f: any) => ({
      ...f,
      sections: [
        ...f.sections,
        {
          id: `new-sec-${Date.now()}`,
          isNew: true,
          title: `Sección ${f.sections.length + 1}`,
          description: "",
          questions: [],
        },
      ],
    }));
  };

  const deleteSection = (secId: string) => {
    if (form.sections.length <= 1) return; // Must have at least 1
    setForm((f: any) => ({
      ...f,
      sections: f.sections.filter((s: any) => s.id !== secId),
    }));
  };

  const updateSection = (secId: string, updates: any) => {
    setForm((f: any) => ({
      ...f,
      sections: f.sections.map((s: any) =>
        s.id === secId ? { ...s, ...updates } : s,
      ),
    }));
  };

  const addQuestion = (secId: string) => {
    setForm((f: any) => ({
      ...f,
      sections: f.sections.map((s: any) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          questions: [
            ...s.questions,
            {
              id: `new-q-${Date.now()}`,
              isNew: true,
              title: "",
              description: "",
              type: "SHORT_TEXT",
              is_required: false,
              options: null,
            },
          ],
        };
      }),
    }));
  };

  const updateQuestion = (secId: string, qId: string, updates: any) => {
    setForm((f: any) => ({
      ...f,
      sections: f.sections.map((s: any) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          questions: s.questions.map((q: any) =>
            q.id === qId ? { ...q, ...updates } : q,
          ),
        };
      }),
    }));
  };

  const deleteQuestion = (secId: string, qId: string) => {
    setForm((f: any) => ({
      ...f,
      sections: f.sections.map((s: any) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          questions: s.questions.filter((q: any) => q.id !== qId),
        };
      }),
    }));
  };

  const duplicateQuestion = (secId: string, q: any) => {
    setForm((f: any) => ({
      ...f,
      sections: f.sections.map((s: any) => {
        if (s.id !== secId) return s;
        const qIndex = s.questions.findIndex((x: any) => x.id === q.id);
        const newQs = [...s.questions];
        newQs.splice(qIndex + 1, 0, {
          ...q,
          id: `new-q-${Date.now()}`,
          isNew: true,
        });
        return { ...s, questions: newQs };
      }),
    }));
  };

  const handleDragEnd = (event: DragEndEvent, secId: string) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setForm((f: any) => {
        const sIndex = f.sections.findIndex((s: any) => s.id === secId);
        const sec = f.sections[sIndex];
        const oldIndex = sec.questions.findIndex(
          (q: any) => q.id === active.id,
        );
        const newIndex = sec.questions.findIndex((q: any) => q.id === over?.id);

        const newQs = arrayMove(sec.questions, oldIndex, newIndex);
        const newSecs = [...f.sections];
        newSecs[sIndex] = { ...sec, questions: newQs };
        return { ...f, sections: newSecs };
      });
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.title.trim()) {
      setError("El formulario debe tener un nombre.");
      return;
    }

    for (const section of form.sections) {
      if (!section.questions || section.questions.length === 0) {
        setError("Cada sección debe tener al menos una pregunta.");
        return;
      }
      for (const question of section.questions) {
        if (!question.title || !question.title.trim()) {
          setError("Todas las preguntas deben tener un título.");
          return;
        }
      }
    }

    setSaving(true);
    setError("");
    setSuccess(false);
    const res = await updateFormStructure(
      form.id,
      form.title,
      form.description,
      form.sections,
    );
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setOriginalForm(JSON.parse(JSON.stringify(form)));
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-card/95 backdrop-blur-sm p-4 rounded-xl border border-border shadow-md sticky top-20 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/forms"
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight line-clamp-1">
              {form.title}
            </h1>
            <p className="text-xs text-muted-foreground">/forms/{form.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <span className="text-destructive text-sm font-medium">
              {error}
            </span>
          )}
          {success && (
            <span className="text-emerald-500 text-sm font-medium flex items-center gap-1 animate-in fade-in duration-300">
              <Check className="w-4 h-4" /> Guardado
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-md font-medium flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar
          </button>
        </div>
      </div>

      <Card
        className="p-6 md:p-8 bg-card border-t-8 rounded-xl shadow-md"
        style={{ borderTopColor: "rgb(124 58 237)" }}
      >
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateFormAttr("title", e.target.value)}
          placeholder="Título del Formulario"
          className="w-full text-3xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-2 py-2 mb-2 transition-colors"
        />
        <textarea
          value={form.description || ""}
          onChange={(e) => updateFormAttr("description", e.target.value)}
          placeholder="Descripción del formulario (Opcional)"
          className="w-full text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-2 py-2 resize-none transition-colors h-24"
        />
      </Card>

      <div className="flex flex-col gap-12">
        {form.sections.map((section: any, sIndex: number) => (
          <div key={section.id} className="relative group/section">
            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-white/10 rounded-full group-hover/section:bg-violet-500/40 transition-colors" />

            <div className="flex items-center justify-between bg-violet-500/80 p-4 rounded-t-xl border-t border-l border-r border-border mb-0">
              <div className="flex-1">
                <input
                  type="text"
                  value={section.title || ""}
                  onChange={(e) =>
                    updateSection(section.id, { title: e.target.value })
                  }
                  placeholder={`Sección ${sIndex + 1}`}
                  className="w-full text-xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-1 transition-colors"
                />
                <input
                  type="text"
                  value={section.description || ""}
                  onChange={(e) =>
                    updateSection(section.id, { description: e.target.value })
                  }
                  placeholder="Descripción (opcional)"
                  className="w-full text-sm text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-1 transition-colors"
                />
              </div>

              {form.sections.length > 1 && (
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-md cursor-pointer transition-colors ml-4 shrink-0"
                  title="Eliminar Sección"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="bg-white/[0.01] p-4 rounded-b-xl border border-border">
              {section.questions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                  <p>Esta sección no tiene preguntas.</p>
                </div>
              ) : (
                <DndContext
                  id={`dnd-context-${section.id}`}
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, section.id)}
                >
                  <SortableContext
                    items={section.questions.map((q: any) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {section.questions.map((q: any) => (
                      <SortableQuestionItem
                        key={q.id}
                        question={q}
                        updateQuestion={(qId: string, updates: any) =>
                          updateQuestion(section.id, qId, updates)
                        }
                        deleteQuestion={(qId: string) =>
                          deleteQuestion(section.id, qId)
                        }
                        duplicateQuestion={(question: any) =>
                          duplicateQuestion(section.id, question)
                        }
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}

              <div className="flex items-center justify-center mt-4 pt-4 border-t border-border/50">
                <button
                  onClick={() => addQuestion(section.id)}
                  className="flex items-center gap-2 bg-transparent border border-dashed border-border hover:border-violet-500/60 hover:bg-violet-500/5 px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer text-muted-foreground hover:text-violet-400"
                >
                  <Plus className="w-4 h-4" /> Añadir Pregunta
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8 pb-4">
        <button
          onClick={addSection}
          className="flex items-center gap-2 bg-transparent border-2 border-dashed border-border hover:border-violet-500/60 hover:bg-violet-500/5 px-8 py-4 rounded-xl font-medium transition-all cursor-pointer text-muted-foreground hover:text-violet-400"
        >
          <Plus className="w-5 h-5" /> Añadir Nueva Sección
        </button>
      </div>
    </div>
  );
}
