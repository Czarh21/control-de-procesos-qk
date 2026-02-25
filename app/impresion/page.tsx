"use client"

import { useState } from "react"
import Link from "next/link"
import { useTickets, revalidateAllTickets } from "@/hooks/use-tickets"
import {
  terminarPaso,
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
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Ticket, TicketEstado } from "@/lib/tickets"

const FILTER_IMPRESION_1: TicketEstado[] = ["en_impresion"]
const FILTER_IMPRESION_2: TicketEstado[] = ["listo_para_impresion_2", "en_impresion_2"]

export default function ImpresionPage() {
  const { tickets: enImpresion1 } = useTickets(FILTER_IMPRESION_1)
  const { tickets: impresion2All } = useTickets(FILTER_IMPRESION_2)
  const [formOpen, setFormOpen] = useState(false)
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [historialOpen, setHistorialOpen] = useState(false)

  // Separate listo_para_impresion_2 from en_impresion_2
  const listoParaImp2 = impresion2All.filter(
    (t) => t.estado === "listo_para_impresion_2"
  )
  const enImpresion2 = impresion2All.filter(
    (t) => t.estado === "en_impresion_2"
  )

  const totalCount = enImpresion1.length + impresion2All.length

  async function handleTerminarImpresion(ticket: Ticket) {
    await terminarPaso(ticket)
    revalidateAllTickets()
    if (ticket.tipoServicio === "solo_impresion" && !ticket.conAcabados) {
      toast.success(`Ticket #${ticket.ticketPOS} terminado`)
    } else if (ticket.tipoServicio === "solo_impresion" && ticket.conAcabados) {
      toast.success(`Ticket #${ticket.ticketPOS} enviado a acabados`)
    } else {
      toast.success(`Ticket #${ticket.ticketPOS} enviado a laminado`)
    }
  }

  async function handleIniciarImpresion2(ticket: Ticket) {
    await updateTicket(ticket.id, {
      estado: "en_impresion_2",
      inicioImpresion2: new Date().toISOString(),
    })
    revalidateAllTickets()
    toast.success(`Ticket #${ticket.ticketPOS} - 2da impresion iniciada`)
  }

  async function handleTerminarImpresion2(ticket: Ticket) {
    await terminarPaso(ticket)
    revalidateAllTickets()
    toast.success(`Ticket #${ticket.ticketPOS} enviado a foil`)
  }

  async function handleEditSave(realizadoPor: string, notas: string) {
    if (!editTicket) return
    const updates: Partial<Omit<Ticket, "id">> = { notas: notas || undefined }
    if (editTicket.estado === "en_impresion") {
      updates.realizadoPorImpresion = realizadoPor || undefined
    } else {
      updates.realizadoPorImpresion2 = realizadoPor || undefined
    }
    await updateTicket(editTicket.id, updates)
    revalidateAllTickets()
    toast.success(`Ticket #${editTicket.ticketPOS} actualizado`)
    setEditTicket(null)
  }

  async function handleDelete(id: string, ticketPOS: string) {
    await deleteTicket(id)
    revalidateAllTickets()
    toast.success(`Ticket #${ticketPOS} eliminado`)
  }

  function getButtonLabel(ticket: Ticket): string {
    if (ticket.tipoServicio === "solo_impresion") {
      return ticket.conAcabados ? "Enviar a Acabados" : "Marcar Terminado"
    }
    return "Enviar a Laminado"
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-blue-50 px-4 py-3">
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
              {totalCount > 0 && (
                <Badge className="bg-blue-500 text-white border-none text-sm">
                  {totalCount}
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            className="h-10 gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Nuevo Ticket
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
        {/* 1st impression */}
        {enImpresion1.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              1ra Impresion ({enImpresion1.length})
            </h2>
            {enImpresion1.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showProcessSteps
                actions={
                  <>
                    <Button
                      onClick={() => handleTerminarImpresion(ticket)}
                      className={cn(
                        "h-11 flex-1 gap-2 text-white",
                        ticket.tipoServicio === "solo_impresion" && !ticket.conAcabados
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-sky-600 hover:bg-sky-700"
                      )}
                    >
                      <Send className="size-4" />
                      {getButtonLabel(ticket)}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-11"
                      onClick={() => setEditTicket(ticket)}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-11 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(ticket.id, ticket.ticketPOS)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </>
                }
              />
            ))}
          </section>
        )}

        {/* 2nd impression - pending */}
        {listoParaImp2.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Pendientes 2da Impresion ({listoParaImp2.length})
            </h2>
            {listoParaImp2.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showProcessSteps
                actions={
                  <Button
                    onClick={() => handleIniciarImpresion2(ticket)}
                    className="h-11 w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Send className="size-4" />
                    Iniciar 2da Impresion
                  </Button>
                }
              />
            ))}
          </section>
        )}

        {/* 2nd impression - in progress */}
        {enImpresion2.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              En 2da Impresion ({enImpresion2.length})
            </h2>
            {enImpresion2.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showProcessSteps
                actions={
                  <>
                    <Button
                      onClick={() => handleTerminarImpresion2(ticket)}
                      className="h-11 flex-1 gap-2 bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <Send className="size-4" />
                      Enviar a Foil
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-11"
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

        {/* Empty state */}
        {enImpresion1.length === 0 && impresion2All.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <Plus className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No hay tickets en impresion</p>
            <Button onClick={() => setFormOpen(true)} variant="outline" className="h-11 gap-2">
              <Plus className="size-4" />
              Crear primer ticket
            </Button>
          </div>
        )}

        {/* History collapsible */}
        <Collapsible open={historialOpen} onOpenChange={setHistorialOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
              <span>Historial</span>
              <ChevronDown
                className={cn("size-4 transition-transform", historialOpen && "rotate-180")}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 text-sm text-muted-foreground text-center">
            Consulta el historial completo en la seccion de Consulta.
          </CollapsibleContent>
        </Collapsible>
      </main>

      <TicketFormDialog open={formOpen} onOpenChange={setFormOpen} />

      {editTicket && (
        <EditTicketDialog
          open={!!editTicket}
          onOpenChange={(open) => { if (!open) setEditTicket(null) }}
          initialRealizadoPor={
            editTicket.estado === "en_impresion"
              ? editTicket.realizadoPorImpresion || ""
              : editTicket.realizadoPorImpresion2 || ""
          }
          initialNotas={editTicket.notas || ""}
          title={`Editar Ticket #${editTicket.ticketPOS}`}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
