"use client"

import { useState } from "react"
import Link from "next/link"
import { useTickets, revalidateAllTickets } from "@/hooks/use-tickets"
import {
  marcarListoParaLaminado,
  updateTicket,
  deleteTicket,
} from "@/lib/tickets"
import { TicketCard } from "@/components/ticket-card"
import {
  TicketFormDialog,
  EditTicketDialog,
} from "@/components/ticket-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Plus,
  ArrowLeft,
  Send,
  Pencil,
  ChevronDown,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import type { Ticket, TicketEstado } from "@/lib/tickets"

const FILTER_IMPRESION: TicketEstado[] = ["en_impresion"]
const FILTER_ENVIADOS: TicketEstado[] = ["listo_para_laminado", "en_laminado", "terminado"]

export default function ImpresionPage() {
  const { tickets: enImpresion } = useTickets(FILTER_IMPRESION)
  const { tickets: enviados } = useTickets(FILTER_ENVIADOS)
  const [formOpen, setFormOpen] = useState(false)
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [historialOpen, setHistorialOpen] = useState(false)

  // Only show today's history
  const today = new Date().toDateString()
  const historialHoy = enviados.filter(
    (t) => new Date(t.creadoEn).toDateString() === today
  )

  async function handleEnviarLaminado(id: string, ticketPOS: string) {
    await marcarListoParaLaminado(id)
    revalidateAllTickets()
    toast.success(`Ticket #${ticketPOS} enviado a laminado`)
  }

  async function handleEditSave(realizadoPor: string, notas: string) {
    if (!editTicket) return
    await updateTicket(editTicket.id, {
      realizadoPorImpresion: realizadoPor || undefined,
      notas: notas || undefined,
    })
    revalidateAllTickets()
    toast.success(`Ticket #${editTicket.ticketPOS} actualizado`)
    setEditTicket(null)
  }

  async function handleDelete(id: string, ticketPOS: string) {
    await deleteTicket(id)
    revalidateAllTickets()
    toast.success(`Ticket #${ticketPOS} eliminado`)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-amber-50 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="size-9">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Volver al inicio</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Impresion</h1>
              {enImpresion.length > 0 && (
                <Badge className="bg-amber-500 text-white border-none text-sm">
                  {enImpresion.length}
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            className="h-10 gap-2 bg-amber-600 text-white hover:bg-amber-700"
          >
            <Plus className="size-4" />
            Nuevo Ticket
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
        {/* Active tickets */}
        {enImpresion.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <Plus className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">
              No hay tickets en impresion
            </p>
            <Button
              onClick={() => setFormOpen(true)}
              variant="outline"
              className="h-11 gap-2"
            >
              <Plus className="size-4" />
              Crear primer ticket
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              En impresion ({enImpresion.length})
            </h2>
            {enImpresion.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                actions={
                  <>
                    <Button
                      onClick={() =>
                        handleEnviarLaminado(ticket.id, ticket.ticketPOS)
                      }
                      className="h-11 flex-1 gap-2 bg-sky-600 text-white hover:bg-sky-700"
                    >
                      <Send className="size-4" />
                      Enviar a Laminado
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-11"
                      onClick={() => setEditTicket(ticket)}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar ticket</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-11 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() =>
                        handleDelete(ticket.id, ticket.ticketPOS)
                      }
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Eliminar ticket</span>
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        )}

        {/* History */}
        {historialHoy.length > 0 && (
          <Collapsible open={historialOpen} onOpenChange={setHistorialOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
                <span>
                  Enviados hoy ({historialHoy.length})
                </span>
                <ChevronDown
                  className={`size-4 transition-transform ${historialOpen ? "rotate-180" : ""}`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-3 pt-3">
              {historialHoy.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </main>

      {/* Dialogs */}
      <TicketFormDialog open={formOpen} onOpenChange={setFormOpen} />

      {editTicket && (
        <EditTicketDialog
          open={!!editTicket}
          onOpenChange={(open) => {
            if (!open) setEditTicket(null)
          }}
          initialRealizadoPor={editTicket.realizadoPorImpresion || ""}
          initialNotas={editTicket.notas || ""}
          title={`Editar Ticket #${editTicket.ticketPOS}`}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
