"use client"

import { useState } from "react"
import Link from "next/link"
import { useTickets, revalidateAllTickets } from "@/hooks/use-tickets"
import {
  iniciarLaminado,
  terminarLaminado,
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
} from "lucide-react"
import { toast } from "sonner"
import type { Ticket, TicketEstado } from "@/lib/tickets"

const FILTER_PENDIENTES: TicketEstado[] = ["listo_para_laminado"]
const FILTER_EN_PROCESO: TicketEstado[] = ["en_laminado"]
const FILTER_TERMINADOS: TicketEstado[] = ["terminado"]

export default function LaminadoPage() {
  const { tickets: pendientes } = useTickets(FILTER_PENDIENTES)
  const { tickets: enProceso } = useTickets(FILTER_EN_PROCESO)
  const { tickets: terminados } = useTickets(FILTER_TERMINADOS)
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [operadorInputs, setOperadorInputs] = useState<
    Record<string, string>
  >({})
  const [historialOpen, setHistorialOpen] = useState(false)

  // Only show today's history
  const today = new Date().toDateString()
  const terminadosHoy = terminados.filter(
    (t) => new Date(t.creadoEn).toDateString() === today
  )

  async function handleIniciarLaminado(id: string, ticketPOS: string) {
    const operador = operadorInputs[id]?.trim() || ""
    await iniciarLaminado(id, operador || undefined)
    revalidateAllTickets()
    toast.success(`Ticket #${ticketPOS} - Laminado iniciado`)
    // Clean operator input
    setOperadorInputs((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  async function handleTerminar(id: string, ticketPOS: string) {
    await terminarLaminado(id)
    revalidateAllTickets()
    toast.success(`Ticket #${ticketPOS} - Terminado`)
  }

  async function handleEditSave(realizadoPor: string, notas: string) {
    if (!editTicket) return
    await updateTicket(editTicket.id, {
      realizadoPorLaminado: realizadoPor || undefined,
      notas: notas || undefined,
    })
    revalidateAllTickets()
    toast.success(`Ticket #${editTicket.ticketPOS} actualizado`)
    setEditTicket(null)
  }

  const totalPendientes = pendientes.length + enProceso.length

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-violet-50 px-4 py-3">
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
              {totalPendientes > 0 && (
                <Badge className="bg-violet-500 text-white border-none text-sm">
                  {totalPendientes}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {pendientes.length > 0 && (
              <Badge variant="outline" className="border-sky-400 text-sky-700">
                {pendientes.length} por recibir
              </Badge>
            )}
            {enProceso.length > 0 && (
              <Badge
                variant="outline"
                className="border-violet-400 text-violet-700"
              >
                {enProceso.length} en proceso
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
        {/* Pending tickets */}
        {pendientes.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              Pendientes por recibir ({pendientes.length})
            </h2>
            {pendientes.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                actions={
                  <div className="flex w-full flex-col gap-2">
                    <Input
                      placeholder="Quien lo lamina (opcional)"
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
                      onClick={() =>
                        handleIniciarLaminado(ticket.id, ticket.ticketPOS)
                      }
                      className="h-12 w-full gap-2 bg-violet-600 text-white hover:bg-violet-700 text-base"
                    >
                      <Play className="size-5" />
                      Iniciar Laminado
                    </Button>
                  </div>
                }
              />
            ))}
          </section>
        )}

        {/* In progress */}
        {enProceso.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-700">
              En proceso ({enProceso.length})
            </h2>
            {enProceso.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                actions={
                  <>
                    <Button
                      onClick={() =>
                        handleTerminar(ticket.id, ticket.ticketPOS)
                      }
                      className="h-12 flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700 text-base"
                    >
                      <CheckCircle2 className="size-5" />
                      Terminado
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-12"
                      onClick={() => setEditTicket(ticket)}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar ticket</span>
                    </Button>
                  </>
                }
              />
            ))}
          </section>
        )}

        {/* Empty state */}
        {pendientes.length === 0 && enProceso.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">
              No hay tickets pendientes
            </p>
            <p className="text-muted-foreground text-sm">
              Los tickets enviados desde impresion apareceran aqui automaticamente
            </p>
          </div>
        )}

        {/* History */}
        {terminadosHoy.length > 0 && (
          <Collapsible open={historialOpen} onOpenChange={setHistorialOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
                <span>
                  Terminados hoy ({terminadosHoy.length})
                </span>
                <ChevronDown
                  className={`size-4 transition-transform ${historialOpen ? "rotate-180" : ""}`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-3 pt-3">
              {terminadosHoy.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </main>

      {/* Edit dialog */}
      {editTicket && (
        <EditTicketDialog
          open={!!editTicket}
          onOpenChange={(open) => {
            if (!open) setEditTicket(null)
          }}
          initialRealizadoPor={editTicket.realizadoPorLaminado || ""}
          initialNotas={editTicket.notas || ""}
          title={`Editar Ticket #${editTicket.ticketPOS}`}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
