"use client"

import { useState } from "react"
import Link from "next/link"
import { useTickets } from "@/hooks/use-tickets"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Ticket, TicketEstado } from "@/lib/tickets"
import {
  ArrowLeft,
  Search,
  Printer,
  Layers,
  CheckCircle2,
  Clock,
  Package,
  Timer,
} from "lucide-react"

import type { TipoServicio } from "@/lib/tickets"

const pasosAmbos: {
  estado: TicketEstado
  label: string
  icon: React.ElementType
}[] = [
  { estado: "en_impresion", label: "Imprimiendo", icon: Printer },
  { estado: "en_laminado", label: "Laminando", icon: Layers },
  { estado: "terminado", label: "Listo", icon: CheckCircle2 },
]

const pasosSoloImpresion = [
  { estado: "en_impresion" as TicketEstado, label: "Imprimiendo", icon: Printer },
  { estado: "terminado" as TicketEstado, label: "Listo", icon: CheckCircle2 },
]

const pasosSoloLaminado = [
  { estado: "en_laminado" as TicketEstado, label: "Laminando", icon: Layers },
  { estado: "terminado" as TicketEstado, label: "Listo", icon: CheckCircle2 },
]

function getPasos(tipo: TipoServicio) {
  if (tipo === "solo_impresion") return pasosSoloImpresion
  if (tipo === "solo_laminado") return pasosSoloLaminado
  return pasosAmbos
}

function estadoIndex(estado: TicketEstado, tipo: TipoServicio) {
  const pasos = getPasos(tipo)
  if (estado === "listo_para_laminado") return 0
  return pasos.findIndex((p) => p.estado === estado)
}

function estimatedRemainingMinutes(ticket: Ticket): number {
  const now = Date.now()
  const tiempoImp = ticket.tiempoImpresion ?? 0
  const tiempoLam = ticket.tiempoLaminado ?? 0
  switch (ticket.estado) {
    case "en_impresion": {
      const start = new Date(ticket.inicioImpresion || ticket.creadoEn).getTime()
      const elapsedMin = (now - start) / 60000
      const remainingImpresion = Math.max(0, tiempoImp - elapsedMin)
      // solo_impresion won't have laminado time
      return Math.ceil(remainingImpresion + tiempoLam)
    }
    case "listo_para_laminado":
      return Math.ceil(tiempoLam)
    case "en_laminado": {
      if (!ticket.inicioLaminado) return Math.ceil(tiempoLam)
      const startLam = new Date(ticket.inicioLaminado).getTime()
      const elapsedLam = (now - startLam) / 60000
      return Math.ceil(Math.max(0, tiempoLam - elapsedLam))
    }
    case "terminado":
      return 0
    default:
      return 0
  }
}

function formatEstimatedTime(minutes: number): string {
  if (minutes <= 0) return "Listo"
  if (minutes < 60) return `~${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `~${h}h ${m}min` : `~${h}h`
}

function estadoLabel(estado: TicketEstado): string {
  switch (estado) {
    case "en_impresion":
      return "Imprimiendo"
    case "listo_para_laminado":
      return "Listo para laminar"
    case "en_laminado":
      return "Laminando"
    case "terminado":
      return "Listo para recoger"
    default:
      return estado
  }
}

function ConsultaTicketCard({ ticket }: { ticket: Ticket }) {
  const tipo = ticket.tipoServicio ?? "ambos"
  const pasos = getPasos(tipo)
  const currentIdx = estadoIndex(ticket.estado, tipo)
  const isTerminado = ticket.estado === "terminado"
  const remaining = estimatedRemainingMinutes(ticket)

  return (
    <Card
      className={cn(
        "border-2 py-0 overflow-hidden",
        isTerminado ? "border-emerald-400" : "border-border"
      )}
    >
      {/* Status banner */}
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between",
          isTerminado
            ? "bg-emerald-500 text-white"
            : "bg-muted text-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          <Package className="size-5" />
          <span className="font-bold text-lg font-mono">
            #{ticket.ticketPOS}
          </span>
        </div>
        <Badge
          className={cn(
            "text-sm border-none",
            isTerminado
              ? "bg-white/20 text-white"
              : "bg-background text-foreground"
          )}
        >
          {estadoLabel(ticket.estado)}
        </Badge>
      </div>

      <CardContent className="flex flex-col gap-4 p-4">
        {/* Client name */}
        {ticket.cliente && (
          <p className="text-base text-muted-foreground">
            Cliente:{" "}
            <span className="font-semibold text-foreground">
              {ticket.cliente}
            </span>
          </p>
        )}

        {/* Estimated time remaining */}
        {!isTerminado && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <Timer className="size-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Tiempo estimado de entrega
              </p>
              <p className="text-lg font-bold text-amber-700">
                {formatEstimatedTime(remaining)}
              </p>
            </div>
          </div>
        )}

        {/* Progress steps */}
        <div className="flex items-center gap-0">
          {pasos.map((paso, idx) => {
            const Icon = paso.icon
            const completed = idx <= currentIdx
            const isCurrent = idx === currentIdx
            return (
              <div
                key={paso.estado}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        idx <= currentIdx ? "bg-emerald-400" : "bg-border"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full transition-all",
                      completed &&
                        !isCurrent &&
                        "bg-emerald-100 text-emerald-600",
                      isCurrent &&
                        !isTerminado &&
                        "bg-amber-100 text-amber-600 ring-2 ring-amber-400",
                      isCurrent &&
                        isTerminado &&
                        "bg-emerald-500 text-white ring-2 ring-emerald-400",
                      !completed && "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  {idx < pasos.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        idx < currentIdx ? "bg-emerald-400" : "bg-border"
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs text-center leading-tight",
                    isCurrent
                      ? "font-bold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {paso.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Total time info */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          {ticket.tiempoImpresion != null && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              Impresion: {ticket.tiempoImpresion} min
            </span>
          )}
          {ticket.tiempoLaminado != null && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              Laminado: {ticket.tiempoLaminado} min
            </span>
          )}
        </div>

        {/* Big message for finished */}
        {isTerminado && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-center">
            <p className="text-lg font-bold text-emerald-700">
              Tu trabajo esta listo
            </p>
            <p className="text-sm text-emerald-600">
              Puedes pasar a recogerlo
            </p>
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

  // Show all tickets, filtered by search if query exists
  const resultados = query
    ? allTickets.filter(
        (t) =>
          t.ticketPOS.toLowerCase().includes(query) ||
          (t.cliente && t.cliente.toLowerCase().includes(query))
      )
    : allTickets

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-emerald-50 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">
            Consultar Pedido
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
        {/* Search bar */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="busqueda"
            className="text-sm font-medium text-muted-foreground"
          >
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

        {/* Results */}
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
              {query
                ? "No se encontraron resultados"
                : "No hay pedidos registrados"}
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
