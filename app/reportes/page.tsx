"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useTickets } from "@/hooks/use-tickets"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  type Ticket,
  getTicketProcessSteps,
  type ProcessStep,
  tipoServicioLabel,
} from "@/lib/tickets"
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  UserCircle,
  Printer,
  Layers,
  Scissors,
  Sparkles,
  Star,
  CalendarDays,
  X,
} from "lucide-react"

type FiltroReporte = "todos" | "a_tiempo" | "con_fallos"
type FiltroFecha = "hoy" | "ayer" | "semana" | "mes" | "personalizado" | null

const stepIconMap: Record<string, React.ElementType> = {
  impresion: Printer,
  laminado: Layers,
  impresion_2: Printer,
  foil: Sparkles,
  corte: Scissors,
  acabados: Star,
}

const stepColorMap: Record<string, string> = {
  impresion: "text-blue-600",
  laminado: "text-purple-600",
  impresion_2: "text-blue-600",
  foil: "text-pink-600",
  corte: "text-orange-600",
  acabados: "text-teal-600",
}

function formatMinutos(min: number): string {
  if (min < 1) return "<1 min"
  if (min < 60) return `${Math.round(min)} min`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatFecha(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatFechaCorta(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getDateRange(filtro: FiltroFecha): { desde: Date; hasta: Date } | null {
  if (!filtro || filtro === "personalizado") return null
  const now = new Date()
  const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  switch (filtro) {
    case "hoy":
      return { desde: hoy, hasta: manana }
    case "ayer": {
      const ayer = new Date(hoy)
      ayer.setDate(ayer.getDate() - 1)
      return { desde: ayer, hasta: hoy }
    }
    case "semana": {
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(inicioSemana.getDate() - 7)
      return { desde: inicioSemana, hasta: manana }
    }
    case "mes": {
      const inicioMes = new Date(hoy)
      inicioMes.setDate(inicioMes.getDate() - 30)
      return { desde: inicioMes, hasta: manana }
    }
    default:
      return null
  }
}

function calcRealTime(step: ProcessStep): number | null {
  if (!step.inicio || !step.fin) return null
  return (new Date(step.fin).getTime() - new Date(step.inicio).getTime()) / 60000
}

function EtapaBadge({ step }: { step: ProcessStep }) {
  if (step.estado === "pendiente" || step.estado === "no_aplica") {
    return (
      <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
        N/A
      </Badge>
    )
  }
  if (step.estado === "en_progreso") {
    return (
      <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
        En progreso
      </Badge>
    )
  }
  const real = calcRealTime(step)
  if (real === null) return null
  const est = step.tiempoEstimado ?? 0
  const onTime = real <= est
  if (onTime) {
    return (
      <Badge className="text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        <CheckCircle2 className="size-3 mr-1" />A tiempo
      </Badge>
    )
  }
  return (
    <Badge className="text-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
      <XCircle className="size-3 mr-1" />Excedido
    </Badge>
  )
}

function ResumenCard({
  titulo,
  valor,
  subtitulo,
  icon: Icon,
  colorClass,
}: {
  titulo: string
  valor: string | number
  subtitulo?: string
  icon: React.ElementType
  colorClass: string
}) {
  return (
    <Card className="py-0 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{titulo}</p>
            <p className="text-2xl font-bold text-foreground">{valor}</p>
            {subtitulo && <p className="text-xs text-muted-foreground">{subtitulo}</p>}
          </div>
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", colorClass)}>
            <Icon className="size-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TicketReporteCard({ ticket }: { ticket: Ticket }) {
  const steps = getTicketProcessSteps(ticket)
  const completedSteps = steps.filter((s) => s.estado === "completado")

  return (
    <Card className="py-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <span className="font-bold font-mono text-foreground">#{ticket.ticketPOS}</span>
          {ticket.cliente && (
            <span className="text-sm text-muted-foreground">- {ticket.cliente}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {tipoServicioLabel(ticket.tipoServicio)}
          </Badge>
          <span className="text-xs text-muted-foreground">{formatFecha(ticket.creadoEn)}</span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className={cn("grid grid-cols-1 gap-3", completedSteps.length > 1 ? "sm:grid-cols-2" : "")}>
          {steps.map((step) => {
            const Icon = stepIconMap[step.key] || Clock
            const color = stepColorMap[step.key] || "text-muted-foreground"
            const realTime = calcRealTime(step)

            return (
              <div key={step.key} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("size-4", color)} />
                    <span className="text-sm font-semibold text-foreground">{step.label}</span>
                  </div>
                  <EtapaBadge step={step} />
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>Est: {formatMinutos(step.tiempoEstimado ?? 0)}</span>
                  </div>
                  {realTime !== null && (
                    <div
                      className={cn(
                        "flex items-center gap-1 font-medium",
                        realTime <= (step.tiempoEstimado ?? 0)
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      <Clock className="size-3.5" />
                      <span>Real: {formatMinutos(realTime)}</span>
                    </div>
                  )}
                </div>
                {step.realizadoPor && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground border-t pt-2 mt-1">
                    <UserCircle className="size-3.5 shrink-0" />
                    <span className="font-medium text-foreground">{step.realizadoPor}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReportesPage() {
  const { tickets: allTickets } = useTickets()
  const [filtro, setFiltro] = useState<FiltroReporte>("todos")
  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>(null)
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")

  // Filter tickets by date first
  const ticketsPorFecha = useMemo(() => {
    if (!filtroFecha) return allTickets

    let desde: Date | null = null
    let hasta: Date | null = null

    if (filtroFecha === "personalizado") {
      if (fechaDesde) desde = new Date(fechaDesde + "T00:00:00")
      if (fechaHasta) {
        hasta = new Date(fechaHasta + "T00:00:00")
        hasta.setDate(hasta.getDate() + 1) // include the full "hasta" day
      }
      if (!desde && !hasta) return allTickets
    } else {
      const range = getDateRange(filtroFecha)
      if (range) {
        desde = range.desde
        hasta = range.hasta
      }
    }

    return allTickets.filter((t) => {
      const creado = new Date(t.creadoEn)
      if (desde && creado < desde) return false
      if (hasta && creado >= hasta) return false
      return true
    })
  }, [allTickets, filtroFecha, fechaDesde, fechaHasta])

  const analisis = useMemo(() => {
    const ticketsConDatos = ticketsPorFecha.filter((t) => {
      const steps = getTicketProcessSteps(t)
      return steps.some((s) => s.estado === "completado")
    })

    let totalStepsCompleted = 0
    let totalStepsOnTime = 0

    // Per-stage aggregate
    const stageMap: Record<string, { total: number; onTime: number; totalReal: number; totalEst: number }> = {}

    const resultados = ticketsConDatos.map((ticket) => {
      const steps = getTicketProcessSteps(ticket)
      const completedSteps = steps.filter((s) => s.estado === "completado")
      let allOnTime = true

      for (const step of completedSteps) {
        totalStepsCompleted++
        const real = calcRealTime(step)

        if (!stageMap[step.key]) {
          stageMap[step.key] = { total: 0, onTime: 0, totalReal: 0, totalEst: 0 }
        }
        stageMap[step.key].total++

        if (real !== null) {
          stageMap[step.key].totalReal += real
          stageMap[step.key].totalEst += step.tiempoEstimado ?? 0
          if (real <= (step.tiempoEstimado ?? 0)) {
            totalStepsOnTime++
            stageMap[step.key].onTime++
          } else {
            allOnTime = false
          }
        }
      }

      const allDone = steps.every((s) => s.estado === "completado")
      const hasFail = completedSteps.some((s) => {
        const real = calcRealTime(s)
        return real !== null && real > (s.tiempoEstimado ?? 0)
      })

      return { ticket, allOnTime: allDone && allOnTime, hasFail, allDone }
    })

    const completedTickets = resultados.filter((r) => r.allDone)
    const perfectTickets = completedTickets.filter((r) => r.allOnTime)

    // Ordered stage keys
    const stageOrder = ["impresion", "laminado", "impresion_2", "foil", "corte", "acabados"]
    const stageLabels: Record<string, string> = {
      impresion: "Impresion",
      laminado: "Laminado",
      impresion_2: "2da Impresion",
      foil: "Foil",
      corte: "Corte",
      acabados: "Acabados",
    }
    const stageStats = stageOrder
      .filter((key) => stageMap[key] && stageMap[key].total > 0)
      .map((key) => ({
        key,
        label: stageLabels[key] || key,
        ...stageMap[key],
        pctOnTime: stageMap[key].total > 0
          ? Math.round((stageMap[key].onTime / stageMap[key].total) * 100)
          : 0,
        avgReal: stageMap[key].total > 0
          ? stageMap[key].totalReal / stageMap[key].total
          : 0,
        avgEst: stageMap[key].total > 0
          ? stageMap[key].totalEst / stageMap[key].total
          : 0,
      }))

    return {
      resultados,
      totalConDatos: ticketsConDatos.length,
      totalStepsCompleted,
      totalStepsOnTime,
      completedTickets: completedTickets.length,
      perfectTickets: perfectTickets.length,
      stageStats,
    }
  }, [ticketsPorFecha])

  const ticketsFiltrados = useMemo(() => {
    switch (filtro) {
      case "a_tiempo":
        return analisis.resultados.filter((r) => r.allOnTime)
      case "con_fallos":
        return analisis.resultados.filter((r) => r.hasFail)
      default:
        return analisis.resultados
    }
  }, [filtro, analisis.resultados])

  const pctSteps =
    analisis.totalStepsCompleted > 0
      ? Math.round((analisis.totalStepsOnTime / analisis.totalStepsCompleted) * 100)
      : 0

  const pctGlobal =
    analisis.completedTickets > 0
      ? Math.round((analisis.perfectTickets / analisis.completedTickets) * 100)
      : 0

  function handleFiltroFecha(f: FiltroFecha) {
    if (filtroFecha === f) {
      setFiltroFecha(null)
      setFechaDesde("")
      setFechaHasta("")
    } else {
      setFiltroFecha(f)
      if (f !== "personalizado") {
        setFechaDesde("")
        setFechaHasta("")
      }
    }
  }

  function clearDateFilter() {
    setFiltroFecha(null)
    setFechaDesde("")
    setFechaHasta("")
  }

  // Compute active date label
  const fechaLabel = useMemo(() => {
    if (!filtroFecha) return null
    if (filtroFecha === "personalizado") {
      const parts: string[] = []
      if (fechaDesde) parts.push(`Desde ${formatFechaCorta(fechaDesde)}`)
      if (fechaHasta) parts.push(`Hasta ${formatFechaCorta(fechaHasta)}`)
      return parts.length > 0 ? parts.join(" - ") : null
    }
    const labels: Record<string, string> = {
      hoy: "Hoy",
      ayer: "Ayer",
      semana: "Ultimos 7 dias",
      mes: "Ultimos 30 dias",
    }
    return labels[filtroFecha] ?? null
  }, [filtroFecha, fechaDesde, fechaHasta])

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-indigo-50 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="size-9">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Volver al inicio</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-foreground">Reportes</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4">
        {/* Date filter section */}
        <Card className="py-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
            <CalendarDays className="size-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-foreground">Filtrar por fecha</h2>
            {fechaLabel && (
              <Badge className="ml-auto text-xs bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100 gap-1">
                {fechaLabel}
                <button onClick={clearDateFilter} className="ml-0.5 hover:text-indigo-900" aria-label="Limpiar filtro de fecha">
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {/* Quick presets */}
              <div className="flex flex-wrap gap-2">
                {([
                  { key: "hoy" as const, label: "Hoy" },
                  { key: "ayer" as const, label: "Ayer" },
                  { key: "semana" as const, label: "7 dias" },
                  { key: "mes" as const, label: "30 dias" },
                  { key: "personalizado" as const, label: "Personalizado" },
                ]).map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={filtroFecha === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFiltroFecha(key)}
                    className={cn(
                      "text-xs",
                      filtroFecha === key && "bg-indigo-600 hover:bg-indigo-700 text-white"
                    )}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Custom date range inputs */}
              {filtroFecha === "personalizado" && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end rounded-lg border p-3 bg-muted/30">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label htmlFor="fecha-desde" className="text-xs text-muted-foreground">
                      Desde
                    </Label>
                    <Input
                      id="fecha-desde"
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label htmlFor="fecha-hasta" className="text-xs text-muted-foreground">
                      Hasta
                    </Label>
                    <Input
                      id="fecha-hasta"
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  {(fechaDesde || fechaHasta) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => {
                        setFechaDesde("")
                        setFechaHasta("")
                      }}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ResumenCard
            titulo="Total tickets"
            valor={analisis.totalConDatos}
            subtitulo="con datos"
            icon={BarChart3}
            colorClass="bg-indigo-500"
          />
          <ResumenCard
            titulo="Etapas a tiempo"
            valor={`${pctSteps}%`}
            subtitulo={`${analisis.totalStepsOnTime}/${analisis.totalStepsCompleted} pasos`}
            icon={Clock}
            colorClass="bg-blue-500"
          />
          <ResumenCard
            titulo="Exito global"
            valor={`${pctGlobal}%`}
            subtitulo={`${analisis.perfectTickets}/${analisis.completedTickets} perfectos`}
            icon={TrendingUp}
            colorClass={pctGlobal >= 70 ? "bg-green-500" : pctGlobal >= 40 ? "bg-amber-500" : "bg-red-500"}
          />
        </div>

        {/* Per-stage breakdown */}
        {analisis.stageStats.length > 0 && (
          <Card className="py-0 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
              <TrendingUp className="size-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-foreground">Desglose por Etapa</h2>
            </div>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                {analisis.stageStats.map((stage) => {
                  const Icon = stepIconMap[stage.key] || Clock
                  const color = stepColorMap[stage.key] || "text-muted-foreground"
                  const barColor =
                    stage.pctOnTime >= 80
                      ? "bg-green-500"
                      : stage.pctOnTime >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  const badgeColor =
                    stage.pctOnTime >= 80
                      ? "bg-green-100 text-green-700 border-green-200"
                      : stage.pctOnTime >= 50
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-red-100 text-red-700 border-red-200"

                  return (
                    <div key={stage.key} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4", color)} />
                          <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                          <span className="text-xs text-muted-foreground">({stage.total} completados)</span>
                        </div>
                        <Badge className={cn("text-xs", badgeColor, "hover:opacity-90")}>
                          {stage.pctOnTime}% a tiempo
                        </Badge>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 w-full rounded-full bg-muted mb-2">
                        <div
                          className={cn("h-full rounded-full transition-all", barColor)}
                          style={{ width: `${stage.pctOnTime}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="size-3 text-green-600" />
                            {stage.onTime} a tiempo
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="size-3 text-red-600" />
                            {stage.total - stage.onTime} excedidos
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>Prom. est: {formatMinutos(stage.avgEst)}</span>
                          <span className={cn("font-medium", stage.avgReal > stage.avgEst ? "text-red-600" : "text-green-600")}>
                            Prom. real: {formatMinutos(stage.avgReal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status filters */}
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Estado:</span>
          <div className="flex gap-2">
            {([
              { key: "todos", label: "Todos" },
              { key: "a_tiempo", label: "A tiempo" },
              { key: "con_fallos", label: "Con fallos" },
            ] as const).map(({ key, label }) => (
              <Button
                key={key}
                variant={filtro === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltro(key)}
                className={cn(
                  "text-xs",
                  filtro === key && key === "a_tiempo" && "bg-green-600 hover:bg-green-700 text-white",
                  filtro === key && key === "con_fallos" && "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Ticket list */}
        {ticketsFiltrados.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {ticketsFiltrados.length} ticket{ticketsFiltrados.length !== 1 ? "s" : ""}
            </p>
            {ticketsFiltrados.map(({ ticket }) => (
              <TicketReporteCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <BarChart3 className="size-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-lg font-medium">
              {filtroFecha
                ? "No hay tickets en este periodo"
                : filtro === "todos"
                  ? "No hay tickets con datos de reporte"
                  : filtro === "a_tiempo"
                    ? "No hay tickets completados a tiempo"
                    : "No hay tickets con fallos"}
            </p>
            <p className="text-muted-foreground text-sm">
              {filtroFecha
                ? "Intenta cambiar el rango de fechas o quitar el filtro"
                : filtro === "todos"
                  ? "Los reportes apareceran cuando se completen etapas de los tickets"
                  : "Intenta cambiar el filtro para ver mas resultados"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
