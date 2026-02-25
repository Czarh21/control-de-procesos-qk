"use client"

import { useState } from "react"
import Link from "next/link"
import { useTickets, revalidateAllTickets } from "@/hooks/use-tickets"
import { iniciarPaso, terminarPaso, updateTicket } from "@/lib/tickets"
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
  Scissors,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Ticket, TicketEstado } from "@/lib/tickets"

const FILTER_LISTO: TicketEstado[] = ["listo_para_corte"]
const FILTER_EN_CORTE: TicketEstado[] = ["en_corte"]

export default function CortePage() {
  const { tickets: listoCorte } = useTickets(FILTER_LISTO)
  const { tickets: enCorte } = useTickets(FILTER_EN_CORTE)
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [operadorInputs, setOperadorInputs] = useState<Record<string, string>>({})
  const [historialOpen, setHistorialOpen] = useState(false)

  const totalCount = listoCorte.length + enCorte.length

  async function handleIniciar(ticket: Ticket) {
    const operador = operadorInputs[ticket.id]?.trim() || ""
    await iniciarPaso(ticket, operador || undefined)
    revalidateAllTickets()
    toast.success(`Ticket #${ticket.ticketPOS} - Corte iniciado`)
    setOperadorInputs((prev) => {
      const next = { ...prev }
      delete next[ticket.id]
      return next
    })
  }

  async function handleTerminar(ticket: Ticket) {
    await terminarPaso(ticket)
    revalidateAllTickets()
    if (ticket.conAcabados) {
      toast.success(`Ticket #${ticket.ticketPOS} enviado a acabados`)
    } else {
      toast.success(`Ticket #${ticket.ticketPOS} terminado`)
    }
  }

  async function handleEditSave(realizadoPor: string, notas: string) {
    if (!editTicket) return
    await updateTicket(editTicket.id, {
      realizadoPorCorte: realizadoPor || undefined,
      notas: notas || undefined,
    })
    revalidateAllTickets()
    toast.success(`Ticket #${editTicket.ticketPOS} actualizado`)
    setEditTicket(null)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-orange-50 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="size-9">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Volver al inicio</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Corte</h1>
              {totalCount > 0 && (
                <Badge className="bg-orange-500 text-white border-none text-sm">
                  {totalCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {listoCorte.length > 0 && (
              <Badge variant="outline" className="border-amber-400 text-amber-700">
                {listoCorte.length} por recibir
              </Badge>
            )}
            {enCorte.length > 0 && (
              <Badge variant="outline" className="border-orange-400 text-orange-700">
                {enCorte.length} en proceso
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
        {/* Pending */}
        {listoCorte.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Pendientes por recibir ({listoCorte.length})
            </h2>
            {listoCorte.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showProcessSteps
                actions={
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
                      className="h-12 w-full gap-2 bg-orange-600 text-white hover:bg-orange-700 text-base"
                    >
                      <Play className="size-5" />
                      Iniciar Corte
                    </Button>
                  </div>
                }
              />
            ))}
          </section>
        )}

        {/* In progress */}
        {enCorte.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-700">
              En Corte ({enCorte.length})
            </h2>
            {enCorte.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showProcessSteps
                actions={
                  <>
                    <Button
                      onClick={() => handleTerminar(ticket)}
                      className="h-12 flex-1 gap-2 bg-green-600 text-white hover:bg-green-700 text-base"
                    >
                      <CheckCircle2 className="size-5" />
                      {ticket.conAcabados ? "Enviar a Acabados" : "Terminado"}
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
                }
              />
            ))}
          </section>
        )}

        {/* Empty */}
        {totalCount === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <Scissors className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No hay tickets en corte</p>
            <p className="text-muted-foreground text-sm">
              Los tickets que incluyan corte apareceran aqui
            </p>
          </div>
        )}

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

      {editTicket && (
        <EditTicketDialog
          open={!!editTicket}
          onOpenChange={(open) => { if (!open) setEditTicket(null) }}
          initialRealizadoPor={editTicket.realizadoPorCorte || ""}
          initialNotas={editTicket.notas || ""}
          title={`Editar Ticket #${editTicket.ticketPOS}`}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
