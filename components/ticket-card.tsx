"use client"

import { type Ticket, type TicketEstado } from "@/lib/tickets"
import { useElapsedTime, isOverdue } from "@/hooks/use-tickets"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Clock,
  User,
  UserCircle,
  FileText,
  AlertTriangle,
  Timer,
} from "lucide-react"

const estadoConfig: Record<
  TicketEstado,
  {
    label: string
    borderColor: string
    bgColor: string
    badgeBg: string
    badgeText: string
    timerField: "inicioImpresion" | "inicioLaminado" | undefined
    estimateField: "tiempoImpresion" | "tiempoLaminado" | undefined
  }
> = {
  en_impresion: {
    label: "En Impresion",
    borderColor: "border-amber-400",
    bgColor: "bg-amber-50",
    badgeBg: "bg-amber-500",
    badgeText: "text-white",
    timerField: "inicioImpresion",
    estimateField: "tiempoImpresion",
  },
  listo_para_laminado: {
    label: "Listo para Laminado",
    borderColor: "border-sky-400",
    bgColor: "bg-sky-50",
    badgeBg: "bg-sky-500",
    badgeText: "text-white",
    timerField: "finImpresion",
    estimateField: undefined,
  },
  en_laminado: {
    label: "En Laminado",
    borderColor: "border-violet-400",
    bgColor: "bg-violet-50",
    badgeBg: "bg-violet-500",
    badgeText: "text-white",
    timerField: "inicioLaminado",
    estimateField: "tiempoLaminado",
  },
  terminado: {
    label: "Terminado",
    borderColor: "border-emerald-400",
    bgColor: "bg-emerald-50",
    badgeBg: "bg-emerald-500",
    badgeText: "text-white",
    timerField: undefined,
    estimateField: undefined,
  },
}

interface TicketCardProps {
  ticket: Ticket
  actions?: React.ReactNode
}

export function TicketCard({ ticket, actions }: TicketCardProps) {
  const config = estadoConfig[ticket.estado]
  const timerStart = config.timerField ? ticket[config.timerField] : undefined
  const elapsed = useElapsedTime(timerStart)
  const estimateField = config.estimateField
  const estimateMinutes = estimateField ? ticket[estimateField] : 0
  const overdue =
    config.timerField && config.estimateField
      ? isOverdue(ticket[config.timerField], ticket[config.estimateField])
      : false

  // For "listo_para_laminado", show waiting time
  const waitingElapsed = useElapsedTime(
    ticket.estado === "listo_para_laminado" ? ticket.finImpresion : undefined
  )

  return (
    <Card
      className={cn(
        "border-l-4 py-4 gap-3 transition-all",
        config.borderColor,
        config.bgColor,
        overdue && "ring-2 ring-red-400 animate-pulse"
      )}
    >
      <CardContent className="flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground font-mono">
              #{ticket.ticketPOS}
            </span>
            <Badge
              className={cn(
                "text-xs border-none",
                config.badgeBg,
                config.badgeText
              )}
            >
              {config.label}
            </Badge>
          </div>
          {ticket.cliente && (
            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
              <UserCircle className="size-4 text-muted-foreground" />
              {ticket.cliente}
            </span>
          )}
          {overdue && (
            <AlertTriangle className="size-5 text-red-500" />
          )}
        </div>

        {/* Info row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            Imp: {ticket.tiempoImpresion}min
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            Lam: {ticket.tiempoLaminado}min
          </span>
          {ticket.realizadoPorImpresion && (
            <span className="flex items-center gap-1">
              <User className="size-3.5" />
              {ticket.realizadoPorImpresion}
            </span>
          )}
          {ticket.realizadoPorLaminado && (
            <span className="flex items-center gap-1">
              <User className="size-3.5" />
              Lam: {ticket.realizadoPorLaminado}
            </span>
          )}
          {ticket.notas && (
            <span className="flex items-center gap-1">
              <FileText className="size-3.5" />
              {ticket.notas}
            </span>
          )}
        </div>

        {/* Timer */}
        {ticket.estado !== "terminado" && (
          <div className="flex items-center gap-2">
            <Timer
              className={cn(
                "size-4",
                overdue ? "text-red-500" : "text-muted-foreground"
              )}
            />
            {ticket.estado === "listo_para_laminado" ? (
              <span className="font-mono text-base text-sky-700">
                Esperando: {waitingElapsed}
              </span>
            ) : (
              <span
                className={cn(
                  "font-mono text-base",
                  overdue ? "text-red-600 font-bold" : "text-foreground"
                )}
              >
                {elapsed}
                {estimateMinutes > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {" "}
                    / {estimateMinutes}min
                  </span>
                )}
              </span>
            )}
          </div>
        )}

        {/* Completed info for finished tickets */}
        {ticket.estado === "terminado" && ticket.finLaminado && (
          <div className="text-sm text-emerald-700 font-medium">
            Completado:{" "}
            {new Date(ticket.finLaminado).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}

        {/* Actions */}
        {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
      </CardContent>
    </Card>
  )
}
