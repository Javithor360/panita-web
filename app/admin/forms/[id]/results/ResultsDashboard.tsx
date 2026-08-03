"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { deleteFormResponse } from "@/app/actions/forms";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
} from "recharts";
import {
  ArrowLeft,
  Users,
  FileText,
  CheckCircle2,
  LayoutTemplate,
  BarChart3,
  Check,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#9e9e9e",
  "#607d8b",
  "#f06292",
  "#ba68c8",
  "#9575cd",
  "#7986cb",
  "#64b5f6",
  "#4fc3f7",
  "#4dd0e1",
  "#4db6ac",
  "#81c784",
  "#aed581",
  "#dce775",
  "#fff176",
  "#ffd54f",
  "#ffb74d",
  "#ff8a65",
  "#a1887f",
  "#e57373",
  "#f48fb1",
  "#ce93d8",
  "#b39ddb",
  "#9fa8da",
  "#90caf9",
  "#81d4fa",
  "#80deea",
  "#80cbc4",
  "#a5d6a7",
  "#c5e1a5",
  "#e6ee9c",
  "#fff59d",
  "#ffe082",
  "#ffcc80",
  "#ffab91",
  "#bcaaa4",
];

const getQuestionColor = (questionId: string, index: number) => {
  let hash = 0;
  for (let i = 0; i < questionId.length; i++) {
    hash = questionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const startIdx = Math.abs(hash) % COLORS.length;
  return COLORS[(startIdx + index) % COLORS.length];
};

const CustomTooltip = ({ active, payload, label, totalValues }: any) => {
  if (active && payload && payload.length) {
    const title = label || payload[0].name;
    const value = payload[0].value;
    const percent = totalValues
      ? ((value / totalValues) * 100).toFixed(0)
      : null;
    const color = payload[0].payload?.fill || payload[0].color;

    return (
      <div className="bg-[#f3f4f6] text-[#111827] px-3 py-2 rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] border border-[#e5e7eb] text-sm pointer-events-none">
        <p className="font-bold mb-1 pb-1">{title}</p>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span>
            Elegido {value} {value === 1 ? 'vez' : 'veces'} {percent !== null ? `(${percent}%)` : ""}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const PAGE_SIZE = 10;

function TextAnswersList({ answers }: { answers: any[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(answers.length / PAGE_SIZE);
  const pageAnswers = answers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const start = page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, answers.length);

  return (
    <div className="flex flex-col gap-2">
      {pageAnswers.map((ans: any, i: number) => (
        <div
          key={i}
          className="bg-secondary/20 hover:bg-secondary/40 transition-colors px-4 py-3 rounded-xl border border-border/60 text-sm text-foreground/90 leading-relaxed relative overflow-hidden shadow-sm group"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500/40 group-hover:bg-violet-500 transition-colors" />
          {ans.value}
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/30 hover:bg-secondary/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ← Anterior
          </button>
          <span className="text-xs text-muted-foreground">
            Mostrando {start}–{end} de {answers.length} respuestas
            <span className="ml-2 text-muted-foreground/60">· Pág. {page + 1}/{totalPages}</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/30 hover:bg-secondary/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export function ResultsDashboard({ form }: { form: any }) {
  const [activeTab, setActiveTab] = useState<"summary" | "individual">(
    "summary",
  );
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [deleteResponse, setDeleteResponse] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const totalResponses = form.responses?.length || 0;

  const handleDeleteConfirm = () => {
    if (!deleteResponse) return;

    startTransition(async () => {
      const res = await deleteFormResponse(deleteResponse.id);
      if (res.error) {
        alert(res.error);
      } else {
        if (selectedResponse?.id === deleteResponse.id) {
          setSelectedResponse(null);
        }
        setDeleteResponse(null);
        router.refresh();
      }
    });
  };

  const renderShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      isActive,
    } = props;
    return (
      <g>
        {isActive && (
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 8}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            opacity={0.25}
            stroke="none"
            style={{ pointerEvents: "none" }}
          />
        )}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="hsl(var(--card))"
          strokeWidth={2}
          style={{ outline: "none" }}
        />
      </g>
    );
  };

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (percent < 0.03) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Aggregation logic for charts
  const getQuestionStats = (q: any) => {
    if (!["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN"].includes(q.type))
      return null;

    let options: string[] = [];
    try {
      options = JSON.parse(q.options || "[]");
    } catch {
      // ignore
    }

    const counts: Record<string, number> = {};
    options.forEach((opt) => (counts[opt] = 0));

    q.answers.forEach((ans: any) => {
      try {
        if (q.type === "MULTIPLE_CHOICE") {
          const vals = JSON.parse(ans.value || "[]");
          if (Array.isArray(vals)) {
            vals.forEach((v) => {
              if (counts[v] !== undefined) counts[v]++;
            });
          }
        } else {
          const val = ans.value;
          if (counts[val] !== undefined) counts[val]++;
        }
      } catch {
        // ignore parse errors
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // Text answers logic — returns ALL non-empty answers for text questions
  const getTextAnswers = (q: any) => {
    if (["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN"].includes(q.type))
      return null;
    return q.answers.filter((a: any) => a.value && a.value.trim() !== "");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-card/80 backdrop-blur-md p-5 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/forms"
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-bold text-xl leading-tight line-clamp-1">
                {form.title}
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-bold uppercase tracking-wider shrink-0">
                <BarChart3 className="w-3.5 h-3.5" />
                Analíticas
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Analizando resultados en tiempo real
            </p>
          </div>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 text-emerald-500/50 rounded-lg font-bold text-sm shadow-sm cursor-not-allowed"
          title="Próximamente"
        >
          <Download className="w-4 h-4 opacity-50" />
          Exportar a Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card/60 backdrop-blur-sm border-border flex flex-col items-center justify-center text-center gap-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-primary/10 rounded-full text-primary ring-4 ring-primary/5">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-4xl font-black mb-1">{totalResponses}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Respuestas Totales
            </p>
          </div>
        </Card>
        <Card className="p-6 bg-card/60 backdrop-blur-sm border-border flex flex-col items-center justify-center text-center gap-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500 ring-4 ring-emerald-500/5">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-4xl font-black mb-1">
              {form.is_open ? "Activo" : "Cerrado"}
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Estado
            </p>
          </div>
        </Card>
        <Card className="p-6 bg-card/60 backdrop-blur-sm border-border flex flex-col items-center justify-center text-center gap-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-violet-500/10 rounded-full text-violet-500 ring-4 ring-violet-500/5">
            <LayoutTemplate className="w-7 h-7" />
          </div>
          <div>
            <p className="text-4xl font-black mb-1">{form.sections.length}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Secciones
            </p>
          </div>
        </Card>
      </div>

      <div className="flex bg-card/60 backdrop-blur-sm rounded-xl border border-border p-1.5 mt-6 shadow-sm">
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer ${
            activeTab === "summary"
              ? "bg-violet-500/20 text-violet-400"
              : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-300"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Resumen de Respuestas
        </button>
        <button
          onClick={() => setActiveTab("individual")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer ${
            activeTab === "individual"
              ? "bg-violet-500/20 text-violet-400"
              : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-300"
          }`}
        >
          <Users className="w-4 h-4" />
          Respuestas Individuales
        </button>
      </div>

      {activeTab === "summary" && (
        <div className="flex flex-col gap-6">
          {totalResponses === 0 ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">
                Aún no hay respuestas para este formulario.
              </p>
            </div>
          ) : (
            form.sections.map((section: any, sIndex: number) => (
              <div key={section.id} className="flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-violet-500/50 w-full min-w-[20px]" />
                    <h2 className="text-xl font-bold text-violet-500 text-center uppercase tracking-wider shrink-0 max-w-[60%] sm:max-w-[70%] break-words">
                      {section.title || `Sección ${sIndex + 1}`}
                    </h2>
                    <div className="h-px bg-gradient-to-l from-transparent via-border to-violet-500/50 w-full min-w-[20px]" />
                  </div>
                  {section.description && (
                    <p className="text-sm text-muted-foreground mt-2 text-center max-w-2xl">
                      {section.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {section.questions.map((q: any) => {
                    const stats = getQuestionStats(q);
                    const texts = getTextAnswers(q);

                    return (
                      <Card
                        key={q.id}
                        className="p-6 bg-card border-border rounded-xl"
                      >
                        <h3
                          className={`font-semibold text-lg ${stats ? "mb-4" : "mb-2"}`}
                        >
                          {q.title}
                        </h3>

                        {stats && (
                          <div className="w-full mt-2">
                            {q.type === "SINGLE_CHOICE" || q.type === "DROPDOWN"
                              ? (() => {
                                  const validStats = stats.filter(
                                    (s: any) => s.value > 0,
                                  );
                                  const totalValues = stats.reduce(
                                    (acc: number, curr: any) =>
                                      acc + curr.value,
                                    0,
                                  );

                                  return (
                                    <div className="flex flex-col md:flex-row items-center justify-start gap-10 w-full px-2 md:px-6">
                                      {validStats.length > 0 ? (
                                        (() => {
                                          const pieData = validStats.map(
                                            (entry: any) => {
                                              const originalIndex =
                                                stats.findIndex(
                                                  (s: any) =>
                                                    s.name === entry.name,
                                                );
                                              return {
                                                ...entry,
                                                fill: getQuestionColor(
                                                  q.id,
                                                  originalIndex,
                                                ),
                                              };
                                            },
                                          );
                                          return (
                                            <div className="w-[240px] h-[240px] shrink-0">
                                              <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                              >
                                                <PieChart>
                                                  <Pie
                                                    isAnimationActive={false}
                                                    startAngle={90}
                                                    endAngle={-269.999}
                                                    shape={renderShape}
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    dataKey="value"
                                                    stroke="hsl(var(--card))"
                                                    strokeWidth={2}
                                                    labelLine={false}
                                                    label={
                                                      renderCustomizedLabel
                                                    }
                                                  />
                                                  <RechartsTooltip
                                                    wrapperStyle={{
                                                      pointerEvents: "none",
                                                    }}
                                                    content={
                                                      <CustomTooltip
                                                        totalValues={
                                                          totalValues
                                                        }
                                                      />
                                                    }
                                                  />
                                                </PieChart>
                                              </ResponsiveContainer>
                                            </div>
                                          );
                                        })()
                                      ) : (
                                        <div className="w-[240px] h-[240px] shrink-0 flex items-center justify-center border border-dashed border-border rounded-full text-muted-foreground text-sm">
                                          Sin votos
                                        </div>
                                      )}

                                      <div className="flex flex-col gap-2.5 flex-1 min-w-[200px] max-w-[500px]">
                                        {stats.map(
                                          (item: any, index: number) => {
                                            const isZero = item.value === 0;
                                            const percent =
                                              totalValues > 0
                                                ? (
                                                    (item.value / totalValues) *
                                                    100
                                                  ).toFixed(0)
                                                : "0";
                                            return (
                                              <div
                                                key={item.name}
                                                className={`flex items-start gap-3 text-sm transition-opacity ${isZero ? "opacity-50" : "opacity-100"}`}
                                              >
                                                <div
                                                  className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 shadow-sm"
                                                  style={{
                                                    backgroundColor:
                                                      getQuestionColor(
                                                        q.id,
                                                        index,
                                                      ),
                                                  }}
                                                />
                                                <span className="text-foreground/90 font-medium leading-tight">
                                                  {item.name}
                                                </span>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()
                              : (() => {
                                  const barData = stats.map(
                                    (entry: any, index: number) => ({
                                      ...entry,
                                      fill: COLORS[index % COLORS.length],
                                    }),
                                  );
                                  return (
                                    <div className="h-72 w-full mt-4">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <BarChart
                                          data={barData}
                                          layout="vertical"
                                          margin={{ left: 50, right: 20 }}
                                        >
                                          <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#333"
                                            horizontal={false}
                                          />
                                          <XAxis
                                            type="number"
                                            stroke="#888"
                                            allowDecimals={false}
                                          />
                                          <YAxis
                                            dataKey="name"
                                            type="category"
                                            stroke="#888"
                                            width={120}
                                            tick={{ fontSize: 12 }}
                                          />
                                          <RechartsTooltip
                                            cursor={{
                                              fill: "rgba(255, 255, 255, 0.05)",
                                            }}
                                            wrapperStyle={{
                                              pointerEvents: "none",
                                            }}
                                            content={<CustomTooltip />}
                                          />
                                          <Bar
                                            dataKey="value"
                                            radius={[0, 4, 4, 0]}
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  );
                                })()}
                          </div>
                        )}

                        {texts && texts.length > 0 && (
                          <TextAnswersList answers={texts} />
                        )}

                        {texts && texts.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">
                            No hay respuestas escritas aún.
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "individual" && (
        // ... existing individual tab layout
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="w-full md:w-1/3 bg-card border-border rounded-xl flex flex-col h-[600px]">
            <div className="p-4 border-b border-border font-bold flex items-center justify-center gap-2 text-foreground/90">
              <Users className="w-5 h-5 text-violet-500" />
              Usuarios ({totalResponses})
            </div>
            <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-1">
              {form.responses.map((resp: any) => (
                <button
                  key={resp.id}
                  onClick={() => setSelectedResponse(resp)}
                  className={`w-full text-left p-3 rounded-md transition-colors cursor-pointer flex items-center gap-3 ${
                    selectedResponse?.id === resp.id
                      ? "bg-violet-500/20 text-violet-400"
                      : "hover:bg-violet-500/10 hover:text-violet-300 text-foreground"
                  }`}
                >
                  <img
                    src={`https://render.crafty.gg/2d/head/${resp.user.ign || 'Steve'}`}
                    alt={resp.user.ign || 'Avatar'}
                    className="w-8 h-8 rounded-md bg-secondary/50"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {resp.user.ign || resp.user.discord_name}
                    </span>
                    <span
                      className={`text-xs transition-colors ${selectedResponse?.id === resp.id ? "text-violet-400/70" : "text-muted-foreground group-hover:text-violet-400/70"}`}
                    >
                      {new Date(resp.created_at).toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
              {totalResponses === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Sin respuestas
                </div>
              )}
            </div>
          </Card>

          <Card className="w-full md:w-2/3 bg-card border-border rounded-xl h-[600px] overflow-y-auto p-6">
            {!selectedResponse ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="w-12 h-12 mb-2 opacity-20" />
                <p>Selecciona un usuario para ver sus respuestas</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="border-b border-border pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://render.crafty.gg/2d/head/${selectedResponse.user.ign || 'Steve'}`}
                      alt={selectedResponse.user.ign || 'Avatar'}
                      className="w-12 h-12 rounded-lg bg-secondary/50 shadow-sm"
                    />
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold">
                        {selectedResponse.user.ign ||
                          selectedResponse.user.discord_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedResponse.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setDeleteResponse(selectedResponse)}
                    disabled={isPending}
                    className="flex items-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors font-medium text-sm cursor-pointer"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Eliminar
                  </button>
                </div>

                {form.sections.map((section: any, sIndex: number) => (
                  <div key={section.id} className="flex flex-col gap-4">
                    <div className="flex flex-col items-center justify-center mt-4 mb-2">
                      <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
                        <div className="h-px bg-gradient-to-r from-transparent via-border to-violet-500/50 w-full min-w-[20px]" />
                        <h4 className="text-lg font-bold text-violet-500 text-center uppercase tracking-wider shrink-0 max-w-[50%] sm:max-w-[70%] break-words">
                          {section.title || `Sección ${sIndex + 1}`}
                        </h4>
                        <div className="h-px bg-gradient-to-l from-transparent via-border to-violet-500/50 w-full min-w-[20px]" />
                      </div>
                      {section.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 text-center max-w-xl">
                          {section.description}
                        </p>
                      )}
                    </div>
                    {section.questions.map((q: any) => {
                      const ans = selectedResponse.answers.find(
                        (a: any) => a.question_id === q.id,
                      );

                      let selectedValues: string[] = [];
                      let displayVal = "- Sin respuesta -";

                      if (ans && ans.value) {
                        try {
                          if (q.type === "MULTIPLE_CHOICE") {
                            const parsed = JSON.parse(ans.value);
                            if (Array.isArray(parsed)) {
                              displayVal = parsed.join(", ");
                              selectedValues = parsed;
                            } else {
                              displayVal = ans.value;
                              selectedValues = [ans.value];
                            }
                          } else {
                            displayVal = ans.value;
                            selectedValues = [ans.value];
                          }
                        } catch {
                          displayVal = ans.value;
                          selectedValues = [ans.value];
                        }
                      }

                      const isChoiceBased = [
                        "SINGLE_CHOICE",
                        "MULTIPLE_CHOICE",
                        "DROPDOWN",
                      ].includes(q.type);

                      return (
                        <div key={q.id} className="flex flex-col gap-1.5 mb-4">
                          <p className="text-sm font-semibold text-foreground/90">
                            {q.title}
                          </p>

                          {isChoiceBased ? (
                            <div className="flex flex-col gap-2 mt-1">
                              {(() => {
                                let options: string[] = [];
                                try {
                                  options = JSON.parse(q.options || "[]");
                                } catch {}
                                if (options.length === 0)
                                  return (
                                    <span className="text-sm text-muted-foreground">
                                      - Sin opciones -
                                    </span>
                                  );

                                return options.map((opt, i) => {
                                  const isSelected =
                                    selectedValues.includes(opt);
                                  return (
                                    <div
                                      key={i}
                                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isSelected ? "border-violet-500/50 bg-violet-500/10" : "border-border/40 bg-secondary/10 opacity-70"}`}
                                    >
                                      {q.type === "MULTIPLE_CHOICE" ? (
                                        <div
                                          className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${isSelected ? "bg-violet-500 border-violet-500 text-white" : "border-muted-foreground/50"}`}
                                        >
                                          {isSelected && (
                                            <Check className="w-3 h-3" />
                                          )}
                                        </div>
                                      ) : (
                                        <div
                                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-violet-500" : "border-muted-foreground/50"}`}
                                        >
                                          {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-violet-500" />
                                          )}
                                        </div>
                                      )}
                                      <span
                                        className={`text-sm ${isSelected ? "text-foreground font-medium" : "text-muted-foreground"}`}
                                      >
                                        {opt}
                                      </span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          ) : (
                            <div className="bg-secondary/20 hover:bg-secondary/40 transition-colors px-4 py-3 rounded-xl border border-border/60 text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed relative overflow-hidden shadow-sm group">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500/40 group-hover:bg-violet-500 transition-colors" />
                              {displayVal}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
      <AlertDialog open={!!deleteResponse} onOpenChange={(open) => !open && setDeleteResponse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar respuesta?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar esta respuesta permanentemente?
              Al hacerlo, este usuario podrá volver a llenar el formulario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
