"use client"

import {
  type Ticket,
  tipoServicioLabel,
  estadoLabel,
  estadoColor,
  getCurrentStepInfo,
  getTicketProcessSteps,
} from "@/lib/tickets"
import { useElapsedTime, isOverdue } from "@/hooks/use-tickets"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Clock,
  User,
  FileText,
  AlertTriangle,
  Timer,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react"

interface TicketCardProps {
  ticket: Ticket
  actions?: React.ReactNode
  showProcessSteps?: boolean
}

export function TicketCard({
  ticket,
  actions,
  showProcessSteps = false,
}: TicketCardProps) {
  const stepInfo = getCurrentStepInfo(ticket)
  const elapsed = useElapsedTime(stepInfo.startTime)
  const overdue =
    stepInfo.startTime && stepInfo.estimatedMinutes
      ? isOverdue(stepInfo.startTime, stepInfo.estimatedMinutes)
      : false

  // For "listo_para_*" states, show waiting time
  const isWaiting = ticket.estado.startsWith("listo_para_")
  const waitStartMap: Record<string, string | undefined> = {
    listo_para_laminado: ticket.finImpresion,
    listo_para_impresion_2: ticket.finLaminado,
    listo_para_foil: ticket.finImpresion2,
    listo_para_corte: ticket.finFoil || ticket.finLaminado,
    listo_para_acabados:
      ticket.finCorte || ticket.finFoil || ticket.finLaminado || ticket.finImpresion,
  }
  const waitStart = isWaiting ? waitStartMap[ticket.estado] : undefined
  const waitElapsed = useElapsedTime(waitStart)

  const borderColorMap: Record<string, string> = {
    en_impresion: "border-blue-400",
    en_impresion_2: "border-blue-400",
    listo_para_laminado: "border-amber-400",
    listo_para_impresion_2: "border-amber-400",
    listo_para_foil: "border-amber-400",
    listo_para_corte: "border-amber-400",
    listo_para_acabados: "border-amber-400",
    en_laminado: "border-purple-400",
    en_foil: "border-purple-400",
    en_corte: "border-orange-400",
    en_acabados: "border-teal-400",
    terminado: "border-green-400",
  }

  const bgColorMap: Record<string, string> = {
    en_impresion: "bg-blue-50",
    en_impresion_2: "bg-blue-50",
    listo_para_laminado: "bg-amber-50",
    listo_para_impresion_2: "bg-amber-50",
    listo_para_foil: "bg-amber-50",
    listo_para_corte: "bg-amber-50",
    listo_para_acabados: "bg-amber-50",
    en_laminado: "bg-purple-50",
    en_foil: "bg-purple-50",
    en_corte: "bg-orange-50",
    en_acabados: "bg-teal-50",
    terminado: "bg-green-50",
  }

  const processSteps = showProcessSteps ? getTicketProcessSteps(ticket) : []

  return (
    <Card
      className={cn(
        "border-l-4 py-4 gap-3 transition-all",
        borderColorMap[ticket.estado] || "border-muted",
        bgColorMap[ticket.estado] || "bg-background",
        overdue && "ring-2 ring-red-400 animate-pulse"
      )}
    >
      <CardContent className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground font-mono">
              #{ticket.ticketPOS}
            </span>
            <Badge className={cn("text-xs border-none", estadoColor(ticket.estado))}>
              {estadoLabel(ticket.estado)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {ticket.cliente && (
              <span className="text-sm font-medium text-foreground">{ticket.cliente}</span>
            )}
            {overdue && <AlertTriangle className="size-5 text-red-500" />}
          </div>
        </div>

        {/* Service type */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {tipoServicioLabel(ticket.tipoServicio)}
          </span>
          {ticket.conAcabados && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              + Acabados
            </Badge>
          )}
        </div>

        {/* Process steps mini-bar */}
        {showProcessSteps && processSteps.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {processSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                {step.estado === "completado" && (
                  <CheckCircle2 className="size-3.5 text-green-600" />
                )}
                {step.estado === "en_progreso" && (
                  <Loader2 className="size-3.5 text-primary animate-spin" />
                )}
                {step.estado === "pendiente" && (
                  <Circle className="size-3.5 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    step.estado === "completado" && "text-green-700",
                    step.estado === "en_progreso" && "text-primary font-bold",
                    step.estado === "pendiente" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {i < processSteps.length - 1 && (
                  <span className="text-muted-foreground mx-0.5">{">"}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {stepInfo.estimatedMinutes != null && stepInfo.estimatedMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {stepInfo.stepLabel}: {stepInfo.estimatedMinutes}min
            </span>
          )}
          {ticket.realizadoPorImpresion && (
            <span className="flex items-center gap-1">
              <User className="size-3.5" />
              {ticket.realizadoPorImpresion}
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
            {isWaiting ? (
              <span className="font-mono text-base text-amber-700">
                Esperando: {waitElapsed}
              </span>
            ) : (
              <span
                className={cn(
                  "font-mono text-base",
                  overdue ? "text-red-600 font-bold" : "text-foreground"
                )}
              >
                {elapsed}
                {stepInfo.estimatedMinutes != null && stepInfo.estimatedMinutes > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {" "}/ {stepInfo.estimatedMinutes}min
                  </span>
                )}
              </span>
            )}
          </div>
        )}

        {/* Completed info */}
        {ticket.estado === "terminado" && (
          <div className="text-sm text-green-700 font-medium">
            Completado:{" "}
            {new Date(
              ticket.finAcabados ||
                ticket.finCorte ||
                ticket.finFoil ||
                ticket.finLaminado ||
                ticket.finImpresion ||
                ticket.creadoEn
            ).toLocaleTimeString("es-MX", {
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
