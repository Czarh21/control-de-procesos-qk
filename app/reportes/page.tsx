"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useTickets } from "@/hooks/use-tickets"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

type FiltroReporte = "todos" | "a_tiempo" | "con_fallos"

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

  const analisis = useMemo(() => {
    const ticketsConDatos = allTickets.filter((t) => {
      const steps = getTicketProcessSteps(t)
      return steps.some((s) => s.estado === "completado")
    })

    let totalStepsCompleted = 0
    let totalStepsOnTime = 0

    const resultados = ticketsConDatos.map((ticket) => {
      const steps = getTicketProcessSteps(ticket)
      const completedSteps = steps.filter((s) => s.estado === "completado")
      let allOnTime = true

      for (const step of completedSteps) {
        totalStepsCompleted++
        const real = calcRealTime(step)
        if (real !== null && real <= (step.tiempoEstimado ?? 0)) {
          totalStepsOnTime++
        } else if (real !== null) {
          allOnTime = false
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

    return {
      resultados,
      totalConDatos: ticketsConDatos.length,
      totalStepsCompleted,
      totalStepsOnTime,
      completedTickets: completedTickets.length,
      perfectTickets: perfectTickets.length,
    }
  }, [allTickets])

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

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtrar:</span>
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
              {filtro === "todos"
                ? "No hay tickets con datos de reporte"
                : filtro === "a_tiempo"
                  ? "No hay tickets completados a tiempo"
                  : "No hay tickets con fallos"}
            </p>
            <p className="text-muted-foreground text-sm">
              {filtro === "todos"
                ? "Los reportes apareceran cuando se completen etapas de los tickets"
                : "Intenta cambiar el filtro para ver mas resultados"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
