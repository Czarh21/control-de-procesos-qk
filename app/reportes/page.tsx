"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useTickets } from "@/hooks/use-tickets"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Ticket } from "@/lib/tickets"
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Layers,
  TrendingUp,
  Filter,
  UserCircle,
} from "lucide-react"

type FiltroReporte = "todos" | "a_tiempo" | "con_fallos"

interface EtapaResultado {
  aTiempo: boolean
  tiempoReal: number
  tiempoEstimado: number
  completada: boolean
}

function calcularEtapaImpresion(ticket: Ticket): EtapaResultado | null {
  // Not applicable for solo_laminado
  if (ticket.tipoServicio === "solo_laminado") return null
  const estimado = ticket.tiempoImpresion ?? 0
  if (!ticket.inicioImpresion || !ticket.finImpresion) {
    return { aTiempo: false, tiempoReal: 0, tiempoEstimado: estimado, completada: false }
  }
  const inicio = new Date(ticket.inicioImpresion).getTime()
  const fin = new Date(ticket.finImpresion).getTime()
  const tiempoReal = (fin - inicio) / 60000
  return {
    aTiempo: tiempoReal <= estimado,
    tiempoReal: Math.round(tiempoReal * 10) / 10,
    tiempoEstimado: estimado,
    completada: true,
  }
}

function calcularEtapaLaminado(ticket: Ticket): EtapaResultado | null {
  // Not applicable for solo_impresion
  if (ticket.tipoServicio === "solo_impresion") return null
  const estimado = ticket.tiempoLaminado ?? 0
  if (!ticket.inicioLaminado || !ticket.finLaminado) {
    return { aTiempo: false, tiempoReal: 0, tiempoEstimado: estimado, completada: false }
  }
  const inicio = new Date(ticket.inicioLaminado).getTime()
  const fin = new Date(ticket.finLaminado).getTime()
  const tiempoReal = (fin - inicio) / 60000
  return {
    aTiempo: tiempoReal <= estimado,
    tiempoReal: Math.round(tiempoReal * 10) / 10,
    tiempoEstimado: estimado,
    completada: true,
  }
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

function EtapaBadge({ resultado }: { resultado: EtapaResultado | null }) {
  if (!resultado) {
    return (
      <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
        N/A
      </Badge>
    )
  }
  if (!resultado.completada) {
    return (
      <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
        En progreso
      </Badge>
    )
  }
  if (resultado.aTiempo) {
    return (
      <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
        <CheckCircle2 className="size-3 mr-1" />
        A tiempo
      </Badge>
    )
  }
  return (
    <Badge className="text-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
      <XCircle className="size-3 mr-1" />
      Excedido
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
            {subtitulo && (
              <p className="text-xs text-muted-foreground">{subtitulo}</p>
            )}
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
  const impresion = calcularEtapaImpresion(ticket)
  const laminado = calcularEtapaLaminado(ticket)

  return (
    <Card className="py-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <span className="font-bold font-mono text-foreground">#{ticket.ticketPOS}</span>
          {ticket.cliente && (
            <span className="text-sm text-muted-foreground">- {ticket.cliente}</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{formatFecha(ticket.creadoEn)}</span>
      </div>

      <CardContent className="p-4">
        <div className={cn("grid grid-cols-1 gap-4", impresion && laminado ? "sm:grid-cols-2" : "")}>
          {/* Impresion */}
          {impresion && (
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Printer className="size-4 text-amber-600" />
                  <span className="text-sm font-semibold text-foreground">Impresion</span>
                </div>
                <EtapaBadge resultado={impresion} />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>Estimado: {formatMinutos(impresion.tiempoEstimado)}</span>
                </div>
                {impresion.completada && (
                  <div className={cn(
                    "flex items-center gap-1 font-medium",
                    impresion.aTiempo ? "text-emerald-600" : "text-red-600"
                  )}>
                    <Clock className="size-3.5" />
                    <span>Real: {formatMinutos(impresion.tiempoReal)}</span>
                  </div>
                )}
              </div>
              {ticket.realizadoPorImpresion && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground border-t pt-2 mt-1">
                  <UserCircle className="size-3.5 shrink-0" />
                  <span className="font-medium text-foreground">{ticket.realizadoPorImpresion}</span>
                </div>
              )}
            </div>
          )}

          {/* Laminado */}
          {laminado && (
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="size-4 text-violet-600" />
                  <span className="text-sm font-semibold text-foreground">Laminado</span>
                </div>
                <EtapaBadge resultado={laminado} />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>Estimado: {formatMinutos(laminado.tiempoEstimado)}</span>
                </div>
                {laminado.completada && (
                  <div className={cn(
                    "flex items-center gap-1 font-medium",
                    laminado.aTiempo ? "text-emerald-600" : "text-red-600"
                  )}>
                    <Clock className="size-3.5" />
                    <span>Real: {formatMinutos(laminado.tiempoReal)}</span>
                  </div>
                )}
              </div>
              {ticket.realizadoPorLaminado && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground border-t pt-2 mt-1">
                  <UserCircle className="size-3.5 shrink-0" />
                  <span className="font-medium text-foreground">{ticket.realizadoPorLaminado}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReportesPage() {
  const { tickets: allTickets } = useTickets()
  const [filtro, setFiltro] = useState<FiltroReporte>("todos")

  const analisis = useMemo(() => {
    // Only analyze tickets that have completed at least one stage
    const ticketsConDatos = allTickets.filter(
      (t) => t.finImpresion || t.finLaminado
    )

    const resultados = ticketsConDatos.map((ticket) => {
      const impresion = calcularEtapaImpresion(ticket)
      const laminado = calcularEtapaLaminado(ticket)
      const impresionOk = impresion ? impresion.completada && impresion.aTiempo : true
      const laminadoOk = laminado ? laminado.completada && laminado.aTiempo : true
      // "all stages complete" means all applicable stages are done
      const allApplicableComplete =
        (impresion === null || impresion.completada) &&
        (laminado === null || laminado.completada)
      const todoATiempo = allApplicableComplete && impresionOk && laminadoOk
      const tieneFallo =
        (impresion?.completada && !impresion.aTiempo) ||
        (laminado?.completada && !laminado.aTiempo)

      return { ticket, impresion, laminado, impresionOk, laminadoOk, ambosCompletos: allApplicableComplete, todoATiempo, tieneFallo }
    })

    const totalConDatos = resultados.length
    const impresionesCompletadas = resultados.filter((r) => r.impresion?.completada)
    const laminadosCompletados = resultados.filter((r) => r.laminado?.completada)
    const impresionesATiempo = impresionesCompletadas.filter((r) => r.impresionOk).length
    const laminadosATiempo = laminadosCompletados.filter((r) => r.laminadoOk).length
    const ambosCompletos = resultados.filter((r) => r.ambosCompletos)
    const todoATiempoCount = ambosCompletos.filter((r) => r.todoATiempo).length

    return {
      resultados,
      totalConDatos,
      impresionesCompletadas: impresionesCompletadas.length,
      laminadosCompletados: laminadosCompletados.length,
      impresionesATiempo,
      laminadosATiempo,
      ambosCompletosCount: ambosCompletos.length,
      todoATiempoCount,
    }
  }, [allTickets])

  const ticketsFiltrados = useMemo(() => {
    switch (filtro) {
      case "a_tiempo":
        return analisis.resultados.filter((r) => r.todoATiempo)
      case "con_fallos":
        return analisis.resultados.filter((r) => r.tieneFallo)
      default:
        return analisis.resultados
    }
  }, [filtro, analisis.resultados])

  const pctImpresion = analisis.impresionesCompletadas > 0
    ? Math.round((analisis.impresionesATiempo / analisis.impresionesCompletadas) * 100)
    : 0

  const pctLaminado = analisis.laminadosCompletados > 0
    ? Math.round((analisis.laminadosATiempo / analisis.laminadosCompletados) * 100)
    : 0

  const pctGlobal = analisis.ambosCompletosCount > 0
    ? Math.round((analisis.todoATiempoCount / analisis.ambosCompletosCount) * 100)
    : 0

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-blue-50 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="size-9">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Volver al inicio</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-blue-600" />
            <h1 className="text-xl font-bold text-foreground">Reportes</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ResumenCard
            titulo="Total tickets"
            valor={analisis.totalConDatos}
            subtitulo="con datos"
            icon={BarChart3}
            colorClass="bg-blue-500"
          />
          <ResumenCard
            titulo="Impresion"
            valor={`${pctImpresion}%`}
            subtitulo={`${analisis.impresionesATiempo}/${analisis.impresionesCompletadas} a tiempo`}
            icon={Printer}
            colorClass="bg-amber-500"
          />
          <ResumenCard
            titulo="Laminado"
            valor={`${pctLaminado}%`}
            subtitulo={`${analisis.laminadosATiempo}/${analisis.laminadosCompletados} a tiempo`}
            icon={Layers}
            colorClass="bg-violet-500"
          />
          <ResumenCard
            titulo="Exito global"
            valor={`${pctGlobal}%`}
            subtitulo={`${analisis.todoATiempoCount}/${analisis.ambosCompletosCount} perfectos`}
            icon={TrendingUp}
            colorClass={pctGlobal >= 70 ? "bg-emerald-500" : pctGlobal >= 40 ? "bg-amber-500" : "bg-red-500"}
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
                  filtro === key && key === "a_tiempo" && "bg-emerald-600 hover:bg-emerald-700 text-white",
                  filtro === key && key === "con_fallos" && "bg-red-600 hover:bg-red-700 text-white",
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
