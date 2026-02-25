"use client"

import { useState } from "react"
import { useTickets } from "@/hooks/use-tickets"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type Ticket,
  type TicketEstado,
  estadoLabel,
  getTicketProcessSteps,
  tipoServicioLabel,
} from "@/lib/tickets"
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Timer,
  Circle,
  Loader2,
} from "lucide-react"

function estimatedRemainingMinutes(ticket: Ticket): number {
  const now = Date.now()
  const steps = getTicketProcessSteps(ticket)
  let remaining = 0

  for (const step of steps) {
    if (step.estado === "completado") continue
    if (step.estado === "en_progreso" && step.inicio) {
      const elapsed = (now - new Date(step.inicio).getTime()) / 60000
      remaining += Math.max(0, (step.tiempoEstimado ?? 0) - elapsed)
    } else if (step.estado === "pendiente") {
      remaining += step.tiempoEstimado ?? 0
    }
  }

  return Math.ceil(remaining)
}

function formatEstimatedTime(minutes: number): string {
  if (minutes <= 0) return "Listo"
  if (minutes < 60) return `~${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `~${h}h ${m}min` : `~${h}h`
}

function ConsultaTicketCard({ ticket }: { ticket: Ticket }) {
  const isTerminado = ticket.estado === "terminado"
  const remaining = estimatedRemainingMinutes(ticket)
  const processSteps = getTicketProcessSteps(ticket)

  return (
    <Card
      className={cn(
        "border-2 py-0 overflow-hidden",
        isTerminado ? "border-green-400" : "border-border"
      )}
    >
      {/* Status banner */}
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between",
          isTerminado ? "bg-green-500 text-white" : "bg-muted text-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          <Package className="size-5" />
          <span className="font-bold text-lg font-mono">#{ticket.ticketPOS}</span>
        </div>
        <Badge
          className={cn(
            "text-sm border-none",
            isTerminado ? "bg-white/20 text-white" : "bg-background text-foreground"
          )}
        >
          {estadoLabel(ticket.estado)}
        </Badge>
      </div>

      <CardContent className="flex flex-col gap-4 p-4">
        {/* Client name */}
        {ticket.cliente && (
          <p className="text-base text-muted-foreground">
            Cliente: <span className="font-semibold text-foreground">{ticket.cliente}</span>
          </p>
        )}

        {/* Service type */}
        <p className="text-sm text-muted-foreground">
          Proceso: <span className="font-medium text-foreground">{tipoServicioLabel(ticket.tipoServicio)}</span>
          {ticket.conAcabados && <span className="text-teal-600 font-medium"> + Acabados</span>}
        </p>

        {/* Estimated time remaining */}
        {!isTerminado && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <Timer className="size-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Tiempo estimado de entrega</p>
              <p className="text-lg font-bold text-amber-700">{formatEstimatedTime(remaining)}</p>
            </div>
          </div>
        )}

        {/* Progress steps */}
        <div className="flex items-center gap-0">
          {processSteps.map((step, idx) => {
            const completed = step.estado === "completado"
            const current = step.estado === "en_progreso"
            return (
              <div key={idx} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div className={cn("h-0.5 flex-1", completed || current ? "bg-green-400" : "bg-border")} />
                  )}
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full transition-all",
                      completed && "bg-green-100 text-green-600",
                      current && !isTerminado && "bg-amber-100 text-amber-600 ring-2 ring-amber-400",
                      current && isTerminado && "bg-green-500 text-white ring-2 ring-green-400",
                      step.estado === "pendiente" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="size-4" />
                    ) : current ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                  </div>
                  {idx < processSteps.length - 1 && (
                    <div className={cn("h-0.5 flex-1", completed ? "bg-green-400" : "bg-border")} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] text-center leading-tight",
                    current ? "font-bold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
          {/* Terminado step */}
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <div className={cn("h-0.5 flex-1", isTerminado ? "bg-green-400" : "bg-border")} />
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  isTerminado ? "bg-green-500 text-white ring-2 ring-green-400" : "bg-muted text-muted-foreground"
                )}
              >
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <span className={cn("text-[10px] text-center leading-tight", isTerminado ? "font-bold text-foreground" : "text-muted-foreground")}>
              Listo
            </span>
          </div>
        </div>

        {/* Time info */}
        <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
          {processSteps.map(
            (step) =>
              step.tiempoEstimado != null &&
              step.tiempoEstimado > 0 && (
                <span key={step.key} className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {step.label}: {step.tiempoEstimado} min
                </span>
              )
          )}
        </div>

        {/* Big message for finished */}
        {isTerminado && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-center">
            <p className="text-lg font-bold text-green-700">Tu trabajo esta listo</p>
            <p className="text-sm text-green-600">Puedes pasar a recogerlo</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ConsultaPage() {
  const { tickets: allTickets } = useTickets()
  const [busqueda, setBusqueda] = useState("")

  const query = busqueda.trim().toLowerCase()

  const resultados = query
    ? allTickets.filter(
        (t) =>
          t.ticketPOS.toLowerCase().includes(query) ||
          (t.cliente && t.cliente.toLowerCase().includes(query))
      )
    : allTickets

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-green-50 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">Consultar Pedido</h1>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="busqueda" className="text-sm font-medium text-muted-foreground">
            Busca por numero de ticket o nombre del cliente
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              id="busqueda"
              placeholder="Ej: 1234 o Juan Perez"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-14 pl-11 text-lg"
              autoFocus
            />
          </div>
        </div>

        {resultados.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {resultados.length} pedido{resultados.length !== 1 ? "s" : ""}
              {query ? " encontrado" : ""}
              {resultados.length !== 1 && query ? "s" : ""}
            </p>
            {resultados.map((ticket) => (
              <ConsultaTicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <Search className="size-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-lg font-medium">
              {query ? "No se encontraron resultados" : "No hay pedidos registrados"}
            </p>
            <p className="text-muted-foreground text-sm">
              {query
                ? "Verifica el numero de ticket o nombre del cliente"
                : "Los pedidos apareceran aqui cuando se registren"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
