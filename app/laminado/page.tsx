"use client"

import { useState } from "react"
import Link from "next/link"
import { useTickets, revalidateAllTickets } from "@/hooks/use-tickets"
import {
  iniciarPaso,
  terminarPaso,
  updateTicket,
} from "@/lib/tickets"
import { TicketCard } from "@/components/ticket-card"
import { EditTicketDialog } from "@/components/ticket-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Pencil,
  ChevronDown,
  Send,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Ticket, TicketEstado } from "@/lib/tickets"

// Laminado normal
const FILTER_LISTO_LAM: TicketEstado[] = ["listo_para_laminado"]
const FILTER_EN_LAM: TicketEstado[] = ["en_laminado"]

// Foil
const FILTER_LISTO_FOIL: TicketEstado[] = ["listo_para_foil"]
const FILTER_EN_FOIL: TicketEstado[] = ["en_foil"]

export default function LaminadoPage() {
  const { tickets: listoLam } = useTickets(FILTER_LISTO_LAM)
  const { tickets: enLam } = useTickets(FILTER_EN_LAM)
  const { tickets: listoFoil } = useTickets(FILTER_LISTO_FOIL)
  const { tickets: enFoil } = useTickets(FILTER_EN_FOIL)
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [operadorInputs, setOperadorInputs] = useState<Record<string, string>>({})
  const [historialOpen, setHistorialOpen] = useState(false)

  const totalLam = listoLam.length + enLam.length
  const totalFoil = listoFoil.length + enFoil.length
  const totalCount = totalLam + totalFoil

  async function handleIniciar(ticket: Ticket) {
    const operador = operadorInputs[ticket.id]?.trim() || ""
    await iniciarPaso(ticket, operador || undefined)
    revalidateAllTickets()
    const label = ticket.estado === "listo_para_foil" ? "Foil" : "Laminado"
    toast.success(`Ticket #${ticket.ticketPOS} - ${label} iniciado`)
    setOperadorInputs((prev) => {
      const next = { ...prev }
      delete next[ticket.id]
      return next
    })
  }

  async function handleTerminar(ticket: Ticket) {
    await terminarPaso(ticket)
    revalidateAllTickets()
    const isFoil = ticket.estado === "en_foil"
    toast.success(`Ticket #${ticket.ticketPOS} - ${isFoil ? "Foil" : "Laminado"} terminado`)
  }

  async function handleEditSave(realizadoPor: string, notas: string) {
    if (!editTicket) return
    const updates: Partial<Omit<Ticket, "id">> = { notas: notas || undefined }
    if (editTicket.estado === "en_foil" || editTicket.estado === "listo_para_foil") {
      updates.realizadoPorFoil = realizadoPor || undefined
    } else {
      updates.realizadoPorLaminado = realizadoPor || undefined
    }
    await updateTicket(editTicket.id, updates)
    revalidateAllTickets()
    toast.success(`Ticket #${editTicket.ticketPOS} actualizado`)
    setEditTicket(null)
  }

  function renderSection(
    title: string,
    titleColor: string,
    tickets: Ticket[],
    type: "listo" | "en_proceso"
  ) {
    if (tickets.length === 0) return null

    return (
      <section className="flex flex-col gap-3">
        <h2 className={cn("text-sm font-semibold uppercase tracking-wide", titleColor)}>
          {title} ({tickets.length})
        </h2>
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            showProcessSteps
            actions={
              type === "listo" ? (
                <div className="flex w-full flex-col gap-2">
                  <Input
                    placeholder="Operador (opcional)"
                    value={operadorInputs[ticket.id] || ""}
                    onChange={(e) =>
                      setOperadorInputs((prev) => ({
                        ...prev,
                        [ticket.id]: e.target.value,
                      }))
                    }
                    className="h-11 text-base"
                  />
                  <Button
                    onClick={() => handleIniciar(ticket)}
                    className={cn(
                      "h-12 w-full gap-2 text-white text-base",
                      ticket.estado === "listo_para_foil"
                        ? "bg-pink-600 hover:bg-pink-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    )}
                  >
                    <Play className="size-5" />
                    {ticket.estado === "listo_para_foil"
                      ? "Iniciar Foil"
                      : "Iniciar Laminado"}
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => handleTerminar(ticket)}
                    className={cn(
                      "h-12 flex-1 gap-2 text-white text-base",
                      ticket.estado === "en_foil"
                        ? "bg-pink-600 hover:bg-pink-700"
                        : "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {ticket.estado === "en_foil" ? (
                      <>
                        <Sparkles className="size-5" />
                        Terminar Foil
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-5" />
                        Terminar Laminado
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-12"
                    onClick={() => setEditTicket(ticket)}
                  >
                    <Pencil className="size-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                </>
              )
            }
          />
        ))}
      </section>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-purple-50 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="size-9">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Volver al inicio</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Laminado</h1>
              {totalCount > 0 && (
                <Badge className="bg-purple-500 text-white border-none text-sm">
                  {totalCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {totalLam > 0 && (
              <Badge variant="outline" className="border-purple-400 text-purple-700">
                {totalLam} laminado
              </Badge>
            )}
            {totalFoil > 0 && (
              <Badge variant="outline" className="border-pink-400 text-pink-700">
                {totalFoil} foil
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
        {/* Laminado sections */}
        {renderSection("Pendientes Laminado", "text-amber-700", listoLam, "listo")}
        {renderSection("En Laminado", "text-purple-700", enLam, "en_proceso")}

        {/* Foil sections */}
        {renderSection("Pendientes Foil", "text-amber-700", listoFoil, "listo")}
        {renderSection("En Foil", "text-pink-700", enFoil, "en_proceso")}

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No hay tickets pendientes</p>
            <p className="text-muted-foreground text-sm">
              Los tickets enviados desde impresion apareceran aqui
            </p>
          </div>
        )}

        {/* History */}
        <Collapsible open={historialOpen} onOpenChange={setHistorialOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
              <span>Historial</span>
              <ChevronDown className={cn("size-4 transition-transform", historialOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 text-sm text-muted-foreground text-center">
            Consulta el historial completo en la seccion de Consulta.
          </CollapsibleContent>
        </Collapsible>
      </main>

      {/* Edit dialog */}
      {editTicket && (
        <EditTicketDialog
          open={!!editTicket}
          onOpenChange={(open) => { if (!open) setEditTicket(null) }}
          initialRealizadoPor={
            editTicket.estado === "en_foil" || editTicket.estado === "listo_para_foil"
              ? editTicket.realizadoPorFoil || ""
              : editTicket.realizadoPorLaminado || ""
          }
          initialNotas={editTicket.notas || ""}
          title={`Editar Ticket #${editTicket.ticketPOS}`}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
